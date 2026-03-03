import { useState, useEffect, useCallback, memo } from 'react';

const Modal = memo(({isWin, movie, onClose, isDailyChallenge, soundEnabled, setSoundEnabled}) => {
  const [copied, setCopied] = useState(false);
  const stats = JSON.parse(localStorage.getItem('gameStats') || '{"wins":0,"losses":0,"currentStreak":0,"maxStreak":0}');
  const totalGames = stats.wins + stats.losses;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
  
  const toggleSound = useCallback(() => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('soundEnabled', newValue);
  },[soundEnabled, setSoundEnabled]);
  
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
  
  const shareResults = useCallback(() => {
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
  },[isWin, isDailyChallenge]);
  
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
});

export default Modal;
