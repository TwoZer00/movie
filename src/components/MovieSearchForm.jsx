export default function MovieSearchForm({ 
  selectedMovie,
  shakeInput,
  visible,
  searchLoading,
  movieSearchList,
  selectedIndex,
  onSubmit,
  onBlur,
  onKeyDown,
  onChange,
  onMovieSelect,
  highlightMatch,
  tries
}) {
  return (
    <form onSubmit={onSubmit} className='flex-0 relative flex flex-col gap-2'>
      <div className='relative flex-1'>
        <input 
          placeholder='Search for movie title' 
          type="text" 
          className={`rounded w-full text-base sm:text-lg py-2 px-2 border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus-within:outline-none ${shakeInput ? 'animate-shake border-red-500' : ''}`} 
          onBlur={onBlur} 
          onKeyDown={onKeyDown} 
          value={selectedMovie?.title||selectedMovie?.original_title} 
          onChange={onChange} 
        />
        <ul className={`shadow-xl border-2 border-slate-200 dark:border-gray-600 rounded-tl rounded-tr absolute bottom-full left-0 w-full flex flex-col divide-y dark:divide-gray-600 bg-white dark:bg-gray-800 max-h-[50ch] overflow-y-auto ${visible?"":"hidden"}`}>
          {searchLoading ? (
            <li className='p-4 text-center text-gray-500 dark:text-gray-400'>
              <div className='flex items-center justify-center gap-2'>
                <div className='w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                Searching...
              </div>
            </li>
          ) : movieSearchList.length > 0 ? (
            movieSearchList.map((item,index)=>{
              const showOriginal = item.original_title && item.original_title !== item.title;
              return(
                <li id={`search-result-${index}`} key={item.id} className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-2 dark:text-white ${selectedIndex === index ? 'bg-blue-100 dark:bg-blue-900' : ''}`} onClick={()=>onMovieSelect(item)}>
                  <div>
                    <div>{highlightMatch(item.title||item.original_title, selectedMovie.original_title)} ({new Date(item.release_date).getFullYear()})</div>
                    {showOriginal && <div className='text-xs text-gray-500 dark:text-gray-400 italic'>Original: {item.original_title}</div>}
                  </div>
                </li>
              )
            })
          ) : (
            <li className='p-4 text-center text-gray-500 dark:text-gray-400'>No movies found</li>
          )}
        </ul>
      </div>
      <div className='flex gap-2'>
        <input type="submit" value={"Try"} className='flex-1 rounded bg-blue-500 text-white font-semibold py-2 px-4 hover:bg-blue-600 dark:hover:bg-blue-700'/>
        <button type="button" onClick={(e) => { e.preventDefault(); /* Pass handler will be passed as prop */ }} disabled={tries.length >= 4} className='rounded bg-gray-500 text-white font-semibold py-2 px-4 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'>Pass</button>
      </div>
    </form>
  );
}
