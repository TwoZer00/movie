import { useEffect, useRef, useState } from 'react'
import { getGenres } from '../api/init'
import { getCountries } from '../api/utils/utils'
import { useNavigate } from 'react-router-dom'
export default function Menu() {
  const [options,setOptions] = useState({})
  const navigate = useNavigate();
  return (
    <div className='flex flex-col h-dvh'>
      <h1 className="font-bold text-4xl text-center">Guess the movie</h1>
      <p className="font-thin text-center">Guess the movie by its cast</p>
      <div className='px-1'>
        <form action="" className='flex flex-row gap-1 justify-around'>
          <GenreSelect options={setOptions}/>
          <DecadeSelect options={setOptions} />
          <RegionSelect options={setOptions}/>
        </form>
      </div>
      <div className='flex-1 flex justify-center text-center items-center'>
        <button className='bg-blue-500 text-white rounded-md py-2 px-8 h-fit' onClick={()=>{navigate("/play",{ state:options})
        }} >Play</button>
      </div>
    </div>
  )
}

//primary_release.lte
//primary_release_date.lte


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
      <select name="genre" className="bg-gray-200 rounded-md p-2 w-[12ch]" onChange={(e)=> setSelected(e.target.value)  }>
        <option value="" defaultValue hidden >Genre</option>
        {genres?.map((genre) => (
          <option key={genre.id} value={genre.id}>{genre.name}</option>
        ))}
      </select>
      {selected && 
      <button type='button' onClick={handleClear}>
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
      <select name="decade"  className="bg-gray-200 rounded-md p-2 w-[12ch]" onChange={handleSelect}>
      <option value="" defaultValue hidden >Decade</option>
      {decades.map((genre) => (
        <option key={genre.id} value={genre.rangeYear}>{genre.name}</option>
      ))}
    </select>
    {rangeDate &&
    <button type='button' onClick={handleClear}>
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
      <select name="region" className="bg-gray-200 rounded-md p-2 w-[12ch]" onChange={handleChange} value={region}>
      <option value="" defaultValue hidden >Region</option>
      {regions?.map((region) => (
        <option key={region} value={region}>{region}</option>
      ))}
    </select>
    {selectedCountries.length > 0 &&
    <button type='button' onClick={handleClear}>
      <svg xmlns="XXXXXXXXXXXXXXXXXXXXXXXXXX" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
    </button>}
    </div>
  )
}

const getCountriesFromRegion = (region,countries) => {
  return countries.filter(country => country.region === region).map(item=> item.cca2)
}