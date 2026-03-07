import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { getMoviesByName, getValidMovie, getDailyMovie, getCastFromMovie, getKeywords } from "../api/init";
import { IMG_URL, POSTER_SIZE } from '../api/utils/const';
import { useLocation, useNavigate } from 'react-router-dom';
import genres from '../resources/genre.json'
import winSound from '../resources/win_sound.wav'
import lossSound from '../resources/loss_sound.wav'
import CastMember from '../components/CastMember';
import TryItem from '../components/TryItem';
import Modal from '../components/Modal';
import { Loader, SkipButton } from '../components/UIComponents';
import { CastSkeleton } from '../components/Skeleton';
import { Toast } from '../components/Toast';
import { gameStatusVal, loadStatus } from '../utils/constants';
import AdSense from '../components/AdSense';
import AdSenseVertical from '../components/AdSenseVertical';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal';
import { trackGameStart, trackGameEnd, trackSkip, trackCollectionStart, trackDailyChallengeComplete, trackGameDuration, trackSearch } from '../utils/analytics';
import { generateShareImage, downloadImage, shareImageNative } from '../utils/shareImage';

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
  const [toast, setToast] = useState(null);
  const [revealedLetters, setRevealedLetters] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [director, setDirector] = useState(null);
  const [collectionId, setCollectionId] = useState(null);
  const [shakeInput, setShakeInput] = useState(false);
  const [lastTryCount, setLastTryCount] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);
  const [matchedGenres, setMatchedGenres] = useState([]);
  const [yearHints, setYearHints] = useState({ min: null, max: null });
  const [startTime, setStartTime] = useState(Date.now());
  const [showHelp, setShowHelp] = useState(false);
  const [showShareImage, setShowShareImage] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState(null);

  const fetchData = useCallback(async ()=>{
    lStatus.current = loadStatus.loading
    try {
      let movie, cast, credits;
      
      if(isDailyChallenge) {
        movie = await getDailyMovie();
        credits = await getCastFromMovie(movie.id);
        cast = credits.cast.filter((item) => item?.profile_path !== null && item?.cast_id !== null && item?.id !== null);
      } else {
        const stateWithUpdatedPlayed = location.state?.collectionId ? {
          ...location.state,
          playedMovies: [...JSON.parse(localStorage.getItem(`collection_${location.state.collectionId}_played`) || '[]'), ...getRecentMovies()]
        } : { playedMovies: getRecentMovies() };
        
        try {
          [movie, cast] = await getValidMovie(stateWithUpdatedPlayed);
          credits = await getCastFromMovie(movie.id);
        } catch (error) {
          if (error.message === 'COLLECTION_COMPLETE') {
            const collectionId = location.state?.collectionId;
            if (collectionId && confirm('You\'ve played all movies in this collection! Reset and start over?')) {
              localStorage.removeItem(`collection_${collectionId}_played`);
              return fetchData();
            } else {
              navigate('/');
              return;
            }
          }
          throw error;
        }
      }
      
      const sortedCast = cast
        .sort((a, b) => a.order - b.order)
        .slice(0, 5)
        .reverse();

      const movieKeywords = await getKeywords(movie.id);
      const movieDirector = credits.crew.find(person => person.job === 'Director');

      setMovie(movie);
      setHints(sortedCast.map((item, index) => 
        index === 0 ? item : { id: item.id }
      ));
      setCast(sortedCast);
      setKeywords(movieKeywords);
      setDirector(movieDirector);
      setRevealedLetters([]);
      setCollectionId(location.state?.collectionId || null);
      setLoading(false);
      
      if (location.state?.collectionId) {
        trackCollectionStart(location.state.collectionId, location.state.collectionName || 'Custom Collection');
      } else {
        trackGameStart(isDailyChallenge ? 'guess_by_cast_daily' : 'guess_by_cast');
      }
    } catch (error) {
      lStatus.current = loadStatus.error
      console.error('Error fetching movie data:', error);
      setLoading(false);
      setToast({ message: 'Failed to load movie. Please try again.', type: 'error' });
      setTimeout(() => navigate('/'), 2000);
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
    
    // Clear session movies when leaving the game
    const handleBeforeUnload = () => {
      if (window.location.pathname !== '/play') {
        sessionStorage.removeItem('sessionPlayedMovies');
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [fetchData, navigate]);

  useEffect(() => {
    if(gameStatus === gameStatusVal.playing) {
      const handleKeyDown = (e) => {
        if(e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
          e.preventDefault();
        }
      };
      const handleContextMenu = (e) => e.preventDefault();
      
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('contextmenu', handleContextMenu);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [gameStatus]);

  const showHints = useCallback(()=>{
    setHints([...cast]);
  },[cast]);

  const handleSubmit = useCallback((e)=>{
    e.preventDefault();
    if(!selectedMovie.id) return;
    if(selectedMovie.original_title===movie.original_title){
      // Save completed movie for collection
      if(collectionId) {
        const playedKey = `collection_${collectionId}_played`;
        const playedMovies = JSON.parse(localStorage.getItem(playedKey) || '[]');
        if(!playedMovies.includes(movie.id)) {
          playedMovies.push(movie.id);
          localStorage.setItem(playedKey, JSON.stringify(playedMovies));
        }
      }
      
      if(isDailyChallenge) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`daily_${today}`, 'completed');
      }
      const stats = JSON.parse(localStorage.getItem('gameStats') || '{"wins":0,"losses":0,"currentStreak":0,"maxStreak":0}');
      stats.wins++;
      stats.currentStreak++;
      stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
      localStorage.setItem('gameStats', JSON.stringify(stats));
      
      const gameDuration = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
      trackGameDuration(isDailyChallenge ? 'guess_by_cast_daily' : 'guess_by_cast', gameDuration);
      trackGameEnd(isDailyChallenge ? 'guess_by_cast_daily' : 'guess_by_cast', 'win', tries.length + 1);
      
      if (isDailyChallenge) {
        trackDailyChallengeComplete('guess_by_cast', 'win', tries.length + 1);
      }
      
      setIsWin(true);
      setShowModal(true);
      if(soundEnabled) winAudio.current.play();
      setGameStatus(gameStatusVal.finished);
      return;
    }
    
    // Wrong answer - shake animation
    setShakeInput(true);
    setTimeout(() => setShakeInput(false), 500);
    if(tries.length+1>4){
      if(isDailyChallenge) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`daily_${today}`, 'completed');
      }
      const stats = JSON.parse(localStorage.getItem('gameStats') || '{"wins":0,"losses":0,"currentStreak":0,"maxStreak":0}');
      stats.losses++;
      stats.currentStreak = 0;
      localStorage.setItem('gameStats', JSON.stringify(stats));
      
      const gameDuration = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
      trackGameDuration(isDailyChallenge ? 'guess_by_cast_daily' : 'guess_by_cast', gameDuration);
      trackGameEnd(isDailyChallenge ? 'guess_by_cast_daily' : 'guess_by_cast', 'loss', tries.length + 1);
      
      if (isDailyChallenge) {
        trackDailyChallengeComplete('guess_by_cast', 'loss', tries.length + 1);
      }
      
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
    
    // Track matched genres
    const matchingGenres = selectedMovie.genre_ids?.filter(gid => movie?.genre_ids?.includes(gid)) || [];
    if (matchingGenres.length > 0) {
      setMatchedGenres(prev => [...new Set([...prev, ...matchingGenres])]);
    }
    
    // Track year hints
    if (selectedMovie.release_date && movie?.release_date) {
      const guessYear = new Date(selectedMovie.release_date).getFullYear();
      const targetYear = new Date(movie.release_date).getFullYear();
      const diff = Math.abs(guessYear - targetYear);
      
      if (diff <= 5) {
        setYearHints(prev => ({
          min: prev.min ? Math.max(prev.min, targetYear - 10) : targetYear - 10,
          max: prev.max ? Math.min(prev.max, targetYear + 10) : targetYear + 10
        }));
      }
    }
    
    setLastTryCount(tries.length + 1);
    
    const title = movie.title || movie.original_title;
    const letters = title.replace(/[^a-zA-Z]/g, '').split('');
    const maxReveals = Math.ceil(letters.length * 0.5); // Max 50% of letters
    if(letters.length > 0 && revealedLetters.length < maxReveals) {
      const availableIndices = letters.map((_, i) => i).filter(i => !revealedLetters.includes(i));
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      setRevealedLetters(prev => [...prev, randomIndex]);
    }
    
    e.target.querySelector("input").focus();
  },[selectedMovie, movie, tries.length, cast, isDailyChallenge, soundEnabled, collectionId]);

  const handleChange = useCallback((e) => {
    const movie = {original_title:e.target.value}
  
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    setSelectedMovie(movie);
    setSelectedIndex(-1);
  
    if (movie.original_title.trim()) {
      setVisible(true);
      setSearchLoading(true);
      searchTimeout.current = setTimeout(() => {
        getMoviesByName(movie.original_title)
          .then(data => {
            let results = data.results;
            
            trackSearch('guess_by_cast', movie.original_title, results.length);
            
            // Filter by matched genres
            if (matchedGenres.length > 0) {
              results = results.filter(m => 
                m.genre_ids?.some(gid => matchedGenres.includes(gid))
              );
            }
            
            // Filter by year hints
            if (yearHints.min !== null && yearHints.max !== null) {
              results = results.filter(m => {
                if (!m.release_date) return false;
                const movieYear = new Date(m.release_date).getFullYear();
                return movieYear >= yearHints.min && movieYear <= yearHints.max;
              });
            }
            
            setMovieSearchList(results);
            setSearchLoading(false);
          })
          .catch(error => {
            console.error('Error fetching movies:', error);
            setMovieSearchList([]);
            setSearchLoading(false);
          });
      }, 500);
    } else {
      setMovieSearchList([]);
      setSearchLoading(false);
    }
  },[matchedGenres, yearHints]);
  
  const handleKeyDown = useCallback((e) => {
    if (!visible || movieSearchList.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => {
        const newIndex = prev < movieSearchList.length - 1 ? prev + 1 : prev;
        document.querySelector(`#search-result-${newIndex}`)?.scrollIntoView({ block: 'nearest' });
        return newIndex;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => {
        const newIndex = prev > 0 ? prev - 1 : -1;
        if (newIndex >= 0) {
          document.querySelector(`#search-result-${newIndex}`)?.scrollIntoView({ block: 'nearest' });
        }
        return newIndex;
      });
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

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      if (e.key === '?' || e.key === '/') {
        e.preventDefault();
        setShowHelp(true);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        document.querySelector('input[type="text"]')?.focus();
      } else if ((e.key === 'p' || e.key === 'P') && tries.length < 4 && gameStatus === gameStatusVal.playing) {
        e.preventDefault();
        handlePass();
      } else if ((e.key === 'k' || e.key === 'K') && !isDailyChallenge && gameStatus === gameStatusVal.playing) {
        e.preventDefault();
        handleSkip();
      } else if (e.key === 'Escape' && showHelp) {
        setShowHelp(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [tries.length, gameStatus, isDailyChallenge, showHelp]);

  const reset = useCallback(async ()=>{
    setLoading(true);
    setTries([]);
    setMovieSearchList([]);
    setGameStatus(gameStatusVal.playing);
    setShowModal(false);
    setRevealedLetters([]);
    setKeywords([]);
    setDirector(null);
    setMatchedGenres([]);
    setYearHints({ min: null, max: null });
    setSelectedMovie({original_title:""});
    
    if (movie?.id) {
      addMovieCooldown(movie.id);
    }
    
    fetchData();
  },[fetchData, movie]);

  const posterUrl = useMemo(() => 
    movie?.backdrop_path ? `${IMG_URL}${POSTER_SIZE.lg}/${movie.backdrop_path}` : 
    movie?.poster_path ? `${IMG_URL}${POSTER_SIZE.lg}/${movie.poster_path}` : null,
    [movie?.backdrop_path, movie?.poster_path]
  );

  const blurAmount = useMemo(() => {
    const maxBlur = 20;
    const minBlur = 0;
    return Math.max(minBlur, maxBlur - (tries.length * 4));
  }, [tries.length]);

  const imageScale = useMemo(() => {
    const maxScale = 2.5;
    const minScale = 1;
    const scaleStep = (maxScale - minScale) / 5;
    return Math.max(minScale, maxScale - (tries.length * scaleStep));
  }, [tries.length]);

  const displayTitle = useMemo(() => {
    if(gameStatus === gameStatusVal.finished) return movie?.title || movie?.original_title;
    if(!movie || tries.length === 0) return '???';
    
    const title = movie.title || movie.original_title;
    let letterIndex = -1;
    
    return title.split('').map((char, i) => {
      if(/[a-zA-Z]/.test(char)) {
        letterIndex++;
        const isRevealed = revealedLetters.includes(letterIndex);
        return isRevealed ? <span key={i} className='inline-block animate-popIn'>{char}</span> : '_';
      }
      return revealedLetters.length > 0 ? char : '_';
    });
  }, [movie, gameStatus, revealedLetters, tries.length]);

  const handleSkip = useCallback(() => {
    trackSkip();
    if(collectionId) {
      if(confirm('Skip this movie and get a new one from the collection?')) {
        reset();
      }
    } else {
      setIsWin(false);
      setShowModal(true);
      setGameStatus(gameStatusVal.finished);
      showHints();
    }
  }, [showHints, collectionId, reset]);

  const handlePass = useCallback(() => {
    if(tries.length >= 4) return;
    
    setTries((value) => {
      const temp = [...value];
      temp.push({id: `pass-${tries.length}-${Date.now()}`, original_title: '(Passed)', passed: true});
      return temp;
    });
    setHints((value) => {
      const temp = [...value];
      temp[tries.length + 1] = cast[tries.length + 1];
      return temp;
    });
    
    setLastTryCount(tries.length + 1);
    
    const title = movie.title || movie.original_title;
    const letters = title.replace(/[^a-zA-Z]/g, '').split('');
    const maxReveals = Math.ceil(letters.length * 0.5); // Max 50% of letters
    if(letters.length > 0 && revealedLetters.length < maxReveals) {
      const availableIndices = letters.map((_, i) => i).filter(i => !revealedLetters.includes(i));
      const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
      setRevealedLetters(prev => [...prev, randomIndex]);
    }
  }, [tries.length, cast, movie, revealedLetters]);

  const handleShareImage = async () => {
    const stats = JSON.parse(localStorage.getItem('gameStats') || '{"wins":0,"losses":0,"currentStreak":0,"maxStreak":0}');
    
    const imageData = await generateShareImage({
      type: 'guess',
      mode: isDailyChallenge ? '🎯 Daily Challenge' : '🎬 Guess by Cast',
      isWin,
      tries: tries.length + 1,
      difficulty: 'Medium',
      streak: stats.currentStreak
    });
    
    const shared = await shareImageNative(imageData, 'Filmdle Result', 'Check out my Filmdle result!');
    if (!shared) {
      setShareImageUrl(imageData);
      setShowShareImage(true);
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showModal && <Modal isWin={isWin} movie={movie} onClose={isDailyChallenge ? ()=>navigate('/') : reset} isDailyChallenge={isDailyChallenge} triesUsed={tries.length} revealedCast={cast} onShareImage={handleShareImage} />}
      {showHelp && <KeyboardShortcutsModal onClose={() => setShowHelp(false)} mode='guess' />}
      {showShareImage && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4' onClick={() => setShowShareImage(false)}>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg' onClick={(e) => e.stopPropagation()}>
            <h3 className='text-xl font-bold mb-4 dark:text-white'>Share Result</h3>
            <img src={shareImageUrl} alt='Result' className='w-full rounded mb-4' />
            <div className='flex gap-2'>
              <button onClick={() => downloadImage(shareImageUrl, 'filmdle-result.png')} className='flex-1 bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700'>Download</button>
              <button onClick={() => setShowShareImage(false)} className='flex-1 bg-gray-500 text-white py-2 rounded font-semibold hover:bg-gray-600'>Close</button>
            </div>
          </div>
        </div>
      )}
      {loading && !movie && <Loader />}
      {loading && movie && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg'>
            <div className='w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3'></div>
            <p className='text-gray-700 dark:text-gray-300 font-semibold'>Loading next movie...</p>
          </div>
        </div>
      )}
      <SkipButton onSkip={handleSkip} disabled={isDailyChallenge} />
      
      {/* Desktop: Sidebar Ads */}
      <div className='hidden xl:block fixed left-2 top-1/2 -translate-y-1/2 z-10'>
        <AdSenseVertical />
      </div>
      <div className='hidden xl:block fixed right-2 top-1/2 -translate-y-1/2 z-10'>
        <AdSenseVertical />
      </div>
      
      <div className='flex-1 flex flex-col gap-2 px-2 sm:px-4 max-h-screen overflow-hidden dark:bg-gray-900 pb-16 lg:pb-4 max-w-6xl mx-auto w-full'>
        <div className='py-2 flex justify-between items-center'>
          <h1 className='text-xl sm:text-2xl font-bold dark:text-white'>
            {isDailyChallenge ? '🎯 Daily Challenge' : '🎬 Guess by Cast'}
          </h1>
          <button 
            onClick={() => setShowHelp(true)}
            className='bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold'
            title='Keyboard shortcuts (?)'
          >
            ⌨️
          </button>
        </div>
        <div className='py-2 flex flex-row items-start gap-3 sm:gap-4 max-w-4xl mx-auto'>
          <div className='flex-shrink-0'>
            <div className='aspect-[16/9] w-32 sm:w-48 md:w-64 flex justify-center shadow-lg rounded overflow-hidden dark:shadow-gray-800 select-none bg-gray-200 dark:bg-gray-700' onContextMenu={(e)=>e.preventDefault()}>{
              gameStatus===gameStatusVal.finished ?
                <img src={posterUrl} className='object-cover w-full h-full animate-fadeIn blur-sm animate-[unblur_1s_ease-out_forwards] pointer-events-none' loading="eager" alt="Movie backdrop" style={{animationDelay: '0.3s'}} draggable="false" onError={(e) => e.target.style.display = 'none'} />
              : tries.length > 0 ?
                <img src={posterUrl} className='object-cover w-full h-full transition-all duration-500 pointer-events-none' loading="eager" alt="Movie backdrop" style={{filter: `blur(${blurAmount}px)`, transform: `scale(${imageScale})`}} draggable="false" onError={(e) => e.target.style.display = 'none'} />
              :
              <div className='w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
                <span className='text-4xl'>?</span>
              </div>
            }
            </div>
          </div>
          <div className='flex-1 flex flex-col gap-2'>
            <div>
              <p className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1'>Movie Title</p>
              <div className='border-2 rounded-lg py-3 px-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600 min-h-[3rem] flex items-center justify-center'>
                <p className='font-bold text-sm sm:text-lg text-center dark:text-white font-mono tracking-wider break-words'>
                  {displayTitle}
                </p>
              </div>
            </div>
            <div className='min-h-[4rem]'>
              {tries.length > 0 && gameStatus !== gameStatusVal.finished && keywords.length > 0 && (
                <div className='flex flex-wrap gap-2 mb-2'>
                  {keywords.slice(0, Math.min(tries.length, 3)).map((kw, i) => {
                    const shouldAnimate = i === Math.min(tries.length, 3) - 1 && tries.length === lastTryCount;
                    return (
                      <span key={kw.id} className={`px-3 py-1 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium ${shouldAnimate ? 'animate-popIn' : ''}`} style={{animationDelay: `${i * 100}ms`}}>#{kw.name}</span>
                    );
                  })}
                </div>
              )}
              {tries.length > 0 && gameStatus !== gameStatusVal.finished && (
                <div className='flex flex-wrap gap-2'>
                  {tries.length >= 2 && movie?.genre_ids?.[0] && (
                    <span className={`px-3 py-1 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded-full text-sm font-medium ${tries.length === 2 && lastTryCount === 2 ? 'animate-popIn' : ''}`}>{genres.find(g=>g.id===movie.genre_ids[0])?.name}</span>
                  )}
                  {tries.length >= 3 && movie?.genre_ids?.[1] && (
                    <span className={`px-3 py-1 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded-full text-sm font-medium ${tries.length === 3 && lastTryCount === 3 ? 'animate-popIn' : ''}`} style={{animationDelay: '100ms'}}>{genres.find(g=>g.id===movie.genre_ids[1])?.name}</span>
                  )}
                  {tries.length >= 4 && director && (
                    <span className={`px-3 py-1 bg-orange-100 dark:bg-orange-900 dark:text-orange-300 rounded-full text-sm font-medium ${tries.length === 4 && lastTryCount === 4 ? 'animate-popIn' : ''}`} style={{animationDelay: '200ms'}}>🎬 {director.name}</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-800 p-3 sm:p-4'>
          <p className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 text-center'>Cast Members</p>
          <div className="grid grid-cols-5 gap-2 sm:gap-3 max-w-2xl mx-auto">
            {
              loading ? 
                Array(5).fill(0).map((_, i) => <CastSkeleton key={i} />)
              :
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
        <div className='flex-1 border dark:border-gray-700 px-2 rounded flex flex-col gap-1 overflow-y-auto overflow-x-hidden min-h-0 dark:bg-gray-800'>
          <p className='text-right font-semibold sticky top-0 bg-white dark:bg-gray-800 dark:text-white py-1'>Tries {5 - tries.length}/5</p>
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
              <input placeholder='Search for movie title' type="text" className={`rounded w-full text-base sm:text-lg py-3 px-4 border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus-within:outline-none ${shakeInput ? 'animate-shake border-red-500' : ''}`} onBlur={handleBlur} onKeyDown={handleKeyDown} value={selectedMovie?.title||selectedMovie?.original_title} onChange={handleChange} />
              <ul className={`shadow-xl border-2 border-slate-200 dark:border-gray-600 rounded-tl rounded-tr absolute bottom-full left-0 w-full flex flex-col divide-y dark:divide-gray-600 bg-white dark:bg-gray-800 max-h-[50ch] overflow-y-auto ${visible?"":"hidden"}`}>
                {
                  searchLoading ? (
                    <li className='p-4 text-center text-gray-500 dark:text-gray-400'>
                      <div className='flex items-center justify-center gap-2'>
                        <div className='w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin'></div>
                        Searching...
                      </div>
                    </li>
                  ) : movieSearchList.length > 0 ? (
                    movieSearchList.map((item,index)=>{
                      const showOriginal = item.original_title && item.original_title !== item.title;
                      return(
                        <li id={`search-result-${index}`} key={item.id} className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-4 dark:text-white ${selectedIndex === index ? 'bg-blue-100 dark:bg-blue-900' : ''}`} onClick={()=>setSelectedMovie(item)}>
                          <div>
                            <div>{highlightMatch(item.title||item.original_title, selectedMovie.original_title)} ({new Date(item.release_date).getFullYear()})</div>
                            {showOriginal && <div className='text-xs text-gray-500 dark:text-gray-400 italic'>Original: {item.original_title}</div>}
                          </div>
                        </li>
                      )
                    })
                  ) : (
                    <li className='p-4 text-center text-gray-500 dark:text-gray-400'>No movies found</li>
                  )
                }
              </ul>
            </div>
            <div className='flex gap-2'>
              <input type="submit" value={"Try"} className='flex-1 rounded bg-red-600 text-white font-semibold py-3 px-4 hover:bg-red-700 active:bg-red-800'/>
              <button type="button" onClick={handlePass} disabled={tries.length >= 4} className='rounded bg-gray-500 text-white font-semibold py-3 px-4 hover:bg-gray-600 active:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'>Pass</button>
            </div>
        </form>
      </div>
      
      {/* Mobile/Tablet: Bottom Ad */}
        <div className='lg:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 py-2 h-16 overflow-hidden'>
        <div className='max-w-screen-lg mx-auto h-full'>
          <AdSense />
        </div>
      </div>
    </>
  )
}
