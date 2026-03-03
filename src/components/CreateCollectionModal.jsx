import { useState, useEffect } from 'react';

export default function CreateCollectionModal({ onClose, onSave, editCollection = null }) {
  const [name, setName] = useState(editCollection?.name || '');
  const [emoji, setEmoji] = useState(editCollection?.emoji || '🎬');
  const [genres, setGenres] = useState(editCollection?.filters?.with_genres?.split(',') || []);
  const [decade, setDecade] = useState('');
  const [minRating, setMinRating] = useState(editCollection?.filters?.['vote_average.gte'] || '6');
  const [keywords, setKeywords] = useState(editCollection?.filters?.with_keywords || '');
  const [company, setCompany] = useState(editCollection?.filters?.with_companies || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [resultCount, setResultCount] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleGenre = (genreId) => {
    setGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(g => g !== genreId)
        : [...prev, genreId]
    );
  };

  useEffect(() => {
    const fetchCount = async () => {
      setLoading(true);
      const filters = new URLSearchParams();
      if (genres.length > 0) filters.append('with_genres', genres.join(','));
      if (decade) {
        const [start, end] = decade.split('-');
        filters.append('primary_release_date.gte', `${start}-01-01`);
        filters.append('primary_release_date.lte', `${end}-12-31`);
      }
      if (minRating) filters.append('vote_average.gte', minRating);
      if (keywords) filters.append('with_keywords', keywords);
      if (company) filters.append('with_companies', company);
      filters.append('language', 'en-US');

      try {
        const response = await fetch(`https://api.themoviedb.org/3/discover/movie?${filters.toString()}`, {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`
          }
        });
        const data = await response.json();
        setResultCount(data.total_results || 0);
      } catch (error) {
        console.error('Error fetching count:', error);
        setResultCount(null);
      }
      setLoading(false);
    };

    const timer = setTimeout(fetchCount, 500);
    return () => clearTimeout(timer);
  }, [genres, decade, minRating, keywords, company]);

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a collection name');
      return;
    }

    const filters = {};
    if (genres.length > 0) filters.with_genres = genres.join(',');
    if (decade) {
      const [start, end] = decade.split('-');
      filters['primary_release_date.gte'] = `${start}-01-01`;
      filters['primary_release_date.lte'] = `${end}-12-31`;
    }
    if (minRating) filters['vote_average.gte'] = minRating;
    if (keywords) filters.with_keywords = keywords;
    if (company) filters.with_companies = company;

    const collection = {
      id: editCollection?.id || `custom_${Date.now()}`,
      name: name.trim(),
      emoji: emoji || '🎬',
      filters,
      custom: true
    };

    onSave(collection);
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4' onClick={onClose}>
      <div className='bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full' onClick={(e) => e.stopPropagation()}>
        <h2 className='text-2xl font-bold mb-4 dark:text-white'>
          {editCollection ? 'Edit Collection' : 'Create Collection'}
        </h2>

        <div className='flex flex-col gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1 dark:text-gray-300'>Collection Name</label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='My Awesome Collection'
              className='w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-1 dark:text-gray-300'>Emoji</label>
            <input
              type='text'
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder='🎬'
              maxLength={2}
              className='w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-2xl'
            />
          </div>

          <div>
            <label className='block text-sm font-medium mb-2 dark:text-gray-300'>Genres (optional)</label>
            <div className='grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg dark:border-gray-600'>
              {[
                { id: '28', name: 'Action' },
                { id: '12', name: 'Adventure' },
                { id: '16', name: 'Animation' },
                { id: '35', name: 'Comedy' },
                { id: '80', name: 'Crime' },
                { id: '99', name: 'Documentary' },
                { id: '18', name: 'Drama' },
                { id: '10751', name: 'Family' },
                { id: '14', name: 'Fantasy' },
                { id: '27', name: 'Horror' },
                { id: '10402', name: 'Music' },
                { id: '9648', name: 'Mystery' },
                { id: '10749', name: 'Romance' },
                { id: '878', name: 'Sci-Fi' },
                { id: '53', name: 'Thriller' },
                { id: '10752', name: 'War' },
                { id: '37', name: 'Western' }
              ].map(genre => (
                <label key={genre.id} className='flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded'>
                  <input
                    type='checkbox'
                    checked={genres.includes(genre.id)}
                    onChange={() => toggleGenre(genre.id)}
                    className='w-4 h-4'
                  />
                  <span className='text-sm dark:text-white'>{genre.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-1 dark:text-gray-300'>Decade (optional)</label>
            <select
              value={decade}
              onChange={(e) => setDecade(e.target.value)}
              className='w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white'
            >
              <option value=''>Any Decade</option>
              <option value='1970-1979'>1970s</option>
              <option value='1980-1989'>1980s</option>
              <option value='1990-1999'>1990s</option>
              <option value='2000-2009'>2000s</option>
              <option value='2010-2019'>2010s</option>
              <option value='2020-2029'>2020s</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium mb-1 dark:text-gray-300'>
              Min TMDB Rating: {minRating}
            </label>
            <input
              type='range'
              min='0'
              max='10'
              step='0.5'
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className='w-full'
            />
          </div>

          <button
            type='button'
            onClick={() => setShowAdvanced(!showAdvanced)}
            className='text-sm text-blue-500 dark:text-blue-400 hover:underline'
          >
            {showAdvanced ? '▼ Hide' : '▶ Show'} Advanced Filters
          </button>

          {showAdvanced && (
            <>
              <div>
                <label className='block text-sm font-medium mb-1 dark:text-gray-300'>Keywords (optional)</label>
                <select
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                >
                  <option value=''>No Keywords</option>
                  <option value='9715'>Superhero</option>
                  <option value='9748'>Revenge</option>
                  <option value='4379'>Time Travel</option>
                  <option value='9663'>Zombie</option>
                  <option value='818'>Based on Novel</option>
                  <option value='10683'>Heist</option>
                  <option value='6091'>Artificial Intelligence</option>
                  <option value='9882'>Dystopia</option>
                  <option value='10364'>Space</option>
                  <option value='1299'>Vampire</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium mb-1 dark:text-gray-300'>Production Company (optional)</label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className='w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                >
                  <option value=''>Any Company</option>
                  <option value='420'>Marvel Studios</option>
                  <option value='3'>Pixar</option>
                  <option value='2'>Walt Disney Pictures</option>
                  <option value='33'>Universal Pictures</option>
                  <option value='4'>Paramount Pictures</option>
                  <option value='174'>Warner Bros.</option>
                  <option value='25'>20th Century Fox</option>
                  <option value='7505'>A24</option>
                  <option value='1632'>Lionsgate</option>
                  <option value='5'>Columbia Pictures</option>
                  <option value='521'>DreamWorks</option>
                  <option value='429'>Studio Ghibli</option>
                </select>
              </div>
            </>
          )}

          <div className='flex gap-2 mt-4'>
            <button
              onClick={handleSave}
              className='flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 disabled:opacity-50'
              disabled={loading}
            >
              {editCollection ? 'Update' : 'Create'}
            </button>
            <button
              onClick={onClose}
              className='flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white py-2 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-500'
            >
              Cancel
            </button>
          </div>

          {resultCount !== null && (
            <div className='text-center text-sm mt-2 dark:text-gray-300'>
              {loading ? (
                <span className='text-gray-500'>Counting movies...</span>
              ) : (
                <span className='font-semibold'>
                  📊 {resultCount.toLocaleString()} movies available
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
