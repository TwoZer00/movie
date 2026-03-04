import { useEffect, useRef, useState } from 'react'
import { getGenres } from '../api/init'
import { getCountries } from '../api/utils/utils'
import { useNavigate } from 'react-router-dom'
import CreateCollectionModal from '../components/CreateCollectionModal'
import AdSenseSquare from '../components/AdSenseSquare'

const COLLECTIONS = [
  {
    id: 'marvel',
    name: 'Marvel Heroes',
    emoji: '🦸',
    filters: {
      with_companies: '420',
      with_genres: '28'
    }
  },
  {
    id: 'pixar',
    name: 'Pixar Animation',
    emoji: '🎨',
    filters: {
      with_companies: '3'
    }
  },
  {
    id: 'disney',
    name: 'Disney Classics',
    emoji: '🏰',
    filters: {
      with_companies: '2',
      with_genres: '16'
    }
  },
  {
    id: 'anime',
    name: 'Anime Films',
    emoji: '🎌',
    filters: {
      with_genres: '16',
      with_origin_country: 'JP',
      'vote_count.gte': '100'
    }
  },
  {
    id: 'oscars2025',
    name: '2025 Oscar Nominees',
    emoji: '🏆',
    filters: {
      'primary_release_date.gte': '2024-01-01',
      'primary_release_date.lte': '2024-12-31',
      'vote_average.gte': '7.5',
      'vote_count.gte': '500'
    }
  },
  {
    id: 'scifi',
    name: 'Sci-Fi Universe',
    emoji: '🚀',
    filters: {
      with_genres: '878',
      'vote_average.gte': '6.5'
    }
  }
];

