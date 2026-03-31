import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { closeModal, selectUtility } from "../../redux/utility";
import { resetForm } from "../../redux/form";
import { useAppDispatch, useAppSelector } from "../../redux/redux-hook";
import type { FC} from "react";
import type { ModalGlobalInterFace } from "./interface";

const ModalGlobal: FC<ModalGlobalInterFace> = ({ children, title, namaForm, width = "600px" }) => {
  const utility = useAppSelector(selectUtility);
  const dispatch = useAppDispatch();

  const handleCancel = () => {
    if (namaForm) {
      dispatch(resetForm(namaForm));
    } else {
      dispatch(resetForm("all"));
    }
    dispatch(closeModal());
  };

  return (
    <Transition appear show={utility.modal.isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={handleCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-50"
          leave="ease-in duration-200"
          leaveFrom="opacity-50"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                style={{ maxWidth: width }}
              >
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {utility.modal.isEdit ? "Edit" : "Add"} {title}
                  </Dialog.Title>
                  <button
                    onClick={handleCancel}
                    className="text-gray-500 hover:text-gray-700 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-2 text-gray-700">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModalGlobal;
