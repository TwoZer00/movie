export default function GameOverScreen({ chain, elapsedTime, hintsUsed, bestChain, isDailyChallenge, onShareResults, onShareImage, onReset }) {
  return (
    <div className='text-center bg-red-50 dark:bg-red-900/30 p-4 rounded-lg'>
      <h3 className='text-xl font-bold text-red-600 dark:text-red-400 mb-2'>🏁 Game Over!</h3>
      <div className='text-sm text-gray-700 dark:text-gray-300 mb-3 space-y-1'>
        <p>Final Chain: <span className='font-bold'>{Math.floor(chain.length / 2) + 1}</span></p>
        <p>Time: <span className='font-bold'>{elapsedTime}</span></p>
        <p>Hints Used: <span className='font-bold'>{hintsUsed}</span></p>
        <p>Best Chain: <span className='font-bold'>{bestChain}</span></p>
      </div>
      
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
        <button onClick={onShareResults} className='bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600'>
          Share Results
        </button>
        <button onClick={onShareImage} className='bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-amber-700'>
          📷 Share Image
        </button>
        {!isDailyChallenge && (
          <button onClick={onReset} className='bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700'>
            New Challenge
          </button>
        )}
      </div>
      {isDailyChallenge && (
        <p className='text-xs text-gray-600 dark:text-gray-400 mt-2'>Come back tomorrow for a new challenge!</p>
      )}
    </div>
  );
}
