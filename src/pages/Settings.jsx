import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('soundEnabled') !== 'false');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [adultFilter, setAdultFilter] = useState(localStorage.getItem('adultFilter') !== 'false');
  const stats = JSON.parse(localStorage.getItem('gameStats') || '{"wins":0,"losses":0,"currentStreak":0,"maxStreak":0}');
  const linkStats = JSON.parse(localStorage.getItem('linkChainStats') || '{}');
  const oddStats = JSON.parse(localStorage.getItem('oddOneOutStats') || '{}');
  const totalGames = stats.wins + stats.losses;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
  const avgChain = linkStats.totalGames > 0 ? Math.round(linkStats.totalLinks / linkStats.totalGames) : 0;

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('soundEnabled', newValue);
  };

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    localStorage.setItem('darkMode', newValue);
    document.documentElement.classList.toggle('dark', newValue);
  };

  const toggleAdultFilter = () => {
    const newValue = !adultFilter;
    
    // Confirm when disabling filter
    if (!newValue) {
      if (!confirm('Are you sure you want to disable the adult content filter? This will show adult-rated movies.')) {
        return;
      }
    }
    
    setAdultFilter(newValue);
    localStorage.setItem('adultFilter', newValue);
  };

  const resetStats = () => {
    if(confirm('Reset all statistics? This cannot be undone.')) {
      localStorage.setItem('gameStats', JSON.stringify({wins:0,losses:0,currentStreak:0,maxStreak:0}));
      localStorage.setItem('linkChainStats', JSON.stringify({}));
      localStorage.setItem('oddOneOutStats', JSON.stringify({}));
      window.location.reload();
    }
  };

  return (
    <div className='flex-1 flex flex-col items-center p-4 dark:bg-gray-900 overflow-y-auto'>
      <div className='w-full max-w-4xl'>
        <div className='flex items-center justify-between mb-6'>
          <button 
            onClick={() => navigate('/')}
            className='bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-semibold'
            title='Back to menu'
          >
            ← Menu
          </button>
          <h2 className='text-3xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent'>⚙️ Settings</h2>
          <div className='w-16'></div> {/* Spacer for centering */}
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          {/* Preferences Card */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6'>
            <h3 className='text-xl font-bold mb-4 text-red-600 dark:text-red-400'>🎮 Preferences</h3>
            <div className='space-y-4'>
              <div className='flex items-center justify-between py-1'>
                <span className='text-gray-700 dark:text-gray-300'>🔊 Sound Effects</span>
                <button 
                  onClick={toggleSound}
                  className={`min-w-[80px] min-h-[44px] px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 ${
                    soundEnabled ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                  }`}
                >
                  {soundEnabled ? 'On' : 'Off'}
                </button>
              </div>
              <div className='flex items-center justify-between py-1'>
                <span className='text-gray-700 dark:text-gray-300'>{darkMode ? '☀️' : '🌙'} Dark Mode</span>
                <button 
                  onClick={toggleDarkMode}
                  className={`min-w-[80px] min-h-[44px] px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 ${
                    darkMode ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900' : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white'
                  }`}
                >
                  {darkMode ? 'On' : 'Off'}
                </button>
              </div>
              <div className='flex items-center justify-between py-1'>
                <div>
                  <span className='text-gray-700 dark:text-gray-300'>🔒 Adult Filter</span>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>Hide adult content</p>
                </div>
                <button 
                  onClick={toggleAdultFilter}
                  className={`min-w-[80px] min-h-[44px] px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 active:scale-95 ${
                    adultFilter ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                  }`}
                >
                  {adultFilter ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>

          {/* Guess by Cast Stats */}
          <div className='bg-gradient-to-br from-red-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-lg p-6'>
            <h3 className='text-xl font-bold mb-4 text-red-600 dark:text-red-400'>🎬 Guess by Cast</h3>
            <div className='grid grid-cols-2 gap-3'>
              <div className='bg-white dark:bg-gray-800 p-3 rounded-lg text-center'>
                <p className='text-2xl font-bold text-amber-600'>{totalGames}</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Games</p>
              </div>
              <div className='bg-white dark:bg-gray-800 p-3 rounded-lg text-center'>
                <p className='text-2xl font-bold text-amber-600'>{winRate}%</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Win Rate</p>
              </div>
              <div className='bg-white dark:bg-gray-800 p-3 rounded-lg text-center'>
                <p className='text-2xl font-bold text-amber-600'>{stats.currentStreak}</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Streak</p>
              </div>
              <div className='bg-white dark:bg-gray-800 p-3 rounded-lg text-center'>
                <p className='text-2xl font-bold text-amber-600'>{stats.maxStreak}</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Best</p>
              </div>
            </div>
          </div>

          {/* Link Chain Stats */}
          <div className='bg-gradient-to-br from-red-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-lg p-6'>
            <h3 className='text-xl font-bold mb-4 text-red-600 dark:text-red-400'>🔗 Link Chain</h3>
            <div className='grid grid-cols-3 gap-3'>
              <div className='bg-white dark:bg-gray-800 p-3 rounded-lg text-center'>
                <p className='text-2xl font-bold text-amber-600'>{linkStats.totalGames || 0}</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Games</p>
              </div>
              <div className='bg-white dark:bg-gray-800 p-3 rounded-lg text-center'>
                <p className='text-2xl font-bold text-amber-600'>{linkStats.bestChain || 0}</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Best</p>
              </div>
              <div className='bg-white dark:bg-gray-800 p-3 rounded-lg text-center'>
                <p className='text-2xl font-bold text-amber-600'>{avgChain}</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Avg</p>
              </div>
            </div>
          </div>

          {/* Odd One Out Stats */}
          <div className='bg-gradient-to-br from-red-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-lg p-6'>
            <h3 className='text-xl font-bold mb-4 text-red-600 dark:text-red-400'>🎯 Odd One Out</h3>
            <div className='grid grid-cols-3 gap-3'>
              <div className='bg-white dark:bg-gray-800 p-3 rounded-lg text-center'>
                <p className='text-2xl font-bold text-amber-600'>{oddStats.totalGames || 0}</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Games</p>
              </div>
              <div className='bg-white dark:bg-gray-800 p-3 rounded-lg text-center'>
                <p className='text-2xl font-bold text-amber-600'>{oddStats.bestScore || 0}</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Best</p>
              </div>
              <div className='bg-white dark:bg-gray-800 p-3 rounded-lg text-center'>
                <p className='text-2xl font-bold text-amber-600'>{oddStats.bestStreak || 0}</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6'>
          <button 
            onClick={resetStats}
            className='w-full min-h-[48px] bg-gradient-to-r from-red-500 to-red-600 text-white py-4 rounded-lg font-semibold hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 transition-all transform hover:scale-105 active:scale-95'
          >
            🗑️ Reset All Statistics
          </button>
        </div>
      </div>
      
      <footer className='text-center text-sm text-gray-500 dark:text-gray-400 mt-6 py-4'>
        <p className='mb-2'>
          Filmdle - Guess movies by their cast or build actor-movie chains. Multiple game modes with daily challenges!
        </p>
        <p className='mb-2'>Made by <a href="https://twozer00.dev" className='underline hover:text-blue-500'>TwoZer00</a></p>
        <p className='text-xs'>
          This product uses the TMDB API but is not endorsed or certified by <a className="underline hover:text-blue-500" href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a>.
        </p>
      </footer>
    </div>
  );
}
