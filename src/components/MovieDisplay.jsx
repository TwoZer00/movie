import { IMG_URL, POSTER_SIZE } from '../api/utils/const';
import genres from '../resources/genre.json';

export default function MovieDisplay({ 
  movie, 
  posterUrl, 
  blurAmount, 
  imageScale, 
  displayTitle, 
  gameStatus, 
  gameStatusVal, 
  tries, 
  keywords, 
  lastTryCount,
  director 
}) {
  return (
    <div className='py-2 flex flex-row items-start gap-3 sm:gap-4 max-w-4xl mx-auto'>
      <div className='flex-shrink-0'>
        <div className='aspect-[16/9] w-32 sm:w-48 md:w-64 flex justify-center shadow-lg rounded overflow-hidden dark:shadow-gray-800 select-none bg-gray-200 dark:bg-gray-700' onContextMenu={(e)=>e.preventDefault()}>
          {gameStatus===gameStatusVal.finished ?
            <img src={posterUrl} className='object-cover w-full h-full animate-fadeIn blur-sm animate-[unblur_1s_ease-out_forwards] pointer-events-none' loading="eager" alt="Movie backdrop" style={{animationDelay: '0.3s'}} draggable="false" onError={(e) => e.target.style.display = 'none'} />
          : tries.length > 0 ?
            <img src={posterUrl} className='object-cover w-full h-full transition-all duration-500 pointer-events-none' loading="eager" alt="Movie backdrop" style={{filter: `blur(${blurAmount}px)`, transform: `scale(${imageScale})`}} draggable="false" onError={(e) => e.target.style.display = 'none'} />
          :
          <div className='w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
            <span className='text-4xl'>?</span>
          </div>
          }
        </div>
      </div>
      <div className='flex-1 flex flex-col gap-2'>
        <div>
          <p className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1'>Movie Title</p>
          <div className='border-2 rounded-lg py-3 px-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 dark:border-gray-600 min-h-[3rem] flex items-center justify-center'>
            <p className='font-bold text-sm sm:text-lg text-center dark:text-white font-mono tracking-wider break-words'>
              {displayTitle}
            </p>
          </div>
        </div>
        <div className='min-h-[4rem]'>
          {tries.length > 0 && gameStatus !== gameStatusVal.finished && keywords.length > 0 && (
            <div className='flex flex-wrap gap-2 mb-2'>
              {keywords.slice(0, Math.min(tries.length, 3)).map((kw, i) => {
                const shouldAnimate = i === Math.min(tries.length, 3) - 1 && tries.length === lastTryCount;
                return (
                  <span key={kw.id} className={`px-3 py-1 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-medium ${shouldAnimate ? 'animate-popIn' : ''}`} style={{animationDelay: `${i * 100}ms`}}>#{kw.name}</span>
                );
              })}
            </div>
          )}
          {tries.length > 0 && gameStatus !== gameStatusVal.finished && (
            <div className='flex flex-wrap gap-2'>
              {tries.length >= 2 && movie?.genre_ids?.[0] && (
                <span className={`px-3 py-1 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded-full text-sm font-medium ${tries.length === 2 && lastTryCount === 2 ? 'animate-popIn' : ''}`}>{genres.find(g=>g.id===movie.genre_ids[0])?.name}</span>
              )}
              {tries.length >= 3 && movie?.genre_ids?.[1] && (
                <span className={`px-3 py-1 bg-red-100 dark:bg-red-900 dark:text-red-300 rounded-full text-sm font-medium ${tries.length === 3 && lastTryCount === 3 ? 'animate-popIn' : ''}`} style={{animationDelay: '100ms'}}>{genres.find(g=>g.id===movie.genre_ids[1])?.name}</span>
              )}
              {tries.length >= 4 && director && (
                <span className={`px-3 py-1 bg-orange-100 dark:bg-orange-900 dark:text-orange-300 rounded-full text-sm font-medium ${tries.length === 4 && lastTryCount === 4 ? 'animate-popIn' : ''}`} style={{animationDelay: '200ms'}}>🎬 {director.name}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
