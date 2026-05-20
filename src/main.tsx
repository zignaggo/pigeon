import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  RouterProvider,
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from '@tanstack/react-router'
import Home from './routes/index'
import './styles.css'

const rootRoute = createRootRoute({ component: () => <Outlet /> })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const routeTree = rootRoute.addChildren([indexRoute])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const el = document.getElementById('root')
if (el) {
  createRoot(el).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}
