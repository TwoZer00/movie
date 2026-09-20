import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDailyStreak, getWeekDays } from '../utils/dailyStreak'
import PWAInstallBanner from '../components/PWAInstallBanner'
import PWAFeatures from '../components/PWAFeatures'

export default function Menu() {
  const [dailyCompleted,setDailyCompleted] = useState(false)
  const [stats, setStats] = useState({ wins: 0, currentStreak: 0, bestChain: 0, dailyStreak: 0 })
  const [weekDays, setWeekDays] = useState([])
  const [howToPlay, setHowToPlay] = useState(null); // 'guess' | 'link' | 'odd'
  const navigate = useNavigate();
  
  const checkDailyStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const completed = localStorage.getItem(`daily_${today}`);
    setDailyCompleted(!!completed);
    
    const gameStats = JSON.parse(localStorage.getItem('gameStats') || '{"wins":0,"currentStreak":0}');
    const linkStats = JSON.parse(localStorage.getItem('linkChainStats') || '{"bestChain":0}');
    const dailyStreak = getDailyStreak();
    setStats({ ...gameStats, bestChain: linkStats.bestChain || 0, dailyStreak });
    setWeekDays(getWeekDays());
  };
  
  useEffect(()=>{
    checkDailyStatus();
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkDailyStatus();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  },[]);

  const getStreakMessage = () => {
    if (dailyCompleted) return "✓ Done for today! Come back tomorrow.";
    if (stats.dailyStreak === 0) return "Start your streak today!";
    if (stats.dailyStreak >= 7) return `🔥 ${stats.dailyStreak} days! Don't break it now!`;
    if (stats.dailyStreak >= 3) return `${stats.dailyStreak} days strong! Keep going!`;
    return `${stats.dailyStreak} day streak — play now to keep it!`;
  };

  const GameModeCard = ({ title, icon, description, children, stats, howToPlayKey, howToPlaySteps }) => (
    <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
      <div className='flex items-center gap-3 mb-4'>
        <span className='text-3xl'>{icon}</span>
        <div className='flex-1'>
          <h3 className='text-xl font-bold text-gray-800 dark:text-white'>{title}</h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>{description}</p>
        </div>
        {howToPlaySteps && (
          <button
            onClick={() => setHowToPlay(howToPlay === howToPlayKey ? null : howToPlayKey)}
            className='text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-amber-400 transition-colors flex-shrink-0'
            title='How to play'
          >
            {howToPlay === howToPlayKey ? '▲ Hide' : '? How'}
          </button>
        )}
      </div>
      {howToPlay === howToPlayKey && howToPlaySteps && (
        <ul className='mb-4 space-y-1 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 animate-fadeIn'>
          {howToPlaySteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ul>
      )}
      {stats && (
        <div className='flex gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400'>
          {stats.map((stat, i) => (
            <span key={i} className='flex items-center gap-1'>
              <span className='font-semibold text-gray-800 dark:text-white'>{stat.value}</span>
              {stat.label}
            </span>
          ))}
        </div>
      )}
      {children}
    </div>
  );

  return (
    <div className='flex flex-col flex-1 items-center gap-6 p-4 bg-gray-50 dark:bg-gray-900'>
      <PWAInstallBanner streak={stats.dailyStreak} />
      <div className='w-full max-w-4xl'>
        <PWAFeatures />
        
        {/* Daily Challenge with Week Streak */}
        <div className='mb-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl p-5 text-white'>
          <div className='flex justify-between items-center mb-3'>
            <h2 className='text-xl font-bold'>📅 Daily Challenge</h2>
            {stats.dailyStreak > 0 && (
              <div className='bg-white/20 px-3 py-1 rounded-full text-sm font-bold'>
                🔥 {stats.dailyStreak}
              </div>
            )}
          </div>
          
          {/* Week day tracker */}
          <div className='flex justify-between mb-3 bg-black/10 rounded-lg p-3'>
            {weekDays.map((day, i) => (
              <div key={i} className='flex flex-col items-center gap-1'>
                <span className='text-xs opacity-75'>{day.label}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  day.completed 
                    ? 'bg-green-400 text-green-900 scale-110' 
                    : day.isToday 
                      ? 'bg-white/30 border-2 border-white animate-pulse' 
                      : day.isFuture 
                        ? 'bg-white/10 text-white/40' 
                        : day.missed
                          ? 'bg-red-400/50 text-red-100'
                          : 'bg-white/10 text-white/40'
                }`}>
                  {day.completed ? '✓' : day.isToday ? '?' : day.isFuture ? '·' : day.missed ? '✗' : '·'}
                </div>
              </div>
            ))}
          </div>

          {/* Urgency message */}
          <p className={`text-sm text-center mb-3 ${!dailyCompleted && stats.dailyStreak > 0 ? 'font-bold animate-pulse' : 'opacity-90'}`}>
            {getStreakMessage()}
          </p>

          <button 
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all ${
              dailyCompleted 
                ? 'bg-white/20 cursor-not-allowed opacity-60' 
                : 'bg-white/30 hover:bg-white/40 hover:scale-[1.02] active:scale-[0.98]'
            }`}
            onClick={()=>navigate("/play?daily=true")} 
            disabled={dailyCompleted}
          >
            {dailyCompleted ? '🎬 Completed ✓' : '🎬 Play Today\'s Challenge'}
          </button>
        </div>

        {/* Game Modes */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <GameModeCard
            title='Guess by Cast'
            icon='🎬'
            description='Identify movies from their cast members'
            howToPlayKey='guess'
            howToPlaySteps={[
              '🎯 5 attempts to guess the movie',
              '👤 One cast member revealed at start, more after each wrong guess',
              '💡 Hints unlock progressively: keywords, genres, director',
              '📅 Year arrows tell you if the answer is older or newer',
            ]}
            stats={[
              { value: stats.wins, label: 'wins' },
              { value: stats.currentStreak, label: 'streak' }
            ]}
          >
            <div className='flex gap-3'>
              <button 
                className='flex-1 py-3 rounded-lg font-semibold bg-gradient-to-r from-red-600 to-amber-600 text-white hover:from-red-700 hover:to-amber-700 transition-all'
                onClick={()=>navigate("/play")}
              >
                Play
              </button>
              <button 
                className='px-4 py-3 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-700 transition-all'
                onClick={()=>navigate('/guess-setup')}
              >
                ⚙️
              </button>
            </div>
          </GameModeCard>

          <GameModeCard
            title='Link Chain'
            icon='🔗'
            description='Build actor-movie chains as long as possible'
            howToPlayKey='link'
            howToPlaySteps={[
              '🎬 A movie is shown → type an actor from that movie',
              '👤 That actor is shown → type a movie they appeared in',
              '🔄 Alternate back and forth — no repeats allowed',
              '🏆 Game ends when no valid connections remain',
            ]}
            stats={[
              { value: stats.bestChain, label: 'best chain' }
            ]}
          >
            <button 
              className='w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-red-600 to-amber-600 text-white hover:from-red-700 hover:to-amber-700 transition-all'
              onClick={()=>navigate('/link')}
            >
              Play
            </button>
          </GameModeCard>

          <GameModeCard
            title='Odd One Out'
            icon='🎯'
            description="Find the movie that doesn't belong"
            howToPlayKey='odd'
            howToPlaySteps={[
              '🎬 4 movies are shown — 3 share a hidden connection',
              '🔍 The connection can be: same actor, director, year, genre, decade or franchise',
              '❓ Use the Hint button to reveal the connection type (-1 point)',
              '❤️ You have 3 lives — wrong answers cost one',
            ]}
          >
            <button 
              className='w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-red-600 to-amber-600 text-white hover:from-red-700 hover:to-amber-700 transition-all'
              onClick={()=>navigate('/odd')}
            >
              Play
            </button>
          </GameModeCard>
        </div>
        <div className='mt-4 text-center'>
          <button
            onClick={()=>navigate('/settings')}
            className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm flex items-center gap-1 mx-auto transition-colors'
          >
            ⚙️ Settings &amp; Stats
          </button>
        </div>
      </div>
    </div>
  )
}
