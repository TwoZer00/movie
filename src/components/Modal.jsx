import { useState, useCallback, memo, useMemo } from 'react';
import Confetti from './Confetti';

const Modal = memo(({isWin, movie, onClose, isDailyChallenge, triesUsed, revealedCast, onShareImage}) => {
  const [copied, setCopied] = useState(false);
  const stats = JSON.parse(localStorage.getItem('gameStats') || '{"wins":0,"losses":0,"currentStreak":0,"maxStreak":0}');
  const totalGames = stats.wins + stats.losses;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
  
  const popularityRank = useMemo(() => {
    const popularity = movie?.popularity || 0;
    const voteCount = movie?.vote_count || 0;
    const releaseYear = new Date(movie?.release_date).getFullYear();
    const currentYear = new Date().getFullYear();
    const yearDiff = currentYear - releaseYear;
    
    let score = 0;
    
    // Popularity (0-3 points)
    if (popularity > 100) score += 3;
    else if (popularity > 50) score += 2;
    else if (popularity > 20) score += 1;
    
    // Vote count (0-2 points)
    if (voteCount > 5000) score += 2;
    else if (voteCount > 1000) score += 1;
    
    // Age penalty (0-1 points)
    if (yearDiff < 10) score += 1;
    
    // Total: 0-6 points
    if (score >= 5) return 'Very Popular';
    if (score >= 3) return 'Popular';
    if (score >= 2) return 'Moderately Known';
    return 'Obscure';
  }, [movie?.popularity, movie?.vote_count, movie?.release_date]);
  
  const difficultyLevel = useMemo(() => {
    const voteCount = movie?.vote_count || 0;
    const releaseYear = new Date(movie?.release_date).getFullYear();
    const currentYear = new Date().getFullYear();
    const yearDiff = currentYear - releaseYear;
    const castPopularity = revealedCast?.[0]?.popularity || 0;
    
    let score = 0;
    
    // Vote count (0-3 points)
    if (voteCount > 5000) score += 3;
    else if (voteCount > 2000) score += 2;
    else if (voteCount > 500) score += 1;
    
    // Recency (0-2 points)
    if (yearDiff < 5) score += 2;
    else if (yearDiff < 15) score += 1;
    
    // Cast popularity (0-2 points)
    if (castPopularity > 50) score += 2;
    else if (castPopularity > 20) score += 1;
    
    // Total: 0-7 points
    if (score >= 5) return 'Easy';
    if (score >= 3) return 'Medium';
    return 'Hard';
  }, [movie?.vote_count, movie?.release_date, revealedCast]);
  
  const shareResults = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const emoji = isWin ? '🎬' : '❌';
    const result = isWin ? 'Won' : 'Lost';
    const movieDetails = `
📽️ ${movie?.title || movie?.original_title}
⭐ Rating: ${movie?.vote_average?.toFixed(1)}/10
📅 Year: ${new Date(movie?.release_date).getFullYear()}
🎯 Difficulty: ${difficultyLevel}`;
    const text = `${emoji} Guess the Movie ${isDailyChallenge ? today : ''}
${result}!
${movieDetails}

Play at: ${window.location.origin}`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  },[isWin, isDailyChallenge, movie, difficultyLevel]);
  
  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4' onClick={onClose}>
      {isWin && <Confetti />}
      <div className='card rounded-2xl p-4 sm:p-5 max-w-md w-full max-h-[90vh] overflow-y-auto text-center animate-scaleIn' onClick={(e)=>e.stopPropagation()}>
        <h2 className={`text-3xl font-bold mb-1 ${isWin?'text-green-600':'text-red-600'}`}>
          {isWin ? '🎉 You Won!' : '😔 You Lost!'}
        </h2>
        {isWin && <p className='text-gray-600 dark:text-gray-400 mb-3 text-sm'>Completed in {triesUsed + 1}/5 tries</p>}
        
        <div className='flex gap-3 mb-3'>
          <img 
            src={`https://image.tmdb.org/t/p/w342${movie?.poster_path}`} 
            alt={movie?.title || movie?.original_title}
            className='w-24 h-36 object-cover rounded-lg shadow-lg flex-shrink-0'
          />
          <div className='text-left flex-1 min-w-0'>
            <p className='font-bold text-base dark:text-white'>{movie?.title || movie?.original_title}</p>
            <div className='flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-1'>
              <span>⭐ {movie?.vote_average?.toFixed(1)}/10</span>
              <span>📅 {new Date(movie?.release_date).getFullYear()}</span>
              <span className={`px-1.5 py-0.5 rounded-full ${
                difficultyLevel === 'Easy' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                difficultyLevel === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
                'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
              }`}>{difficultyLevel}</span>
            </div>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>🔥 {popularityRank}</p>
            {movie?.overview && (
              <p className='text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-3'>{movie.overview}</p>
            )}
          </div>
        </div>

        {revealedCast && revealedCast.length > 0 && (
          <div className='flex gap-2 justify-center mb-3'>
            {[revealedCast[4], revealedCast[2], revealedCast[0]].filter(Boolean).map((cast) => (
              <div key={cast.id} className='flex items-center gap-1.5 bg-black/3 dark:bg-white/5 px-2 py-1 rounded-lg text-left'>
                <img 
                  src={`https://image.tmdb.org/t/p/w45${cast.profile_path}`}
                  alt={cast.name}
                  className='w-6 h-6 rounded-full object-cover flex-shrink-0'
                />
                <span className='text-xs font-medium dark:text-white'>{cast.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className='flex gap-2 justify-center mb-3'>
          <a 
            href={`https://www.themoviedb.org/movie/${movie?.id}`} 
            target='_blank' 
            rel='noopener noreferrer'
            className='text-xs bg-blue-100 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 px-3 py-1 rounded-full transition-colors'
          >
            TMDB
          </a>
          <a 
            href={`https://letterboxd.com/tmdb/${movie?.id}`} 
            target='_blank' 
            rel='noopener noreferrer'
            className='text-xs bg-green-100 dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 px-3 py-1 rounded-full transition-colors'
          >
            Letterboxd
          </a>
        </div>
        
        <div className='grid grid-cols-4 gap-2 mb-4'>
          {[
            { value: totalGames, label: 'Played', color: 'text-gray-900 dark:text-white' },
            { value: `${winRate}%`, label: 'Win Rate', color: 'text-green-600 dark:text-green-400' },
            { value: stats.currentStreak, label: 'Streak', color: 'text-amber-600 dark:text-amber-400' },
            { value: stats.maxStreak, label: 'Best', color: 'text-orange-500 dark:text-orange-400' },
          ].map(({ value, label, color }) => (
            <div key={label} className='bg-black/3 dark:bg-white/5 p-2 rounded-xl text-center'>
              <p className={`text-xl font-bold leading-none ${color}`}>{value}</p>
              <p className='text-[10px] uppercase tracking-wide text-gray-400 mt-1'>{label}</p>
            </div>
          ))}
        </div>

        <div className='flex flex-col gap-2'>
          <div className='flex gap-2'>
            {!isDailyChallenge && (
              <button onClick={() => window.location.href = '/'} className='flex-1 py-2.5 rounded-xl font-semibold text-sm bg-black/5 dark:bg-white/8 text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/12 transition-colors'>
                🏠 Home
              </button>
            )}
            <button onClick={onClose} className='flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-90 active:scale-[0.98] transition-all shadow-sm'>
              {isDailyChallenge ? '🏠 Back to Menu' : '▶ Play Again'}
            </button>
          </div>
          <div className='flex gap-2'>
            <button onClick={shareResults} className='flex-1 py-2.5 rounded-xl font-semibold text-sm bg-black/5 dark:bg-white/8 text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/12 transition-colors'>
              {copied ? '✓ Copied!' : '📋 Share'}
            </button>
            {onShareImage && (
              <button onClick={onShareImage} className='flex-1 py-2.5 rounded-xl font-semibold text-sm bg-black/5 dark:bg-white/8 text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/12 transition-colors'>
                📷 Image
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
});

export default Modal;
