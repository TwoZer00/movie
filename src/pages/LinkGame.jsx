import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { getValidMovie, getCastFromMovie, getMoviesByActor, searchPerson, getMoviesByName, getKeywords, getMovieImages, getMovieAlternativeTitles, getMovie, getDailyLinkMovie, getPersonDetails } from '../api/init';
import { IMG_URL, POSTER_SIZE, PROFILE_SIZE } from '../api/utils/const';
import { Loader } from '../components/UIComponents';
import genres from '../resources/genre.json';
import { useLocation } from 'react-router-dom';
import Confetti from '../components/Confetti';
import KeyboardShortcutsModal from '../components/KeyboardShortcutsModal';
import LinkChainHeader from '../components/LinkChainHeader';
import ChainDisplay from '../components/ChainDisplay';
import GameOverScreen from '../components/GameOverScreen';
import SearchSection from '../components/SearchSection';
import AdSense from '../components/AdSense';
import AdSenseVertical from '../components/AdSenseVertical';
import winSound from '../resources/win_sound.wav';
import lossSound from '../resources/loss_sound.wav';
import { trackGameStart, trackGameEnd, trackHintUsed, trackShare, trackUndo, trackDailyChallengeComplete, trackGameDuration, trackSearch } from '../utils/analytics';
import { generateShareImage, downloadImage, shareImageNative } from '../utils/shareImage';

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export default function LinkGame() {
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
          trackSearch('link_chain', query, results.results.length);
        } else {
          const results = await getMoviesByName(query);
          setSearchResults(results.results.slice(0, 10));
          trackSearch('link_chain', query, results.results.length);
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
        trackHintUsed('link_chain', 'actor_character');
        // Hint 1: Show character name or role
        const randomActor = currentCast[Math.floor(Math.random() * Math.min(5, currentCast.length))];
        const character = randomActor.character || 'Unknown role';
        setHints([`Plays: ${character}`]);
        setActorHints({ actorId: randomActor.id });
      } else if (hints.length === 1 && actorHints) {
        trackHintUsed('link_chain', 'actor_birth_year');
        // Hint 2: Birth year
        const personDetails = await getPersonDetails(actorHints.actorId);
        const birthYear = personDetails.birthday ? new Date(personDetails.birthday).getFullYear() : 'Unknown';
        setHints(prev => [...prev, `Born in: ${birthYear}`]);
      } else if (hints.length === 2 && actorHints) {
        trackHintUsed('link_chain', 'actor_first_letter');
        // Hint 3: First letter
        const actor = currentCast.find(a => a.id === actorHints.actorId);
        setHints(prev => [...prev, `Name starts with: ${actor.name[0]}`]);
      }
    } else {
      // Hints for guessing movie from actor
      if (hints.length === 0) {
        trackHintUsed('link_chain', 'movie_year_genre');
        // Hint 1: Get random movie from actor and show year + genres
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
        trackHintUsed('link_chain', 'movie_cast');
        // Hint 2: Other cast members
        const credits = await getCastFromMovie(actorHints.movieId);
        const otherCast = credits.cast
          .filter(c => c.id !== currentActor.id)
          .slice(0, 2)
          .map(c => c.name)
          .join(', ');
        setHints(prev => [...prev, `Also starring: ${otherCast || 'Unknown'}`]);
      } else if (hints.length === 2 && actorHints) {
        trackHintUsed('link_chain', 'movie_director');
        // Hint 3: Director
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
    if (isDailyChallenge) return; // Can't reset daily challenge
    
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
      {/* Desktop: Sidebar Ads */}
      <div className='hidden xl:block fixed left-2 top-1/2 -translate-y-1/2 z-10'>
        <AdSenseVertical />
      </div>
      <div className='hidden xl:block fixed right-2 top-1/2 -translate-y-1/2 z-10'>
        <AdSenseVertical />
      </div>
      
      <div className='flex-1 flex flex-col gap-2 p-2 sm:p-4 overflow-hidden dark:bg-gray-900 max-w-4xl mx-auto w-full pb-16 lg:pb-4'>
      {loading && chain.length > 0 && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg'>
            <div className='w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3'></div>
            <p className='text-gray-700 dark:text-gray-300 font-semibold'>Loading...</p>
          </div>
        </div>
      )}
      <div className='text-center bg-gradient-to-r from-red-600 to-amber-600 text-white p-2 sm:p-3 rounded-lg relative'>
        <h2 className='text-lg sm:text-xl font-bold'>🔗 {isDailyChallenge ? 'Daily Link' : 'Link Chain'}</h2>
        <div className='flex justify-center items-center gap-2 sm:gap-4 text-xs opacity-90'>
          <span>Chain: <span className='font-bold'>{Math.floor(chain.length / 2) + 1}</span></span>
          <span>Time: <span className='font-bold'>{getElapsedTime()}</span></span>
          <span className='hidden sm:inline'>Best: <span className='font-bold'>{getBestChain()}</span></span>
        </div>
        <div className='absolute right-2 top-1/2 -translate-y-1/2 flex gap-1'>
          <button 
            onClick={() => setShowHelp(true)}
            className='bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs sm:text-sm font-semibold'
            title='Keyboard shortcuts (?)'
          >
            ⌨️
          </button>
          {!isDailyChallenge && !gameOver && chain.length > 1 && (
            <button 
              onClick={handleUndo}
              className='bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold'
              title='Undo last move (U)'
            >
              ↩️
            </button>
          )}
          {!isDailyChallenge && !gameOver && (
            <button 
              onClick={reset}
              className='bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold'
              title='Give up (G)'
            >
              Give Up
            </button>
          )}
        </div>
      </div>

      {/* Chain Display */}
      <ChainDisplay chain={chain} />

      {gameOver ? (
        <div className='text-center bg-red-50 dark:bg-red-900/30 p-4 rounded-lg'>
          <h3 className='text-xl font-bold text-red-600 dark:text-red-400 mb-2'>🏁 Game Over!</h3>
          <div className='text-sm text-gray-700 dark:text-gray-300 mb-3 space-y-1'>
            <p>Final Chain: <span className='font-bold'>{Math.floor(chain.length / 2) + 1}</span></p>
            <p>Time: <span className='font-bold'>{getElapsedTime()}</span></p>
            <p>Hints Used: <span className='font-bold'>{hintsUsed}</span></p>
            <p>Best Chain: <span className='font-bold'>{getBestChain()}</span></p>
          </div>
          
          {/* Chain Summary */}
          <div className='mb-3 p-3 bg-white dark:bg-gray-800 rounded-lg max-h-48 overflow-y-auto'>
            <p className='text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2'>Your Chain:</p>
            <div className='flex flex-wrap gap-2 justify-center text-xs'>
              {chain.map((link, i) => (
                <span key={i} className='flex items-center gap-1'>
                  <span className='font-medium dark:text-white'>
                    {link.type === 'movie' ? `🎬 ${link.data.title}` : `👤 ${link.data.name}`}
                  </span>
                  {i < chain.length - 1 && <span className='text-amber-600'>→</span>}
                </span>
              ))}
            </div>
          </div>
          
          <div className='flex gap-2 justify-center'>
            <button onClick={shareResults} className='bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600'>
              Share Results
            </button>
            <button onClick={handleShareImage} className='bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-700'>
              📷 Share Image
            </button>
            {!isDailyChallenge && (
              <button onClick={reset} className='bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700'>
                New Challenge
              </button>
            )}
          </div>
          {isDailyChallenge && (
            <p className='text-xs text-gray-600 dark:text-gray-400 mt-2'>Come back tomorrow for a new challenge!</p>
          )}
        </div>
      ) : (
        <>
          {/* Current Movie or Actor */}
          <div className='bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg text-center flex-shrink-0'>
            {mode === 'guessActor' ? (
              <>
                <h3 className='text-sm sm:text-base font-semibold mb-2 dark:text-white'>Current Movie:</h3>
                <div className='flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3'>
                  <div className='w-24 h-36 sm:w-32 sm:h-48 bg-gradient-to-br from-red-600 to-amber-600 rounded-lg shadow-lg flex items-center justify-center flex-shrink-0 p-2'>
                    {currentMovie?.logo ? (
                      <img 
                        src={`${IMG_URL}w500${currentMovie.logo}`}
                        alt={currentMovie.title}
                        className='max-w-full max-h-full object-contain'
                      />
                    ) : (
                      <span className='text-3xl sm:text-4xl'>🎬</span>
                    )}
                  </div>
                  <div className='text-center sm:text-left'>
                    <p className='text-base sm:text-lg font-bold dark:text-white'>{currentMovie?.title}</p>
                    {currentMovie?.original_title && currentMovie.original_title !== currentMovie.title && (
                      <p className='text-xs text-gray-500 dark:text-gray-400 italic'>Original: {currentMovie.original_title}</p>
                    )}
                    <p className='text-xs text-gray-500 dark:text-gray-400 mb-1'>
                      {new Date(currentMovie?.release_date).getFullYear()}
                      {currentMovie?.origin_country?.[0] && ` • ${currentMovie.origin_country[0]}`}
                      {currentMovie?.original_language && ` • ${currentMovie.original_language.toUpperCase()}`}
                    </p>
                    {currentMovie?.director && (
                      <p className='text-xs text-gray-600 dark:text-gray-400 mb-1'>🎬 {currentMovie.director}</p>
                    )}
                    {currentMovie?.tagline && (
                      <p className='text-xs italic text-gray-500 dark:text-gray-400 mb-1 hidden sm:block'>"{currentMovie.tagline}"</p>
                    )}
                    <div className='flex flex-wrap gap-1 justify-center sm:justify-start'>
                      {currentMovie?.genre_ids?.slice(0, 2).map(gid => (
                        <span key={gid} className='px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-full text-xs'>
                          {genres.find(g => g.id === gid)?.name}
                        </span>
                      ))}
                      {currentMovie?.keywords?.slice(0, 2).map(kw => (
                        <span key={kw.id} className='px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs'>
                          #{kw.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 className='text-sm sm:text-base font-semibold mb-2 dark:text-white'>Current Actor:</h3>
                <div className='flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3'>
                  <img 
                    src={`${IMG_URL}${PROFILE_SIZE.md}${currentActor?.profile_path}`}
                    alt={currentActor?.name}
                    className='w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-full shadow-lg flex-shrink-0'
                  />
                  <p className='text-base sm:text-lg font-bold dark:text-white'>{currentActor?.name}</p>
                </div>
              </>
            )}
          </div>

          {/* Search */}
          <div className='bg-white dark:bg-gray-800 p-3 rounded-lg flex-1 flex flex-col min-h-0'>
            <div className='flex justify-between items-center mb-2'>
              <h3 className='text-sm font-semibold dark:text-white'>
                {mode === 'guessActor' ? 'Search actor:' : 'Search movie:'}
              </h3>
              {hintsUsed < 3 && !gameOver && (
                <button 
                  onClick={getHint}
                  disabled={loading}
                  className='bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-semibold disabled:opacity-50'
                >
                  Get Hint ({hintsUsed}/3)
                </button>
              )}
            </div>
            
            {hints.length > 0 && (
              <div className='mb-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded space-y-1'>
                {hints.map((hint, i) => (
                  <p key={i} className='text-sm text-blue-700 dark:text-blue-300'>💡 {hint}</p>
                ))}
              </div>
            )}
            
            {mode === 'guessActor' && usedActors.length > 0 && (
              <div className='mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded text-sm'>
                <p className='text-gray-700 dark:text-gray-300'>Can't use: {usedActors.map(a => a.name).join(', ')}</p>
              </div>
            )}
            
            {mode === 'guessMovie' && usedMovies.length > 1 && (
              <div className='mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded text-sm'>
                <p className='text-gray-700 dark:text-gray-300'>Can't reuse movies</p>
              </div>
            )}
            
            <div className='relative'>
              <input 
                ref={searchInputRef}
                type='text'
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchQuery('');
                    setSearchResults([]);
                    setShowResults(false);
                    setSelectedIndex(-1);
                  } else if (e.key === 'Enter' && searchResults.length === 1) {
                    e.preventDefault();
                    if (mode === 'guessActor') {
                      handleActorSelect(searchResults[0]);
                    } else {
                      handleMovieSelect(searchResults[0]);
                    }
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
                      if (newIndex >= 0) {
                        document.querySelector(`#link-result-${newIndex}`)?.scrollIntoView({ block: 'nearest' });
                      }
                      return newIndex;
                    });
                  } else if (e.key === 'Enter' && selectedIndex >= 0) {
                    e.preventDefault();
                    if (mode === 'guessActor') {
                      handleActorSelect(searchResults[selectedIndex]);
                    } else {
                      handleMovieSelect(searchResults[selectedIndex]);
                    }
                  }
                }}
                placeholder={mode === 'guessActor' ? 'Type actor name...' : 'Type movie title...'}
                className='w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600'
                disabled={loading}
              />
              
              {searching && (
                <div className='absolute right-3 top-3'>
                  <div className='w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin'></div>
                </div>
              )}
              
              {searchResults.length > 0 && showResults && (
                <div className='absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10'>
                  {mode === 'guessActor' ? (
                    searchResults.map((actor, index) => (
                      <button
                        id={`link-result-${index}`}
                        key={actor.id}
                        onClick={() => handleActorSelect(actor)}
                        disabled={loading}
                        className={`w-full p-4 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-3 text-left disabled:opacity-50 active:bg-gray-200 dark:active:bg-gray-500 ${selectedIndex === index ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                      >
                        {actor.profile_path && (
                          <img 
                            src={`${IMG_URL}${PROFILE_SIZE.sm}${actor.profile_path}`}
                            alt={actor.name}
                            className='w-12 h-12 rounded-full object-cover'
                          />
                        )}
                        <div>
                          <p className='font-medium dark:text-white'>{actor.name}</p>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>{actor.known_for_department}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    searchResults.map((movie, index) => (
                      <button
                        id={`link-result-${index}`}
                        key={movie.id}
                        onClick={() => handleMovieSelect(movie)}
                        disabled={loading}
                        className={`w-full p-4 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-3 text-left disabled:opacity-50 active:bg-gray-200 dark:active:bg-gray-500 ${selectedIndex === index ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                      >
                        {movie.poster_path && (
                          <img 
                            src={`${IMG_URL}${POSTER_SIZE.sm}${movie.poster_path}`}
                            alt={movie.title}
                            className='w-12 h-18 object-cover rounded'
                          />
                        )}
                        <div>
                          <p className='font-medium dark:text-white'>{movie.title}</p>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>{new Date(movie.release_date).getFullYear()}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            
            {errorMessage && (
              <p className='mt-3 text-red-600 dark:text-red-400 text-center font-medium'>{errorMessage}</p>
            )}
          </div>
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
      
      {/* Mobile/Tablet: Bottom Ad */}
        <div className='xl:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 py-2 h-16 overflow-hidden'>
        <div className='max-w-screen-lg mx-auto h-full'>
          <AdSense />
        </div>
      </div>
    </>
  )
}
