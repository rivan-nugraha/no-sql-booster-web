import { createContext, useContext } from "react";
import { useAppDispatch, useAppSelector } from "../redux/redux-hook";
import { login, logout, selectAuth } from "../redux/auth";
import type { FC, ReactNode} from "react";
import type { AuthState } from "../redux/auth/interface";

type AuthContextType = {
    login: (user: AuthState) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({children}) => {
    const token = useAppSelector(selectAuth).token;
    const dispatch = useAppDispatch();

    const loginContext = (user: AuthState) => {
        dispatch(login(user));
    };

    const logoutContext = () => {
        dispatch(logout());
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ isAuthenticated, login: loginContext, logout: logoutContext }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};