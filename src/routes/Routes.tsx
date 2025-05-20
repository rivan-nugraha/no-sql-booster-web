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
    isAuthenticated: !!state.token,
    token: state.token,
    username: state.username,
    name: state.name,
    division: state.division,
  }
}