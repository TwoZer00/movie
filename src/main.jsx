import { createBrowserRouter } from 'react-router-dom'
import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import Init from './pages/Init'
import Menu from './pages/Menu'
import ErrorBoundary from './components/ErrorBoundary'
import { Loader } from './components/UIComponents'

// Lazy load all game pages and heavy components
const Home = lazy(() => import('./pages/Home'))
const LinkGame = lazy(() => import('./pages/LinkGame'))
const OddOneOut = lazy(() => import('./pages/OddOneOut'))
const Settings = lazy(() => import('./pages/Settings'))
const GuessSetup = lazy(() => import('./pages/GuessSetup'))

const router = createBrowserRouter([
  {
    path: "/",
    element: <Init/>,
    children: [
      {
        path: "/play",
        element: <Suspense fallback={<Loader />}><Home/></Suspense>,
      },
      {
        path: "/",
        element: <Menu/>,
      },
      {
        path: "/link",
        element: <Suspense fallback={<Loader />}><LinkGame/></Suspense>,
      },
      {
        path: "/settings",
        element: <Suspense fallback={<Loader />}><Settings/></Suspense>,
      },
      {
        path: "/guess-setup",
        element: <Suspense fallback={<Loader />}><GuessSetup/></Suspense>,
      },
      {
        path: "/odd",
        element: <Suspense fallback={<Loader />}><OddOneOut/></Suspense>,
      }
    ]
  }
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>,
)

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registered'))
      .catch(() => console.log('SW registration failed'));
  });
}
