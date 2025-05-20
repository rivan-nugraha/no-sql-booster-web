export interface UtilityState<T> {
    loading: {
        screen: boolean;
        table: boolean;
        button: boolean;
    },
    modal: ModalData<T>,
    modalCropper: ModalCropper<T>
}

interface ModalData<T> {
    isOpen: boolean;
    data: T;
    formName: string;
    isEdit: boolean;
}

interface ModalCropper<T> {
    isOpen: boolean;
    fieldName: string;
    data: T
}

export interface SetModal<T> {
    modal: ModalData<T>
}

export interface SetModalCropper<T>{
    modalCropper: ModalCropper<T>
}

export interface LoadingScreen {
    screen: boolean
}

export interface LoadingTable {
    table: boolean
}

export interface LoadingButton {
    button: boolean
}