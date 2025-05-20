import {
  createRoute,
  redirect
} from '@tanstack/react-router'
import type {AnyRoute, RouteOptions} from '@tanstack/react-router';

type SecureRouteOptions<TParentRoute extends AnyRoute> = RouteOptions<TParentRoute> & {
  isSecure?: boolean
}

export const createSecureRoute = <TParentRoute extends AnyRoute>(
  opts: SecureRouteOptions<TParentRoute>
) => {
  const { isSecure, beforeLoad, ...rest } = opts

  const wrappedBeforeLoad = isSecure
    ? ({ context }: any) => {
        if (!context.auth?.isAuthenticated) {
          throw redirect({ to: '/' })
        }
      }
    : undefined;
  
  const finalOpts = {
    ...rest,
    beforeLoad: wrappedBeforeLoad,
  } as RouteOptions<TParentRoute>

  return createRoute(finalOpts)
}
