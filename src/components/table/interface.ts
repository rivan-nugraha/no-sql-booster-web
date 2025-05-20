/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ColumnProps<T> {
    title: string;
    key?: keyof T | string;
    render?: (item: T, index: number) => React.ReactNode;
}

export default interface TableComponentProps<T extends Record<string, any>> {
    columns: ColumnProps<T>[],
    data: T[],
    handleEdit?: (item: T) => void;
    handleDelete?: (item: T) => void;
    anotherAction?: (item: T) => void;
    anotherActionLabel?: string;
    icon?: React.ReactElement,
    editTujuan?: (item: T) => void;
    editTembusan?: (item: T) => void;
    editEvent?: (item: T) => void;
    emptyText?: string;
    deleteDisable?: (item: T) => boolean;
    editDisable?: (item: T) => boolean;
    cetakNotulensi?: (item: T) => void;
    cetakDokumentasi?: (item: T) => void;
    editScript?: (item: T) => void;
}