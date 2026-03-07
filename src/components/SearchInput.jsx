import { useSearch } from '../utils/useSearch';

export default function SearchInput({ 
  type = 'movie', 
  placeholder = 'Search...', 
  onSelect, 
  filters = {},
  disabled = false,
  className = '',
  maxResults = 10
}) {
  const {
    query,
    results,
    loading,
    visible,
    selectedIndex,
    handleInputChange,
    handleKeyDown,
    handleBlur,
    handleFocus,
    selectItem
  } = useSearch(type, { 
    filters, 
    onSelect, 
    maxResults,
    cacheKey: `${type}_search`
  });

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <strong key={i}>{part}</strong> : part
    );
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 ${className}`}
        role="combobox"
        aria-expanded={visible}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
      />
      
      {loading && (
        <div className="absolute right-3 top-3">
          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {visible && results.length > 0 && (
        <div 
          className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10"
          role="listbox"
          aria-label={`${type} search results`}
        >
          {type === 'person' ? (
            results.map((person, index) => (
              <button
                id={`search-result-${index}`}
                key={person.id}
                onClick={() => selectItem(person)}
                className={`w-full p-4 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-3 text-left transition-colors ${
                  selectedIndex === index ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' : ''
                }`}
                role="option"
                aria-selected={selectedIndex === index}
              >
                {person.profile_path && (
                  <img 
                    src={`https://image.tmdb.org/t/p/w92${person.profile_path}`}
                    alt={person.name}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                  />
                )}
                <div>
                  <p className="font-medium dark:text-white">{highlightMatch(person.name, query)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{person.known_for_department}</p>
                </div>
              </button>
            ))
          ) : (
            results.map((movie, index) => (
              <button
                id={`search-result-${index}`}
                key={movie.id}
                onClick={() => selectItem(movie)}
                className={`w-full p-4 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-3 text-left transition-colors ${
                  selectedIndex === index ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' : ''
                }`}
                role="option"
                aria-selected={selectedIndex === index}
              >
                {movie.poster_path && (
                  <img 
                    src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                    alt={movie.title}
                    className="w-12 h-18 object-cover rounded"
                    loading="lazy"
                  />
                )}
                <div>
                  <p className="font-medium dark:text-white">
                    {highlightMatch(movie.title || movie.original_title, query)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown'}
                  </p>
                  {movie.original_title && movie.original_title !== movie.title && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                      Original: {movie.original_title}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {visible && !loading && results.length === 0 && query.trim() && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg p-4 z-10">
          <p className="text-center text-gray-500 dark:text-gray-400">No results found</p>
        </div>
      )}
    </div>
  );
}