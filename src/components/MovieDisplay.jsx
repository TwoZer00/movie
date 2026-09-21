import { IMG_URL, POSTER_SIZE } from '../api/utils/const';
import genres from '../resources/genre.json';

export default function MovieDisplay({ 
  movie, posterUrl, blurAmount, imageScale,
  displayTitle, gameStatus, gameStatusVal,
  tries, keywords, lastTryCount, director 
}) {
  return (
    <div className='card rounded-xl overflow-hidden flex-shrink-0'>
      {/* Backdrop image — capped height on mobile */}
      <div
        className='relative w-full overflow-hidden select-none bg-black/5 dark:bg-white/5 h-28 sm:h-36 md:aspect-video md:h-auto'
        onContextMenu={(e) => e.preventDefault()}
      >
        {gameStatus === gameStatusVal.finished ? (
          <img
            src={posterUrl}
            className='object-cover w-full h-full animate-fadeIn blur-sm animate-[unblur_1s_ease-out_forwards] pointer-events-none'
            loading='eager' alt='Movie backdrop'
            style={{ animationDelay: '0.3s' }}
            draggable='false'
            onError={(e) => e.target.style.display = 'none'}
          />
        ) : tries.length > 0 ? (
          <img
            src={posterUrl}
            className='object-cover w-full h-full transition-all duration-500 pointer-events-none'
            loading='eager' alt='Movie backdrop'
            style={{ filter: `blur(${blurAmount}px)`, transform: `scale(${imageScale})` }}
            draggable='false'
            onError={(e) => e.target.style.display = 'none'}
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <span className='text-5xl opacity-15'>🎬</span>
          </div>
        )}
      </div>

      {/* Info below image */}
      <div className='p-3 flex flex-col gap-2'>
        {/* Title */}
        <div>
          <p className='text-[10px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1'>Movie Title</p>
          <div className='rounded-lg py-2.5 px-3 bg-black/3 dark:bg-white/5 border border-black/6 dark:border-white/6 min-h-[2.5rem] flex items-center justify-center'>
            <p className='font-bold text-sm sm:text-base text-center dark:text-white font-mono tracking-widest break-all'>
              {displayTitle}
            </p>
          </div>
        </div>

        {/* Hint badges */}
        {tries.length > 0 && gameStatus !== gameStatusVal.finished && (
          <div className='flex flex-wrap gap-1.5'>
            {keywords.slice(0, Math.min(tries.length, 3)).map((kw, i) => {
              const shouldAnimate = i === Math.min(tries.length, 3) - 1 && tries.length === lastTryCount;
              return (
                <span key={kw.id} className={`px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium ${shouldAnimate ? 'animate-popIn' : ''}`} style={{ animationDelay: `${i * 100}ms` }}>#{kw.name}</span>
              );
            })}
            {tries.length >= 2 && movie?.genre_ids?.[0] && (
              <span className={`px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-xs font-medium ${tries.length === 2 && lastTryCount === 2 ? 'animate-popIn' : ''}`}>
                {genres.find(g => g.id === movie.genre_ids[0])?.name}
              </span>
            )}
            {tries.length >= 3 && movie?.genre_ids?.[1] && (
              <span className={`px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded-full text-xs font-medium ${tries.length === 3 && lastTryCount === 3 ? 'animate-popIn' : ''}`} style={{ animationDelay: '100ms' }}>
                {genres.find(g => g.id === movie.genre_ids[1])?.name}
              </span>
            )}
            {tries.length >= 4 && director && (
              <span className={`px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium ${tries.length === 4 && lastTryCount === 4 ? 'animate-popIn' : ''}`} style={{ animationDelay: '200ms' }}>
                🎬 {director.name}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
