import { useEffect, useRef, useState } from 'react'
import { getGenres } from '../api/init'
import { getCountries } from '../api/utils/utils'
import { useNavigate } from 'react-router-dom'
export default function Menu() {
  const [options,setOptions] = useState({})
  const [dailyCompleted,setDailyCompleted] = useState(false)
  const navigate = useNavigate();
  
  useEffect(()=>{
    const today = new Date().toISOString().split('T')[0];
    const completed = localStorage.getItem(`daily_${today}`);
    setDailyCompleted(!!completed);
  },[]);
  return (
    <div className='flex flex-col flex-1 items-center justify-center gap-8 p-4'>
      <div className='w-full max-w-2xl flex flex-col gap-6'>
        <div className='flex flex-row gap-3 justify-center flex-wrap'>
          <GenreSelect options={setOptions}/>
          <DecadeSelect options={setOptions}/>
          <RegionSelect options={setOptions}/>
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <button className='py-4 shadow-lg text-2xl font-semibold uppercase rounded-lg bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-all' onClick={()=>{navigate("/play",{ state:options})}}>
            Play
          </button>
          <button className={`py-4 shadow-lg text-2xl font-semibold uppercase rounded-lg transition-all relative ${dailyCompleted ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-60' : 'bg-yellow-200 dark:bg-yellow-700 dark:text-white hover:bg-yellow-300 dark:hover:bg-yellow-600'}`} onClick={()=>{navigate("/play?daily=true")}} disabled={dailyCompleted}>
            Daily Challenge
            {dailyCompleted && <span className='absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full'>✓ Completed</span>}
          </button>
        </div>
        
        <button className='py-3 shadow-lg text-lg font-semibold uppercase rounded-lg bg-blue-100 dark:bg-blue-900 dark:text-white hover:bg-blue-200 dark:hover:bg-blue-800 transition-all' onClick={()=>navigate('/settings')}>
          ⚙️ Settings
        </button>
        
        <CountdownTimer />
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
