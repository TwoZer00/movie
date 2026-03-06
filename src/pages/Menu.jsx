import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Menu() {
  const [dailyCompleted,setDailyCompleted] = useState(false)
  const [dailyLinkChain,setDailyLinkChain] = useState(null)
  const navigate = useNavigate();
  
  useEffect(()=>{
    const today = new Date().toISOString().split('T')[0];
    const completed = localStorage.getItem(`daily_${today}`);
    setDailyCompleted(!!completed);
    
    const dailyLink = localStorage.getItem(`daily_link_${today}`);
    if (dailyLink) {
      const data = JSON.parse(dailyLink);
      const chainLength = Math.floor(data.chain.length / 2) + 1;
      setDailyLinkChain(chainLength);
    }
  },[]);

  return (
    <div className='flex flex-col flex-1 items-center justify-center gap-8 p-4 overflow-y-auto'>
      <div className='w-full max-w-2xl flex flex-col gap-6'>
        {/* Guess by Cast */}
        <div>
          <h3 className='text-lg font-semibold mb-3 text-center text-gray-700 dark:text-gray-300'>🎬 Guess by Cast</h3>
          <div className='grid grid-cols-2 gap-3'>
            <button className='py-4 shadow-lg text-xl font-semibold uppercase rounded-lg bg-gradient-to-r from-red-600 to-amber-600 text-white hover:from-red-700 hover:to-amber-700 transition-all' onClick={()=>navigate("/play")}>
              🎬 Play
            </button>
            <div className='relative'>
              <button className={`w-full py-4 shadow-lg text-xl font-semibold uppercase rounded-lg transition-all ${dailyCompleted ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-60' : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600'}`} onClick={()=>navigate("/play?daily=true")} disabled={dailyCompleted}>
                📅 Daily
                {dailyCompleted && <span className='absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full'>✓ Done</span>}
              </button>
              {dailyCompleted && <CountdownTimer />}
            </div>
          </div>
          <button className='w-full mt-3 py-3 shadow text-sm font-semibold uppercase rounded-lg bg-gray-600 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600 transition-all' onClick={()=>navigate('/guess-setup')}>
            ⚙️ Custom Game
          </button>
        </div>
        {/* Link Chain */}
        <div>
          <h3 className='text-lg font-semibold mb-3 text-center text-gray-700 dark:text-gray-300'>🔗 Link Chain</h3>
          <div className='grid grid-cols-2 gap-3'>
            <button className='py-4 shadow-lg text-xl font-semibold uppercase rounded-lg bg-gradient-to-r from-red-600 to-amber-600 text-white hover:from-red-700 hover:to-amber-700 transition-all' onClick={()=>navigate('/link')}>
              🔗 Play
            </button>
            <div className='relative'>
              <button className='w-full py-4 shadow-lg text-xl font-semibold uppercase rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600 transition-all' onClick={()=>navigate('/link?daily=true')}>
                📅 Daily
                {dailyLinkChain && <span className='absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full'>{dailyLinkChain} 🔗</span>}
              </button>
            </div>
          </div>
        </div>
        
        {/* Odd One Out */}
        <div>
          <h3 className='text-lg font-semibold mb-3 text-center text-gray-700 dark:text-gray-300'>🎯 Odd One Out</h3>
          <button className='w-full py-4 shadow-lg text-xl font-semibold uppercase rounded-lg bg-gradient-to-r from-red-600 to-amber-600 text-white hover:from-red-700 hover:to-amber-700 transition-all' onClick={()=>navigate('/odd')}>
            🎯 Play
          </button>
        </div>
        
        <button className='py-3 shadow-lg text-lg font-semibold uppercase rounded-lg bg-red-800 dark:bg-red-900 text-white hover:bg-red-900 dark:hover:bg-red-800 transition-all' onClick={()=>navigate('/settings')}>
          ⚙️ Settings
        </button>
      </div>
    </div>
  )
}

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className='text-center text-sm text-gray-500 mt-2'>
      Next challenge in: {timeLeft}
    </p>
  );
};
