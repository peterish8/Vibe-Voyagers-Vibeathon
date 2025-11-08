"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Info, AlertTriangle, X, XCircle } from "lucide-react";
import { useEffect } from "react";

export type ToastType = "success" | "info" | "warning" | "error";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
};

const colors = {
  success: "text-green-600",
  info: "text-blue-600",
  warning: "text-amber-600",
  error: "text-red-600",
};

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const Icon = icons[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="glass-strong rounded-2xl p-4 w-80 shadow-xl"
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors[toast.type]}`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{toast.title}</p>
          {toast.description && (
            <p className="text-xs text-gray-600 mt-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="p-1 rounded-lg hover:bg-white/50 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence>
        {toasts.slice(0, 3).map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

