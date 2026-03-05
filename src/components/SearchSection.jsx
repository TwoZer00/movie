import { IMG_URL, POSTER_SIZE, PROFILE_SIZE } from '../api/utils/const';

export default function SearchSection({ 
  mode, 
  hintsUsed, 
  gameOver, 
  loading, 
  hints, 
  usedActors, 
  usedMovies,
  searchQuery,
  searchResults,
  showResults,
  searching,
  selectedIndex,
  searchInputRef,
  onGetHint,
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onSearchKeyDown,
  onActorSelect,
  onMovieSelect
}) {
  return (
    <div className='bg-white dark:bg-gray-800 p-3 rounded-lg flex-1 flex flex-col min-h-0'>
      <div className='flex justify-between items-center mb-2'>
        <h3 className='text-sm font-semibold dark:text-white'>
          {mode === 'guessActor' ? 'Search actor:' : 'Search movie:'}
        </h3>
        {hintsUsed < 3 && !gameOver && (
          <button 
            onClick={onGetHint}
            disabled={loading}
            className='bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-xs font-semibold disabled:opacity-50'
          >
            Get Hint ({hintsUsed}/3)
          </button>
        )}
      </div>
      
      {hints.length > 0 && (
        <div className='mb-3 p-2 bg-blue-50 dark:bg-blue-900/30 rounded space-y-1'>
          {hints.map((hint, i) => (
            <p key={i} className='text-sm text-blue-700 dark:text-blue-300'>💡 {hint}</p>
          ))}
        </div>
      )}
      
      {mode === 'guessActor' && usedActors.length > 0 && (
        <div className='mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded text-sm'>
          <p className='text-gray-700 dark:text-gray-300'>Can't use: {usedActors.map(a => a.name).join(', ')}</p>
        </div>
      )}
      
      {mode === 'guessMovie' && usedMovies.length > 1 && (
        <div className='mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded text-sm'>
          <p className='text-gray-700 dark:text-gray-300'>Can't reuse movies</p>
        </div>
      )}
      
      <div className='relative'>
        <input 
          ref={searchInputRef}
          type='text'
          value={searchQuery}
          onChange={onSearchChange}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
          onKeyDown={onSearchKeyDown}
          placeholder={mode === 'guessActor' ? 'Type actor name...' : 'Type movie title...'}
          className='w-full p-3 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600'
          disabled={loading}
        />
        
        {searching && (
          <div className='absolute right-3 top-3'>
            <div className='w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin'></div>
          </div>
        )}
        
        {searchResults.length > 0 && showResults && (
          <div className='absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10'>
            {mode === 'guessActor' ? (
              searchResults.map((actor, index) => (
                <button
                  id={`link-result-${index}`}
                  key={actor.id}
                  onClick={() => onActorSelect(actor)}
                  disabled={loading}
                  className={`w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-3 text-left disabled:opacity-50 ${selectedIndex === index ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                >
                  {actor.profile_path && (
                    <img 
                      src={`${IMG_URL}${PROFILE_SIZE.sm}${actor.profile_path}`}
                      alt={actor.name}
                      className='w-12 h-12 rounded-full object-cover'
                    />
                  )}
                  <div>
                    <p className='font-medium dark:text-white'>{actor.name}</p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>{actor.known_for_department}</p>
                  </div>
                </button>
              ))
            ) : (
              searchResults.map((movie, index) => (
                <button
                  id={`link-result-${index}`}
                  key={movie.id}
                  onClick={() => onMovieSelect(movie)}
                  disabled={loading}
                  className={`w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-3 text-left disabled:opacity-50 ${selectedIndex === index ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
                >
                  {movie.poster_path && (
                    <img 
                      src={`${IMG_URL}${POSTER_SIZE.sm}${movie.poster_path}`}
                      alt={movie.title}
                      className='w-12 h-18 object-cover rounded'
                    />
                  )}
                  <div>
                    <p className='font-medium dark:text-white'>{movie.title}</p>
                    <p className='text-xs text-gray-500 dark:text-gray-400'>{new Date(movie.release_date).getFullYear()}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
