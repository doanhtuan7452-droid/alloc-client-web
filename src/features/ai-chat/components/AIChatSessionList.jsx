import { Sparkles, Plus, Search, MessageSquare, Bot, Clock } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import Skeleton from "../../../components/skeletons/Skeleton";

function formatModelName(modelStr) {
  if (!modelStr) return "AI Model";
  if (modelStr.includes("gemini")) return "Gemini 2.0 Flash";
  if (modelStr === "gpt-4o-mini") return "GPT-4o Mini";
  if (modelStr === "gpt-4o") return "GPT-4o";
  return modelStr;
}

/**
 * Khu A: Component hiển thị danh sách các đoạn chat AI (Conversations List)
 */
export default function AIChatSessionList({
  conversations = [],
  activeConversationId,
  onSelectConversation,
  onStartNewChat,
  searchQuery,
  onSearchChange,
  isLoading = false,
  remainingQuota = null,
}) {
  const { t } = useLanguage();
  return (
    <div className="h-full flex flex-col bg-neutral-950/60 border-r border-white/10 overflow-hidden select-none">
      {/* Header Khu A: Nút tạo mới & Tiêu đề */}
      <div className="p-3 border-b border-white/10 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            {t("aiChat.sessionListTitle")}
          </h2>
          <button
            onClick={onStartNewChat}
            className="flex items-center gap-1 px-2 py-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-md text-[11px] font-semibold text-purple-300 transition-all cursor-pointer active:scale-95"
            title={t("aiChat.newChatTitle")}
          >
            <Plus className="w-3 h-3" />
            <span className="font-mono text-[10px]">{t("aiChat.createNewBtn")}</span>
          </button>
        </div>

        {/* Ô Tìm kiếm danh sách cuộc trò chuyện */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder={t("aiChat.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-md pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 font-mono transition-colors"
          />
        </div>
      </div>

      {/* Danh sách các đoạn Chat AI */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-surface/30 border border-border-default/40 rounded-xl"
              >
                <Skeleton variant="circle" className="w-8 h-8" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton variant="text" className="h-3.5 w-2/3" />
                  <Skeleton variant="text" className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-10 px-4 space-y-2 font-mono text-xs text-slate-500">
            <Bot className="w-8 h-8 mx-auto opacity-30 text-purple-400" />
            <p className="italic">{t("aiChat.emptyHistory")}</p>
            <button
              onClick={onStartNewChat}
              className="text-[11px] text-purple-400 hover:text-purple-300 underline cursor-pointer"
            >
              {t("aiChat.startChatLink")}
            </button>
          </div>
        ) : (
          conversations.map((conv) => {
            const isSelected = activeConversationId === conv.conversation_id;
            const title = conv.title || t("aiChat.defaultChatTitle");
            const summary = conv.summary || t("aiChat.noSummary");
            const model = conv.metadata?.model || "gpt-4o-mini";
            const timeStr = conv.updated_at
              ? new Date(conv.updated_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : "";

            return (
              <div
                key={conv.conversation_id || conv.id}
                onClick={() => onSelectConversation(conv.conversation_id)}
                className={`group flex items-start gap-2 p-2 rounded-lg cursor-pointer border transition-all ${
                  isSelected
                    ? "bg-neutral-800 border-white/10 text-white font-medium shadow-sm"
                    : "bg-transparent border-transparent text-slate-400 hover:bg-neutral-800/50 hover:text-slate-200"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors mt-0.5 ${
                    isSelected
                      ? "bg-purple-600/30 border-purple-400/40 text-purple-300"
                      : "bg-white/[0.03] border-white/10 text-slate-500 group-hover:text-slate-300"
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-semibold text-[11px] truncate text-slate-200">
                      {title}
                    </span>
                    {timeStr && (
                      <span className="text-[9px] font-mono text-slate-500 shrink-0 flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {timeStr}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate line-clamp-1 font-mono">
                    {summary}
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                      {formatModelName(model)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Khu A: Quota & Status */}
      <div className="p-2 border-t border-white/10 bg-black/40 flex items-center justify-between text-[10px] font-mono text-slate-500 shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {t("aiChat.activeStatus")}
        </span>
        {remainingQuota !== null && (
          <span className="text-purple-400 font-semibold">
            {t("aiChat.quotaLabel").replace("{count}", remainingQuota)}
          </span>
        )}
      </div>
    </div>
  );
}
