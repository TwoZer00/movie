import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGenres } from '../api/init';
import { getCountries } from '../api/utils/utils';

const COLLECTIONS = [
  { id: 'marvel', name: 'Marvel Heroes', emoji: '🦸', filters: { with_companies: '420', with_genres: '28' } },
  { id: 'pixar', name: 'Pixar Animation', emoji: '🎨', filters: { with_companies: '3' } },
  { id: 'disney', name: 'Disney Classics', emoji: '🏰', filters: { with_companies: '2', with_genres: '16' } },
  { id: 'anime', name: 'Anime Films', emoji: '🎌', filters: { with_genres: '16', with_origin_country: 'JP', 'vote_count.gte': '100' } },
  { id: 'oscars2025', name: '2025 Oscar Nominees', emoji: '🏆', filters: { 'primary_release_date.gte': '2024-01-01', 'primary_release_date.lte': '2024-12-31', 'vote_average.gte': '7.5', 'vote_count.gte': '500' } },
  { id: 'scifi', name: 'Sci-Fi Universe', emoji: '🚀', filters: { with_genres: '878', 'vote_average.gte': '6.5' } }
];

export default function GuessSetup() {
  const navigate = useNavigate();
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedDecade, setSelectedDecade] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [countries, setCountries] = useState([]);
  const loading = useRef(false);

  useEffect(() => {
    if (!loading.current) {
      loading.current = true;
      getGenres().then(setGenres);
      getCountries().then(setCountries);
    }
  }, []);

  const handleStart = (filters = {}) => {
    navigate('/play', { state: filters });
  };

  const handleCollection = (collection) => {
    const playedKey = `collection_${collection.id}_played`;
    const playedMovies = JSON.parse(localStorage.getItem(playedKey) || '[]');
    navigate('/play', { 
      state: { 
        ...collection.filters, 
        collectionId: collection.id,
        collectionName: collection.name,
        playedMovies 
      }
    });
  };

  const buildFilters = () => {
    const filters = {};
    if (selectedGenre) filters.with_genres = selectedGenre;
    if (selectedDecade) {
      const [start, end] = selectedDecade.split('-');
      filters['primary_release_date.gte'] = `${start}-01-01`;
      filters['primary_release_date.lte'] = `${end}-12-31`;
    }
    if (selectedRegion) {
      const regionCountries = countries.filter(c => c.region === selectedRegion).map(c => c.cca2);
      filters.with_origin_country = regionCountries.join('|');
    }
    return filters;
  };

  const decades = [];
  for (let year = 1970; year <= new Date().getFullYear(); year += 10) {
    decades.push({ value: `${year}-${year + 9}`, label: `${year}s` });
  }

  return (
    <div className='flex-1 flex flex-col items-center p-4 dark:bg-gray-900 overflow-y-auto'>
      <div className='w-full max-w-4xl'>
        <div className='flex items-center justify-between mb-6'>
          <button 
            onClick={() => navigate('/')}
            className='bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-semibold'
            title='Back to menu'
          >
            ← Menu
          </button>
          <h2 className='text-xl sm:text-3xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent'>🎬 Guess Setup</h2>
          <div className='w-16'></div> {/* Spacer for centering */}
        </div>
        
        {/* Quick Start */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6'>
          <h3 className='text-xl font-bold mb-4 text-red-600 dark:text-red-400'>Quick Start</h3>
          <button 
            onClick={() => handleStart()}
            className='w-full bg-gradient-to-r from-red-600 to-amber-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-red-700 hover:to-amber-700 transition-all'
          >
            🎬 Play Random Movie
          </button>
        </div>

        {/* Filters */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6'>
          <h3 className='text-xl font-bold mb-4 text-red-600 dark:text-red-400'>Custom Filters</h3>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
            <select 
              value={selectedGenre} 
              onChange={(e) => setSelectedGenre(e.target.value)}
              className='bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg p-3 border-2 border-gray-300 dark:border-gray-600'
            >
              <option value=''>All Genres</option>
              {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select 
              value={selectedDecade} 
              onChange={(e) => setSelectedDecade(e.target.value)}
              className='bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg p-3 border-2 border-gray-300 dark:border-gray-600'
            >
              <option value=''>All Decades</option>
              {decades.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <select 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value)}
              className='bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg p-3 border-2 border-gray-300 dark:border-gray-600'
            >
              <option value=''>All Regions</option>
              {['Americas', 'Europe', 'Asia', 'Africa', 'Oceania'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button 
            onClick={() => handleStart(buildFilters())}
            disabled={!selectedGenre && !selectedDecade && !selectedRegion}
            className='w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-lg font-semibold hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Start with Filters
          </button>
        </div>

        {/* Collections */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6'>
          <h3 className='text-xl font-bold mb-4 text-red-600 dark:text-red-400'>Collections</h3>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
            {COLLECTIONS.map(collection => (
              <button
                key={collection.id}
                onClick={() => handleCollection(collection)}
                className='p-4 rounded-lg bg-gradient-to-br from-red-100 to-amber-100 dark:from-red-900 dark:to-amber-900 hover:from-red-200 hover:to-amber-200 dark:hover:from-red-800 dark:hover:to-amber-800 transition-all shadow-md hover:shadow-lg'
              >
                <div className='text-3xl mb-2'>{collection.emoji}</div>
                <div className='text-sm font-semibold dark:text-white'>{collection.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
