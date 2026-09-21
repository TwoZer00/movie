import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('soundEnabled') !== 'false');
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [adultFilter, setAdultFilter] = useState(localStorage.getItem('adultFilter') !== 'false');
  const [confirmReset, setConfirmReset] = useState(false);
  const stats = JSON.parse(localStorage.getItem('gameStats') || '{"wins":0,"losses":0,"currentStreak":0,"maxStreak":0}');
  const linkStats = JSON.parse(localStorage.getItem('linkChainStats') || '{}');
  const oddStats = JSON.parse(localStorage.getItem('oddOneOutStats') || '{}');
  const totalGames = stats.wins + stats.losses;
  const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
  const avgChain = linkStats.totalGames > 0 ? Math.round(linkStats.totalLinks / linkStats.totalGames) : 0;

  const toggleSound = () => {
    const v = !soundEnabled; setSoundEnabled(v); localStorage.setItem('soundEnabled', v);
  };
  const toggleDarkMode = () => {
    const v = !darkMode; setDarkMode(v); localStorage.setItem('darkMode', v);
    document.documentElement.classList.toggle('dark', v);
  };
  const toggleAdultFilter = () => {
    const v = !adultFilter;
    if (!v) { if (!window.confirm('Are you sure you want to disable the adult content filter?')) return; }
    setAdultFilter(v); localStorage.setItem('adultFilter', v);
  };
  const resetStats = () => {
    if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000); return; }
    localStorage.setItem('gameStats', JSON.stringify({ wins: 0, losses: 0, currentStreak: 0, maxStreak: 0 }));
    localStorage.setItem('linkChainStats', JSON.stringify({}));
    localStorage.setItem('oddOneOutStats', JSON.stringify({}));
    window.location.reload();
  };

  return (
    <div className='flex-1 flex flex-col items-center p-4 pb-6'>
      <div className='w-full max-w-lg flex flex-col gap-4'>

        {/* Preferences */}
        <div className='card rounded-2xl p-5'>
          <p className='text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4'>Preferences</p>
          <div className='flex flex-col divide-y divide-black/5 dark:divide-white/5'>
            <ToggleRow
              label='Sound Effects'
              icon='🔊'
              value={soundEnabled}
              onToggle={toggleSound}
            />
            <ToggleRow
              label='Dark Mode'
              icon={darkMode ? '☀️' : '🌙'}
              value={darkMode}
              onToggle={toggleDarkMode}
            />
            <ToggleRow
              label='Adult Content Filter'
              icon='🔒'
              description='Hide adult-rated movies'
              value={adultFilter}
              onToggle={toggleAdultFilter}
            />
          </div>
        </div>

        {/* Stats */}
        {[
          {
            icon: '🎬', title: 'Guess by Cast',
            stats: [
              { value: totalGames, label: 'Games' },
              { value: `${winRate}%`, label: 'Win Rate' },
              { value: stats.currentStreak, label: 'Streak' },
              { value: stats.maxStreak, label: 'Best' },
            ]
          },
          {
            icon: '🔗', title: 'Link Chain',
            stats: [
              { value: linkStats.totalGames || 0, label: 'Games' },
              { value: linkStats.bestChain || 0, label: 'Best Chain' },
              { value: avgChain, label: 'Avg Chain' },
            ]
          },
          {
            icon: '🎯', title: 'Odd One Out',
            stats: [
              { value: oddStats.totalGames || 0, label: 'Games' },
              { value: oddStats.bestScore || 0, label: 'Best Score' },
              { value: oddStats.bestStreak || 0, label: 'Best Streak' },
            ]
          },
        ].map(({ icon, title, stats }) => (
          <div key={title} className='card rounded-2xl p-5'>
            <p className='text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3'>
              {icon} {title}
            </p>
            <div className={`grid gap-2 ${stats.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
              {stats.map(({ value, label }) => (
                <div key={label} className='bg-black/3 dark:bg-white/5 rounded-xl p-3 text-center'>
                  <p className='text-xl font-bold text-gray-900 dark:text-white leading-none'>{value}</p>
                  <p className='text-[10px] uppercase tracking-wide text-gray-400 mt-0.5'>{label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Reset */}
        <button
          onClick={resetStats}
          className={`w-full py-3.5 rounded-2xl font-semibold text-sm transition-colors ${
            confirmReset
              ? 'bg-red-600 text-white'
              : 'text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
        >
          {confirmReset ? '⚠️ Tap again to confirm' : '🗑️ Reset All Statistics'}
        </button>

        {/* Attribution */}
        <p className='text-center text-xs text-gray-400 dark:text-gray-500'>
          Data provided by{' '}
          <a href='https://www.themoviedb.org/' target='_blank' rel='noopener noreferrer' className='hover:text-amber-500 transition-colors'>
            TMDB
          </a>
        </p>

      </div>
    </div>
  );
}

function Toggle({ value, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${value ? 'bg-red-600' : 'bg-black/15 dark:bg-white/15'}`}
    >
      <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function ToggleRow({ icon, label, description, value, onToggle }) {
  return (
    <button className='flex items-center justify-between py-3.5 gap-4 w-full text-left active:bg-black/3 dark:active:bg-white/5 rounded-lg transition-colors' onClick={onToggle}>
      <div className='flex items-center gap-3'>
        <span className='text-lg'>{icon}</span>
        <div>
          <p className='text-sm font-medium text-gray-900 dark:text-white'>{label}</p>
          {description && <p className='text-xs text-gray-400 dark:text-gray-500'>{description}</p>}
        </div>
      </div>
      <Toggle value={value} onToggle={(e) => { e.stopPropagation(); onToggle(); }} />
    </button>
  );
}
