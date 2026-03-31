import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../redux-store";
import type { FormStateRedux } from "./interface";
import type { PayloadAction } from "@reduxjs/toolkit";
import { initialFormLogin } from "@/pages/Login/dto";
import { initialFormSetup } from "@/pages/Setup/dto";

export const initialState: FormStateRedux = {
    LoginForm: initialFormLogin,
    SetupForm: initialFormSetup,
}

export const formSlice = createSlice({
    name: 'form',
    initialState,
    reducers: {
        setValue: <T extends keyof FormStateRedux>(
            state: FormStateRedux,
            action: PayloadAction<{ form: T; values: Partial<FormStateRedux[T]> }>
        ) => {
            const { form, values } = action.payload;
            // Pastikan Anda menggunakan spread untuk membuat salinan dari state lama
            state[form] = { ...state[form], ...values };
        },
        resetForm: <T extends keyof FormStateRedux>(
            state: FormStateRedux,
            action: PayloadAction<keyof FormStateRedux | 'all'>
        ) => {
            if (action.payload === 'all') {
                state = initialState
            } else {
                const form = action.payload as T;
                state[form] = { ...initialState[form] };
            }
        }
    }
});

export const { setValue, resetForm } = formSlice.actions;

export const selectForm = (state: RootState) => state.form;
export default formSlice.reducer;
