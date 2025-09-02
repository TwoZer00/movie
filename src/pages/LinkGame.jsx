import { useEffect, useState } from 'react'
import { getValidMovie } from '../api/init';
import { IMG_URL, POSTER_SIZE, PROFILE_SIZE } from '../api/utils/const';
export default function LinkGame() {
  const [movieSelected, setMovieSelected] = useState();
  const [castSelected, setCastSelected] = useState();

  const fetchData = async() =>{
    const [movie,cast] = await getValidMovie();
    setMovieSelected(movie);
    setCastSelected(cast);
  }

  useEffect(
    ()=>{
    fetchData();
    return ()=>{}
  },[]
  )
  
  
  return (
    <div className='flex flex-1 flex-col'>
      <div className='aspect-[9/16] w-32'>
        <img src={IMG_URL+POSTER_SIZE.lg+movieSelected?.poster_path} alt="" />
      </div>
      <div>
        <form>
        <input className='border' type="text" />
        <button type='button' value={"je"}/>
        </form>
      </div>
    </div>
  )
}
