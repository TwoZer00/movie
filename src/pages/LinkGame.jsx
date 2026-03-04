import { useEffect, useState, useCallback, useMemo } from 'react'
import { getValidMovie, getCastFromMovie, getMoviesByActor, searchPerson, getMoviesByName, getKeywords, getMovieImages, getMovieAlternativeTitles, getMovie, getDailyLinkMovie, getPersonDetails } from '../api/init';
import { IMG_URL, POSTER_SIZE, PROFILE_SIZE } from '../api/utils/const';
import { Loader } from '../components/UIComponents';
import genres from '../resources/genre.json';
import { useLocation } from 'react-router-dom';

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
          const lastMovie = data.chain[data.chain.length - 1];
          const [movieDetails, credits, keywords, images] = await Promise.all([
            getMovie(lastMovie.data.id),
            getCastFromMovie(lastMovie.data.id),
            getKeywords(lastMovie.data.id),
            getMovieImages(lastMovie.data.id)
          ]);
          const cast = credits.cast.filter(item => item?.profile_path && item?.id && !data.usedActors.some(a => a.id === item.id));
          const logo = images.logos?.find(l => l.iso_639_1 === 'en') || images.logos?.[0];
          const director = credits.crew.find(person => person.job === 'Director');
          setCurrentMovie({...movieDetails, keywords: keywords.slice(0, 3), logo: logo?.file_path, director: director?.name});
          setCurrentCast(cast);
        }
        setLoading(false);
        return;
      }
      movie = await getDailyLinkMovie();
    } else {
      [movie] = await getValidMovie();
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
  }, []);

  useEffect(() => {
    fetchInitialMovie();
  }, [fetchInitialMovie]);

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
        } else {
          const results = await getMoviesByName(query);
          setSearchResults(results.results.slice(0, 10));
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
      setLoading(false);
      return;
    }
    
    // Check if actor was already used
    if (usedActors.some(a => a.id === actor.id)) {
      setErrorMessage(`You already used ${actor.name}!`);
      setLoading(false);
      return;
    }
    
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
      setLoading(false);
      return;
    }
    
    // Check if movie was already used
    if (usedMovies.includes(movie.id)) {
      setErrorMessage(`You already used ${movie.title}!`);
      setLoading(false);
      return;
    }
    
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
      if (isDailyChallenge) {
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
        // Hint 1: Show character name or role
        const randomActor = currentCast[Math.floor(Math.random() * Math.min(5, currentCast.length))];
        const character = randomActor.character || 'Unknown role';
        setHints([`Plays: ${character}`]);
        setActorHints({ actorId: randomActor.id });
      } else if (hints.length === 1 && actorHints) {
        // Hint 2: Birth year
        const personDetails = await getPersonDetails(actorHints.actorId);
        const birthYear = personDetails.birthday ? new Date(personDetails.birthday).getFullYear() : 'Unknown';
        setHints(prev => [...prev, `Born in: ${birthYear}`]);
      } else if (hints.length === 2 && actorHints) {
        // Hint 3: First letter
        const actor = currentCast.find(a => a.id === actorHints.actorId);
        setHints(prev => [...prev, `Name starts with: ${actor.name[0]}`]);
      }
    } else {
      // Hints for guessing movie from actor
      if (hints.length === 0) {
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
        // Hint 2: Other cast members
        const credits = await getCastFromMovie(actorHints.movieId);
        const otherCast = credits.cast
          .filter(c => c.id !== currentActor.id)
          .slice(0, 2)
          .map(c => c.name)
          .join(', ');
        setHints(prev => [...prev, `Also starring: ${otherCast || 'Unknown'}`]);
      } else if (hints.length === 2 && actorHints) {
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
    setShowShareModal(true);
    setTimeout(() => setShowShareModal(false), 2000);
  };

  const reset = () => {
    if (isDailyChallenge) return; // Can't reset daily challenge
    
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

  if (loading && chain.length === 0) return <Loader />;

  return (
    <div className='flex-1 flex flex-col gap-2 p-2 sm:p-4 overflow-hidden dark:bg-gray-900 max-w-4xl mx-auto w-full'>
      <div className='text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white p-2 rounded-lg relative'>
        <h2 className='text-xl font-bold'>🔗 {isDailyChallenge ? 'Daily Link Challenge' : 'Link Chain Challenge'}</h2>
        <div className='flex justify-center items-center gap-4 text-xs opacity-90'>
          <span>Chain: <span className='font-bold'>{Math.floor(chain.length / 2) + 1}</span></span>
          <span>Time: <span className='font-bold'>{getElapsedTime()}</span></span>
          <span>Best: <span className='font-bold'>{getBestChain()}</span></span>
        </div>
        {!isDailyChallenge && !gameOver && (
          <button 
            onClick={reset}
            className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm font-semibold'
          >
            Give Up
          </button>
        )}
      </div>

      {/* Chain Display */}
      <div className='flex gap-2 justify-start items-center bg-white dark:bg-gray-800 p-3 rounded-lg overflow-x-auto'>
        {chain.map((link, i) => (
          <div key={i} className='flex items-center gap-2 animate-fadeIn'>
            {link.type === 'movie' ? (
              <div className='text-center flex-shrink-0 transform hover:scale-105 transition-transform'>
                <div className='w-20 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg flex items-center justify-center p-2'>
                  {link.data.logo ? (
                    <img 
                      src={`${IMG_URL}w500${link.data.logo}`}
                      alt={link.data.title}
                      className='max-w-full max-h-full object-contain'
                    />
                  ) : (
                    <span className='text-2xl'>🎬</span>
                  )}
                </div>
                <p className='text-xs mt-1 dark:text-white max-w-[80px] truncate font-medium'>{link.data.title}</p>
              </div>
            ) : (
              <div className='text-center flex-shrink-0 transform hover:scale-105 transition-transform'>
                <div className='relative'>
                  <img 
                    src={`${IMG_URL}${PROFILE_SIZE.sm}${link.data.profile_path}`}
                    alt={link.data.name}
                    className='w-16 h-16 object-cover rounded-full shadow-lg border-2 border-purple-400'
                  />
                  <div className='absolute -bottom-1 -right-1 bg-purple-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold'>
                    {Math.floor((i + 1) / 2)}
                  </div>
                </div>
                <p className='text-xs mt-1 dark:text-white max-w-[64px] truncate font-medium'>{link.data.name}</p>
              </div>
            )}
            {i < chain.length - 1 && (
              <div className='flex-shrink-0 animate-slideIn'>
                <svg className='w-6 h-6 text-purple-500' fill='currentColor' viewBox='0 0 20 20'>
                  <path fillRule='evenodd' d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z' clipRule='evenodd' />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {gameOver ? (
        <div className='text-center bg-red-50 dark:bg-red-900/30 p-4 rounded-lg'>
          <h3 className='text-xl font-bold text-red-600 dark:text-red-400 mb-2'>🏁 Game Over!</h3>
          <div className='text-sm text-gray-700 dark:text-gray-300 mb-3 space-y-1'>
            <p>Final Chain: <span className='font-bold'>{Math.floor(chain.length / 2) + 1}</span></p>
            <p>Time: <span className='font-bold'>{getElapsedTime()}</span></p>
            <p>Hints Used: <span className='font-bold'>{hintsUsed}</span></p>
            <p>Best Chain: <span className='font-bold'>{getBestChain()}</span></p>
          </div>
          <div className='flex gap-2 justify-center'>
            <button onClick={shareResults} className='bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600'>
              Share Results
            </button>
            {!isDailyChallenge && (
              <button onClick={reset} className='bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600'>
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
          <div className='bg-white dark:bg-gray-800 p-3 rounded-lg text-center flex-shrink-0'>
            {mode === 'guessActor' ? (
              <>
                <h3 className='text-base font-semibold mb-2 dark:text-white'>Current Movie:</h3>
                <div className='flex items-center justify-center gap-3'>
                  <div className='w-32 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg flex items-center justify-center flex-shrink-0 p-2'>
                    {currentMovie?.logo ? (
                      <img 
                        src={`${IMG_URL}w500${currentMovie.logo}`}
                        alt={currentMovie.title}
                        className='max-w-full max-h-full object-contain'
                      />
                    ) : (
                      <span className='text-4xl'>🎬</span>
                    )}
                  </div>
                  <div className='text-left'>
                    <p className='text-lg font-bold dark:text-white'>{currentMovie?.title}</p>
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
                      <p className='text-xs italic text-gray-500 dark:text-gray-400 mb-1'>"{currentMovie.tagline}"</p>
                    )}
                    <div className='flex flex-wrap gap-1'>
                      {currentMovie?.genre_ids?.slice(0, 2).map(gid => (
                        <span key={gid} className='px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs'>
                          {genres.find(g => g.id === gid)?.name}
                        </span>
                      ))}
                      {currentMovie?.keywords?.map(kw => (
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
                <h3 className='text-base font-semibold mb-2 dark:text-white'>Current Actor:</h3>
                <div className='flex items-center justify-center gap-3'>
                  <img 
                    src={`${IMG_URL}${PROFILE_SIZE.md}${currentActor?.profile_path}`}
                    alt={currentActor?.name}
                    className='w-32 h-32 object-cover rounded-full shadow-lg flex-shrink-0'
                  />
                  <p className='text-lg font-bold dark:text-white'>{currentActor?.name}</p>
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
                type='text'
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchQuery && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                placeholder={mode === 'guessActor' ? 'Type actor name...' : 'Type movie title...'}
                className='w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500'
                disabled={loading}
              />
              
              {searching && (
                <div className='absolute right-3 top-3'>
                  <div className='w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin'></div>
                </div>
              )}
              
              {searchResults.length > 0 && showResults && (
                <div className='absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10'>
                  {mode === 'guessActor' ? (
                    searchResults.map(actor => (
                      <button
                        key={actor.id}
                        onClick={() => handleActorSelect(actor)}
                        disabled={loading}
                        className='w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-3 text-left disabled:opacity-50'
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
                    searchResults.map(movie => (
                      <button
                        key={movie.id}
                        onClick={() => handleMovieSelect(movie)}
                        disabled={loading}
                        className='w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-3 text-left disabled:opacity-50'
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

      {loading && chain.length > 0 && (
        <div className='text-center py-4'>
          <div className='inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin'></div>
          <p className='text-sm text-gray-600 dark:text-gray-400 mt-2'>Finding next {mode === 'guessActor' ? 'movie' : 'actor'}...</p>
        </div>
      )}

      {showShareModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl'>
            <p className='text-lg font-semibold text-green-600 dark:text-green-400'>✔ Copied to clipboard!</p>
          </div>
        </div>
      )}
    </div>
  )
}
