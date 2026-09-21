import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getValidMovie, getCastFromMovie, getMovie, getMoviesByActor, getMoviesByDirector, getMovieImages } from '../api/init';
import { IMG_URL } from '../api/utils/const';
import { Loader } from '../components/UIComponents';
import Confetti from '../components/Confetti';
import AdSenseResponsive from '../components/AdSenseResponsive';
import winSound from '../resources/win_sound.wav';
import lossSound from '../resources/loss_sound.wav';

const CONNECTION_TYPES = [
  { id: 'actor', name: 'Same Actor', weight: 3 },
  { id: 'director', name: 'Same Director', weight: 3 },
  { id: 'year', name: 'Same Year', weight: 2 },
  { id: 'genre', name: 'Same Genre', weight: 2 },
  { id: 'decade', name: 'Same Decade', weight: 2 },
  { id: 'franchise', name: 'Same Franchise', weight: 1 }
];

export default function OddOneOut() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [oddOneIndex, setOddOneIndex] = useState(null);
  const [connection, setConnection] = useState(null);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(3);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('soundEnabled') !== 'false');
  const [preloadedRound, setPreloadedRound] = useState(null);
  const [adKey, setAdKey] = useState(Date.now());
  const successAudio = useRef(new Audio(winSound));
  const errorAudio = useRef(new Audio(lossSound));
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      generateRound();
    }
  }, []);

  const generateRound = async () => {
    setSelected(null);
    setResult(null);

    // Use preloaded round if available
    if (preloadedRound) {
      setMovies(preloadedRound.movies);
      setOddOneIndex(preloadedRound.oddOneIndex);
      setConnection(preloadedRound.connection);
      setPreloadedRound(null);
      setLoading(false);
      
      // Fetch logos in background
      preloadedRound.movies.forEach(async (movie, idx) => {
        if (!movie.images) {
          const images = await getMovieImages(movie.id);
          setMovies(prev => {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], images };
            return updated;
          });
        }
      });
      
      return;
    }

    // Pick random connection type
    const connectionType = CONNECTION_TYPES[Math.floor(Math.random() * CONNECTION_TYPES.length)];
    
    try {
      let connectedMovies = [];
      let connectionInfo = '';

      if (connectionType.id === 'actor') {
        const [baseMovie] = await getValidMovie();
        const credits = await getCastFromMovie(baseMovie.id);
        const mainActor = credits.cast.find(c => c.profile_path);
        if (!mainActor) throw new Error('No actor found');
        
        const actorMovies = await getMoviesByActor(mainActor.id);
        const movieIds = actorMovies.cast
          .filter(m => m.backdrop_path && m.id !== baseMovie.id)
          .slice(0, 3)
          .map(m => m.id);
        
        connectedMovies = await Promise.all(movieIds.map(id => getMovie(id)));
        connectionInfo = mainActor.name;
      } else if (connectionType.id === 'director') {
        const [baseMovie] = await getValidMovie();
        const movieDetails = await getMovie(baseMovie.id);
        const credits = await getCastFromMovie(baseMovie.id);
        const director = credits.crew.find(c => c.job === 'Director');
        if (!director) throw new Error('No director found');
        
        const directorMovies = await getMoviesByDirector(director.id);
        const movieIds = directorMovies.crew
          .filter(m => m.backdrop_path && m.id !== baseMovie.id)
          .slice(0, 3)
          .map(m => m.id);
        
        connectedMovies = await Promise.all(movieIds.map(id => getMovie(id)));
        connectionInfo = director.name;
      } else if (connectionType.id === 'year') {
        const [baseMovie] = await getValidMovie();
        const year = new Date(baseMovie.release_date).getFullYear();
        
        const yearMovies = await fetch(
          `https://api.themoviedb.org/3/discover/movie?primary_release_year=${year}&sort_by=popularity.desc&include_adult=false`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`
            }
          }
        ).then(r => r.json());
        
        connectedMovies = yearMovies.results
          .filter(m => m.backdrop_path && m.id !== baseMovie.id)
          .slice(0, 3);
        
        connectionInfo = year.toString();
      } else if (connectionType.id === 'genre') {
        const [baseMovie] = await getValidMovie();
        const mainGenre = baseMovie.genre_ids[0];
        
        const genreMovies = await fetch(
          `https://api.themoviedb.org/3/discover/movie?with_genres=${mainGenre}&sort_by=popularity.desc&include_adult=false`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`
            }
          }
        ).then(r => r.json());
        
        connectedMovies = genreMovies.results
          .filter(m => m.backdrop_path && m.id !== baseMovie.id && m.genre_ids?.[0] === mainGenre)
          .slice(0, 3);
        
        const genreNames = { 28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime', 18: 'Drama', 878: 'Sci-Fi', 53: 'Thriller', 27: 'Horror' };
        connectionInfo = genreNames[mainGenre] || 'Genre';
      } else if (connectionType.id === 'decade') {
        const [baseMovie] = await getValidMovie();
        const year = new Date(baseMovie.release_date).getFullYear();
        const decade = Math.floor(year / 10) * 10;
        
        const decadeMovies = await fetch(
          `https://api.themoviedb.org/3/discover/movie?primary_release_date.gte=${decade}-01-01&primary_release_date.lte=${decade + 9}-12-31&sort_by=popularity.desc&include_adult=false`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`
            }
          }
        ).then(r => r.json());
        
        connectedMovies = decadeMovies.results
          .filter(m => m.backdrop_path && m.id !== baseMovie.id)
          .slice(0, 3);
        
        connectionInfo = `${decade}s`;
      } else if (connectionType.id === 'franchise') {
        const [baseMovie] = await getValidMovie();
        const movieDetails = await getMovie(baseMovie.id);
        
        if (!movieDetails.belongs_to_collection) throw new Error('No franchise');
        
        const collectionId = movieDetails.belongs_to_collection.id;
        const collection = await fetch(
          `https://api.themoviedb.org/3/collection/${collectionId}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`
            }
          }
        ).then(r => r.json());
        
        connectedMovies = collection.parts
          .filter(m => m.backdrop_path && m.id !== baseMovie.id)
          .slice(0, 3);
        
        connectionInfo = movieDetails.belongs_to_collection.name;
      }

      if (connectedMovies.length < 3) throw new Error('Not enough movies');

      // Remove duplicates from connected movies
      const uniqueConnected = [];
      const seenIds = new Set();
      for (const movie of connectedMovies) {
        if (!seenIds.has(movie.id)) {
          seenIds.add(movie.id);
          uniqueConnected.push(movie);
        }
      }
      
      if (uniqueConnected.length < 3) throw new Error('Not enough unique movies');
      connectedMovies = uniqueConnected.slice(0, 3);

      // Add odd one out (ensure it's different)
      let oddMovie;
      let attempts = 0;
      const connectedIds = connectedMovies.map(m => m.id);
      const franchiseId = connectionType.id === 'franchise' ? (await getMovie(connectedMovies[0].id)).belongs_to_collection?.id : null;
      
      do {
        [oddMovie] = await getValidMovie();
        
        // Check if odd movie is in same franchise
        if (franchiseId) {
          const oddDetails = await getMovie(oddMovie.id);
          if (oddDetails.belongs_to_collection?.id === franchiseId) {
            attempts++;
            continue;
          }
        }
        
        if (!connectedIds.includes(oddMovie.id)) break;
        attempts++;
      } while (attempts < 5);
      
      const oddIndex = Math.floor(Math.random() * 4);
      const allMovies = [...connectedMovies.slice(0, oddIndex), oddMovie, ...connectedMovies.slice(oddIndex)].slice(0, 4);

      setMovies(allMovies);
      setOddOneIndex(oddIndex);
      setConnection({ type: connectionType.id, info: connectionInfo });
      setLoading(false);
      
      // Fetch logos in background
      allMovies.forEach(async (movie, idx) => {
        const images = await getMovieImages(movie.id);
        setMovies(prev => {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], images };
          return updated;
        });
      });
    } catch (error) {
      console.error('Error generating round:', error);
      generateRound();
    }
  };

  const handleSelect = (index) => {
    if (result || gameOver) return;
    
    setSelected(index);
    const isCorrect = index === oddOneIndex;
    setResult(isCorrect ? 'correct' : 'wrong');
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      if (soundEnabled) successAudio.current.play();
      if ((streak + 1) % 5 === 0) setShowConfetti(true);
      
      // Preload next round
      preloadNextRound();
    } else {
      setStreak(prev => {
        const currentStreak = prev;
        setLives(prevLives => {
          const newLives = prevLives - 1;
          if (newLives === 0) {
            setGameOver(true);
            const stats = JSON.parse(localStorage.getItem('oddOneOutStats') || '{}');
            stats.totalGames = (stats.totalGames || 0) + 1;
            stats.totalScore = (stats.totalScore || 0) + score;
            stats.bestScore = Math.max(stats.bestScore || 0, score);
            stats.bestStreak = Math.max(stats.bestStreak || 0, currentStreak);
            localStorage.setItem('oddOneOutStats', JSON.stringify(stats));
          }
          return newLives;
        });
        return 0;
      });
      if (soundEnabled) errorAudio.current.play();
    }
  };

  const updateStats = (finalScore, finalRound) => {
    const stats = JSON.parse(localStorage.getItem('oddOneOutStats') || '{}');
    stats.totalGames = (stats.totalGames || 0) + 1;
    stats.totalScore = (stats.totalScore || 0) + finalScore;
    stats.bestScore = Math.max(stats.bestScore || 0, finalScore);
    stats.bestStreak = Math.max(stats.bestStreak || 0, streak);
    localStorage.setItem('oddOneOutStats', JSON.stringify(stats));
  };

  const resetGame = () => {
    setScore(0);
    setRound(1);
    setLives(3);
    setStreak(0);
    setGameOver(false);
    setShowConfetti(false);
    initialized.current = false;
    generateRound();
  };

  const nextRound = () => {
    setRound(prev => prev + 1);
    setShowConfetti(false);
    setHintUsed(false);
    setLoading(true);
    setAdKey(Date.now()); // Force ad remount
    generateRound();
  };

  const useHint = () => {
    if (hintUsed || result) return;
    setHintUsed(true);
    setScore(prev => Math.max(0, prev - 1));
  };

  const shareResults = () => {
    const text = `🎯 Filmdle Odd One Out\n\nScore: ${score}\nRounds: ${round}\nBest Streak: ${streak}\n\nPlay at: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setShowShareModal(true);
    setTimeout(() => setShowShareModal(false), 2000);
  };

  const preloadNextRound = async () => {
    const connectionType = CONNECTION_TYPES[Math.floor(Math.random() * CONNECTION_TYPES.length)];
    try {
      let connectedMovies = [];
      let connectionInfo = '';
      
      // Simplified preload - just get movie data, skip logos
      if (connectionType.id === 'actor') {
        const [baseMovie] = await getValidMovie();
        const credits = await getCastFromMovie(baseMovie.id);
        const mainActor = credits.cast.find(c => c.profile_path);
        if (!mainActor) return;
        const actorMovies = await getMoviesByActor(mainActor.id);
        connectedMovies = actorMovies.cast.filter(m => m.backdrop_path && m.id !== baseMovie.id).slice(0, 3);
        connectionInfo = mainActor.name;
      } else if (connectionType.id === 'director') {
        const [baseMovie] = await getValidMovie();
        const credits = await getCastFromMovie(baseMovie.id);
        const director = credits.crew.find(c => c.job === 'Director');
        if (!director) return;
        const directorMovies = await getMoviesByDirector(director.id);
        connectedMovies = directorMovies.crew.filter(m => m.backdrop_path && m.id !== baseMovie.id).slice(0, 3);
        connectionInfo = director.name;
      } else {
        return; // Skip preload for other types
      }
      
      if (connectedMovies.length < 3) return;
      
      let oddMovie;
      let attempts = 0;
      const connectedIds = connectedMovies.map(m => m.id);
      do {
        [oddMovie] = await getValidMovie();
        attempts++;
      } while (attempts < 5 && connectedIds.includes(oddMovie.id));
      
      const oddIndex = Math.floor(Math.random() * 4);
      const allMovies = [...connectedMovies.slice(0, oddIndex), oddMovie, ...connectedMovies.slice(oddIndex)].slice(0, 4);
      
      setPreloadedRound({ movies: allMovies, oddOneIndex: oddIndex, connection: { type: connectionType.id, info: connectionInfo } });
    } catch (error) {
      console.error('Preload error:', error);
    }
  };

  if (loading && movies.length === 0) return <Loader />;

  return (
    <>
      {/* Desktop: Sidebar Ads - Hidden on mobile/tablet */}
      <div className='hidden xl:block fixed left-2 top-1/2 -translate-y-1/2 z-10'>
        <AdSenseResponsive format='vertical' />
      </div>
      <div className='hidden xl:block fixed right-2 top-1/2 -translate-y-1/2 z-10'>
        <AdSenseResponsive format='vertical' />
      </div>
      
      <div className='flex-1 flex flex-col gap-3 p-3 sm:p-4 overflow-y-auto max-w-4xl mx-auto w-full'>
      {loading && movies.length > 0 && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg'>
            <div className='w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3'></div>
            <p className='text-gray-700 dark:text-gray-300 font-semibold'>Loading next round...</p>
          </div>
        </div>
      )}
      
      <div className='card rounded-2xl px-4 py-3 flex justify-between items-center flex-shrink-0'>
        <div className='flex items-center gap-4'>
          <div className='text-center'>
            <p className='text-lg font-bold text-gray-900 dark:text-white leading-none'>{round}</p>
            <p className='text-[10px] uppercase tracking-wide text-gray-400'>Round</p>
          </div>
          <div className='w-px h-8 bg-black/8 dark:bg-white/8' />
          <div className='text-center'>
            <p className='text-lg font-bold text-amber-500 leading-none'>{score}</p>
            <p className='text-[10px] uppercase tracking-wide text-gray-400'>Score</p>
          </div>
          {streak > 0 && (
            <>
              <div className='w-px h-8 bg-black/8 dark:bg-white/8' />
              <div className='text-center'>
                <p className='text-lg font-bold text-orange-500 leading-none'>🔥{streak}</p>
                <p className='text-[10px] uppercase tracking-wide text-gray-400'>Streak</p>
              </div>
            </>
          )}
        </div>
        <div className='flex gap-1'>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
              i < lives ? 'bg-red-100 dark:bg-red-900/40 text-red-500' : 'bg-black/5 dark:bg-white/5 text-gray-300 dark:text-gray-600'
            }`}>
              ♥
            </div>
          ))}
        </div>
      </div>

      <div className='card rounded-2xl p-4'>
        <div className='flex justify-between items-start'>
          <div>
            <p className='text-[10px] uppercase tracking-widest text-gray-400 mb-1'>Find the odd one out</p>
            <h3 className='font-bold text-gray-900 dark:text-white text-sm'>Which movie doesn't belong?</h3>
          </div>
          {!result && !hintUsed && (
            <button
              onClick={useHint}
              className='px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors flex-shrink-0'
            >
              Hint −1pt
            </button>
          )}
        </div>
        {hintUsed && !result && (
          <p className='text-xs text-amber-600 dark:text-amber-400 mt-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2'>
            Connection type: <span className='font-bold capitalize'>{connection.type}</span>
          </p>
        )}
        {result && (
          <div className='mt-2 text-xs text-gray-600 dark:text-gray-400 bg-black/3 dark:bg-white/4 rounded-lg px-3 py-2 space-y-1'>
            <p>
              {connection.type === 'actor' && `👤 These 3 star ${connection.info}`}
              {connection.type === 'director' && `🎬 Directed by ${connection.info}`}
              {connection.type === 'year' && `📅 All released in ${connection.info}`}
              {connection.type === 'genre' && `🎥 All ${connection.info} films`}
              {connection.type === 'decade' && `🗓 All from the ${connection.info}`}
              {connection.type === 'franchise' && `🏆 All part of ${connection.info}`}
            </p>
            {result === 'wrong' && (
              <p className='text-red-600 dark:text-red-400 font-semibold'>
                Odd one: <span className='font-bold'>{movies[oddOneIndex]?.title}</span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Mobile: Fixed size banner ad (320x50) */}
      <div className='hidden'></div>

      <div className='grid grid-cols-2 gap-2 sm:gap-4'>
        {movies.map((movie, index) => (
          <button
            key={movie.id}
            onClick={() => handleSelect(index)}
            disabled={result !== null}
            className={`relative rounded-lg overflow-hidden transition-all transform hover:scale-105 ${
              selected === index
                ? result === 'correct'
                  ? 'ring-4 ring-green-500'
                  : 'ring-4 ring-red-500 animate-shake'
                : result && index === oddOneIndex
                ? 'ring-4 ring-green-500'
                : ''
            } ${result ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <img
              src={`${IMG_URL}w500${movie.backdrop_path}`}
              alt={movie.title}
              className='w-full aspect-video object-cover'
            />
            <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 flex items-center justify-center min-h-[80px]'>
              {movie.images?.logos?.find(l => l.iso_639_1 === 'en')?.file_path || movie.images?.logos?.[0]?.file_path ? (
                <img
                  src={`${IMG_URL}w300${movie.images.logos.find(l => l.iso_639_1 === 'en')?.file_path || movie.images.logos[0].file_path}`}
                  alt={movie.title}
                  className='max-w-full max-h-16 object-contain'
                />
              ) : (
                <p className='text-white text-sm font-semibold text-center'>{movie.title}</p>
              )}
            </div>
            {selected === index && result === 'correct' && (
              <div className='absolute inset-0 bg-green-500/30 flex items-center justify-center'>
                <span className='text-6xl'>✓</span>
              </div>
            )}
            {selected === index && result === 'wrong' && (
              <div className='absolute inset-0 bg-red-500/30 flex items-center justify-center'>
                <span className='text-6xl'>✗</span>
              </div>
            )}
            {result && index === oddOneIndex && selected !== index && (
              <div className='absolute inset-0 bg-green-500/20 flex items-center justify-center animate-pulse'>
                <span className='text-4xl'>✓</span>
              </div>
            )}
          </button>
        ))}
      </div>

      {result && (
        <button
          onClick={nextRound}
          className='w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm'
        >
          Next Round →
        </button>
      )}

      </div>
      
      {showConfetti && <Confetti />}
      
      {gameOver && (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='card rounded-2xl p-6 max-w-sm w-full text-center animate-scaleIn'>
            <div className='text-5xl mb-3'>🏁</div>
            <h2 className='font-display text-4xl tracking-wide bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent mb-1'>GAME OVER</h2>
            <p className='text-xs text-gray-400 uppercase tracking-widest mb-5'>No lives remaining</p>
            <div className='grid grid-cols-2 gap-3 mb-5'>
              <div className='bg-black/3 dark:bg-white/5 rounded-xl p-3'>
                <p className='text-2xl font-bold text-amber-500 leading-none'>{score}</p>
                <p className='text-[10px] uppercase tracking-wide text-gray-400 mt-0.5'>Score</p>
              </div>
              <div className='bg-black/3 dark:bg-white/5 rounded-xl p-3'>
                <p className='text-2xl font-bold text-gray-900 dark:text-white leading-none'>{round}</p>
                <p className='text-[10px] uppercase tracking-wide text-gray-400 mt-0.5'>Rounds</p>
              </div>
              <div className='bg-black/3 dark:bg-white/5 rounded-xl p-3'>
                <p className='text-2xl font-bold text-gray-900 dark:text-white leading-none'>{JSON.parse(localStorage.getItem('oddOneOutStats') || '{}').bestScore || 0}</p>
                <p className='text-[10px] uppercase tracking-wide text-gray-400 mt-0.5'>Best Score</p>
              </div>
              <div className='bg-black/3 dark:bg-white/5 rounded-xl p-3'>
                <p className='text-2xl font-bold text-orange-500 leading-none'>{JSON.parse(localStorage.getItem('oddOneOutStats') || '{}').bestStreak || 0}</p>
                <p className='text-[10px] uppercase tracking-wide text-gray-400 mt-0.5'>Best Streak</p>
              </div>
            </div>
            <div className='flex gap-2'>
              <button onClick={shareResults} className='py-2.5 px-3 rounded-xl font-semibold text-sm bg-black/5 dark:bg-white/8 text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/12 transition-colors'>
                📤 Share
              </button>
              <button onClick={() => navigate('/')} className='flex-1 py-2.5 rounded-xl font-semibold text-sm bg-black/5 dark:bg-white/8 text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/12 transition-colors'>
                🏠 Home
              </button>
              <button onClick={resetGame} className='flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-90 transition-all shadow-sm'>
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showShareModal && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl'>
            <p className='text-lg font-semibold text-green-600 dark:text-green-400'>✔ Copied to clipboard!</p>
          </div>
        </div>
      )}
    </>
  );
}
