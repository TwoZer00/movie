import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDailyStreak } from '../utils/dailyStreak'
import PWAInstallBanner from '../components/PWAInstallBanner'
import PWAFeatures from '../components/PWAFeatures'

export default function Menu() {
  const [dailyCompleted,setDailyCompleted] = useState(false)
  const [dailyLinkChain,setDailyLinkChain] = useState(null)
  const [stats, setStats] = useState({ wins: 0, currentStreak: 0, bestChain: 0, dailyStreak: 0 })
  const navigate = useNavigate();
  
  const checkDailyStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const completed = localStorage.getItem(`daily_${today}`);
    setDailyCompleted(!!completed);
    
    const dailyLink = localStorage.getItem(`daily_link_${today}`);
    if (dailyLink) {
      const data = JSON.parse(dailyLink);
      const chainLength = Math.floor(data.chain.length / 2) + 1;
      setDailyLinkChain(chainLength);
    } else {
      setDailyLinkChain(null);
    }
    
    // Load stats
    const gameStats = JSON.parse(localStorage.getItem('gameStats') || '{"wins":0,"currentStreak":0}');
    const linkStats = JSON.parse(localStorage.getItem('linkChainStats') || '{"bestChain":0}');
    const dailyStreak = getDailyStreak();
    setStats({ ...gameStats, bestChain: linkStats.bestChain || 0, dailyStreak });
  };
  
  useEffect(()=>{
    checkDailyStatus();
    
    // Check when app becomes visible (handles PWA/tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkDailyStatus();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  },[]);

  const GameModeCard = ({ title, icon, description, children, stats }) => (
    <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1'>
      <div className='flex items-center gap-3 mb-4'>
        <span className='text-3xl'>{icon}</span>
        <div>
          <h3 className='text-xl font-bold text-gray-800 dark:text-white'>{title}</h3>
          <p className='text-sm text-gray-600 dark:text-gray-400'>{description}</p>
        </div>
      </div>
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
    <div className='flex flex-col flex-1 items-center justify-center gap-6 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900'>
      <PWAInstallBanner streak={stats.dailyStreak} />
      <div className='w-full max-w-4xl'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent'>🎬 Filmdle</h1>
          <p className='text-gray-600 dark:text-gray-400 mt-2'>The daily movie guessing game</p>
        </div>
        
        <PWAFeatures />
        
        {/* Featured Daily Challenges */}
        <div className='mb-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl p-6 text-white'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-2xl font-bold'>📅 Daily Challenges</h2>
            <div className='text-right'>
              {stats.dailyStreak > 0 ? (
                <div>
                  <div className='text-2xl font-bold'>🔥 {stats.dailyStreak}</div>
                  <div className='text-sm opacity-90'>day streak</div>
                </div>
              ) : (
                <div>
                  <div className='text-xl'>🎆</div>
                  <div className='text-xs opacity-75'>Start streak</div>
                </div>
              )}
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <button 
              className={`py-3 px-6 rounded-lg font-semibold transition-all ${dailyCompleted ? 'bg-white/20 cursor-not-allowed opacity-60' : 'bg-white/30 hover:bg-white/40'}`}
              onClick={()=>navigate("/play?daily=true")} 
              disabled={dailyCompleted}
            >
              🎬 Guess by Cast {dailyCompleted && '✓'}
            </button>
            <button 
              className='py-3 px-6 rounded-lg font-semibold bg-white/30 hover:bg-white/40 transition-all'
              onClick={()=>navigate('/link?daily=true')}
            >
              🔗 Link Chain {dailyLinkChain && `(${dailyLinkChain} links)`}
            </button>
          </div>
        </div>

        {/* Game Modes */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <GameModeCard
            title='Guess by Cast'
            icon='🎬'
            description='Identify movies from their cast members'
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
          >
            <button 
              className='w-full py-3 rounded-lg font-semibold bg-gradient-to-r from-red-600 to-amber-600 text-white hover:from-red-700 hover:to-amber-700 transition-all'
              onClick={()=>navigate('/odd')}
            >
              Play
            </button>
          </GameModeCard>

          <div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center'>
            <button 
              className='w-full py-4 rounded-lg font-semibold bg-red-800 dark:bg-red-900 text-white hover:bg-red-900 dark:hover:bg-red-800 transition-all text-lg'
              onClick={()=>navigate('/settings')}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
