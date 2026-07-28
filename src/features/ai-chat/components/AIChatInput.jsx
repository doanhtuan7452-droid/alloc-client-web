import { useState, useRef } from "react";
import { Send, AlertCircle, Loader2, Cpu, RotateCcw } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";

/**
 * Danh sách cấu hình các AI Model & Provider hỗ trợ
 */
const MODEL_OPTIONS = [
  {
    provider: "gemini",
    providerLabel: "Google Gemini",
    models: [
      { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Mặc định)" },
      { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
      { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash" },
      { id: "gemini-flash-latest", label: "Gemini Flash Latest" },
    ],
  },
  {
    provider: "openai",
    providerLabel: "OpenAI",
    models: [
      { id: "gpt-4o-mini", label: "GPT-4o Mini" },
      { id: "gpt-4o", label: "GPT-4o" },
    ],
  },
];

/**
 * Khu B: Component khung nhập prompt và tùy chọn mô hình AI Copilot
 */
export default function AIChatInput({
  onSendMessage,
  isSending = false,
  quotaError = null,
  selectedProvider = "gemini",
  selectedModel = "gemini-2.0-flash",
  onModelChange,
  suggestedPromptInput = "",
}) {
  const [inputText, setInputText] = useState(suggestedPromptInput);
  const [forceNew, setForceNew] = useState(false);
  const textareaRef = useRef(null);
  const { t } = useLanguage();

  // Đồng bộ từ gợi ý khi nhấp chọn ở ngoài
  if (suggestedPromptInput && inputText !== suggestedPromptInput) {
    setInputText(suggestedPromptInput);
  }

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending) return;

    const text = inputText;
    setInputText("");
    onSendMessage(text, { forceNew });

    if (forceNew) {
      setForceNew(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectChange = (e) => {
    const [prov, mod] = e.target.value.split(":");
    if (onModelChange) {
      onModelChange(prov, mod);
    }
  };

  const currentSelectValue = `${selectedProvider}:${selectedModel}`;

  return (
    <div className="p-3 border-t border-white/10 bg-neutral-900/90 shrink-0 space-y-2 select-none">
      {/* Hiển thị thông báo Lỗi Quota AI */}
      {quotaError && (
        <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between font-mono animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{quotaError.message || t("aiChat.quotaExceededDefault")}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 rounded font-bold">
            {quotaError.errorCode || "AI_QUOTA_EXCEEDED"}
          </span>
        </div>
      )}

      {/* Thanh cấu hình Model AI & Force New Session */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5 min-w-0">
          <Cpu className="w-3 h-3 text-purple-400 shrink-0" />
          <span className="shrink-0">{t("aiChat.modelLabel")}</span>
          <select
            value={currentSelectValue}
            onChange={handleSelectChange}
            className="bg-neutral-800 border border-white/10 rounded-md px-1.5 py-0.5 text-slate-200 focus:outline-none focus:border-blue-500/50 cursor-pointer text-[10px] max-w-[130px] sm:max-w-[160px] truncate"
          >
            {MODEL_OPTIONS.map((group) => (
              <optgroup key={group.provider} label={group.providerLabel}>
                {group.models.map((m) => (
                  <option key={`${group.provider}:${m.id}`} value={`${group.provider}:${m.id}`}>
                    {group.providerLabel} - {m.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-1 cursor-pointer hover:text-slate-200 transition-colors shrink-0">
          <input
            type="checkbox"
            checked={forceNew}
            onChange={(e) => setForceNew(e.target.checked)}
            className="rounded border-white/10 text-purple-600 focus:ring-0 cursor-pointer w-3 h-3"
          />
          <span className="flex items-center gap-1 text-[10px]">
            <RotateCcw className="w-3 h-3 text-purple-400" />
            {t("aiChat.forceNewLabel")}
          </span>
        </label>
      </div>

      {/* Form Soạn thảo & Nút gửi */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <textarea
          ref={textareaRef}
          rows={2}
          placeholder={t("aiChat.inputPlaceholder")}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-3 pr-12 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 font-sans resize-none custom-scrollbar"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isSending}
          className="absolute right-2.5 p-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white transition-all disabled:opacity-30 disabled:hover:bg-purple-600 cursor-pointer shadow-md shadow-purple-950/40 active:scale-95 shrink-0"
          title={t("aiChat.sendBtnTitle")}
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
