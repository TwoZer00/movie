import { useEffect, useState, useRef } from 'react';
import { getValidMovie, getCastFromMovie, getMovie, getMoviesByActor, getMoviesByDirector, getMovieImages } from '../api/init';
import { IMG_URL } from '../api/utils/const';
import { Loader } from '../components/UIComponents';
import Confetti from '../components/Confetti';
import AdSense from '../components/AdSense';
import AdSenseVertical from '../components/AdSenseVertical';
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
      setStreak(0);
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives === 0) {
          setGameOver(true);
          updateStats(score, round);
        }
        return newLives;
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
      {/* Desktop: Sidebar Ads */}
      <div className='hidden lg:block fixed left-4 top-1/2 -translate-y-1/2 z-10'>
        <AdSenseVertical />
      </div>
      <div className='hidden lg:block fixed right-4 top-1/2 -translate-y-1/2 z-10'>
        <AdSenseVertical />
      </div>
      
      <div className='flex-1 flex flex-col gap-4 p-4 overflow-y-auto dark:bg-gray-900 max-w-4xl mx-auto w-full pb-16 lg:pb-4'>
      {loading && movies.length > 0 && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white dark:bg-gray-800 p-6 rounded-lg'>
            <div className='w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3'></div>
            <p className='text-gray-700 dark:text-gray-300 font-semibold'>Loading next round...</p>
          </div>
        </div>
      )}
      
      <div className='text-center bg-gradient-to-r from-red-600 to-amber-600 text-white p-3 rounded-lg'>
        <h2 className='text-xl font-bold'>🎯 Odd One Out</h2>
        <div className='flex justify-center gap-4 text-sm opacity-90'>
          <span>Round: <span className='font-bold'>{round}</span></span>
          <span>Score: <span className='font-bold'>{score}</span></span>
          <span>Lives: <span className='font-bold'>{'❤️'.repeat(lives)}</span></span>
          {streak > 0 && <span>Streak: <span className='font-bold'>🔥{streak}</span></span>}
        </div>
      </div>

      <div className='bg-white dark:bg-gray-800 p-4 rounded-lg'>
        <div className='flex justify-between items-center mb-2'>
          <h3 className='text-lg font-semibold dark:text-white'>Find the movie that doesn't belong!</h3>
          {!result && !hintUsed && (
            <button
              onClick={useHint}
              className='bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-semibold'
            >
              Hint (-1 pt)
            </button>
          )}
        </div>
        {hintUsed && !result && (
          <p className='text-sm text-yellow-600 dark:text-yellow-400 text-center'>
            Connection type: <span className='font-bold'>{connection.type}</span>
          </p>
        )}
        {result && (
          <div className='text-sm text-gray-600 dark:text-gray-400 text-center space-y-2'>
            <p>
              {connection.type === 'actor' && `These 3 movies all star ${connection.info}`}
              {connection.type === 'director' && `These 3 movies are all directed by ${connection.info}`}
              {connection.type === 'year' && `These 3 movies were all released in ${connection.info}`}
              {connection.type === 'genre' && `These 3 movies are all ${connection.info} films`}
              {connection.type === 'decade' && `These 3 movies are all from the ${connection.info}`}
              {connection.type === 'franchise' && `These 3 movies are all part of ${connection.info}`}
            </p>
            {result === 'wrong' && (
              <p className='text-red-600 dark:text-red-400 font-semibold'>
                The odd one was: <span className='font-bold'>{movies[oddOneIndex]?.title}</span>
              </p>
            )}
          </div>
        )}
      </div>

      <div className='grid grid-cols-2 gap-4'>
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
          className='bg-gradient-to-r from-red-600 to-amber-600 text-white py-3 rounded-lg font-semibold text-lg hover:from-red-700 hover:to-amber-700'
        >
          Next Round →
        </button>
      )}

      </div>
      
      {showConfetti && <Confetti />}
      
      {gameOver && (
        <div className='fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4'>
          <div className='bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-2xl shadow-2xl text-center max-w-md border-4 border-red-600 relative'>
            <button
              onClick={() => window.location.href = '/'}
              className='absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold'
            >
              ×
            </button>
            <div className='text-6xl mb-4'>💔</div>
            <h2 className='text-3xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent mb-6'>Game Over!</h2>
            <div className='space-y-3 mb-6 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg'>
              <p className='text-xl dark:text-white'>Final Score: <span className='font-bold text-amber-600 text-2xl'>{score}</span></p>
              <p className='text-lg dark:text-white'>Rounds Survived: <span className='font-bold'>{round}</span></p>
              <div className='border-t border-gray-300 dark:border-gray-600 my-3'></div>
              <p className='text-sm text-gray-600 dark:text-gray-400'>🏆 Best Score: <span className='font-bold'>{JSON.parse(localStorage.getItem('oddOneOutStats') || '{}').bestScore || 0}</span></p>
              <p className='text-sm text-gray-600 dark:text-gray-400'>🔥 Best Streak: <span className='font-bold'>{JSON.parse(localStorage.getItem('oddOneOutStats') || '{}').bestStreak || 0}</span></p>
            </div>
            <div className='flex gap-3 justify-center'>
              <button
                onClick={shareResults}
                className='bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 shadow-lg transform hover:scale-105 transition-all'
              >
                📤 Share
              </button>
              <button
                onClick={resetGame}
                className='bg-gradient-to-r from-red-600 to-amber-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-red-700 hover:to-amber-700 shadow-lg transform hover:scale-105 transition-all'
              >
                🔄 Play Again
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
      
      {/* Mobile/Tablet: Bottom Ad */}
      <div className='lg:hidden fixed bottom-0 left-0 right-0 z-10 bg-white dark:bg-gray-900 py-2'>
        <div className='max-w-screen-lg mx-auto'>
          <AdSense />
        </div>
      </div>
    </>
  );
}
