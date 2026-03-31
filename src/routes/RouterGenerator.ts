import { createRootRoute } from '@tanstack/react-router'
import { createSecureRoute } from './CreateSecureRoute.tsx';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard/index.tsx';
import AppLayout from '@/layout/AppLayout.tsx';
import UserPage from '@/pages/User';
import Setup from '@/pages/Setup';

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
    }),
    createSecureRoute({
        getParentRoute: () => layoutRoute,
        path: '/user',
        component: UserPage
    })
]

export const generatedRoutes = [
    createSecureRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: Login
    }),
    createSecureRoute({
        getParentRoute: () => rootRoute,
        path: '/setup',
        component: Setup
    }),
    layoutRoute.addChildren(layoutPath)
];
