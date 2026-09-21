import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import AdSenseResponsive from '../components/AdSenseResponsive'
import ErrorBoundary from '../components/ErrorBoundary'

export default function Init() {
  useEffect(() => {
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
      <main className='flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0 bg-[#f5f0eb] dark:bg-[#0d0d0d]'>
        <ErrorBoundary resetKey={location.pathname}>
          <Outlet/>
        </ErrorBoundary>
      </main>
      {/* Mobile: ad banner replaces footer text. Desktop: footer text only */}
      <div className='md:hidden flex-shrink-0 h-[50px] bg-white/90 dark:bg-[#111]/90 flex items-center justify-center overflow-hidden'>
        <AdSenseResponsive format='banner' />
      </div>
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
      <div className='flex flex-row items-center justify-center px-4 py-1.5 sm:py-2 relative'>
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
          <span className='text-lg sm:text-xl'>🎬</span>
          <div>
            <h1 className='font-display text-2xl sm:text-3xl leading-none tracking-wide bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent'>FILMDLE</h1>
            <p className='text-[9px] sm:text-[10px] text-center text-gray-400 dark:text-gray-500 tracking-widest uppercase'>Guess · Chain · Win</p>
          </div>
        </div>
      </div>
    </header>
  )
}

const Footer = () => (
  <footer className='hidden md:block flex-shrink-0 text-center text-[11px] text-gray-400 dark:text-gray-600 py-1 px-4 bg-white/80 dark:bg-[#111]/80 border-t border-black/6 dark:border-white/5'>
    Made by <a href="https://twozer00.dev" className='hover:text-red-500 transition-colors font-medium' target='_blank' rel='noopener noreferrer'>TwoZer00</a>
    {' · '}
    <a href="https://www.themoviedb.org/" className='hover:text-amber-500 transition-colors' target='_blank' rel='noopener noreferrer'>TMDB</a>
  </footer>
)
