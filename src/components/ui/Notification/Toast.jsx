import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export default function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ message, type, onClose }) {
  const styles = {
    success: {
      bg: "bg-[#092d21]/90 border-emerald-500/30 text-emerald-200",
      iconColor: "text-emerald-400",
      Icon: CheckCircle2,
    },
    error: {
      bg: "bg-[#3f1616]/90 border-rose-500/30 text-rose-200",
      iconColor: "text-rose-400",
      Icon: XCircle,
    },
    warning: {
      bg: "bg-[#331c04]/90 border-amber-500/30 text-amber-200",
      iconColor: "text-amber-400",
      Icon: AlertTriangle,
    },
    info: {
      bg: "bg-[#0c2447]/90 border-blue-500/30 text-blue-200",
      iconColor: "text-blue-400",
      Icon: Info,
    },
  };

  const currentStyle = styles[type] || styles.info;
  const { bg, iconColor, Icon } = currentStyle;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-slide-in ${bg}`}
      role="alert"
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
      <div className="flex-1 text-xs font-medium leading-relaxed break-words whitespace-pre-wrap">
        {message}
      </div>
      <button
        onClick={onClose}
        className="text-white/40 hover:text-white transition-colors shrink-0 p-0.5 rounded-md hover:bg-white/5"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
