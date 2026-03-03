import { useMemo, useCallback, memo } from 'react';
import genres from '../resources/genre.json';

const TryItem = memo(({item, index, movie, expandedTries, setExpandedTries}) => {
  const isExpanded = expandedTries.includes(index);
  
  const yearData = useMemo(() => {
    const guessYear = new Date(item.release_date).getFullYear();
    const targetYear = new Date(movie.release_date).getFullYear();
    const yearDiff = Math.abs(guessYear - targetYear);
    const isMatch = guessYear === targetYear;
    const isClose = yearDiff <= 5;
    return { guessYear, targetYear, isMatch, isClose };
  }, [item.release_date, movie.release_date]);

  const genreData = useMemo(() => {
    const genreMatches = item.genre_ids.filter(id => movie?.genre_ids.includes(id)).length;
    const totalGenres = item.genre_ids.length;
    return { genreMatches, totalGenres };
  }, [item.genre_ids, movie?.genre_ids]);

  const toggleExpand = useCallback(() => {
    setExpandedTries(prev => prev.includes(index) ? prev.filter(i=>i!==index) : [...prev, index]);
  }, [index, setExpandedTries]);

  return (
    <div className='p-2 border-2 rounded-lg bg-white shadow-sm animate-slideIn hover:shadow-md transition-shadow cursor-pointer' style={{animationDelay: `${index * 50}ms`}} onClick={toggleExpand}>
      <div className='flex justify-between items-center gap-2'>
        <p className='font-semibold text-sm flex-1'>{item.title||item.original_title}</p>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
          yearData.isMatch ? "bg-green-500 text-white" : 
          yearData.isClose ? "bg-yellow-400 text-black" : 
          "bg-red-400 text-white"
        }`}>
          {yearData.guessYear}
          {!yearData.isMatch && (yearData.guessYear < yearData.targetYear ? " ↑" : " ↓")}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          genreData.genreMatches === genreData.totalGenres ? "bg-green-500 text-white" :
          genreData.genreMatches > 0 ? "bg-yellow-400 text-black" :
          "bg-gray-200 text-gray-600"
        }`}>
          {genreData.genreMatches}/{genreData.totalGenres}
        </span>
        <span className='text-gray-400'>{isExpanded ? '▲' : '▼'}</span>
      </div>
      {isExpanded && (
        <div className='flex flex-wrap gap-1 mt-2'>
          {item.genre_ids.map(genreId=>{
            const isMatch = genreId===movie?.genre_ids.find(genre=>genre===genreId);
            return(
              <span key={genreId} className={`px-2 py-0.5 rounded-full text-xs font-medium ${isMatch?"bg-green-500 text-white":"bg-gray-200 text-gray-600"}`}>
                {genres.find(genre=>genre.id===genreId)?.name}
              </span>
            )
          })}
        </div>
      )}
    </div>
  );
});

export default TryItem;
