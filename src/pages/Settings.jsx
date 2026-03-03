import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('soundEnabled') !== 'false');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const stats = JSON.parse(localStorage.getItem('gameStats') || '{"wins":0,"losses":0,"currentStreak":0,"maxStreak":0}');
  const totalGames = stats.wins + stats.losses;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;

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

  const resetStats = () => {
    if(confirm('Reset all statistics? This cannot be undone.')) {
      localStorage.setItem('gameStats', JSON.stringify({wins:0,losses:0,currentStreak:0,maxStreak:0}));
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

          {/* Statistics */}
          <div className='border-b dark:border-gray-700 pb-4'>
            <h3 className='text-lg font-semibold mb-3 dark:text-white'>Statistics</h3>
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
            <button 
              onClick={resetStats}
              className='w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 dark:hover:bg-red-700 transition-colors'
            >
              🗑️ Reset Statistics
            </button>
          </div>

          {/* Back Button */}
          <button 
            onClick={() => navigate('/')}
            className='w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors'
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
