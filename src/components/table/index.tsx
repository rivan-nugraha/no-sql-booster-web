/* eslint-disable @typescript-eslint/no-unnecessary-condition */
 
import {
    Database,
    FileCodeIcon,
    Pencil,
    Plus,
    Printer,
    Trash2,
  } from "lucide-react";
  import { useState } from "react";
  import { useAppSelector } from "../../redux/redux-hook";
  import { selectUtility } from "../../redux/utility";
  import type TableComponentProps from "./interface";
  
  const TableComponent = <T extends Record<string, any>>({
    columns,
    data,
    handleEdit,
    handleDelete,
    anotherAction,
    icon,
    editTujuan,
    editTembusan,
    editEvent,
    emptyText = "Data Kosong",
    anotherActionLabel,
    deleteDisable,
    editDisable,
    cetakDokumentasi,
    cetakNotulensi,
    editScript
  }: TableComponentProps<T>) => {
    const loadingTable = useAppSelector(selectUtility).loading.table;
    const [openPopover, setOpenPopover] = useState<number | null>(null);

    return (
      <>
        <table className="w-full divide-y divide-gray-200 text-sm text-center">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-3 font-bold text-gray-700">
                  {column.title}
                </th>
              ))}
              {(handleEdit || anotherAction || handleDelete || editTujuan || editEvent || editTembusan || cetakNotulensi || cetakDokumentasi || editScript) && (
                <th className="px-6 py-3 font-bold text-gray-700">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loadingTable ? (
              <tr>
                <td colSpan={columns.length + 1}>
                  <div className="flex flex-col justify-center items-center h-[50vh] w-full">
                    <svg className="animate-spin h-20 w-20 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  </div>
                </td>
              </tr>
            ) : !data?.length ? (
              <tr>
                <td colSpan={columns.length + 1}>
                  <div className="flex flex-col justify-center items-center h-[50vh] w-full text-gray-500">
                    <Database size={80} />
                    <p className="text-xl font-medium mt-4">{emptyText}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 transition">
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      {column.render
                        ? column.render(item, rowIndex)
                        : column.key
                          ? String(item[column.key as keyof T])
                          : null}
                    </td>
                  ))}
                  {(handleEdit || anotherAction || handleDelete || editTujuan || editEvent || editTembusan || cetakNotulensi || cetakDokumentasi) && (
                    <td className="px-6 py-4 relative">
                      <button
                        onClick={() => setOpenPopover(openPopover === rowIndex ? null : rowIndex)}
                        className="px-3 py-1 border border-gray-400 rounded-md text-sm font-medium hover:bg-gray-100"
                      >
                        ...
                      </button>
                      {openPopover === rowIndex && (
                        <div className="absolute z-10 right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg p-3 space-y-3">
                          <p className="text-center font-semibold text-gray-700 border-b pb-1">Actions</p>
                          {handleEdit && (
                            <div className="text-center">
                              <button
                                disabled={editDisable ? editDisable(item) : false}
                                className="w-full py-2 flex items-center justify-center space-x-2 text-yellow-600 hover:bg-yellow-100 rounded"
                                onClick={() => handleEdit(item)}
                              >
                                <Pencil className="w-4 h-4" />
                                <span>Edit</span>
                              </button>
                            </div>
                          )}
                          {handleDelete && (
                            <div className="text-center">
                              <button
                                disabled={deleteDisable ? deleteDisable(item) : false}
                                className="w-full py-2 flex items-center justify-center space-x-2 text-red-600 hover:bg-red-100 rounded"
                                onClick={() => handleDelete(item)}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                          {anotherAction && (
                            <div className="text-center">
                              <button
                                className="w-full py-2 flex items-center justify-center space-x-2 text-blue-600 hover:bg-blue-100 rounded"
                                onClick={() => anotherAction(item)}
                              >
                                {icon}
                                <span>{anotherActionLabel}</span>
                              </button>
                            </div>
                          )}
                          {editTujuan && (
                            <div className="text-center">
                              <button
                                className="w-full py-2 flex items-center justify-center space-x-2 text-blue-600 hover:bg-blue-100 rounded"
                                onClick={() => editTujuan(item)}
                              >
                                <Plus className="w-4 h-4" />
                                <span>Ubah/Tambah Tujuan</span>
                              </button>
                            </div>
                          )}
                          {editTembusan && (
                            <div className="text-center">
                              <button
                                className="w-full py-2 flex items-center justify-center space-x-2 text-blue-600 hover:bg-blue-100 rounded"
                                onClick={() => editTembusan(item)}
                              >
                                <Plus className="w-4 h-4" />
                                <span>Ubah/Tambah Tembusan</span>
                              </button>
                            </div>
                          )}
                          {editEvent && (
                            <div className="text-center">
                              <button
                                className="w-full py-2 flex items-center justify-center space-x-2 text-blue-600 hover:bg-blue-100 rounded"
                                onClick={() => editEvent(item)}
                              >
                                <Plus className="w-4 h-4" />
                                <span>Ubah/Tambah Kegiatan</span>
                              </button>
                            </div>
                          )}
                          {cetakNotulensi && (
                            <div className="text-center">
                              <button
                                className="w-full py-2 flex items-center justify-center space-x-2 text-green-600 hover:bg-green-100 rounded"
                                onClick={() => cetakNotulensi(item)}
                              >
                                <Printer className="w-4 h-4" />
                                <span>Cetak Notulensi</span>
                              </button>
                            </div>
                          )}
                          {cetakDokumentasi && (
                            <div className="text-center">
                              <button
                                className="w-full py-2 flex items-center justify-center space-x-2 text-green-600 hover:bg-green-100 rounded"
                                onClick={() => cetakDokumentasi(item)}
                              >
                                <Printer className="w-4 h-4" />
                                <span>Cetak Dokumentasi</span>
                              </button>
                            </div>
                          )}
                          {
                            editScript && (
                              <div className="text-center">
                                <button
                                  className="w-full py-2 flex items-center justify-center space-x-2 text-green-600 hover:bg-green-100 rounded"
                                  onClick={() => editScript(item)}
                                >
                                  <FileCodeIcon className="w-4 h-4" />
                                  <span>Edit Script</span>
                                </button>
                              </div>
                            )
                          }
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </>
    );
  };
  
  export default TableComponent;
  