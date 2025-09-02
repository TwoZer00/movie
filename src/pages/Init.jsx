import { useLocation, useNavigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'

export default function Init() {
  return (
    <div className='flex flex-col h-dvh max-w-screen-lg mx-auto'>
      <Header/>
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
    <footer>
      <p className='text-center text-sm text-gray-500'>Made by <a href="https://twozer00.dev" className='underline'>TwoZer00</a> powered by <a className="underline" href="https://www.themoviedb.org/">TheMovieDB</a> API Services</p>
    </footer>
  )
}