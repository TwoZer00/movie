export default function GameOverScreen({ chain, elapsedTime, hintsUsed, bestChain, isDailyChallenge, onShareResults, onShareImage, onReset, onGoHome }) {
  const chainLength = Math.floor(chain.length / 2) + 1;
  const isNewBest = chainLength >= bestChain;

  return (
    <div className='card rounded-2xl p-5 flex flex-col gap-4 animate-scaleIn'>
      <div className='text-center'>
        <p className='text-4xl mb-1'>{isNewBest ? '🏆' : '🏁'}</p>
        <h3 className='font-display text-3xl tracking-wide bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent'>
          {isNewBest ? 'NEW BEST!' : 'CHAIN ENDED'}
        </h3>
      </div>

      <div className='grid grid-cols-2 gap-2'>
        {[
          { value: chainLength, label: 'Chain Length', highlight: true },
          { value: elapsedTime, label: 'Time' },
          { value: hintsUsed, label: 'Hints Used' },
          { value: bestChain, label: 'Best Chain' },
        ].map(({ value, label, highlight }) => (
          <div key={label} className='bg-black/3 dark:bg-white/5 rounded-xl p-3 text-center'>
            <p className={`text-2xl font-bold leading-none ${highlight ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>{value}</p>
            <p className='text-[10px] uppercase tracking-wide text-gray-400 mt-0.5'>{label}</p>
          </div>
        ))}
      </div>

      {/* Chain summary */}
      <div className='bg-black/3 dark:bg-white/5 rounded-xl p-3 max-h-36 overflow-y-auto'>
        <p className='text-[10px] uppercase tracking-widest text-gray-400 mb-2'>Your Chain</p>
        <div className='flex flex-wrap gap-1.5'>
          {chain.map((link, i) => (
            <span key={i} className='flex items-center gap-1'>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                link.type === 'movie'
                  ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                  : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
              }`}>
                {link.type === 'movie' ? '🎬' : '👤'} {link.data.title || link.data.name}
              </span>
              {i < chain.length - 1 && <span className='text-gray-300 dark:text-gray-600 text-xs'>→</span>}
            </span>
          ))}
        </div>
      </div>

      <div className='flex gap-2'>
        <button onClick={onShareResults} className='py-3 px-3 rounded-xl font-semibold text-sm bg-black/5 dark:bg-white/8 text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/12 active:scale-[0.97] transition-all'>
          Share
        </button>
        <button onClick={onShareImage} className='py-3 px-3 rounded-xl font-semibold text-sm bg-black/5 dark:bg-white/8 text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/12 active:scale-[0.97] transition-all'>
          📷
        </button>
        <button onClick={onGoHome} className='flex-1 py-3 rounded-xl font-semibold text-sm bg-black/5 dark:bg-white/8 text-gray-700 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/12 active:scale-[0.97] transition-all'>
          🏠 Home
        </button>
        {!isDailyChallenge && (
          <button onClick={onReset} className='flex-1 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-red-600 to-amber-600 hover:opacity-90 active:scale-[0.97] transition-all shadow-sm'>
            Again
          </button>
        )}
      </div>

      {isDailyChallenge && (
        <p className='text-xs text-center text-gray-400'>Come back tomorrow for a new challenge!</p>
      )}
    </div>
  );
}
