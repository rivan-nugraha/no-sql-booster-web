import { X } from "lucide-react";
import type { FC } from "react";

export type ToastVariant = "error" | "success" | "info" | "warning";

export interface ToastProps {
  id: string;
  title: string;
  message?: string;
  variant?: ToastVariant;
  onClose?: (id: string) => void;
}

const variantClass: Record<ToastVariant, string> = {
  error: "bg-red-100 text-red-700 border-red-200",
  success: "bg-green-100 text-green-700 border-green-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

export const Toast: FC<ToastProps> = ({
  id,
  title,
  message,
  variant = "info",
  onClose,
}) => {
  return (
    <div
      className={`flex w-full max-w-sm items-start gap-3 rounded-md border px-4 py-3 shadow-md ${variantClass[variant]}`}
    >
      <div className="flex-1">
        <p className="font-semibold leading-tight">{title}</p>
        {message && <p className="text-sm leading-snug mt-1">{message}</p>}
      </div>
      {onClose && (
        <button
          aria-label="Close"
          onClick={() => onClose(id)}
          className="p-1 text-inherit hover:opacity-70"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
