import { createBrowserRouter } from 'react-router-dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Init from './pages/Init'
import LinkGame from './pages/LinkGame'
import ErrorBoundary from './ErrorBoundary'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Init/>,
    children: [
      {
        path: "/play",
        element: <Home/>,
      },
      {
        path: "/",
        element: <Menu/>,
      },
      {
        path: "/link",
        element: <LinkGame/>,
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
