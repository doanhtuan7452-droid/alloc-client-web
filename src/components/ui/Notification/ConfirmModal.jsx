import React from "react";
import { HelpCircle } from "lucide-react";

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-md p-4 text-left">
      {/* Click outside to cancel */}
      <div className="absolute inset-0" onClick={onCancel} />
      
      <div className="bg-[#131b2c] border border-white/10 rounded-xl w-full max-w-md shadow-2xl p-6 text-white relative z-10 animate-fadeIn flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
            <HelpCircle size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white mb-1.5 leading-snug">
              {title}
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed break-words whitespace-pre-wrap">
              {message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all text-xs font-semibold"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-all text-xs font-semibold"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}
