import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../redux-store";
import type { AuthState } from "./interface";
import type { PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthState = {
  user_id: '',
  name: '',
  level: '',
  access_token: '',
  refresh_token: '',
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<AuthState>) => {
            state.user_id = action.payload.user_id;
            state.name = action.payload.name;
            state.level = action.payload.level;
            state.access_token = action.payload.access_token;
            state.refresh_token = action.payload.refresh_token;
        },
        setTokens: (
            state,
            action: PayloadAction<Pick<AuthState, 'access_token' | 'refresh_token'>>,
        ) => {
            state.access_token = action.payload.access_token;
            state.refresh_token = action.payload.refresh_token;
        },
        logout: (state) => {
            state.user_id = '';
            state.name = '';
            state.level = '';
            state.access_token = '';
            state.refresh_token = '';
        },
    },
});

export const { login, logout, setTokens } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;
