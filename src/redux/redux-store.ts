/* eslint-disable @typescript-eslint/naming-convention */
import { combineReducers } from 'redux';
import storage from 'redux-persist/lib/storage';
import { persistReducer } from 'redux-persist';
import { configureStore } from '@reduxjs/toolkit';
import { formSlice } from './form';
import { utilitySlice } from './utility';
import { authSlice } from './auth';
import type { ThunkAction } from '@reduxjs/toolkit';
import type { PersistConfig} from 'redux-persist';
import type { Action} from 'redux';

export const rootReducer = combineReducers({
    auth: authSlice.reducer,
    utility: utilitySlice.reducer,
    form: formSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const persistConfig: PersistConfig<RootState> = {
    key: "root",
    version: 1,
    storage: storage,
    blacklist: ["form"],
};

const persistedReducer = persistReducer<RootState>(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    devTools: import.meta.env.VITE_RUN_MODE === "development",
    middleware: getDefaultMiddleware => getDefaultMiddleware({
        serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;