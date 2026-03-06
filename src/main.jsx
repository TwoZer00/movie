import { createBrowserRouter } from 'react-router-dom'
import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import Init from './pages/Init'
import Menu from './pages/Menu'
import Settings from './pages/Settings'
import GuessSetup from './pages/GuessSetup'
import ErrorBoundary from './components/ErrorBoundary'
import { Loader } from './components/UIComponents'

const Home = lazy(() => import('./pages/Home'))
const LinkGame = lazy(() => import('./pages/LinkGame'))
const OddOneOut = lazy(() => import('./pages/OddOneOut'))

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
        element: <Settings/>,
      },
      {
        path: "/guess-setup",
        element: <GuessSetup/>,
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
