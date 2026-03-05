import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('soundEnabled') !== 'false');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [adultFilter, setAdultFilter] = useState(localStorage.getItem('adultFilter') !== 'false');
  const stats = JSON.parse(localStorage.getItem('gameStats') || '{"wins":0,"losses":0,"currentStreak":0,"maxStreak":0}');
  const linkStats = JSON.parse(localStorage.getItem('linkChainStats') || '{}');
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
      window.location.reload();
    }
  };

  return (
    <div className='flex-1 flex flex-col items-center justify-center p-4 dark:bg-gray-900'>
      <div className='w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-800 p-6'>
        <h2 className='text-2xl font-bold mb-6 text-center dark:text-white'>Settings</h2>
        
        <div className='space-y-6'>
          {/* Sound Settings */}
          <div className='border-b dark:border-gray-700 pb-4'>
            <h3 className='text-lg font-semibold mb-3 dark:text-white'>Audio</h3>
            <div className='flex items-center justify-between'>
              <span className='text-gray-700 dark:text-gray-300'>Sound Effects</span>
              <button 
                onClick={toggleSound}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  soundEnabled ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                }`}
              >
                {soundEnabled ? '🔊 On' : '🔇 Off'}
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className='border-b dark:border-gray-700 pb-4'>
            <h3 className='text-lg font-semibold mb-3 dark:text-white'>Appearance</h3>
            <div className='flex items-center justify-between'>
              <span className='text-gray-700 dark:text-gray-300'>Dark Mode</span>
              <button 
                onClick={toggleDarkMode}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-600 text-white'
                }`}
              >
                {darkMode ? '☀️ On' : '🌙 Off'}
              </button>
            </div>
          </div>

          {/* Content Filter */}
          <div className='border-b dark:border-gray-700 pb-4'>
            <h3 className='text-lg font-semibold mb-3 dark:text-white'>Content</h3>
            <div className='flex items-center justify-between'>
              <div>
                <span className='text-gray-700 dark:text-gray-300'>Adult Content Filter</span>
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>Hide adult-rated movies</p>
              </div>
              <button 
                onClick={toggleAdultFilter}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  adultFilter ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}
              >
                {adultFilter ? '🔒 On' : '🔓 Off'}
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className='border-b dark:border-gray-700 pb-4'>
            <h3 className='text-lg font-semibold mb-3 dark:text-white'>Guess by Cast Stats</h3>
            <div className='grid grid-cols-2 gap-3 mb-4'>
              <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded text-center'>
                <p className='text-2xl font-bold dark:text-white'>{totalGames}</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Games Played</p>
              </div>
              <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded text-center'>
                <p className='text-2xl font-bold dark:text-white'>{winRate}%</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Win Rate</p>
              </div>
              <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded text-center'>
                <p className='text-2xl font-bold dark:text-white'>{stats.currentStreak}</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Current Streak</p>
              </div>
              <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded text-center'>
                <p className='text-2xl font-bold dark:text-white'>{stats.maxStreak}</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Max Streak</p>
              </div>
            </div>
          </div>

          {/* Link Chain Stats */}
          <div className='border-b dark:border-gray-700 pb-4'>
            <h3 className='text-lg font-semibold mb-3 dark:text-white'>Link Chain Stats</h3>
            <div className='grid grid-cols-3 gap-3 mb-4'>
              <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded text-center'>
                <p className='text-2xl font-bold dark:text-white'>{linkStats.totalGames || 0}</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Games Played</p>
              </div>
              <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded text-center'>
                <p className='text-2xl font-bold dark:text-white'>{linkStats.bestChain || 0}</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Best Chain</p>
              </div>
              <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded text-center'>
                <p className='text-2xl font-bold dark:text-white'>{avgChain}</p>
                <p className='text-xs text-gray-600 dark:text-gray-400'>Avg Chain</p>
              </div>
            </div>
          </div>

          {/* Reset Stats */}
          <div className='border-b dark:border-gray-700 pb-4'>
            <button 
              onClick={resetStats}
              className='w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 dark:hover:bg-red-700 transition-colors'
            >
              🗑️ Reset All Statistics
            </button>
          </div>

          {/* Back Button */}
          <button 
            onClick={() => navigate('/')}
            className='w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors'
          >
            Back to Menu
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
