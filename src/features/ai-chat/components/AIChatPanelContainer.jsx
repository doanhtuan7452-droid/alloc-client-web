import { useState } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Plus,
  GripVertical,
  LayoutGrid,
  X,
} from "lucide-react";
import { useResizablePanel } from "../hooks/useResizablePanel";
import { useAiChat } from "../hooks/useAiChat";
import AIChatSessionList from "./AIChatSessionList";
import AIChatMessageLog from "./AIChatMessageLog";
import AIChatInput from "./AIChatInput";
import { useLanguage } from "../../../contexts/LanguageContext";

/**
 * Component tổng ghép Khu A (Conversations) và Khu B (Message Content)
 * với khả năng kéo thả Resize và Collapse Khu A hoàn toàn độc lập.
 */
export default function AIChatPanelContainer({
  initialWorkspaceId = null,
  initialProjectId = null,
  onClose = null,
  isDrawer = false,
}) {
  const {
    panelWidth,
    isCollapsed,
    toggleCollapse,
    handleMouseDown,
    isResizing,
  } = useResizablePanel({ minWidth: 140, maxWidth: 220, defaultWidth: 160 });

  const { t } = useLanguage();
  const aiChat = useAiChat(initialWorkspaceId, initialProjectId);
  const [suggestedPromptInput, setSuggestedPromptInput] = useState("");

  const handleSelectSuggestedPrompt = (prompt) => {
    setSuggestedPromptInput(prompt);
  };

  // Lấy tên workspace hiện tại
  const currentWorkspaceObj = aiChat.workspacesList.find(
    (w) => Number(w.workspaceId) === Number(aiChat.workspaceId)
  );

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900/95 text-slate-100 overflow-hidden relative select-none rounded-md border border-white/10 shadow-2xl">
      {/* Top Header Khung AI Chat */}
      <div className="h-12 border-b border-white/10 px-3 flex items-center justify-between bg-neutral-900/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Nút Toggle Thu gọn / Mở rộng Khu A */}
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-purple-300 transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-center shrink-0"
            title={isCollapsed ? t("aiChat.expandSessionList") : t("aiChat.collapseSessionList")}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-purple-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-300" />
            )}
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-5 h-5 rounded-md bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-3 h-3" />
            </div>
            <span className="font-bold text-[11px] tracking-tight bg-gradient-to-r from-purple-200 via-slate-100 to-purple-400 bg-clip-text text-transparent font-mono hidden sm:inline">
              ALLOC AI
            </span>
          </div>

          {/* Hiển thị Workspace Auto-scoped hoặc Dropdown chọn Workspace */}
          <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-white/10 text-xs font-mono min-w-0 truncate">
            <LayoutGrid className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            {initialWorkspaceId ? (
              <span
                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 text-[11px] font-medium truncate"
                title={t("aiChat.workspaceAutoDetect").replace("{name}", currentWorkspaceObj?.name || initialWorkspaceId)}
              >
                {currentWorkspaceObj?.name || `WS #${initialWorkspaceId}`}
              </span>
            ) : (
              <select
                value={aiChat.workspaceId || ""}
                onChange={(e) => aiChat.setWorkspaceId(e.target.value)}
                className="bg-neutral-800 border border-white/10 rounded-md px-2 py-0.5 text-slate-200 focus:outline-none focus:border-blue-500/50 text-[11px] cursor-pointer max-w-[150px] truncate font-medium"
              >
                {aiChat.workspacesList.map((w) => (
                  <option key={w.workspaceId} value={w.workspaceId}>
                    {w.name} (#{w.workspaceId})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={aiChat.startNewChat}
            className="px-2 py-1 rounded-md bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-[11px] font-mono font-medium flex items-center gap-1 transition-all cursor-pointer active:scale-95"
            title={t("aiChat.newChatTitle")}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("aiChat.newChatBtn")}</span>
          </button>

          {/* Nút Đóng Panel X */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={t("aiChat.closePanelBtn")}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Body chứa Khu A & Khu B */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Khu A: Danh sách cuộc trò chuyện (Có thể Resize & Collapse) */}
        <div
          style={{
            width: isCollapsed ? 0 : `${panelWidth}px`,
          }}
          className={`h-full shrink-0 overflow-hidden transition-all duration-300 ease-in-out relative ${
            isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <AIChatSessionList
            conversations={aiChat.conversations}
            activeConversationId={aiChat.activeConversationId}
            onSelectConversation={aiChat.selectConversation}
            onStartNewChat={aiChat.startNewChat}
            searchQuery={aiChat.conversationsSearchQuery}
            onSearchChange={aiChat.setConversationsSearchQuery}
            isLoading={aiChat.isLoadingConversations}
            remainingQuota={aiChat.remainingQuota}
          />
        </div>

        {/* Thanh Kéo Rê (Resize Handle Bar) giữa Khu A và Khu B */}
        {!isCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            className={`w-1.5 h-full bg-white/5 hover:bg-purple-500/50 cursor-col-resize flex items-center justify-center transition-colors shrink-0 z-10 group ${
              isResizing ? "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" : ""
            }`}
            title={t("aiChat.dragResizeTitle")}
          >
            <GripVertical className="w-3 h-3 text-slate-600 group-hover:text-purple-300 transition-colors" />
          </div>
        )}

        {/* Khu B: Nội dung đoạn chat đang chọn (Độ rộng tự động fill) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-900/40">
          <AIChatMessageLog
            messages={aiChat.messages}
            isLoading={aiChat.isLoadingMessages}
            isSending={aiChat.isSending}
            onSelectSuggestedPrompt={handleSelectSuggestedPrompt}
            activeMeta={aiChat.activeMeta}
          />

          <AIChatInput
            onSendMessage={aiChat.sendMessage}
            isSending={aiChat.isSending}
            quotaError={aiChat.quotaError}
            selectedProvider={aiChat.selectedProvider}
            selectedModel={aiChat.selectedModel}
            onModelChange={aiChat.handleModelChange}
            suggestedPromptInput={suggestedPromptInput}
          />
        </div>
      </div>
    </div>
  );
}
