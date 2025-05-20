import { createRootRoute } from '@tanstack/react-router'
import { createSecureRoute } from './CreateSecureRoute.tsx';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard/index.tsx';
import AppLayout from '@/layout/AppLayout.tsx';

export const rootRoute = createRootRoute()

const layoutRoute = createSecureRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: AppLayout,
})

const layoutPath = [
    createSecureRoute({
        getParentRoute: () => layoutRoute,
        path: '/dashboard',
        component: Dashboard
    })
]

export const generatedRoutes = [
    createSecureRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: Login
    }),
    layoutRoute.addChildren(layoutPath)
];
