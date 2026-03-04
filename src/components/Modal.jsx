import { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import AdSenseSquare from './AdSenseSquare';

const Modal = memo(({isWin, movie, onClose, isDailyChallenge, triesUsed, revealedCast}) => {
  const [copied, setCopied] = useState(false);
  const modalAdKey = useRef(`modal-ad-${Date.now()}`);
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
  
  const resetStats = useCallback(() => {
    if(confirm('Reset all statistics?')) {
      localStorage.setItem('gameStats', JSON.stringify({wins:0,losses:0,currentStreak:0,maxStreak:0}));
      window.location.reload();
    }
  },[]);
  
  useEffect(() => {
    if (isWin) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
      let animationId;

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

        animationId = requestAnimationFrame(frame);
      };
      frame();
      
      return () => {
        if (animationId) cancelAnimationFrame(animationId);
        document.querySelectorAll('div[style*="position: fixed"]').forEach(el => {
          if (el.style.borderRadius === '50%' && el.style.width === '10px') {
            el.remove();
          }
        });
      };
    }
  }, [isWin]);
  
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
      <div className='bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto text-center animate-scaleIn dark:text-white' onClick={(e)=>e.stopPropagation()}>
        <h2 className={`text-4xl font-bold mb-2 ${isWin?'text-green-600':'text-red-600'}`}>
          {isWin ? '🎉 You Won!' : '😔 You Lost!'}
        </h2>
        {isWin && <p className='text-gray-600 dark:text-gray-400 mb-4'>Completed in {triesUsed}/5 tries</p>}
        
        <div className='flex gap-4 justify-center mb-4'>
          <div>
            <img 
              src={`https://image.tmdb.org/t/p/w342${movie?.poster_path}`} 
              alt={movie?.title || movie?.original_title}
              className='w-32 h-48 sm:w-40 sm:h-60 object-cover rounded-lg shadow-lg'
            />
          </div>
          {revealedCast && revealedCast.length > 0 && (
            <div className='flex flex-col gap-2 justify-center'>
              {[revealedCast[4], revealedCast[2], revealedCast[0]].filter(Boolean).map((cast) => (
                <div key={cast.id} className='flex items-center gap-2 bg-gray-50 dark:bg-gray-700 p-2 rounded text-left'>
                  <img 
                    src={`https://image.tmdb.org/t/p/w45${cast.profile_path}`}
                    alt={cast.name}
                    className='w-8 h-8 rounded-full object-cover flex-shrink-0'
                  />
                  <div className='flex flex-col'>
                    <span className='text-xs font-medium dark:text-white'>{cast.name}</span>
                    <span className='text-xs text-gray-500 dark:text-gray-400 italic'>{cast.character}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <p className='text-xl sm:text-2xl mb-2'>The movie was:</p>
        <p className='text-lg sm:text-2xl font-semibold mb-2'>{movie?.title || movie?.original_title}</p>
        <div className='flex items-center justify-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400'>
          <span>⭐ {movie?.vote_average?.toFixed(1)}/10</span>
          <span>•</span>
          <span>📅 {new Date(movie?.release_date).getFullYear()}</span>
          <span>•</span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            difficultyLevel === 'Easy' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
            difficultyLevel === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300' :
            'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
          }`}>{difficultyLevel}</span>
        </div>
        <p className='text-xs text-gray-500 dark:text-gray-400 mb-4'>🔥 {popularityRank}</p>
        {movie?.overview && (
          <p className='text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3'>{movie.overview}</p>
        )}
        
        <div className='flex gap-2 justify-center mb-6'>
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
        
        <div className='grid grid-cols-4 gap-3 mb-6 text-center'>
          <div className='bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-700'>
            <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{totalGames}</p>
            <p className='text-xs text-gray-600 dark:text-gray-400'>Played</p>
          </div>
          <div className='bg-green-50 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-700'>
            <p className='text-2xl font-bold text-green-600 dark:text-green-400'>{winRate}%</p>
            <p className='text-xs text-gray-600 dark:text-gray-400'>Win Rate</p>
          </div>
          <div className='bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-200 dark:border-purple-700'>
            <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>{stats.currentStreak}</p>
            <p className='text-xs text-gray-600 dark:text-gray-400'>Current</p>
          </div>
          <div className='bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg border border-orange-200 dark:border-orange-700'>
            <p className='text-2xl font-bold text-orange-600 dark:text-orange-400'>{stats.maxStreak}</p>
            <p className='text-xs text-gray-600 dark:text-gray-400'>Max</p>
          </div>
        </div>
        <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center'>
          <button onClick={onClose} className='bg-blue-500 dark:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors'>
            {isDailyChallenge ? 'Back to Menu' : 'Play Again'}
          </button>
          <button onClick={shareResults} className='bg-green-500 dark:bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-600 dark:hover:bg-green-700 transition-colors'>
            {copied ? '✓ Copied!' : 'Share Results'}
          </button>
        </div>
        
        <div className='mt-6 flex justify-center'>
          <div className='w-[300px] h-[250px]' key={modalAdKey.current}>
            <AdSenseSquare />
          </div>
        </div>
      </div>
    </div>
  )
});

export default Modal;
