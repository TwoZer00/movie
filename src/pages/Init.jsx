import { useEffect } from 'react';
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
      <Header />
      <main className='flex-1 overflow-y-auto flex flex-col'>
        <Outlet/>
      </main>
      <Footer />
    </div>
  )
}

const Header = ()=>{
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <header className='flex-shrink-0 flex flex-row justify-center relative bg-white dark:bg-gray-800 border-b dark:border-gray-700 py-1'>
      {
        location && location.pathname!="/" && 
        <button onClick={()=>navigate('/')} className='h-full absolute left-2 text-gray-800 dark:text-white'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      </svg>
      </button>
      }
      <div className='flex flex-col'>
        <h1 className="font-bold text-2xl text-center text-gray-900 dark:text-white">Filmdle</h1>
        <p className="font-thin text-center text-gray-600 dark:text-gray-400 text-xs">Guess movies & build chains</p>
      </div>
    </header>
  )
}

const Footer = () => (
  <footer className='flex-shrink-0 text-center text-xs text-gray-400 dark:text-gray-500 py-1 px-4 bg-white dark:bg-gray-800 border-t dark:border-gray-700'>
    Made by <a href="https://twozer00.dev" className='underline hover:text-red-500' target='_blank' rel='noopener noreferrer'>TwoZer00</a>
    {' · '}
    <a href="https://www.themoviedb.org/" className='underline hover:text-red-500' target='_blank' rel='noopener noreferrer'>TMDB</a>
  </footer>
)
