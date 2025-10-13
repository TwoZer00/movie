import { useRef, useState } from 'react';
import { useEffect } from "react"
import { getMoviesByName, getValidMovie } from "../api/init";
import { IMG_URL, PROFILE_SIZE, BACKDROP_SIZE, POSTER_SIZE } from '../api/utils/const';
import { useLocation, useSearchParams } from 'react-router-dom';
import genres from '../resources/genre.json'

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
    if(lStatus.current!=loadStatus.loading){
      fetchData();
    }
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
  const reset = async ()=>{
    setTries([]);
    setMovieSearchList([]);
    setGameStatus(gameStatusVal.playing);
    fetchData();
    setSelectedMovie({original_title:""});
  }
  const showHints = ()=>{
    setHints([...cast]);
  }

  const fetchData = async ()=>{
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
  }
  return (
    <>
      <div className='flex-1 flex flex-col gap-2 px-1'>
        {/* <Ad/> */}
        <div className='py-4 flex flex-col items-center gap-2 max-w-xl mx-auto'>
          <div className='aspect-[2/3] h-[300px] max-h-[25dvh] flex justify-center' >{
            gameStatus===gameStatusVal.finished ?
              <img src={`${IMG_URL}${POSTER_SIZE.lg}/${movie?.poster_path}`} className='object-contain' alt="" />
            :
            <div className='w-full h-full bg-gray-100 rounded'></div>
          }
          </div>
          <p className='text-center'>Title:</p>
          <div className='flex-1 flex flex-col min-w-[20ch]'>
            <p className='w-full border rounded py-2 px-4 bg-gray-100 h-[4ch] text-center'>
                {gameStatus===gameStatusVal.finished && (movie?.title||movie?.original_title)}
            </p>  
          </div>
        </div>
        <div className="flex-0 grid grid-cols-5 justify-around gap-4 max-w-lg mx-auto">
          {
            hints?.map(item=>{
              return(
                <div className='flex flex-col' key={item.id}>
                  <div className='rounded-full overflow-hidden outline outline-2 aspect-square'>
                    <img src={`${IMG_URL}${PROFILE_SIZE.md}/${item?.profile_path}`} key={item.id} className='opacity-0 transition-opacity h-full w-full object-cover' alt="" onLoad={handleLoad} />
                  </div>
                  <p className='text-center'>{item?.name||item?.original_name}</p>
                  <p className='text-xs text-center'>{(gameStatus===gameStatusVal.finished&&item.profile_path)&&`(${item?.character})`}</p>
                </div>
              )
            }) 
          }
        </div>
        <div className='flex-1 border px-2 rounded flex flex-col gap-2'>
          <p className='text-right'>Tries {Math.abs(tries.length-5)}/5</p>
          {tries.map(item=>{
            return(
              <div key={item.id} className='px-1 flex flex-row border items-center justify-between rounded bg-slate-100 text-center'>
                <p className='flex-none text-center'>{item.title||item.original_title}
                </p>
                <p className='flex-none text-center'>
                  {
                    (<span className={`${(new Date(item.release_date).getFullYear())===new Date(movie.release_date).getFullYear()?"bg-green-200/60":""}`}>{new Date(item.release_date).getFullYear()}</span>)
                  }
                </p>
                <p className='w-[10ch] text-right'>
                  {item.genre_ids.map(item=>{
                  return(<span key={item} className={`px-1 rounded ml-1 text-xs italic ${ item===movie?.genre_ids.find(genre=>genre===item)?"bg-green-200/60":"text-gray-500"}`}>{
                    genres.find(genre=>genre.id===item)?.name
                  } </span>
                  )
                })}
                </p>
              </div>
            )
          })}
        </div>
        <form onSubmit={handleSubmit} className='flex-0 relative flex flex-row justify-between'>
            <div className='relative flex-1'>
              <input placeholder='Search for movie title' type="text" className='rounded-r-none rounded w-full text-lg py-2 px-2 border focus-within:outline-none' onBlur={handleBlur} value={selectedMovie?.title||selectedMovie?.original_title} onChange={handleChange} />
              <ul className={`shadow-xl border-2 border-slate-200 rounded-tl rounded-tr absolute bottom-full left-0 w-full flex flex-col divide-y bg-white max-h-[50ch] overflow-y-auto ${visible?"":"hidden"}`}>
                {
                  movieSearchList.map(item=>{
                    return(
                      <li key={item.id} className='cursor-pointer hover:bg-gray-100 p-2' onClick={()=>setSelectedMovie(item)}>{item.title||item.original_title} ({new Date(item.release_date).getFullYear()})</li>
                    )
                  })
                }
              </ul>
            </div>
            <input type="submit" value={"Try"} className='rounded-l-none self-end bg-blue-500 text-white font-semibold rounded h-full px-4'/>
        </form>
      </div>
    </>
  )
}
function Ad() {
  return (
    <>
      <div className='100% max-w-lg mx-auto'>
        <amp-ad width="100%" height="320"
          type="adsense"
          data-ad-client="ca-pub-7731037445831235"
          data-ad-slot="5105136682"
          data-auto-format="rspv"
          data-full-width="">
          <div overflow=""></div>
        </amp-ad>
      </div>
    </>
  )
}
