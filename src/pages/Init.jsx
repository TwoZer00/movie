import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'

export default function Init() {
  useEffect(() => {
    // Apply dark mode on load
    const darkMode = localStorage.getItem('darkMode') === 'true';
    document.documentElement.classList.toggle('dark', darkMode);
    
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, [])
  
  return (
    <div className='flex flex-col w-dvw h-dvh dark:bg-gray-900 dark:text-white'>
      <Outlet/>
    </div>
  )
}

const Header = ()=>{
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);
  
  return (
    <>
      <header className='flex flex-row justify-center relative bg-white dark:bg-gray-800 border-b dark:border-gray-700'>
        {
          location && location.pathname!="/" && 
          <button onClick={()=>navigate('/')} className='h-full absolute left-2 text-gray-800 dark:text-white'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        </button>
        }
        <div className='flex flex-col relative max-h-dvh'>
          <h1 className="font-bold text-4xl text-center text-gray-900 dark:text-white">Filmdle</h1>
          <p className="font-thin text-center text-gray-600 dark:text-gray-400">Guess movies & build chains</p>
        </div>
        <button onClick={()=>setShowHelp(true)} className='h-full absolute right-2 text-gray-800 dark:text-white hover:text-blue-500 dark:hover:text-blue-400'>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
          </svg>
        </button>
      </header>
      
      {showHelp && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4' onClick={()=>setShowHelp(false)}>
          <div className='bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full animate-scaleIn max-h-[90vh] overflow-y-auto' onClick={(e)=>e.stopPropagation()}>
            <h2 className='text-2xl font-bold mb-4 text-center dark:text-white'>How to Play</h2>
            
            <div className='mb-4'>
              <h3 className='text-lg font-semibold mb-2 dark:text-white'>🎬 Guess by Cast</h3>
              <div className='space-y-2 text-sm text-gray-700 dark:text-gray-300'>
                <p>🎯 5 attempts to guess the movie</p>
                <p>🔍 New cast member revealed after each guess</p>
                <p>📊 Hints: genres (2nd/3rd try), director (4th try), keywords</p>
              </div>
            </div>
            
            <div className='mb-4'>
              <h3 className='text-lg font-semibold mb-2 dark:text-white'>🔗 Link Chain Mode</h3>
              <div className='space-y-2 text-sm text-gray-700 dark:text-gray-300'>
                <p>🎬 Movie shown → Search & type actor name</p>
                <p>🎭 Actor shown → Search & type movie title</p>
                <p>🚫 Can't reuse actors or movies</p>
                <p>🏆 Build the longest chain possible!</p>
              </div>
            </div>
            
            <div>
              <h3 className='text-lg font-semibold mb-2 dark:text-white'>📅 Daily Challenges</h3>
              <div className='space-y-2 text-sm text-gray-700 dark:text-gray-300'>
                <p>One movie/link challenge per day</p>
                <p>Same for everyone - compare results!</p>
              </div>
            </div>
            
            <button onClick={()=>setShowHelp(false)} className='w-full mt-6 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors'>
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
