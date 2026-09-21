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
        <div className='aspect-[16/9] w-32 sm:w-48 md:w-64 flex justify-center rounded-xl overflow-hidden select-none bg-black/5 dark:bg-white/5 border border-black/8 dark:border-white/8' onContextMenu={(e)=>e.preventDefault()}>
          {gameStatus===gameStatusVal.finished ?
            <img src={posterUrl} className='object-cover w-full h-full animate-fadeIn blur-sm animate-[unblur_1s_ease-out_forwards] pointer-events-none' loading="eager" alt="Movie backdrop" style={{animationDelay: '0.3s'}} draggable="false" onError={(e) => e.target.style.display = 'none'} />
          : tries.length > 0 ?
            <img src={posterUrl} className='object-cover w-full h-full transition-all duration-500 pointer-events-none' loading="eager" alt="Movie backdrop" style={{filter: `blur(${blurAmount}px)`, transform: `scale(${imageScale})`}} draggable="false" onError={(e) => e.target.style.display = 'none'} />
          :
            <div className='w-full h-full flex items-center justify-center'>
              <span className='text-4xl opacity-20'>🎬</span>
            </div>
          }
        </div>
      </div>

      <div className='flex-1 flex flex-col gap-2 min-w-0'>
        {/* Title box */}
        <div>
          <p className='text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1.5'>Movie Title</p>
          <div className='rounded-xl py-3 px-4 bg-black/3 dark:bg-white/5 border border-black/6 dark:border-white/6 min-h-[3rem] flex items-center justify-center'>
            <p className='font-bold text-sm sm:text-base text-center dark:text-white font-mono tracking-widest break-all'>
              {displayTitle}
            </p>
          </div>
        </div>

        {/* Hints */}
        <div className='flex flex-wrap gap-1.5'>
          {tries.length > 0 && gameStatus !== gameStatusVal.finished && keywords.slice(0, Math.min(tries.length, 3)).map((kw, i) => {
            const shouldAnimate = i === Math.min(tries.length, 3) - 1 && tries.length === lastTryCount;
            return (
              <span key={kw.id} className={`px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium ${shouldAnimate ? 'animate-popIn' : ''}`} style={{animationDelay: `${i * 100}ms`}}>#{kw.name}</span>
            );
          })}
          {tries.length >= 2 && movie?.genre_ids?.[0] && gameStatus !== gameStatusVal.finished && (
            <span className={`px-2.5 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-xs font-medium ${tries.length === 2 && lastTryCount === 2 ? 'animate-popIn' : ''}`}>
              {genres.find(g=>g.id===movie.genre_ids[0])?.name}
            </span>
          )}
          {tries.length >= 3 && movie?.genre_ids?.[1] && gameStatus !== gameStatusVal.finished && (
            <span className={`px-2.5 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-xs font-medium ${tries.length === 3 && lastTryCount === 3 ? 'animate-popIn' : ''}`} style={{animationDelay: '100ms'}}>
              {genres.find(g=>g.id===movie.genre_ids[1])?.name}
            </span>
          )}
          {tries.length >= 4 && director && gameStatus !== gameStatusVal.finished && (
            <span className={`px-2.5 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium ${tries.length === 4 && lastTryCount === 4 ? 'animate-popIn' : ''}`} style={{animationDelay: '200ms'}}>
              🎬 {director.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
