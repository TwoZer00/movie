import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'

export default function Init() {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  }
  , [])
  return (
    <div className='flex flex-col w-dvw h-dvh justify-center'>
      <Header/>
      <ins className="adsbygoogle"
     style={{display:'block'}}
     data-ad-client="ca-pub-7731037445831235"
     data-ad-slot="5105136682"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
      <Outlet/>
      <Footer/>
    </div>
  )
}

const Header = ()=>{
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <header className='flex flex-row justify-center relative'>
      {
        location && location.pathname!="/" && 
        <button onClick={()=>navigate(-1)} className='h-full absolute left-2'><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      </svg>
      </button>
      }
      <div className='flex flex-col relative max-h-dvh'>
        <h1 className="font-bold text-4xl text-center">Guess the movie</h1>
        <p className="font-thin text-center">Guess the movie by its cast</p>
      </div>
    </header>
  )
}

const Footer = ()=>{
  return (
    <footer className='text-center text-sm text-gray-500'>
      <p>
        Guess the movie by its cast. You have 5 tries to guess the movie. After each guess, you&#39;ll get hints about the cast of the movie.
      </p>
      <p>Made by <a href="https://twozer00.dev" className='underline'>TwoZer00</a> using <a className="underline" href="https://www.themoviedb.org/">TheMovieDB</a> API Services</p>
    </footer>
  )
}