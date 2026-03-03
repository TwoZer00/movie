import { useState, useMemo, memo, useEffect } from 'react';
import { IMG_URL, PROFILE_SIZE } from '../api/utils/const';

const CastMember = memo(({item, index, gameStatus, gameStatusVal}) => {
  const [loaded, setLoaded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const imageUrl = useMemo(() => 
    `${IMG_URL}${PROFILE_SIZE.md}/${item?.profile_path}`,
    [item?.profile_path]
  );

  useEffect(() => {
    if (item?.profile_path) {
      setTimeout(() => setIsFlipped(true), index * 150 + 100);
    }
  }, [item?.profile_path, index]);

  return (
    <div className='flex flex-col' style={{animationDelay: `${index * 100}ms`}}>
      <div className='relative rounded-lg overflow-hidden shadow-md dark:shadow-gray-800 border-2 border-gray-200 dark:border-gray-700 aspect-square' style={{perspective: '1000px'}}>
        <div className={`w-full h-full transition-transform duration-[800ms] ease-out ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`} style={{transformStyle: 'preserve-3d'}}>
          {/* Back - Question Mark */}
          <div className='absolute inset-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-4xl text-gray-400' style={{backfaceVisibility: 'hidden'}}>
            ?
          </div>
          {/* Front - Image */}
          <div className='absolute inset-0' style={{backfaceVisibility: 'hidden', transform: 'rotateY(180deg)'}}>
            {item?.profile_path && (
              <img 
                src={imageUrl} 
                className={`transition-opacity duration-300 h-full w-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
                alt={item?.name || item?.original_name}
                onLoad={() => setLoaded(true)}
                loading="lazy"
              />
            )}
          </div>
        </div>
      </div>
      {item?.profile_path && (
        <p className='text-center text-xs sm:text-sm font-medium mt-1 line-clamp-2 dark:text-white'>{item?.name||item?.original_name}</p>
      )}
      {gameStatus===gameStatusVal.finished && item.profile_path && (
        <p className='text-xs text-center text-gray-500 dark:text-gray-400 italic'>{item?.character}</p>
      )}
    </div>
  );
});

export default CastMember;
