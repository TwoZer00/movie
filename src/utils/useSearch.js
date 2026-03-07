import { useState, useCallback, useRef, useEffect } from 'react';
import { getMoviesByName, searchPerson } from '../api/init';
import { trackSearch } from './analytics';

const searchCache = new Map();

export const useSearch = (type = 'movie', options = {}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const timeoutRef = useRef(null);
  
  const { 
    debounceMs = 300,
    maxResults = 10,
    filters = {},
    onSelect,
    cacheKey = type
  } = options;

  const search = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setVisible(false);
      return;
    }

    // Check cache first
    const cacheKeyFull = `${cacheKey}-${searchQuery}-${JSON.stringify(filters)}`;
    if (searchCache.has(cacheKeyFull)) {
      const cached = searchCache.get(cacheKeyFull);
      setResults(cached);
      setVisible(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setVisible(true);

    try {
      let data;
      if (type === 'person') {
        data = await searchPerson(searchQuery);
      } else {
        data = await getMoviesByName(searchQuery);
      }

      let filteredResults = data.results.slice(0, maxResults);

      // Apply custom filters
      if (filters.genres?.length > 0) {
        filteredResults = filteredResults.filter(item => 
          item.genre_ids?.some(gid => filters.genres.includes(gid))
        );
      }

      if (filters.yearRange) {
        filteredResults = filteredResults.filter(item => {
          if (!item.release_date) return false;
          const year = new Date(item.release_date).getFullYear();
          return year >= filters.yearRange.min && year <= filters.yearRange.max;
        });
      }

      // Cache results
      searchCache.set(cacheKeyFull, filteredResults);
      
      // Limit cache size
      if (searchCache.size > 50) {
        const firstKey = searchCache.keys().next().value;
        searchCache.delete(firstKey);
      }

      setResults(filteredResults);
      trackSearch(cacheKey, searchQuery, filteredResults.length);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [type, filters, maxResults, cacheKey]);

  const handleInputChange = useCallback((value) => {
    setQuery(value);
    setSelectedIndex(-1);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      search(value);
    }, debounceMs);
  }, [search, debounceMs]);

  const handleKeyDown = useCallback((e) => {
    if (!visible || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev < results.length - 1 ? prev + 1 : 0; // Loop to first
          document.querySelector(`#search-result-${newIndex}`)?.scrollIntoView({ 
            block: 'nearest',
            behavior: 'smooth'
          });
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : results.length - 1; // Loop to last
          document.querySelector(`#search-result-${newIndex}`)?.scrollIntoView({ 
            block: 'nearest',
            behavior: 'smooth'
          });
          return newIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          onSelect?.(results[selectedIndex]);
          setVisible(false);
        } else if (results.length === 1) {
          onSelect?.(results[0]);
          setVisible(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setVisible(false);
        setSelectedIndex(-1);
        break;
      case 'Tab':
        if (selectedIndex >= 0) {
          e.preventDefault();
          onSelect?.(results[selectedIndex]);
          setVisible(false);
        } else {
          setVisible(false);
        }
        break;
      case 'Home':
        if (visible) {
          e.preventDefault();
          setSelectedIndex(0);
          document.querySelector('#search-result-0')?.scrollIntoView({ 
            block: 'nearest',
            behavior: 'smooth'
          });
        }
        break;
      case 'End':
        if (visible) {
          e.preventDefault();
          const lastIndex = results.length - 1;
          setSelectedIndex(lastIndex);
          document.querySelector(`#search-result-${lastIndex}`)?.scrollIntoView({ 
            block: 'nearest',
            behavior: 'smooth'
          });
        }
        break;
    }
  }, [visible, results, selectedIndex, onSelect]);

  const handleBlur = useCallback(() => {
    setTimeout(() => setVisible(false), 100);
  }, []);

  const handleFocus = useCallback(() => {
    if (query && results.length > 0) {
      setVisible(true);
    }
  }, [query, results.length]);

  const selectItem = useCallback((item) => {
    onSelect?.(item);
    setVisible(false);
  }, [onSelect]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setVisible(false);
    setSelectedIndex(-1);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    query,
    results,
    loading,
    visible,
    selectedIndex,
    handleInputChange,
    handleKeyDown,
    handleBlur,
    handleFocus,
    selectItem,
    clearSearch,
    setVisible
  };
};