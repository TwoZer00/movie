import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGenres } from '../api/init';
import { getCountries } from '../api/utils/utils';

const COLLECTIONS = [
  { id: 'marvel', name: 'Marvel', emoji: '🦸', filters: { with_companies: '420', with_genres: '28' } },
  { id: 'pixar', name: 'Pixar', emoji: '🎨', filters: { with_companies: '3' } },
  { id: 'disney', name: 'Disney', emoji: '🏰', filters: { with_companies: '2', with_genres: '16' } },
  { id: 'anime', name: 'Anime', emoji: '🎌', filters: { with_genres: '16', with_origin_country: 'JP', 'vote_count.gte': '100' } },
  { id: 'oscars2025', name: 'Oscars 2025', emoji: '🏆', filters: { 'primary_release_date.gte': '2024-01-01', 'primary_release_date.lte': '2024-12-31', 'vote_average.gte': '7.5', 'vote_count.gte': '500' } },
  { id: 'scifi', name: 'Sci-Fi', emoji: '🚀', filters: { with_genres: '878', 'vote_average.gte': '6.5' } },
];

const selectClass = 'w-full bg-black/3 dark:bg-white/5 border border-black/8 dark:border-white/8 rounded-xl px-3 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/40 dark:focus:ring-amber-500/40 transition-all';

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

  const handleStart = (filters = {}) => navigate('/play', { state: filters });

  const handleCollection = (collection) => {
    const playedKey = `collection_${collection.id}_played`;
    const playedMovies = JSON.parse(localStorage.getItem(playedKey) || '[]');
    navigate('/play', { state: { ...collection.filters, collectionId: collection.id, collectionName: collection.name, playedMovies } });
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

  const hasFilters = selectedGenre || selectedDecade || selectedRegion;

  return (
    <div className='flex-1 flex flex-col items-center p-4 pb-6'>
      <div className='w-full max-w-lg flex flex-col gap-4'>

        {/* Quick start */}
        <button
          onClick={() => handleStart()}
          className='w-full py-4 rounded-2xl font-bold text-white text-base bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-90 active:scale-[0.98] transition-all shadow-md'
        >
          🎬 Play Random Movie
        </button>

        {/* Filters */}
        <div className='card rounded-2xl p-5'>
          <p className='text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3'>Custom Filters</p>
          <div className='flex flex-col gap-3 mb-4'>
            <select value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className={selectClass}>
              <option value=''>All Genres</option>
              {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <select value={selectedDecade} onChange={(e) => setSelectedDecade(e.target.value)} className={selectClass}>
              <option value=''>All Decades</option>
              {decades.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className={selectClass}>
              <option value=''>All Regions</option>
              {['Americas', 'Europe', 'Asia', 'Africa', 'Oceania'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button
            onClick={() => handleStart(buildFilters())}
            disabled={!hasFilters}
            className='w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm'
          >
            Start with Filters
          </button>
        </div>

        {/* Collections */}
        <div className='card rounded-2xl p-5'>
          <p className='text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3'>Collections</p>
          <div className='grid grid-cols-3 gap-2'>
            {COLLECTIONS.map(collection => (
              <button
                key={collection.id}
                onClick={() => handleCollection(collection)}
                className='flex flex-col items-center gap-2 p-3 rounded-xl bg-black/3 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-all group'
              >
                <span className='text-2xl group-hover:scale-110 transition-transform'>{collection.emoji}</span>
                <span className='text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight'>{collection.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
