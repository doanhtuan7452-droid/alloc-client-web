import { useRef, useEffect } from "react";
import { Sparkles, User, Bot, Loader2, Database } from "lucide-react";
import AIMessageFormatter from "./AIMessageFormatter";
import { useLanguage } from "../../../contexts/LanguageContext";
import AiThinkingSkeleton from "../../../components/skeletons/AiThinkingSkeleton";

/**
 * Khu B: Component hiển thị danh sách tin nhắn thoại giữa Người dùng và AI Copilot
 */
export default function AIChatMessageLog({
  messages = [],
  isLoading = false,
  isSending = false,
  onSelectSuggestedPrompt,
  activeMeta = {},
}) {
  const { t } = useLanguage();
  const messagesEndRef = useRef(null);

  // Cuộn xuống tin nhắn mới nhất khi nhận phản hồi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const suggestedPrompts = [
    {
      title: t("aiChat.suggestedRisk"),
      prompt: t("aiChat.suggestedRiskPrompt"),
    },
    {
      title: t("aiChat.suggestedResource"),
      prompt: t("aiChat.suggestedResourcePrompt"),
    },
    {
      title: t("aiChat.suggestedBudget"),
      prompt: t("aiChat.suggestedBudgetPrompt"),
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 custom-scrollbar space-y-3 bg-[#0B0F19]/40">
      {/* Tiêu đề & Tóm tắt đoạn chat nếu có */}
      {activeMeta?.title && (
        <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 mb-4 font-mono">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{activeMeta.title}</span>
          </div>
          {activeMeta.summary && (
            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
              {activeMeta.summary}
            </p>
          )}
        </div>
      )}

      {/* Trang Thái Trống: Hiển thị gợi ý khi chưa có tin nhắn */}
      {messages.length === 0 && !isLoading ? (
        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
          <div className="p-4 bg-purple-600/20 border border-purple-500/30 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.15)]">
            <Bot className="w-10 h-10 text-purple-400 animate-bounce" />
          </div>

          <div className="max-w-md space-y-2">
            <h3 className="text-base font-bold text-slate-100">
              {t("aiChat.greetingTitle")}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {t("aiChat.greetingSubtitle")}
            </p>
          </div>

          {/* Gợi ý câu hỏi */}
          <div className="w-full max-w-md space-y-2 pt-2">
            <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider text-left">
              {t("aiChat.suggestedLabel")}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {suggestedPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectSuggestedPrompt(item.prompt)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/10 hover:border-purple-500/40 text-left transition-all group cursor-pointer"
                >
                  <span className="text-xs font-medium text-slate-300 group-hover:text-purple-300">
                    {item.prompt}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        messages.map((msg, index) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id || index}
              className={`flex gap-2.5 ${
                isUser ? "ml-auto max-w-[85%] flex-row-reverse" : "mr-auto w-full max-w-full"
              } animate-fadeIn`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? "bg-blue-600/20 border-blue-500/30 text-blue-400"
                    : "bg-purple-600/20 border-purple-500/30 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Nội dung Message */}
              <div className={`space-y-1 flex flex-col ${isUser ? "max-w-[90%]" : "flex-1 min-w-0 w-full"}`}>
                <div
                  className={`flex items-center gap-2 text-[10px] font-mono text-slate-500 ${
                    isUser ? "justify-end" : ""
                  }`}
                >
                  <span className="font-bold text-slate-400">
                    {isUser ? t("aiChat.youLabel") : t("aiChat.aiLabel")}
                  </span>
                  {msg.timestamp && (
                    <span
                      title={
                        msg.tokens_count > 0
                          ? `Thời gian: ${new Date(msg.timestamp).toLocaleString()} • Số lượng token: ${msg.tokens_count}`
                          : `Thời gian: ${new Date(msg.timestamp).toLocaleString()}`
                      }
                      className="cursor-help hover:text-slate-300 transition-colors"
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed break-words ${
                    isUser
                      ? "bg-blue-600/30 border border-blue-500/30 text-slate-100 rounded-tr-none shadow-md whitespace-pre-wrap font-sans"
                      : "bg-white/[0.04] border border-white/10 text-slate-200 rounded-tl-none shadow-md font-sans"
                  }`}
                >
                  <AIMessageFormatter content={msg.content} />

                  {/* Nguồn tài liệu RAG nếu có */}
                  {msg.rag_sources && msg.rag_sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
                        <Database className="w-3.5 h-3.5" />
                        <span>{t("aiChat.ragSourcesLabel").replace("{count}", msg.rag_sources.length)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.rag_sources.map((src, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded bg-black/30 border border-white/10 text-slate-400"
                          >
                            {src.title || src.name || t("aiChat.ragDocLabel").replace("{index}", sIdx + 1)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Trạng thái AI đang gửi tin nhắn */}
      {isSending && <AiThinkingSkeleton />}

      <div ref={messagesEndRef} />
    </div>
  );
}
