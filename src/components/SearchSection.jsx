import { IMG_URL, POSTER_SIZE, PROFILE_SIZE } from '../api/utils/const';

export default function SearchSection({ 
  mode, hintsUsed, gameOver, loading, hints,
  usedActors, usedMovies, searchQuery, searchResults,
  showResults, searching, selectedIndex, searchInputRef,
  onGetHint, onSearchChange, onSearchFocus, onSearchBlur,
  onSearchKeyDown, onActorSelect, onMovieSelect
}) {
  return (
    <div className='card rounded-2xl p-4 flex flex-col gap-3'>
      <div className='flex justify-between items-center'>
        <p className='text-[10px] uppercase tracking-widest text-gray-400'>
          {mode === 'guessActor' ? 'Name an actor from this movie' : 'Name a movie with this actor'}
        </p>
        {hintsUsed < 3 && !gameOver && (
          <button
            onClick={onGetHint}
            disabled={loading}
            className='px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/60 disabled:opacity-40 transition-colors'
          >
            Hint {hintsUsed}/3
          </button>
        )}
      </div>

      {hints.length > 0 && (
        <div className='space-y-1.5'>
          {hints.map((hint, i) => (
            <div key={i} className='flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 rounded-xl px-3 py-2'>
              <span className='text-blue-400 text-xs mt-0.5'>💡</span>
              <p className='text-xs text-blue-700 dark:text-blue-300'>{hint}</p>
            </div>
          ))}
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
          placeholder={mode === 'guessActor' ? 'Search actor name…' : 'Search movie title…'}
          className='w-full px-4 py-3 rounded-xl border border-black/8 dark:border-white/8 bg-black/3 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:focus:ring-amber-500/30 transition-all disabled:opacity-50'
          disabled={loading}
        />
        {searching && (
          <div className='absolute right-3 top-1/2 -translate-y-1/2'>
            <div className='w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin' />
          </div>
        )}

        {searchResults.length > 0 && showResults && (
          <div className='absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#1a1a1a] border border-black/8 dark:border-white/8 rounded-xl shadow-xl max-h-60 overflow-y-auto z-10 divide-y divide-black/5 dark:divide-white/5'>
            {mode === 'guessActor'
              ? searchResults.map((actor, index) => (
                <button
                  id={`link-result-${index}`}
                  key={actor.id}
                  onClick={() => onActorSelect(actor)}
                  disabled={loading}
                  className={`w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-black/3 dark:hover:bg-white/5 transition-colors disabled:opacity-50 ${selectedIndex === index ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
                >
                  {actor.profile_path
                    ? <img src={`${IMG_URL}${PROFILE_SIZE.sm}${actor.profile_path}`} alt={actor.name} className='w-9 h-9 rounded-full object-cover flex-shrink-0' />
                    : <div className='w-9 h-9 rounded-full bg-black/8 dark:bg-white/8 flex items-center justify-center text-sm flex-shrink-0'>👤</div>
                  }
                  <div>
                    <p className='text-sm font-medium text-gray-900 dark:text-white'>{actor.name}</p>
                    <p className='text-xs text-gray-400'>{actor.known_for_department}</p>
                  </div>
                </button>
              ))
              : searchResults.map((movie, index) => (
                <button
                  id={`link-result-${index}`}
                  key={movie.id}
                  onClick={() => onMovieSelect(movie)}
                  disabled={loading}
                  className={`w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-black/3 dark:hover:bg-white/5 transition-colors disabled:opacity-50 ${selectedIndex === index ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
                >
                  {movie.poster_path
                    ? <img src={`${IMG_URL}${POSTER_SIZE.sm}${movie.poster_path}`} alt={movie.title} className='w-8 h-12 object-cover rounded-lg flex-shrink-0' />
                    : <div className='w-8 h-12 rounded-lg bg-black/8 dark:bg-white/8 flex items-center justify-center text-sm flex-shrink-0'>🎬</div>
                  }
                  <div>
                    <p className='text-sm font-medium text-gray-900 dark:text-white'>{movie.title}</p>
                    <p className='text-xs text-gray-400'>{new Date(movie.release_date).getFullYear()}</p>
                  </div>
                </button>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
}
