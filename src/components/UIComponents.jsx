import { useEffect, memo } from 'react';

export const Loader = () => {
  return (
    <div className='fixed inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-lg p-8'>
        <div className='w-12 h-12 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin'></div>
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
