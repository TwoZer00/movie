export default function LinkChainHeader({ isDailyChallenge, chain, elapsedTime, bestChain, onShowHelp, onUndo, onGiveUp, gameOver }) {
  return (
    <div className='text-center bg-gradient-to-r from-red-600 to-amber-600 text-white p-2 sm:p-3 rounded-lg relative'>
      <h2 className='text-lg sm:text-xl font-bold'>🔗 {isDailyChallenge ? 'Daily Link' : 'Link Chain'}</h2>
      <div className='flex justify-center items-center gap-2 sm:gap-4 text-xs opacity-90'>
        <span>Chain: <span className='font-bold'>{Math.floor(chain.length / 2) + 1}</span></span>
        <span>Time: <span className='font-bold'>{elapsedTime}</span></span>
        <span className='hidden sm:inline'>Best: <span className='font-bold'>{bestChain}</span></span>
      </div>
      <div className='absolute right-2 top-1/2 -translate-y-1/2 flex gap-1'>
        <button 
          onClick={onShowHelp}
          className='bg-white/20 hover:bg-white/30 px-2 py-1 rounded text-xs sm:text-sm font-semibold'
          title='Keyboard shortcuts (?)'
        >
          ⌨️
        </button>
        {!isDailyChallenge && !gameOver && chain.length > 1 && (
          <button 
            onClick={onUndo}
            className='bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold'
            title='Undo last move (U)'
          >
            ↩️
          </button>
        )}
        {!isDailyChallenge && !gameOver && (
          <button 
            onClick={onGiveUp}
            className='bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm font-semibold'
            title='Give up (G)'
          >
            Give Up
          </button>
        )}
      </div>
    </div>
  );
}
