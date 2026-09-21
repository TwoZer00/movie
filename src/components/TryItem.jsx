import { useMemo, useCallback, memo } from 'react';
import genres from '../resources/genre.json';

const TryItem = memo(({item, index, movie, expandedTries, setExpandedTries}) => {
  const isExpanded = expandedTries.includes(index);
  
  if(item.passed) {
    return (
      <div className='overflow-hidden rounded-xl animate-fadeIn flex-shrink-0' style={{animationDelay: `${index * 100}ms`}}>
        <div className='px-3 py-2 rounded-xl bg-black/3 dark:bg-white/4 border border-black/5 dark:border-white/5'>
          <p className='text-sm text-gray-400 dark:text-gray-500 italic text-center'>— passed —</p>
        </div>
      </div>
    );
  }
  
  const yearData = useMemo(() => {
    const guessYear = new Date(item.release_date).getFullYear();
    const targetYear = new Date(movie.release_date).getFullYear();
    const yearDiff = Math.abs(guessYear - targetYear);
    const isMatch = guessYear === targetYear;
    const isClose = yearDiff <= 5;
    return { guessYear, targetYear, isMatch, isClose };
  }, [item.release_date, movie.release_date]);

  const genreData = useMemo(() => {
    const genreMatches = item.genre_ids?.filter(id => movie?.genre_ids?.includes(id)).length || 0;
    const totalGenres = item.genre_ids?.length || 0;
    return { genreMatches, totalGenres };
  }, [item.genre_ids, movie?.genre_ids]);

  const toggleExpand = useCallback(() => {
    setExpandedTries(prev => prev.includes(index) ? prev.filter(i=>i!==index) : [...prev, index]);
  }, [index, setExpandedTries]);

  return (
    <div className='overflow-hidden rounded-xl animate-fadeIn flex-shrink-0' style={{animationDelay: `${index * 100}ms`}}>
    <div className='px-3 py-3 rounded-xl bg-white/80 dark:bg-white/4 border border-black/6 dark:border-white/6 cursor-pointer hover:bg-black/3 dark:hover:bg-white/6 active:bg-black/5 dark:active:bg-white/8 transition-colors' onClick={toggleExpand}>
      <div className='flex items-center gap-2'>
        <p className='font-medium text-sm flex-1 dark:text-white truncate'>{item.title||item.original_title}</p>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
          yearData.isMatch ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
          yearData.isClose ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' :
          'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
        }`}>
          {yearData.guessYear}{!yearData.isMatch && (yearData.guessYear < yearData.targetYear ? ' ↑' : ' ↓')}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
          genreData.genreMatches === genreData.totalGenres && genreData.totalGenres > 0 ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' :
          genreData.genreMatches > 0 ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' :
          'bg-black/5 dark:bg-white/8 text-gray-500 dark:text-gray-400'
        }`}>
          {genreData.genreMatches}/{genreData.totalGenres}
        </span>
        <span className='text-gray-300 dark:text-gray-600 text-xs flex-shrink-0'>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && item.genre_ids && (
        <div className='flex flex-wrap gap-1 mt-2 pt-2 border-t border-black/5 dark:border-white/5'>
          {item.genre_ids.map(genreId => {
            const isMatch = movie?.genre_ids?.includes(genreId);
            return (
              <span key={genreId} className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isMatch ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-black/5 dark:bg-white/8 text-gray-500 dark:text-gray-400'
              }`}>
                {genres.find(g => g.id === genreId)?.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
    </div>
  );
});

export default TryItem;
