import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { getMoviesByName, getValidMovie, getDailyMovie, getCastFromMovie } from "../api/init";
import { IMG_URL, POSTER_SIZE } from '../api/utils/const';
import { useLocation, useNavigate } from 'react-router-dom';
import genres from '../resources/genre.json'
import winSound from '../resources/win_sound.wav'
import lossSound from '../resources/loss_sound.wav'
import CastMember from '../components/CastMember';
import TryItem from '../components/TryItem';
import Modal from '../components/Modal';
import { Loader, SkipButton } from '../components/UIComponents';
import { gameStatusVal, loadStatus } from '../utils/constants';

export default function Home() {
  const [cast,setCast] = useState([]);
  const [selectedMovie,setSelectedMovie] = useState({original_title:""});
  const [movieSearchList,setMovieSearchList] = useState([])
  const [movie,setMovie] = useState(null)
  const [tries,setTries] = useState([]);
  const [hints,setHints] = useState([]);
  const lStatus = useRef()
  const location = useLocation();
  const navigate = useNavigate();
  const [gameStatus,setGameStatus] = useState(gameStatusVal.playing);
  const [showModal,setShowModal] = useState(false);
  const [isWin,setIsWin] = useState(false);
  const [loading,setLoading] = useState(true);
  const [isDailyChallenge,setIsDailyChallenge] = useState(false);
  const [soundEnabled,setSoundEnabled] = useState(localStorage.getItem('soundEnabled') !== 'false');
  const winAudio = useRef(new Audio(winSound));
  const lossAudio = useRef(new Audio(lossSound));
  const searchTimeout = useRef(null);
  const [visible,setVisible] = useState(false);
  const [selectedIndex,setSelectedIndex] = useState(-1);
  const [expandedTries,setExpandedTries] = useState([]);

  const fetchData = useCallback(async ()=>{
    lStatus.current = loadStatus.loading
    try {
      let movie, cast;
      
      if(isDailyChallenge) {
        movie = await getDailyMovie();
        const credits = await getCastFromMovie(movie.id);
        cast = credits.cast.filter((item) => item?.profile_path !== null && item?.cast_id !== null && item?.id !== null);
      } else {
        [movie, cast] = await getValidMovie(location.state);
      }
      
      const sortedCast = cast
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5)
        .sort((a, b) => b.order - a.order);

      setMovie(movie);
      setHints(sortedCast.map((item, index) => 
        index === 0 ? item : { id: item.id }
      ));
      setCast(sortedCast);
      setLoading(false);
    } catch (error) {
      lStatus.current = loadStatus.error
      console.error('Error fetching movie data:', error);
      setLoading(false);
      alert('Failed to load movie. Please try again.');
      navigate('/');
    }
  },[isDailyChallenge, location.state, navigate]);

  useEffect(() => {
    if(lStatus.current!=loadStatus.loading){
      const isDaily = new URLSearchParams(window.location.search).get('daily') === 'true';
      setIsDailyChallenge(isDaily);
      
      if(isDaily) {
        const today = new Date().toISOString().split('T')[0];
        const completed = localStorage.getItem(`daily_${today}`);
        if(completed) {
          navigate('/');
          return;
        }
      }
      
      fetchData();
    }
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [fetchData, navigate]);

  const showHints = useCallback(()=>{
    setHints([...cast]);
  },[cast]);

  const handleSubmit = useCallback((e)=>{
    e.preventDefault();
    if(!selectedMovie.id) return;
    if(selectedMovie.original_title===movie.original_title){
      if(isDailyChallenge) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`daily_${today}`, 'completed');
      }
      const stats = JSON.parse(localStorage.getItem('gameStats') || '{"wins":0,"losses":0,"currentStreak":0,"maxStreak":0}');
      stats.wins++;
      stats.currentStreak++;
      stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
      localStorage.setItem('gameStats', JSON.stringify(stats));
      
      setIsWin(true);
      setShowModal(true);
      if(soundEnabled) winAudio.current.play();
      setGameStatus(gameStatusVal.finished);
      return;
    }
    if(tries.length+1>4){
      if(isDailyChallenge) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`daily_${today}`, 'completed');
      }
      const stats = JSON.parse(localStorage.getItem('gameStats') || '{"wins":0,"losses":0,"currentStreak":0,"maxStreak":0}');
      stats.losses++;
      stats.currentStreak = 0;
      localStorage.setItem('gameStats', JSON.stringify(stats));
      
      setIsWin(false);
      setShowModal(true);
      if(soundEnabled) lossAudio.current.play();
      setGameStatus(gameStatusVal.finished);
      return;
    }
    setTries((value)=>{
      const temp = [...value];
      temp.push(selectedMovie);
      return temp;
    });
    setHints((value)=>{
      const temp = [...value];
      temp[tries.length+1] = cast[tries.length+1];
      return temp;
    });
    e.target.querySelector("input").focus();
  },[selectedMovie, movie, tries.length, cast, isDailyChallenge, soundEnabled]);

  const handleChange = useCallback((e) => {
    const movie = {original_title:e.target.value}
  
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    setSelectedMovie(movie);
    setSelectedIndex(-1);
  
    if (movie.original_title.trim()) {
      setVisible(true);
      searchTimeout.current = setTimeout(() => {
        getMoviesByName(movie.original_title)
          .then(data => {
            setMovieSearchList(data.results);
          })
          .catch(error => {
            console.error('Error fetching movies:', error);
            setMovieSearchList([]);
          });
      }, 500);
    } else {
      setMovieSearchList([]);
    }
  },[]);
  
  const handleKeyDown = useCallback((e) => {
    if (!visible || movieSearchList.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => prev < movieSearchList.length - 1 ? prev + 1 : prev);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      setSelectedMovie(movieSearchList[selectedIndex]);
      setVisible(false);
    } else if (e.key === 'Escape') {
      setVisible(false);
      setSelectedIndex(-1);
    }
  },[visible, movieSearchList, selectedIndex]);
  
  const highlightMatch = useCallback((text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <strong key={i}>{part}</strong> : part
    );
  },[]);
  
  const handleBlur = useCallback(()=>{
    setTimeout(()=>{
      setVisible(false);
    },100)
  },[]);

  useEffect(()=>{
    if(gameStatus===gameStatusVal.finished){
      showHints();
    }
  },[gameStatus, showHints])

  const reset = useCallback(async ()=>{
    setLoading(true);
    setTries([]);
    setMovieSearchList([]);
    setGameStatus(gameStatusVal.playing);
    setShowModal(false);
    fetchData();
    setSelectedMovie({original_title:""});
  },[fetchData]);

  const posterUrl = useMemo(() => 
    movie?.poster_path ? `${IMG_URL}${POSTER_SIZE.lg}/${movie.poster_path}` : null,
    [movie?.poster_path]
  );

  const handleSkip = useCallback(() => {
    setIsWin(false);
    setShowModal(true);
    setGameStatus(gameStatusVal.finished);
    showHints();
  }, [showHints]);

  return (
    <>
      {showModal && <Modal isWin={isWin} movie={movie} onClose={isDailyChallenge ? ()=>navigate('/') : reset} isDailyChallenge={isDailyChallenge} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />}
      {loading && <Loader />}
      <SkipButton onSkip={handleSkip} disabled={isDailyChallenge} />
      <div className='flex-1 flex flex-col gap-2 px-2 sm:px-4 max-h-screen overflow-hidden'>
        <div className='py-2 flex flex-row items-start gap-3 sm:gap-4 max-w-4xl mx-auto'>
          <div className='flex-shrink-0'>
            <div className='aspect-[2/3] w-24 sm:w-32 flex justify-center shadow-lg rounded overflow-hidden' >{
              gameStatus===gameStatusVal.finished ?
                <img src={posterUrl} className='object-cover w-full h-full animate-fadeIn' loading="lazy" alt="Movie poster" />
              :
              <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                <span className='text-4xl'>?</span>
              </div>
            }
            </div>
          </div>
          <div className='flex-1 flex flex-col gap-2'>
            <div>
              <p className='text-xs text-gray-500 uppercase tracking-wide mb-1'>Movie Title</p>
              <div className='border-2 rounded-lg py-3 px-4 bg-gradient-to-r from-gray-50 to-gray-100 min-h-[3rem] flex items-center justify-center'>
                <p className='font-bold text-lg text-center'>
                  {gameStatus===gameStatusVal.finished ? (movie?.title||movie?.original_title) : '???'}
                </p>
              </div>
            </div>
            {tries.length > 0 && gameStatus !== gameStatusVal.finished && (
              <div className='flex flex-wrap gap-2'>
                {tries.length >= 2 && movie?.genre_ids?.[0] && (
                  <span className='px-3 py-1 bg-purple-100 rounded-full text-sm font-medium'>{genres.find(g=>g.id===movie.genre_ids[0])?.name}</span>
                )}
                {tries.length >= 3 && movie?.genre_ids?.[1] && (
                  <span className='px-3 py-1 bg-purple-100 rounded-full text-sm font-medium'>{genres.find(g=>g.id===movie.genre_ids[1])?.name}</span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className='bg-white rounded-lg shadow-md p-3 sm:p-4'>
          <p className='text-xs text-gray-500 uppercase tracking-wide mb-3 text-center'>Cast Members</p>
          <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-2xl mx-auto">
            {
              hints?.map((item,index)=>(
                <CastMember 
                  key={item.id} 
                  item={item} 
                  index={index} 
                  gameStatus={gameStatus}
                  gameStatusVal={gameStatusVal}
                />
              ))
            }
          </div>
        </div>
        <div className='flex-1 border px-2 rounded flex flex-col gap-1 overflow-y-auto min-h-0'>
          <p className='text-right font-semibold sticky top-0 bg-white py-1'>Tries {Math.abs(tries.length-5)}/5</p>
          {tries.map((item,index)=>(
            <TryItem 
              key={item.id} 
              item={item} 
              index={index} 
              movie={movie}
              expandedTries={expandedTries}
              setExpandedTries={setExpandedTries}
            />
          ))}
        </div>
        <form onSubmit={handleSubmit} className='flex-0 relative flex flex-col gap-2'>
            <div className='relative flex-1'>
              <input placeholder='Search for movie title' type="text" className='rounded w-full text-base sm:text-lg py-2 px-2 border focus-within:outline-none' onBlur={handleBlur} onKeyDown={handleKeyDown} value={selectedMovie?.title||selectedMovie?.original_title} onChange={handleChange} />
              <ul className={`shadow-xl border-2 border-slate-200 rounded-tl rounded-tr absolute bottom-full left-0 w-full flex flex-col divide-y bg-white max-h-[50ch] overflow-y-auto ${visible?"":"hidden"}`}>
                {
                  movieSearchList.length > 0 ? (
                    movieSearchList.map((item,index)=>{
                      return(
                        <li key={item.id} className={`cursor-pointer hover:bg-gray-100 p-2 ${selectedIndex === index ? 'bg-blue-100' : ''}`} onClick={()=>setSelectedMovie(item)}>
                          {highlightMatch(item.title||item.original_title, selectedMovie.original_title)} ({new Date(item.release_date).getFullYear()})
                        </li>
                      )
                    })
                  ) : (
                    <li className='p-4 text-center text-gray-500'>No movies found</li>
                  )
                }
              </ul>
            </div>
            <input type="submit" value={"Try"} className='w-full rounded bg-blue-500 text-white font-semibold py-2 px-4'/>
        </form>
      </div>
    </>
  )
}