export default function Menu() {
  const [options,setOptions] = useState({})
  const [dailyCompleted,setDailyCompleted] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customCollections, setCustomCollections] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const navigate = useNavigate();
  
  useEffect(()=>{
    const today = new Date().toISOString().split('T')[0];
    const completed = localStorage.getItem(`daily_${today}`);
    setDailyCompleted(!!completed);
    
    const saved = localStorage.getItem('custom_collections');
    if (saved) {
      setCustomCollections(JSON.parse(saved));
    }
  },[]);

  const handleCollectionClick = (collection) => {
    const playedKey = `collection_${collection.id}_played`;
    const playedMovies = JSON.parse(localStorage.getItem(playedKey) || '[]');
    
    navigate('/play', { 
      state: { 
        ...collection.filters, 
        collectionId: collection.id,
        playedMovies 
      }
    });
  };

  const handleSaveCollection = (collection) => {
    const updated = [...customCollections.filter(c => c.id !== collection.id), collection];
    setCustomCollections(updated);
    localStorage.setItem('custom_collections', JSON.stringify(updated));
    setShowCreateModal(false);
  };

  const handleDeleteCollection = (collectionId) => {
    if (confirm('Delete this collection?')) {
      const updated = customCollections.filter(c => c.id !== collectionId);
      setCustomCollections(updated);
      localStorage.setItem('custom_collections', JSON.stringify(updated));
      localStorage.removeItem(`collection_${collectionId}_played`);
    }
  };
  return (
    <div className='flex flex-col flex-1 items-center justify-center gap-8 p-4 overflow-y-auto'>
      {showCreateModal && (
        <CreateCollectionModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveCollection}
        />
      )}
      <div className='w-full max-w-2xl flex flex-col gap-6'>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className='py-2 text-sm text-blue-500 dark:text-blue-400 hover:underline self-center'
        >
          {showAdvanced ? '▼ Hide' : '▶ Show'} Advanced Filters
        </button>
        
        {showAdvanced && (
          <div className='flex flex-row gap-3 justify-center flex-wrap'>
            <GenreSelect options={setOptions}/>
            <DecadeSelect options={setOptions}/>
            <RegionSelect options={setOptions}/>
          </div>
        )}
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <button className='py-4 shadow-lg text-2xl font-semibold uppercase rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-all' onClick={()=>{navigate("/play",{ state:options})}}>
            Play
          </button>
          <div className='relative'>
            <button className={`w-full py-4 shadow-lg text-2xl font-semibold uppercase rounded-lg transition-all ${dailyCompleted ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-60' : 'bg-yellow-200 dark:bg-yellow-700 dark:text-white hover:bg-yellow-300 dark:hover:bg-yellow-600'}`} onClick={()=>{navigate("/play?daily=true")}} disabled={dailyCompleted}>
              Daily Challenge
              {dailyCompleted && <span className='absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full'>✓ Completed</span>}
            </button>
            {dailyCompleted && <CountdownTimer />}
          </div>
        </div>
        
        <div>
          <h3 className='text-lg font-semibold mb-3 text-center dark:text-white'>🎬 Themed Collections</h3>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
            {COLLECTIONS.map(collection => {
              const playedKey = `collection_${collection.id}_played`;
              const playedMovies = JSON.parse(localStorage.getItem(playedKey) || '[]');
              const playedCount = playedMovies.length;
              const isOscars = collection.id === 'oscars2025';
              
              return (
                <button
                  key={collection.id}
                  onClick={() => handleCollectionClick(collection)}
                  className={`p-4 rounded-lg transition-all shadow-md hover:shadow-lg relative ${
                    isOscars 
                      ? 'bg-gradient-to-br from-yellow-200 to-amber-300 dark:from-yellow-700 dark:to-amber-800 hover:from-yellow-300 hover:to-amber-400 dark:hover:from-yellow-600 dark:hover:to-amber-700 ring-2 ring-yellow-400 dark:ring-yellow-500'
                      : 'bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 hover:from-purple-200 hover:to-pink-200 dark:hover:from-purple-800 dark:hover:to-pink-800'
                  }`}
                >
                  <div className='text-3xl mb-2'>{collection.emoji}</div>
                  <div className='text-sm font-semibold dark:text-white'>{collection.name}</div>
                  {playedCount > 0 && (
                    <div className='absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full'>
                      {playedCount}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {customCollections.length > 0 && (
          <div>
            <h3 className='text-lg font-semibold mb-3 text-center dark:text-white'>✨ My Collections</h3>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
              {customCollections.map(collection => {
                const playedKey = `collection_${collection.id}_played`;
                const playedMovies = JSON.parse(localStorage.getItem(playedKey) || '[]');
                const playedCount = playedMovies.length;
                
                return (
                  <div key={collection.id} className='relative group'>
                    <button
                      onClick={() => handleCollectionClick(collection)}
                      className='w-full p-4 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 hover:from-blue-200 hover:to-cyan-200 dark:hover:from-blue-800 dark:hover:to-cyan-800 transition-all shadow-md hover:shadow-lg'
                    >
                      <div className='text-3xl mb-2'>{collection.emoji}</div>
                      <div className='text-sm font-semibold dark:text-white'>{collection.name}</div>
                      {playedCount > 0 && (
                        <div className='absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full'>
                          {playedCount}
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteCollection(collection.id)}
                      className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs'
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        <button
          onClick={() => setShowCreateModal(true)}
          className='py-3 shadow-lg text-lg font-semibold uppercase rounded-lg bg-green-100 dark:bg-green-900 dark:text-white hover:bg-green-200 dark:hover:bg-green-800 transition-all'
        >
          ➕ Create Collection
        </button>
        
        <button className='py-3 shadow-lg text-lg font-semibold uppercase rounded-lg bg-blue-100 dark:bg-blue-900 dark:text-white hover:bg-blue-200 dark:hover:bg-blue-800 transition-all' onClick={()=>navigate('/settings')}>
          ⚙️ Settings
        </button>
        
        <div className='flex justify-center mt-4'>
          <AdSenseSquare />
        </div>
      </div>
    </div>
  )
}


const GenreSelect = ({options}) => {
  const [genres,setGenres] = useState([])
  const [selected,setSelected] = useState()
  const loading = useRef(false);

  useEffect(()=>{
    const fetchGenres = async() => {
      loading.current = true;
      const genres = await getGenres()
      setGenres(genres)
    }
    if(!loading.current) fetchGenres();

  },[])
  const handleClear = () => {
    setSelected(null)
    const select = document.querySelector('select[name="genre"]')
    select.value = ""
    select.dispatchEvent(new Event('change', {bubbles: true}))
  }
  useEffect(()=>{
    if(selected) options(value => ({...value,with_genres:selected}))
      else options(value => {
        delete value.with_genres
        return {...value}
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selected])
  return (
    <div className='flex flex-row items-center'>
      <select name="genre" className="bg-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-md p-2 w-[12ch] shadow-md border dark:border-gray-600" onChange={(e)=> setSelected(e.target.value)  }>
        <option value="" defaultValue hidden >Genre</option>
        {genres?.map((genre) => (
          <option key={genre.id} value={genre.id}>{genre.name}</option>
        ))}
      </select>
      {selected && 
      <button type='button' onClick={handleClear} className='dark:text-white'>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    </button>}
    </div>
  )
}
const DecadeSelect = ({options})=>{
  const [rangeDate,setRangeDate] = useState();
  const decades = getDecadesUntilToday();
  const handleSelect = (e) => {
    if(!e.target.value) return setRangeDate(null)
    setRangeDate(getRangeDate(e.target.value))
  }
  const handleClear = () => {
    setRangeDate(null)
    const select = document.querySelector('select[name="decade"]')
    select.value = ""
    select.dispatchEvent(new Event('change', {bubbles: true}))
  }
  useEffect(()=>{
    if(rangeDate) options(value => ({...value, "primary_release_date.gte":rangeDate.gte,"primary_release_date.lte":rangeDate.lte}))
      else options(value => {
        delete value[0]
        delete value[1]
        return {...value}
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[rangeDate])
  return (
    <div className='flex flex-row items-center'>
      <select name="decade"  className="bg-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-md shadow-md p-2 w-[12ch] border dark:border-gray-600" onChange={handleSelect}>
      <option value="" defaultValue hidden >Decade</option>
      {decades.map((genre) => (
        <option key={genre.id} value={genre.rangeYear}>{genre.name}</option>
      ))}
    </select>
    {rangeDate &&
    <button type='button' onClick={handleClear} className='dark:text-white'>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
    </button>}
    </div>
  )
}

const getRangeDate = (range)=>{
  let [gte,lte] = range.split('-')
  gte = new Date(gte,0,1).toISOString()
  lte = new Date(lte,11,31).toISOString()
  gte = gte.slice(0,10)
  lte = lte.slice(0,10)
  return {gte,lte}
}

const getDecadesUntilToday = () =>{
  const currentYear = new Date().getFullYear();
  const decades = [];
  for (let year = 1970; year <= currentYear; year += 10) {
    const rangeYear = `${year}-${year + 9}`;
    const name = `${year}s`;
    const id = `${year}-${year + 9}`;
    decades.push({rangeYear,name,id});
  }
  return decades;
}

const RegionSelect = ({options})=>{
  const [countries,setCountries] = useState([])
  const [selectedCountries,setSelectedCountries] = useState([]);
  const loading = useRef(false);
  const regions = ["Americas","Africa","Europe","Asia","Oceania"]
  const [region,setRegion] = useState(regions[null])

  useEffect(()=>{
    const fetchCountries = async() => {
      loading.current = true;
      const countriesTemp = await getCountries()
      setCountries(countriesTemp)
    }
    if(!loading.current) fetchCountries();

  },[])

  const handleChange = (e) => {
    const regiontemp = e.target.value
    const countriesTemp = getCountriesFromRegion(regiontemp, countries)
    setRegion(regiontemp)
    setSelectedCountries(countriesTemp)
  }
  const handleClear = () => {
    setSelectedCountries([])
    const select = document.querySelector('select[name="region"]')
    select.value = ""
    select.dispatchEvent(new Event('change', {bubbles: true}))
  }
  useEffect(()=>{
    if(selectedCountries.length > 0) options(value => ({...value, with_origin_country:selectedCountries.join("|")}))
      else options(value => {
        delete value.with_origin_country
        return {...value}
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[selectedCountries])
  return (
    <div className='flex flex-row items-center'>
      <select name="region" className="bg-gray-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 rounded-md p-2 shadow-md w-[12ch] border dark:border-gray-600" onChange={handleChange} value={region}>
      <option value="" defaultValue hidden >Region</option>
      {regions?.map((region) => (
        <option key={region} value={region}>{region}</option>
      ))}
    </select>
    {selectedCountries.length > 0 &&
    <button type='button' onClick={handleClear} className='dark:text-white'>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
    </button>}
    </div>
  )
}

const getCountriesFromRegion = (region,countries) => {
  return countries.filter(country => country.region === region).map(item=> item.cca2)
}


const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className='text-center text-sm text-gray-500 mt-2'>
      Next challenge in: {timeLeft}
    </p>
  );
};
