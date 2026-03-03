import { useState, useMemo, memo } from 'react';
import { IMG_URL, PROFILE_SIZE } from '../api/utils/const';

const CastMember = memo(({item, index, gameStatus, gameStatusVal}) => {
  const [loaded, setLoaded] = useState(false);
  const imageUrl = useMemo(() => 
    `${IMG_URL}${PROFILE_SIZE.md}/${item?.profile_path}`,
    [item?.profile_path]
  );

  return (
    <div className='flex flex-col animate-fadeIn' style={{animationDelay: `${index * 100}ms`}}>
      <div className='rounded-lg overflow-hidden shadow-md border-2 border-gray-200 aspect-square bg-gray-100'>
        <img 
          src={imageUrl} 
          className={`transition-opacity duration-300 h-full w-full object-cover ${loaded ? 'opacity-100' : 'opacity-0'}`}
          alt={item?.name || item?.original_name}
          onLoad={() => setLoaded(true)}
          loading="lazy"
        />
      </div>
      <p className='text-center text-xs sm:text-sm font-medium mt-1 line-clamp-2'>{item?.name||item?.original_name}</p>
      {gameStatus===gameStatusVal.finished && item.profile_path && (
        <p className='text-xs text-center text-gray-500 italic'>{item?.character}</p>
      )}
    </div>
  );
});

export default CastMember;
