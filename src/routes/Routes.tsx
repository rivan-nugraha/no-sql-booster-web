import { createRouter } from "@tanstack/react-router";
import { generatedRoutes, rootRoute } from "./RouterGenerator";
import { store } from "@/redux/redux-store";
import NotFound from "@/pages/NotFound";

export const router = createRouter({
    routeTree: rootRoute.addChildren(generatedRoutes),
    defaultPreload: 'intent',
    context: {
        auth: undefined!,
    },
    defaultNotFoundComponent() {
      return (<NotFound />);
    },
});

export const getReduxAuthContext = () => {
  const state = store.getState().auth
  return {
    isAuthenticated: !!state.access_token,
    token: state.access_token,
    user_id: state.user_id,
    name: state.name,
    level: state.level,
  }
}
