import { createSlice } from "@reduxjs/toolkit"
import type { RootState } from "../redux-store"
import type { LoadingButton, LoadingScreen, LoadingTable, SetModal, SetModalCropper, UtilityState } from "./interface"
import type { PayloadAction } from "@reduxjs/toolkit";

function initialState<T>(): UtilityState<T> {
    return {
        loading: {
            screen: false,
            table: false,
            button: false,
        },
        modal: {
            isOpen: false,
            data: [] as T,
            formName: '',
            isEdit: false,
        },
        modalCropper: {
            isOpen: false,
            fieldName: '',
            data: [] as T,
        }
    }
}

export const utilitySlice = createSlice({
    name: 'utility',
    initialState,
    reducers: {
        setLoadingScreen: <T>(state: UtilityState<T>, actions: PayloadAction<LoadingScreen>) => {
            state.loading.screen = actions.payload.screen
        },
        setLoadingTable: <T>(state: UtilityState<T>, actions: PayloadAction<LoadingTable>) => {
            state.loading.table = actions.payload.table
        },
        setLoadingButton: <T>(state: UtilityState<T>, actions: PayloadAction<LoadingButton>) => {
            state.loading.button = actions.payload.button
        },
        setLoadingAll: <T>(state: UtilityState<T>) => {
            state.loading = {
                screen: true,
                table: true,
                button: true,
            }
        },
        stopLoading: <T>(state: UtilityState<T>) => {
            state.loading = {
                screen: false,
                table: false,
                button: false,
            }
        },
        stopLoadingScreen: <T>(state: UtilityState<T>) => {
            state.loading.screen = false;
        },
        stopLoadingButton: <T>(state: UtilityState<T>) => {
            state.loading.button = false;
        },
        stopLoadingTable: <T>(state: UtilityState<T>) => {
            state.loading.table = false;
        },
        setModal: <T>(state: UtilityState<T>, actions: PayloadAction<SetModal<T>>) => {
            state.modal = {
                isOpen: actions.payload.modal.isOpen,
                data: actions.payload.modal.data,
                formName: actions.payload.modal.formName,
                isEdit: actions.payload.modal.isEdit,
            }
        },
        setModalCropper: <T>(state: UtilityState<T>, actions: PayloadAction<SetModalCropper<T>>) => {
            state.modalCropper = {
                isOpen: actions.payload.modalCropper.isOpen,
                fieldName: actions.payload.modalCropper.fieldName,
                data: actions.payload.modalCropper.data,
            }
        },
        closeModal: (state) => {
            state.modal = {
                isOpen: false,
                data: [],
                formName: '',
                isEdit: false,
            }
        },
        closeModalCropper: (state) => {
            state.modalCropper = {
                isOpen: false,
                fieldName: '',
                data: [],
            }
        }
    }
})

export const {
    setLoadingScreen,
    setLoadingTable,
    setLoadingButton,
    setLoadingAll,
    stopLoading,
    setModal,
    setModalCropper,
    closeModal,
    closeModalCropper,
    stopLoadingButton,
    stopLoadingScreen,
    stopLoadingTable,
} = utilitySlice.actions;

export const modalCropperActions = {
    setModalCropper,
    closeModalCropper,
}

export const selectUtility = (state: RootState) => state.utility;
export default utilitySlice.reducer;