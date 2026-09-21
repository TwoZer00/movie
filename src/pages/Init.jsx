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
    <div className='flex flex-col w-dvw h-dvh dark:bg-[#0d0d0d] dark:text-white'>
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
  const isHome = location.pathname === '/';
  
  return (
    <header className='film-header flex-shrink-0 relative bg-white/90 dark:bg-[#111]/90 backdrop-blur-sm border-b border-black/8 dark:border-white/6'>
      <div className='flex flex-row items-center justify-center px-4 py-2 relative'>
        {!isHome && (
          <button
            onClick={() => navigate('/')}
            className='absolute left-3 p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-amber-400 hover:bg-red-50 dark:hover:bg-white/5 transition-all'
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
        )}
        <div className='flex items-center gap-2'>
          <span className='text-xl'>🎬</span>
          <div>
            <h1 className='font-display text-3xl leading-none tracking-wide bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent'>FILMDLE</h1>
            <p className='text-[10px] text-center text-gray-400 dark:text-gray-500 tracking-widest uppercase'>Guess · Chain · Win</p>
          </div>
        </div>
      </div>
    </header>
  )
}

const Footer = () => (
  <footer className='flex-shrink-0 text-center text-xs text-gray-400 dark:text-gray-600 py-1.5 px-4 bg-white/80 dark:bg-[#111]/80 border-t border-black/6 dark:border-white/5'>
    Made by <a href="https://twozer00.dev" className='hover:text-red-500 transition-colors font-medium' target='_blank' rel='noopener noreferrer'>TwoZer00</a>
    {' · '}
    <a href="https://www.themoviedb.org/" className='hover:text-amber-500 transition-colors' target='_blank' rel='noopener noreferrer'>TMDB</a>
  </footer>
)
