import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../redux-store";
import type { AuthState } from "./interface";
import type { PayloadAction } from "@reduxjs/toolkit";

const initialState: AuthState = {
    username: '',
    division: '',
    name: '',
    token: '',
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<AuthState>) => {
            state.username = action.payload.username;
            state.division = action.payload.division;
            state.name = action.payload.name;
            state.token = action.payload.token;
        },
        logout: (state) => {
            state.username = '';
            state.division = '';
            state.name = '';
            state.token = '';
        },
    },
});

export const { login, logout } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;