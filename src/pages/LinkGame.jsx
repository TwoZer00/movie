import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getValidMovie, getCastFromMovie, getMoviesByActor, searchPerson, getMoviesByName, getKeywords, getMovieImages, getMovie, getDailyLinkMovie, getPersonDetails } from '../api/init';
import { IMG_URL, PROFILE_SIZE } from '../api/utils/const';
import { Loader } from '../components/UIComponents';
import genres from '../resources/genre.json';
import { useLocation } from 'react-router-dom';
import Confetti from '../components/Confetti';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal';
import ChainDisplay from '../components/ChainDisplay';
import GameOverScreen from '../components/GameOverScreen';
import SearchSection from '../components/SearchSection';
import winSound from '../resources/win_sound.wav';
import lossSound from '../resources/loss_sound.wav';
import { trackGameStart, trackGameEnd, trackHintUsed, trackShare, trackUndo, trackDailyChallengeComplete, trackGameDuration, trackSearch, trackPlayAgain, trackAbandoned, trackSearchNoResults } from '../utils/analytics';
import { generateShareImage, downloadImage, shareImageNative } from '../utils/shareImage';
import { addMovieCooldown, getRecentMovies } from '../utils/movieCooldown';
import AdSenseResponsive from '../components/AdSenseResponsive';

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export default function LinkGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const [chain, setChain] = useState([]);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [currentActor, setCurrentActor] = useState(null);
  const [currentCast, setCurrentCast] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [usedActors, setUsedActors] = useState([]);
  const [usedMovies, setUsedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [searching, setSearching] = useState(false);
  const [mode, setMode] = useState('guessActor'); // 'guessActor' or 'guessMovie'
  const [showResults, setShowResults] = useState(false);
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [hints, setHints] = useState([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [actorHints, setActorHints] = useState(null);
  const [, setTick] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const searchInputRef = useRef(null);
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('soundEnabled') !== 'false');
  const successAudio = useRef(new Audio(winSound));
  const errorAudio = useRef(new Audio(lossSound));
  const [showHelp, setShowHelp] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showShareImage, setShowShareImage] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState(null);

  // Update timer every second
  useEffect(() => {
    if (!gameOver && startTime) {
      const interval = setInterval(() => {
        setTick(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameOver, startTime]);

  const fetchInitialMovie = useCallback(async() =>{
    setLoading(true);
    const isDaily = new URLSearchParams(window.location.search).get('daily') === 'true';
    setIsDailyChallenge(isDaily);
    setStartTime(Date.now());
    
    trackGameStart(isDaily ? 'link_chain_daily' : 'link_chain');
    
    let movie;
    if (isDaily) {
      const today = new Date().toISOString().split('T')[0];
      const savedChain = localStorage.getItem(`daily_link_${today}`);
      if (savedChain) {
        const data = JSON.parse(savedChain);
        setChain(data.chain);
        setUsedActors(data.usedActors);
        setUsedMovies(data.usedMovies);
        setGameOver(data.gameOver);
        setStartTime(data.startTime);
        setEndTime(data.endTime);
        if (!data.gameOver) {
          const lastItem = data.chain[data.chain.length - 1];
          if (lastItem.type === 'movie') {
            const [movieDetails, credits, keywords, images] = await Promise.all([
              getMovie(lastItem.data.id),
              getCastFromMovie(lastItem.data.id),
              getKeywords(lastItem.data.id),
              getMovieImages(lastItem.data.id)
            ]);
            const cast = credits.cast.filter(item => item?.profile_path && item?.id && !data.usedActors.some(a => a.id === item.id));
            const logo = images.logos?.find(l => l.iso_639_1 === 'en') || images.logos?.[0];
            const director = credits.crew.find(person => person.job === 'Director');
            setCurrentMovie({...movieDetails, keywords: keywords.slice(0, 3), logo: logo?.file_path, director: director?.name});
            setCurrentCast(cast);
            setMode('guessActor');
          } else {
            setCurrentActor(lastItem.data);
            setMode('guessMovie');
          }
        }
        setLoading(false);
        return;
      }
      movie = await getDailyLinkMovie();
    } else {
      [movie] = await getValidMovie({ playedMovies: getRecentMovies() });
    }
    
    const [movieDetails, credits, keywords, images] = await Promise.all([
      getMovie(movie.id),
      getCastFromMovie(movie.id),
      getKeywords(movie.id),
      getMovieImages(movie.id)
    ]);
    const cast = credits.cast.filter(item => item?.profile_path && item?.id);
    const logo = images.logos?.find(l => l.iso_639_1 === 'en') || images.logos?.[0];
    const director = credits.crew.find(person => person.job === 'Director');
    
    setCurrentMovie({...movieDetails, keywords: keywords.slice(0, 3), logo: logo?.file_path, director: director?.name});
    setCurrentCast(cast);
    setChain([{ type: 'movie', data: {...movie, logo: logo?.file_path} }]);
    setUsedActors([]);
    setUsedMovies([movie.id]);
    setMode('guessActor');
    setLoading(false);
    
    if (!isDailyChallenge && movie?.id) {
      addMovieCooldown(movie.id);
    }
  }, []);

  useEffect(() => {
    fetchInitialMovie();
  }, [fetchInitialMovie]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;
      
      if (e.key === '?' || e.key === '/') {
        e.preventDefault();
        setShowHelp(true);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if ((e.key === 'h' || e.key === 'H') && hintsUsed < 3 && !gameOver) {
        e.preventDefault();
        getHint();
      } else if ((e.key === 'u' || e.key === 'U') && chain.length > 1 && !isDailyChallenge && !gameOver) {
        e.preventDefault();
        handleUndo();
      } else if ((e.key === 'g' || e.key === 'G') && !isDailyChallenge && !gameOver) {
        e.preventDefault();
        reset();
      } else if (e.key === 'Escape' && showHelp) {
        setShowHelp(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [hintsUsed, gameOver, chain.length, isDailyChallenge, showHelp]);

  // Update timer every second
  useEffect(() => {
    if (!gameOver && startTime) {
      const interval = setInterval(() => {
        setTick(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameOver, startTime]);

  // Track abandonment when leaving mid-game
  useEffect(() => {
    return () => {
      if (!gameOver && chain.length > 1) {
        trackAbandoned(isDailyChallenge ? 'link_chain_daily' : 'link_chain', chain.length);
      }
    };
  }, [gameOver, chain.length, isDailyChallenge]);

  const debouncedSearch = useMemo(
    () => debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      
      setSearching(true);
      setShowResults(true);
      try {
        if (mode === 'guessActor') {
          const results = await searchPerson(query);
          setSearchResults(results.results.slice(0, 10));
          if (results.results.length === 0) trackSearchNoResults('link_chain', query);
        } else {
          const results = await getMoviesByName(query);
          setSearchResults(results.results.slice(0, 10));
          if (results.results.length === 0) trackSearchNoResults('link_chain', query);
        }
      } catch (error) {
        console.error('Search error:', error);
      }
      setSearching(false);
    }, 300),
    [mode]
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
    setErrorMessage('');
    setSelectedIndex(-1);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    // Apply hint filtering after search
    debouncedSearch(query);
  };

  // Apply hint filtering to search results
  useEffect(() => {
    if (searchResults.length > 0 && actorHints && hints.length === 3) {
      if (mode === 'guessActor' && actorHints.actorId) {
        setSearchResults(prev => prev.filter(r => r.id === actorHints.actorId));
      } else if (mode === 'guessMovie' && actorHints.movieId) {
        setSearchResults(prev => prev.filter(r => r.id === actorHints.movieId));
      }
    }
  }, [hints, actorHints, mode]);

  const handleActorSelect = async (actor) => {
    setLoading(true);
    setErrorMessage('');
    
    // Check if actor is in current movie
    const isInMovie = currentCast.some(c => c.id === actor.id);
    if (!isInMovie) {
      setErrorMessage(`${actor.name} is not in ${currentMovie.title}!`);
      if (soundEnabled) errorAudio.current.play();
      setLoading(false);
      return;
    }
    
    // Check if actor was already used
    if (usedActors.some(a => a.id === actor.id)) {
      setErrorMessage(`You already used ${actor.name}!`);
      if (soundEnabled) errorAudio.current.play();
      setLoading(false);
      return;
    }
    
    if (soundEnabled) successAudio.current.play();
    trackSearch('link_chain', actor.name, 1);
    
    // Add actor to chain and switch to movie guessing mode
    setChain(prev => {
      const newChain = [...prev, { type: 'actor', data: actor }];
      if (isDailyChallenge) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`daily_link_${today}`, JSON.stringify({
          chain: newChain,
          usedActors: [...usedActors, actor],
          usedMovies,
          gameOver: false
        }));
      }
      return newChain;
    });
    setUsedActors(prev => [...prev, actor]);
    setCurrentActor(actor);
    setMode('guessMovie');
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setHints([]);
    setHintsUsed(0);
    setActorHints(null);
    setLoading(false);
  };

  const handleMovieSelect = async (movie) => {
    setLoading(true);
    setErrorMessage('');
    
    // Get actor's movies to check if they're in this movie
    const actorMovies = await getMoviesByActor(currentActor.id);
    const isInMovie = actorMovies.cast.some(m => m.id === movie.id);
    
    if (!isInMovie) {
      setErrorMessage(`${currentActor.name} is not in ${movie.title}!`);
      if (soundEnabled) errorAudio.current.play();
      setLoading(false);
      return;
    }
    
    // Check if movie was already used
    if (usedMovies.includes(movie.id)) {
      setErrorMessage(`You already used ${movie.title}!`);
      if (soundEnabled) errorAudio.current.play();
      setLoading(false);
      return;
    }
    
    if (soundEnabled) successAudio.current.play();
    trackSearch('link_chain', movie.title || movie.original_title, 1);
    
    // Get cast from selected movie
    const [movieDetails, nextCredits, keywords, images] = await Promise.all([
      getMovie(movie.id),
      getCastFromMovie(movie.id),
      getKeywords(movie.id),
      getMovieImages(movie.id)
    ]);
    
    const nextCast = nextCredits.cast.filter(item => 
      item?.profile_path && 
      item?.id &&
      !usedActors.some(a => a.id === item.id)
    );
    
    const logo = images.logos?.find(l => l.iso_639_1 === 'en') || images.logos?.[0];
    
    if (nextCast.length === 0) {
      const now = Date.now();
      setEndTime(now);
      setGameOver(true);
      const finalChainLength = chain.length + 2;
      if (finalChainLength >= 10) {
        setShowConfetti(true);
      }
      
      const gameDuration = Math.floor((now - startTime) / 1000);
      trackGameDuration(isDailyChallenge ? 'link_chain_daily' : 'link_chain', gameDuration);
      trackGameEnd(isDailyChallenge ? 'link_chain_daily' : 'link_chain', 'complete', 0, finalChainLength);
      
      if (isDailyChallenge) {
        trackDailyChallengeComplete('link_chain', 'complete', 0, finalChainLength);
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`daily_link_${today}`, JSON.stringify({
          chain: [...chain, { type: 'actor', data: currentActor }, { type: 'movie', data: {...movie, logo: logo?.file_path} }],
          usedActors,
          usedMovies: [...usedMovies, movie.id],
          gameOver: true,
          startTime,
          endTime: now
        }));
      }
      updateBestChain(chain.length + 2);
      setLoading(false);
      return;
    }
    
    const director = nextCredits.crew.find(person => person.job === 'Director');
    
    setChain(prev => {
      const newChain = [...prev, { type: 'movie', data: {...movie, logo: logo?.file_path} }];
      if (isDailyChallenge) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`daily_link_${today}`, JSON.stringify({
          chain: newChain,
          usedActors,
          usedMovies: [...usedMovies, movie.id],
          gameOver: false,
          startTime,
          endTime: null
        }));
      }
      return newChain;
    });
    setUsedMovies(prev => [...prev, movie.id]);
    setCurrentMovie({...movieDetails, keywords: keywords.slice(0, 3), logo: logo?.file_path, director: director?.name});
    setCurrentCast(nextCast);
    setMode('guessActor');
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setHints([]);
    setHintsUsed(0);
    setActorHints(null);
    setLoading(false);
  };

  const getHint = async () => {
    if (hintsUsed >= 3) return;
    
    if (mode === 'guessActor') {
      // Hints for guessing actor from movie - don't reveal which actor
      if (hints.length === 0) {
        trackHintUsed('link_chain', 'actor_character', chain.length);
        const randomActor = currentCast[Math.floor(Math.random() * Math.min(5, currentCast.length))];
        const character = randomActor.character || 'Unknown role';
        setHints([`Plays: ${character}`]);
        setActorHints({ actorId: randomActor.id });
      } else if (hints.length === 1 && actorHints) {
        trackHintUsed('link_chain', 'actor_birth_year', chain.length);
        const personDetails = await getPersonDetails(actorHints.actorId);
        const birthYear = personDetails.birthday ? new Date(personDetails.birthday).getFullYear() : 'Unknown';
        setHints(prev => [...prev, `Born in: ${birthYear}`]);
      } else if (hints.length === 2 && actorHints) {
        trackHintUsed('link_chain', 'actor_first_letter', chain.length);
        const actor = currentCast.find(a => a.id === actorHints.actorId);
        setHints(prev => [...prev, `Name starts with: ${actor.name[0]}`]);
      }
    } else {
      if (hints.length === 0) {
        trackHintUsed('link_chain', 'movie_year_genre', chain.length);
        const actorMovies = await getMoviesByActor(currentActor.id);
        const validMovies = actorMovies.cast.filter(m => !usedMovies.includes(m.id) && m.release_date);
        if (validMovies.length === 0) {
          setHints([`${currentActor.name} has been in many movies`]);
          return;
        }
        const randomMovie = validMovies[Math.floor(Math.random() * Math.min(10, validMovies.length))];
        const movieDetails = await getMovie(randomMovie.id);
        const year = new Date(movieDetails.release_date).getFullYear();
        const genreNames = movieDetails.genres?.slice(0, 2).map(g => g.name).join(', ') || 'Unknown';
        setHints([`${year} • ${genreNames}`]);
        setActorHints({ movieId: randomMovie.id });
      } else if (hints.length === 1 && actorHints) {
        trackHintUsed('link_chain', 'movie_cast', chain.length);
        const credits = await getCastFromMovie(actorHints.movieId);
        const otherCast = credits.cast
          .filter(c => c.id !== currentActor.id)
          .slice(0, 2)
          .map(c => c.name)
          .join(', ');
        setHints(prev => [...prev, `Also starring: ${otherCast || 'Unknown'}`]);
      } else if (hints.length === 2 && actorHints) {
        trackHintUsed('link_chain', 'movie_director', chain.length);
        const credits = await getCastFromMovie(actorHints.movieId);
        const director = credits.crew.find(p => p.job === 'Director');
        setHints(prev => [...prev, `Director: ${director?.name || 'Unknown'}`]);
      }
    }
    
    setHintsUsed(prev => prev + 1);
  };

  const updateBestChain = (length) => {
    const stats = JSON.parse(localStorage.getItem('linkChainStats') || '{}');
    stats.totalGames = (stats.totalGames || 0) + 1;
    stats.totalLinks = (stats.totalLinks || 0) + length;
    if (!stats.bestChain || length > stats.bestChain) {
      stats.bestChain = length;
    }
    localStorage.setItem('linkChainStats', JSON.stringify(stats));
  };

  const getBestChain = () => {
    const stats = JSON.parse(localStorage.getItem('linkChainStats') || '{}');
    return stats.bestChain || 0;
  };

  const getElapsedTime = () => {
    if (!startTime) return '0:00';
    const elapsed = (endTime || Date.now()) - startTime;
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const shareResults = () => {
    const chainLength = Math.floor(chain.length / 2) + 1;
    const time = getElapsedTime();
    const text = `🔗 Filmdle Link Chain ${isDailyChallenge ? '(Daily)' : ''}\n\nChain Length: ${chainLength}\nTime: ${time}\nHints Used: ${hintsUsed}\nBest: ${getBestChain()}\n\nPlay at: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    trackShare(isDailyChallenge ? 'link_chain_daily' : 'link_chain');
    setShowShareModal(true);
    setTimeout(() => setShowShareModal(false), 2000);
  };

  const handleShareImage = async () => {
    trackShare(isDailyChallenge ? 'link_chain_daily' : 'link_chain');
    const chainLength = Math.floor(chain.length / 2) + 1;
    const imageData = await generateShareImage({
      type: 'link',
      mode: isDailyChallenge ? '🔗 Daily Link Chain' : '🔗 Link Chain',
      chainLength,
      time: getElapsedTime(),
      hintsUsed,
      bestChain: getBestChain()
    });
    
    const shared = await shareImageNative(imageData, 'Filmdle Link Chain Result', 'Check out my Filmdle Link Chain!');
    if (!shared) {
      setShareImageUrl(imageData);
      setShowShareImage(true);
    }
  };

  const reset = () => {
    if (isDailyChallenge) return;
    
    const finalChainLength = Math.floor(chain.length / 2) + 1;
    updateBestChain(finalChainLength);
    
    const now = Date.now();
    const gameDuration = Math.floor((now - startTime) / 1000);
    trackGameDuration('link_chain', gameDuration);
    trackGameEnd('link_chain', 'give_up', 0, finalChainLength);
    
    setChain([]);
    setUsedActors([]);
    setUsedMovies([]);
    setCurrentActor(null);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setGameOver(false);
    setErrorMessage('');
    setStartTime(null);
    setEndTime(null);
    setHints([]);
    setHintsUsed(0);
    setActorHints(null);
    fetchInitialMovie();
  };

  const handleUndo = () => {
    if (chain.length <= 1 || isDailyChallenge) return;
    
    trackUndo();
    const lastItem = chain[chain.length - 1];
    
    if (lastItem.type === 'actor') {
      // Remove last actor, go back to guessing actor
      setChain(prev => prev.slice(0, -1));
      setUsedActors(prev => prev.filter(a => a.id !== lastItem.data.id));
      setMode('guessActor');
      setCurrentActor(null);
    } else {
      // Remove last movie, go back to guessing movie
      setChain(prev => prev.slice(0, -1));
      setUsedMovies(prev => prev.filter(id => id !== lastItem.data.id));
      const previousActor = chain[chain.length - 2];
      setMode('guessMovie');
      setCurrentActor(previousActor.data);
    }
    
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setHints([]);
    setHintsUsed(0);
    setActorHints(null);
  };

  if (loading && chain.length === 0) return <Loader />;

  return (
    <>
      {/* Desktop: Sidebar Ads - Hidden on mobile/tablet */}
      <div className='hidden xl:block fixed left-2 top-1/2 -translate-y-1/2 z-10'>
        <AdSenseResponsive format='vertical' />
      </div>
      <div className='hidden xl:block fixed right-2 top-1/2 -translate-y-1/2 z-10'>
        <AdSenseResponsive format='vertical' />
      </div>
      
        <div className='flex-1 flex flex-col gap-2 p-2 sm:p-3 overflow-hidden max-w-4xl mx-auto w-full min-h-0'>
      {loading && chain.length > 0 && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg'>
            <div className='w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3'></div>
            <p className='text-gray-700 dark:text-gray-300 font-semibold'>Loading...</p>
          </div>
        </div>
      )}
      {/* Game header */}
      <div className='card rounded-2xl px-3 py-2.5 flex justify-between items-center flex-shrink-0'>
        <div className='flex items-center gap-1.5'>
          <button
            onClick={() => setShowHelp(true)}
            className='w-9 h-9 rounded-lg bg-black/5 dark:bg-white/8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm flex items-center justify-center transition-colors active:scale-95'
            title='Keyboard shortcuts'
          >?</button>
          {!isDailyChallenge && !gameOver && chain.length > 1 && (
            <button
              onClick={handleUndo}
              className='w-9 h-9 rounded-lg bg-black/5 dark:bg-white/8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm flex items-center justify-center transition-colors active:scale-95'
              title='Undo (U)'
            >↩</button>
          )}
          {!isDailyChallenge && !gameOver && (
            <button
              onClick={reset}
              className='px-3 h-9 rounded-lg bg-black/5 dark:bg-white/8 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-xs font-medium transition-colors active:scale-95'
              title='Give up (G)'
            >Give Up</button>
          )}
        </div>
        <div className='flex items-center gap-3'>
          <div className='text-center'>
            <p className='text-base font-bold text-gray-900 dark:text-white leading-none'>{Math.floor(chain.length / 2) + 1}</p>
            <p className='text-[9px] uppercase tracking-wide text-gray-400'>Chain</p>
          </div>
          <div className='w-px h-6 bg-black/8 dark:bg-white/8' />
          <div className='text-center'>
            <p className='text-base font-bold text-gray-900 dark:text-white leading-none'>{getElapsedTime()}</p>
            <p className='text-[9px] uppercase tracking-wide text-gray-400'>Time</p>
          </div>
          <div className='w-px h-6 bg-black/8 dark:bg-white/8' />
          <div className='text-center'>
            <p className='text-base font-bold text-amber-500 leading-none'>{getBestChain()}</p>
            <p className='text-[9px] uppercase tracking-wide text-gray-400'>Best</p>
          </div>
        </div>
      </div>

      {/* Chain Display */}
      <ChainDisplay chain={chain} />

      {gameOver ? (
        <GameOverScreen
          chain={chain}
          elapsedTime={getElapsedTime()}
          hintsUsed={hintsUsed}
          bestChain={getBestChain()}
          isDailyChallenge={isDailyChallenge}
          onShareResults={shareResults}
          onShareImage={handleShareImage}
          onReset={() => { trackPlayAgain('link_chain'); reset(); }}
          onGoHome={() => navigate('/')}
        />
      ) : (
        <>
          {/* Current Movie or Actor */}
          <div className='card rounded-2xl p-4 flex-shrink-0'>
            {mode === 'guessActor' ? (
              <div className='flex items-center gap-4'>
                <div className='w-20 h-28 sm:w-24 sm:h-32 bg-gradient-to-br from-red-700 to-amber-600 rounded-xl shadow-lg flex items-center justify-center flex-shrink-0 p-2 overflow-hidden'>
                  {currentMovie?.logo ? (
                    <img src={`${IMG_URL}w500${currentMovie.logo}`} alt={currentMovie.title} className='max-w-full max-h-full object-contain' />
                  ) : (
                    <span className='text-3xl'>🎬</span>
                  )}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-[10px] uppercase tracking-widest text-gray-400 mb-1'>Guess an actor from</p>
                  <p className='font-bold text-gray-900 dark:text-white text-base leading-tight'>{currentMovie?.title}</p>
                  {currentMovie?.original_title && currentMovie.original_title !== currentMovie.title && (
                    <p className='text-xs text-gray-400 italic mt-0.5'>{currentMovie.original_title}</p>
                  )}
                  <p className='text-xs text-gray-400 mt-1'>
                    {new Date(currentMovie?.release_date).getFullYear()}
                    {currentMovie?.director && ` · ${currentMovie.director}`}
                  </p>
                  <div className='flex flex-wrap gap-1 mt-2'>
                    {currentMovie?.genre_ids?.slice(0, 2).map(gid => (
                      <span key={gid} className='px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-[10px] font-medium'>
                        {genres.find(g => g.id === gid)?.name}
                      </span>
                    ))}
                    {currentMovie?.keywords?.slice(0, 2).map(kw => (
                      <span key={kw.id} className='px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-[10px]'>#{kw.name}</span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className='flex items-center gap-4'>
                <img
                  src={`${IMG_URL}${PROFILE_SIZE.md}${currentActor?.profile_path}`}
                  alt={currentActor?.name}
                  className='w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-full shadow-lg border-2 border-amber-500 flex-shrink-0'
                />
                <div>
                  <p className='text-[10px] uppercase tracking-widest text-gray-400 mb-1'>Guess a movie with</p>
                  <p className='font-bold text-gray-900 dark:text-white text-base'>{currentActor?.name}</p>
                </div>
              </div>
            )}
          </div>

          <SearchSection
            mode={mode}
            hintsUsed={hintsUsed}
            gameOver={gameOver}
            loading={loading}
            hints={hints}
            usedActors={usedActors}
            usedMovies={usedMovies}
            searchQuery={searchQuery}
            searchResults={searchResults}
            showResults={showResults}
            searching={searching}
            selectedIndex={selectedIndex}
            searchInputRef={searchInputRef}
            onGetHint={getHint}
            onSearchChange={(e) => handleSearch(e.target.value)}
            onSearchFocus={() => searchQuery && setShowResults(true)}
            onSearchBlur={() => setTimeout(() => setShowResults(false), 200)}
            onSearchKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchQuery('');
                setSearchResults([]);
                setShowResults(false);
                setSelectedIndex(-1);
              } else if (e.key === 'ArrowDown' && searchResults.length > 0) {
                e.preventDefault();
                setSelectedIndex(prev => {
                  const newIndex = prev < searchResults.length - 1 ? prev + 1 : prev;
                  document.querySelector(`#link-result-${newIndex}`)?.scrollIntoView({ block: 'nearest' });
                  return newIndex;
                });
              } else if (e.key === 'ArrowUp' && searchResults.length > 0) {
                e.preventDefault();
                setSelectedIndex(prev => {
                  const newIndex = prev > 0 ? prev - 1 : -1;
                  if (newIndex >= 0) document.querySelector(`#link-result-${newIndex}`)?.scrollIntoView({ block: 'nearest' });
                  return newIndex;
                });
              } else if (e.key === 'Enter') {
                e.preventDefault();
                const target = selectedIndex >= 0 ? searchResults[selectedIndex] : searchResults.length === 1 ? searchResults[0] : null;
                if (target) mode === 'guessActor' ? handleActorSelect(target) : handleMovieSelect(target);
              }
            }}
            onActorSelect={handleActorSelect}
            onMovieSelect={handleMovieSelect}
          />
          {errorMessage && (
            <p className='text-red-600 dark:text-red-400 text-center font-medium text-sm animate-shake flex-shrink-0'>{errorMessage}</p>
          )}
        </>
      )}

      </div>
      
      {loading && chain.length > 0 && <Loader />}

      {showShareModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl'>
            <p className='text-lg font-semibold text-green-600 dark:text-green-400'>✔ Copied to clipboard!</p>
          </div>
        </div>
      )}
      
      {showShareImage && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4' onClick={() => setShowShareImage(false)}>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg' onClick={(e) => e.stopPropagation()}>
            <h3 className='text-xl font-bold mb-4 dark:text-white'>Share Result</h3>
            <img src={shareImageUrl} alt='Result' className='w-full rounded mb-4' />
            <div className='flex gap-2'>
              <button onClick={() => downloadImage(shareImageUrl, 'filmdle-link-result.png')} className='flex-1 bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700'>Download</button>
              <button onClick={() => setShowShareImage(false)} className='flex-1 bg-gray-500 text-white py-2 rounded font-semibold hover:bg-gray-600'>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {showHelp && <KeyboardShortcutsModal onClose={() => setShowHelp(false)} mode='link' />}
      {showConfetti && <Confetti />}
    </>
  )
}
