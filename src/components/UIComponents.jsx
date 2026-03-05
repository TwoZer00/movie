import { useEffect, memo } from 'react';

export const Loader = () => {
  return (
    <div className='fixed inset-0 bg-gradient-to-br from-red-900/20 to-amber-900/20 dark:from-red-950/40 dark:to-amber-950/40 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-2xl'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-16 h-16 border-4 border-gray-200 dark:border-gray-700 border-t-red-600 dark:border-t-amber-500 rounded-full animate-spin'></div>
          <div className='text-center'>
            <p className='text-xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent'>Loading...</p>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Preparing your game</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const SkipButton = memo(({onSkip, disabled}) => {
  useEffect(() => {
    if (!disabled) {
      const header = document.querySelector('header');
      const button = document.createElement('button');
      button.className = 'absolute right-2 top-1/2 -translate-y-1/2 bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md';
      button.textContent = 'Skip';
      button.onclick = onSkip;
      header?.appendChild(button);
      
      return () => button.remove();
    }
  }, [onSkip, disabled]);
  
  return null;
});
