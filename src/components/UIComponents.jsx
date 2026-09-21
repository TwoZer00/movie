import { useEffect, memo } from 'react';

export const Loader = () => {
  return (
    <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='card rounded-2xl p-8 flex flex-col items-center gap-4'>
        <div className='w-14 h-14 border-4 border-black/8 dark:border-white/8 border-t-red-600 dark:border-t-amber-500 rounded-full animate-spin'></div>
        <div className='text-center'>
          <p className='font-display text-2xl tracking-wide bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent'>LOADING</p>
          <p className='text-xs text-gray-400 dark:text-gray-500 mt-0.5 tracking-wide'>Preparing your game</p>
        </div>
      </div>
    </div>
  )
}

export const SkipButton = memo(({onSkip, disabled}) => {
  if (disabled) return null;
  
  return (
    <button 
      onClick={onSkip}
      className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm font-semibold animate-buttonHover touch-target'
      title='Skip this movie'
    >
      Skip
    </button>
  );
});
