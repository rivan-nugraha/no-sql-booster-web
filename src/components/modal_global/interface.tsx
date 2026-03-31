import type { FormStateRedux } from "../../redux/form/interface";

export interface ModalGlobalInterFace {
    children: React.ReactNode;
    title?: string;
    id?: string;
    namaForm?: keyof FormStateRedux;
    width?: number | 100;
    hideModal?: () => void;
}
  
export interface ModalLocalInterFace {
    children: React.ReactNode;
    id?: string;
    title: string;
    namaForm: string;
    width?: number | 100;
    isOpen: boolean;
    hideModal: () => void;
}