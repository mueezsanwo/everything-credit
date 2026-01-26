import { X, CheckCircle, AlertCircle } from "lucide-react";

interface ToastProps {
  show: boolean;
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

export default function Toast({ show, message, type, onClose }: ToastProps) {
  if (!show) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
          type === "success"
            ? "bg-green-50 border border-green-200"
            : "bg-red-50 border border-red-200"
        }`}
      >
        {type === "success" ? (
          <CheckCircle className="text-green-600" size={20} />
        ) : (
          <AlertCircle className="text-red-600" size={20} />
        )}
        <span
          className={`text-sm font-medium ${
            type === "success" ? "text-green-800" : "text-red-800"
          }`}
        >
          {message}
        </span>
        <button onClick={onClose} className="ml-2">
          <X size={16} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}