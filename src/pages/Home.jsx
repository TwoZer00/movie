import { useRef, useState } from 'react';
import { useEffect } from "react"
import { getMoviesByName, getRandomMovie, getValidMovie } from "../api/init";
import { IMG_URL } from '../api/utils/const';
import { useLocation, useNavigate } from 'react-router-dom';

const gameStatusVal = {
  playing:2,
  won:1,
  lost:0,
  finished:3
}
const loadStatus = {
  loading:0,
  loaded:1,
  error:2
}

export default function Home() {
  const [cast,setCast] = useState([]);
  const [selectedMovie,setSelectedMovie] = useState({original_title:""});
  const [movieSearchList,setMovieSearchList] = useState([])
  const [movie,setMovie] = useState(null)
  const [tries,setTries] = useState([]);
  const [hints,setHints] = useState([]);
  const lStatus = useRef()
  const location = useLocation();
  const [gameStatus,setGameStatus] = useState(gameStatusVal.playing);
  useEffect(() => {
    const fetchMovieData = async () => {
      // console.log("xxxx",location.state);
      
      lStatus.current = loadStatus.loading
      try {
        const [movie, cast] = await getValidMovie(location.state);
        const sortedCast = cast
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 5)
          .sort((a, b) => b.order - a.order);
  
        // Set states only once with valid data
        setMovie(movie);
        setHints(sortedCast.map((item, index) => 
          index === 0 ? item : { id: item.id }
        ));
        setCast(sortedCast);
        // lStatus.current = loadStatus.loaded
      } catch (error) {
        lStatus.current = loadStatus.error
        console.error('Error fetching movie data:', error);
      }
    };
  
    // Call the function only once
    if(lStatus.current!=loadStatus.loading){
      fetchMovieData();
    }
    
    // Optional: Cleanup function
    return () => {
      // Add any cleanup if needed
    };
  }, []);
  
  
  const handleSubmit = (e)=>{
    e.preventDefault();
    if(!selectedMovie.id) return;
    if(selectedMovie.original_title===movie.original_title){
      alert("You won!");
      setGameStatus(gameStatusVal.finished);
      return;
    }
    if(tries.length+1>4){
      alert("You lost!");
      setGameStatus(gameStatusVal.finished);
      return;
    }
    // console.log(selectedMovie===movie.original_title);
    setTries((value)=>{
      const temp = [...value];
      temp.push(selectedMovie);
      return temp;
    });
    setHints((value)=>{
      const temp = [...value];
      temp[tries.length+1] = cast[tries.length+1];
      // console.log(temp);
      return temp;
    });
    e.target.querySelector("input").focus();
  }
  let searchTimeout = useRef(null);
  const handleChange = (e) => {
    const movie = {original_title:e.target.value}
  
    // Clear any existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Set selected movie immediately for responsive UI
    setSelectedMovie(movie);
  
    // Only set timeout for API call if there's content
    if (movie.original_title.trim()) {
       setVisible(true);
      searchTimeout.current = setTimeout(() => {
        getMoviesByName(movie.original_title)
          .then(data => {
            setMovieSearchList(data.results);
          })
          .catch(error => {
            console.error('Error fetching movies:', error);
            setMovieSearchList([]); // Clear results on error
          });
      }, 500);
    } else {
      // Clear search results if input is empty
      setMovieSearchList([]);
    }
  };
  const [visible,setVisible] = useState(false);
  const handleBlur = ()=>{
    setTimeout(()=>{
      setVisible(false);
    },100)
  }
  const handleLoad = (e)=>{
    e.target.style.opacity = 1;
  }
  useEffect(()=>{
    if(gameStatus===gameStatusVal.finished){
      showHints();
      const timeout = setTimeout(()=>{
        reset();
      },3000)
      return ()=>{
        clearTimeout(timeout);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[gameStatus])
  const reset = ()=>{
    setTries([]);
    setMovieSearchList([]);
    setGameStatus(gameStatusVal.playing);
    (async () => {
      const [movie,cast] = await getValidMovie(location.state);
      setMovie(movie);
      cast.sort((item)=> item.popularity)
      const temp = [cast[0],cast[3],cast[6],cast[7],cast[8]].sort((a, b)=> b.order-a.order);
      setHints(temp.map((item, index)=>{
        if(index>0){
          return {
            id:item.id
          }
        }
        else{
          return item
        }
      }));
      setCast(temp);
      setSelectedMovie({original_title:""});
    })();
  }
  const showHints = ()=>{
    setHints([...cast]);
  }
  return (
    <div className='flex flex-col max-w-screen-lg mx-auto h-[100dvh] p-1 gap-2 '>
      <h1 className='font-semibold text-xl text-center'>Guess movie name of the day by the cast</h1>
      <div className='py-4 flex flex-col items-center gap-2 max-w-xl mx-auto'>
        <div className='aspect-[2/3] h-[300px] max-h-[25dvh] flex justify-center' >{
          gameStatus===gameStatusVal.finished ?
            <img src={`${IMG_URL}${movie?.poster_path}`} className='object-contain' alt="" />
          :
          <div className='w-full h-full bg-gray-100 rounded'></div>
        }
        </div>
        <p className='text-center'>Title:</p>
        <div className='flex-1 flex flex-col min-w-[20ch]'>
          <p className='w-full border rounded py-2 px-4 bg-gray-100 h-[4ch] text-center'>
              {gameStatus===gameStatusVal.finished && movie?.original_title}
          </p>  
        </div>
      </div>
      <div className="grid grid-cols-5 justify-around gap-4 max-w-lg mx-auto">
        {
          hints?.map(item=>{
            return(
              <div className='flex flex-col' key={item.id}>
                <div className='rounded-full overflow-hidden outline aspect-square'>
                  <img src={`${IMG_URL}${item?.profile_path}`} key={item.id} className='opacity-0 transition-opacity h-full w-full object-cover' alt="" onLoad={handleLoad} />
                </div>
                <p className='text-center'>{item?.name||item?.original_name}</p>
                <p className='text-xs text-center'>{(gameStatus===gameStatusVal.finished&&item.profile_path)&&`(${item?.character})`}</p>
              </div>
            )
          }) 
        }
      </div>
      <div className='flex-1 flex flex-col'>
        <div className='flex-0 h-full flex flex-col py-2 gap-2 overflow-y-auto'>
            {tries.map(item=>{
              return(
                <div key={item.id} className='border rounded bg-slate-100 text-center'>
                  <p>{item.original_title} ({new Date(item.release_date).getFullYear()})</p>
                </div>
              )
            })}
        </div>
        <form onSubmit={handleSubmit} className='relative flex flex-col justify-between gap-2'>
          <div className='relative'>
            <input placeholder='Search for movie title' type="text" className='border rounded w-full text-lg py-2 px-2' onBlur={handleBlur} value={selectedMovie?.original_title} onChange={handleChange} />
            <ul className={`shadow-xl border-2 border-slate-200 rounded-tl rounded-tr absolute bottom-full left-0 w-full flex flex-col divide-y bg-white max-h-[50ch] overflow-y-auto ${visible?"":"hidden"}`}>
              {
                movieSearchList.map(item=>{
                  return(
                    <li key={item.id} className='cursor-pointer hover:bg-gray-100 p-2' onClick={()=>setSelectedMovie(item)}>{item.original_title} ({new Date(item.release_date).getFullYear()})</li>
                  )
                })
              }
            </ul>
          </div>
          <input type="submit" value={"Try"} className='self-end px-4 py-1  bg-blue-500 text-white font-semibold rounded'/>
        </form>
      </div>
      <footer>
        <p className='text-center text-sm text-gray-500'>Made by <a href="https://twozer00.dev" className='underline'>TwoZer00</a> powered by <a className="underline" href="https://www.themoviedb.org/">TheMovieDB</a> API Services</p>
      </footer>
    </div>
  )
}
