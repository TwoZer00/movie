import { IMG_URL, PROFILE_SIZE } from '../api/utils/const';
import { useEffect, useRef, useState } from 'react';

export default function ChainDisplay({ chain }) {
  const scrollRef = useRef(null);
  const [isScrollable, setIsScrollable] = useState(false);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: scrollRef.current.scrollWidth, behavior: 'smooth' });
      setIsScrollable(scrollRef.current.scrollWidth > scrollRef.current.clientWidth);
    }
  }, [chain.length]);
  
  return (
    <div className='relative'>
      <div ref={scrollRef} className='w-full overflow-x-auto bg-white dark:bg-gray-800 p-2 sm:p-3 rounded-lg scroll-smooth snap-x snap-mandatory'>
      <div className='flex gap-1 sm:gap-2 items-center' style={{ minWidth: 'max-content' }}>
      {chain.map((link, i) => (
        <div key={i} className='flex items-center gap-1 sm:gap-2 animate-fadeIn snap-start'>
          {link.type === 'movie' ? (
            <div className='text-center flex-shrink-0 transform hover:scale-105 transition-transform'>
              <div className={`${isScrollable ? 'w-12 h-10' : 'w-16 h-14 sm:w-24 sm:h-20'} rounded-lg flex items-center justify-center`}>
                {link.data.logo ? (
                  <img 
                    src={`${IMG_URL}w500${link.data.logo}`}
                    alt='Movie'
                    className='max-w-full max-h-full object-contain'
                  />
                ) : (
                  <div className={`${isScrollable ? 'w-12 h-10' : 'w-16 h-14 sm:w-24 sm:h-20'} bg-gradient-to-br from-red-600 to-amber-600 rounded-lg shadow-lg flex items-center justify-center`}>
                    <span className={`${isScrollable ? 'text-lg' : 'text-xl sm:text-3xl'}`}>🎬</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='text-center flex-shrink-0 transform hover:scale-105 transition-transform'>
              <div className='relative'>
                <img 
                  src={`${IMG_URL}${PROFILE_SIZE.sm}${link.data.profile_path}`}
                  alt='Actor'
                  className={`${isScrollable ? 'w-10 h-10' : 'w-12 h-12 sm:w-16 sm:h-16'} object-cover rounded-full shadow-lg border-2 border-amber-600`}
                />
                <div className={`absolute -bottom-1 -right-1 bg-red-600 rounded-full ${isScrollable ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'} flex items-center justify-center text-white text-xs font-bold`}>
                  {Math.floor((i + 1) / 2)}
                </div>
              </div>
            </div>
          )}
          {i < chain.length - 1 && (
            <div className='flex-shrink-0 animate-slideIn'>
              <svg className='w-4 h-4 sm:w-6 sm:h-6 text-amber-600' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z' clipRule='evenodd' />
              </svg>
            </div>
          )}
        </div>
      ))}
      </div>
      </div>
      {isScrollable && (
        <>
          <div className='absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-800 to-transparent pointer-events-none rounded-l-lg' />
          <div className='absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none rounded-r-lg' />
        </>
      )}
    </div>
  );
}
