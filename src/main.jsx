import { createBrowserRouter } from 'react-router-dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import Menu from './pages/Menu'

const router = createBrowserRouter([
  {
    path: "/play",
    element:<Home/>,
  },
  {
    path: "/",
    element: <Menu/>,
  }
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
