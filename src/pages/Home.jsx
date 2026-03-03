import { useRef, useState, useCallback } from 'react';
import { useEffect } from "react"
import { getMoviesByName, getValidMovie, getDailyMovie, getCastFromMovie } from "../api/init";
import { IMG_URL, PROFILE_SIZE, BACKDROP_SIZE, POSTER_SIZE } from '../api/utils/const';
import { useLocation, useNavigate } from 'react-router-dom';
import genres from '../resources/genre.json'
import winSound from '../resources/win_sound.wav'
import lossSound from '../resources/loss_sound.wav'

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
  const navigate = useNavigate();
  const [gameStatus,setGameStatus] = useState(gameStatusVal.playing);
  const [showModal,setShowModal] = useState(false);
  const [isWin,setIsWin] = useState(false);
  const [loading,setLoading] = useState(true);
  const [isDailyChallenge,setIsDailyChallenge] = useState(false);
  const [soundEnabled,setSoundEnabled] = useState(localStorage.getItem('soundEnabled') !== 'false');
  const winAudio = useRef(new Audio(winSound));
  const lossAudio = useRef(new Audio(lossSound));
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleSubmit = useCallback((e)=>{
    e.preventDefault();
    if(!selectedMovie.id) return;
    if(selectedMovie.original_title===movie.original_title){
      if(isDailyChallenge) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`daily_${today}`, 'completed');
      }
      // Update stats
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
      // Update stats
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
  },[selectedMovie, movie, tries.length, cast, isDailyChallenge]);
  let searchTimeout = useRef(null);
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
  const [visible,setVisible] = useState(false);
  const [selectedIndex,setSelectedIndex] = useState(-1);
  const [expandedTries,setExpandedTries] = useState([]);
  
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
  
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <strong key={i}>{part}</strong> : part
    );
  };
  
  const handleBlur = useCallback(()=>{
    setTimeout(()=>{
      setVisible(false);
    },100)
  },[]);
  const handleLoad = useCallback((e)=>{
    e.target.style.opacity = 1;
  },[]);
  useEffect(()=>{
    if(gameStatus===gameStatusVal.finished){
      showHints();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[gameStatus])
  const reset = async ()=>{
    setLoading(true);
    setTries([]);
    setMovieSearchList([]);
    setGameStatus(gameStatusVal.playing);
    setShowModal(false);
    fetchData();
    setSelectedMovie({original_title:""});
  }
  const showHints = ()=>{
    setHints([...cast]);
  }

  const fetchData = async ()=>{
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
  }
  return (
    <>
      {showModal && <Modal isWin={isWin} movie={movie} onClose={isDailyChallenge ? ()=>navigate('/') : reset} isDailyChallenge={isDailyChallenge} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />}
      {loading && <Loader />}
      <div className='flex-1 flex flex-col gap-2 px-2 sm:px-4 max-h-screen overflow-hidden'>
        {/* <Ad/> */}
        <div className='py-2 flex flex-row items-start gap-3 sm:gap-4 max-w-4xl mx-auto'>
          <div className='flex-shrink-0'>
            <div className='aspect-[2/3] w-24 sm:w-32 flex justify-center shadow-lg rounded overflow-hidden' >{
              gameStatus===gameStatusVal.finished ?
                <img src={`${IMG_URL}${POSTER_SIZE.lg}/${movie?.poster_path}`} className='object-cover w-full h-full animate-fadeIn' loading="lazy" alt="" />
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
              hints?.map((item,index)=>{
                return(
                  <div className='flex flex-col animate-fadeIn' key={item.id} style={{animationDelay: `${index * 100}ms`}}>
                    <div className='rounded-lg overflow-hidden shadow-md border-2 border-gray-200 aspect-square bg-gray-100'>
                      <img src={`${IMG_URL}${PROFILE_SIZE.md}/${item?.profile_path}`} key={item.id} className='opacity-0 transition-opacity h-full w-full object-cover' alt="" onLoad={handleLoad} loading="lazy" />
                    </div>
                    <p className='text-center text-xs sm:text-sm font-medium mt-1 line-clamp-2'>{item?.name||item?.original_name}</p>
                    {gameStatus===gameStatusVal.finished && item.profile_path && (
                      <p className='text-xs text-center text-gray-500 italic'>{item?.character}</p>
                    )}
                  </div>
                )
              }) 
            }
          </div>
        </div>
        <div className='flex-1 border px-2 rounded flex flex-col gap-1 overflow-y-auto min-h-0'>
          <p className='text-right font-semibold sticky top-0 bg-white py-1'>Tries {Math.abs(tries.length-5)}/5</p>
          {tries.map((item,index)=>{
            const isExpanded = expandedTries.includes(index);
            const guessYear = new Date(item.release_date).getFullYear();
            const targetYear = new Date(movie.release_date).getFullYear();
            const yearDiff = Math.abs(guessYear - targetYear);
            const isMatch = guessYear === targetYear;
            const isClose = yearDiff <= 5;
            const genreMatches = item.genre_ids.filter(id => movie?.genre_ids.includes(id)).length;
            const totalGenres = item.genre_ids.length;
            
            return(
              <div key={item.id} className='p-2 border-2 rounded-lg bg-white shadow-sm animate-slideIn hover:shadow-md transition-shadow cursor-pointer' style={{animationDelay: `${index * 50}ms`}} onClick={()=>setExpandedTries(prev => prev.includes(index) ? prev.filter(i=>i!==index) : [...prev, index])}>
                <div className='flex justify-between items-center gap-2'>
                  <p className='font-semibold text-sm flex-1'>{item.title||item.original_title}</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
                    isMatch ? "bg-green-500 text-white" : 
                    isClose ? "bg-yellow-400 text-black" : 
                    "bg-red-400 text-white"
                  }`}>
                    {guessYear}
                    {!isMatch && (guessYear < targetYear ? " ↑" : " ↓")}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    genreMatches === totalGenres ? "bg-green-500 text-white" :
                    genreMatches > 0 ? "bg-yellow-400 text-black" :
                    "bg-gray-200 text-gray-600"
                  }`}>
                    {genreMatches}/{totalGenres}
                  </span>
                  <span className='text-gray-400'>{isExpanded ? '▲' : '▼'}</span>
                </div>
                {isExpanded && (
                  <div className='flex flex-wrap gap-1 mt-2'>
                    {item.genre_ids.map(genreId=>{
                      const isMatch = genreId===movie?.genre_ids.find(genre=>genre===genreId);
                      return(
                        <span key={genreId} className={`px-2 py-0.5 rounded-full text-xs font-medium ${isMatch?"bg-green-500 text-white":"bg-gray-200 text-gray-600"}`}>
                          {genres.find(genre=>genre.id===genreId)?.name}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <form onSubmit={handleSubmit} className='flex-0 relative flex flex-col sm:flex-row justify-between gap-2'>
            <div className='relative flex-1'>
              <input placeholder='Search for movie title' type="text" className='rounded sm:rounded-r-none w-full text-base sm:text-lg py-2 px-2 border focus-within:outline-none' onBlur={handleBlur} onKeyDown={handleKeyDown} value={selectedMovie?.title||selectedMovie?.original_title} onChange={handleChange} />
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
            <input type="submit" value={"Try"} className='rounded sm:rounded-l-none bg-blue-500 text-white font-semibold py-2 px-4'/>
            <button type="button" onClick={()=>{setIsWin(false);setShowModal(true);setGameStatus(gameStatusVal.finished);showHints();}} className='bg-gray-500 text-white font-semibold rounded py-2 px-4 hover:bg-gray-600' disabled={isDailyChallenge}>Skip</button>
        </form>
      </div>
    </>
  )
}


const Modal = ({isWin, movie, onClose, isDailyChallenge, soundEnabled, setSoundEnabled}) => {
  const [copied, setCopied] = useState(false);
  const stats = JSON.parse(localStorage.getItem('gameStats') || '{"wins":0,"losses":0,"currentStreak":0,"maxStreak":0}');
  const totalGames = stats.wins + stats.losses;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
  
  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('soundEnabled', newValue);
  };
  
  const resetStats = () => {
    if(confirm('Reset all statistics?')) {
      localStorage.setItem('gameStats', JSON.stringify({wins:0,losses:0,currentStreak:0,maxStreak:0}));
      window.location.reload();
    }
  };
  
  useEffect(() => {
    if (isWin) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];

      const frame = () => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return;

        const particleCount = 3;
        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.style.position = 'fixed';
          particle.style.left = Math.random() * 100 + '%';
          particle.style.top = '-10px';
          particle.style.width = '10px';
          particle.style.height = '10px';
          particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
          particle.style.borderRadius = '50%';
          particle.style.pointerEvents = 'none';
          particle.style.zIndex = '9999';
          document.body.appendChild(particle);

          const animation = particle.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
          ], {
            duration: 2000 + Math.random() * 1000,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          });

          animation.onfinish = () => particle.remove();
        }

        requestAnimationFrame(frame);
      };
      frame();
    }
  }, [isWin]);
  
  const shareResults = () => {
    const today = new Date().toISOString().split('T')[0];
    const emoji = isWin ? '🎬' : '❌';
    const result = isWin ? 'Won' : 'Lost';
    const text = `${emoji} Guess the Movie ${isDailyChallenge ? today : ''}
${result}!

Play at: ${window.location.origin}`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn' onClick={onClose}>
      <div className='bg-white rounded-lg p-8 max-w-md mx-4 text-center animate-scaleIn' onClick={(e)=>e.stopPropagation()}>
        <h2 className={`text-4xl font-bold mb-4 ${isWin?'text-green-600':'text-red-600'}`}>
          {isWin ? '🎉 You Won!' : '😔 You Lost!'}
        </h2>
        <p className='text-xl mb-2'>The movie was:</p>
        <p className='text-2xl font-semibold mb-6'>{movie?.title || movie?.original_title}</p>
        
        <div className='grid grid-cols-4 gap-3 mb-6 text-center'>
          <div>
            <p className='text-2xl font-bold'>{totalGames}</p>
            <p className='text-xs text-gray-600'>Played</p>
          </div>
          <div>
            <p className='text-2xl font-bold'>{winRate}%</p>
            <p className='text-xs text-gray-600'>Win Rate</p>
          </div>
          <div>
            <p className='text-2xl font-bold'>{stats.currentStreak}</p>
            <p className='text-xs text-gray-600'>Current Streak</p>
          </div>
          <div>
            <p className='text-2xl font-bold'>{stats.maxStreak}</p>
            <p className='text-xs text-gray-600'>Max Streak</p>
          </div>
        </div>
        <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center'>
          <button onClick={onClose} className='bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors'>
            {isDailyChallenge ? 'Back to Menu' : 'Play Again'}
          </button>
          <button onClick={shareResults} className='bg-green-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors'>
            {copied ? '✓ Copied!' : 'Share Results'}
          </button>
        </div>
        
        <div className='flex gap-2 justify-center mt-4'>
          <button onClick={toggleSound} className='text-gray-600 hover:text-gray-800 p-2' title={soundEnabled ? 'Mute' : 'Unmute'}>
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button onClick={resetStats} className='text-gray-600 hover:text-gray-800 p-2 text-sm' title='Reset Stats'>
            🗑️ Reset
          </button>
        </div>
      </div>
    </div>
  )
}



const Loader = () => {
  return (
    <div className='fixed inset-0 bg-black/30 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-8'>
        <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
      </div>
    </div>
  )
}


const CompletedModal = ({navigate}) => {
  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn'>
      <div className='bg-white rounded-lg p-8 max-w-md mx-4 text-center animate-scaleIn'>
        <h2 className='text-3xl font-bold mb-4'>Already Completed!</h2>
        <p className='text-lg mb-6'>You already completed today's challenge. Come back tomorrow!</p>
        <button onClick={()=>navigate('/')} className='bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors'>
          Back to Menu
        </button>
      </div>
    </div>
  )
}




