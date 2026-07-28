import { useState, useEffect, useCallback } from "react";
import {
  fetchAiConversations,
  fetchAiMessages,
  sendAiChatMessage,
} from "../../../services/aiChatApi";
import WorkspaceService from "../../../services/WorkspaceService";

/**
 * Custom Hook quản lý dữ liệu và luồng giao tiếp AI Copilot Chat
 */
export function useAiChat(initialWorkspaceId = null, initialProjectId = null) {
  const [workspacesList, setWorkspacesList] = useState([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);

  const [workspaceId, setWorkspaceIdState] = useState(() => {
    if (initialWorkspaceId && !isNaN(Number(initialWorkspaceId))) {
      return Number(initialWorkspaceId);
    }
    const stored = localStorage.getItem("lastActiveWorkspaceId");
    return stored ? parseInt(stored, 10) : null;
  });

  const [projectId, setProjectId] = useState(initialProjectId);

  // Đồng bộ khi initialWorkspaceId từ URL/Context thay đổi
  useEffect(() => {
    if (initialWorkspaceId && !isNaN(Number(initialWorkspaceId))) {
      const num = Number(initialWorkspaceId);
      if (num !== workspaceId) {
        setWorkspaceIdState(num);
        localStorage.setItem("lastActiveWorkspaceId", num.toString());
      }
    }
  }, [initialWorkspaceId]);

  useEffect(() => {
    setProjectId(initialProjectId);
  }, [initialProjectId]);

  // Conversations (Khu A)
  const [conversations, setConversations] = useState([]);
  const [totalConversations, setTotalConversations] = useState(0);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [conversationsSearchQuery, setConversationsSearchQuery] = useState("");

  // Current Active Conversation (Khu B)
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeMeta, setActiveMeta] = useState({ title: "", summary: "" });
  const [messages, setMessages] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Send State & Options
  const [isSending, setIsSending] = useState(false);
  const [quotaError, setQuotaError] = useState(null);
  const [remainingQuota, setRemainingQuota] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState("gemini");
  const [selectedModel, setSelectedModel] = useState("gemini-2.0-flash");

  const handleModelChange = useCallback((provider, model) => {
    setSelectedProvider(provider);
    setSelectedModel(model);
  }, []);

  // Thay đổi Workspace an toàn & lưu vào localStorage
  const setWorkspaceId = useCallback((id) => {
    const numId = Number(id);
    if (!numId) return;
    setWorkspaceIdState(numId);
    localStorage.setItem("lastActiveWorkspaceId", numId.toString());
    setActiveConversationId(null);
    setMessages([]);
    setQuotaError(null);
  }, []);

  // Fetch danh sách Workspace người dùng tham gia & fallback nếu ID hiện tại không thuộc danh sách
  useEffect(() => {
    let isSubscribed = true;
    async function loadWorkspaces() {
      setIsLoadingWorkspaces(true);
      try {
        const res = await WorkspaceService.getWorkspaces();
        const list = res.items || res || [];
        if (!isSubscribed) return;

        setWorkspacesList(list);

        if (list.length > 0) {
          const exists = list.some((w) => Number(w.workspaceId) === Number(workspaceId));
          if (!workspaceId || !exists) {
            const defaultId = Number(list[0].workspaceId);
            setWorkspaceIdState(defaultId);
            localStorage.setItem("lastActiveWorkspaceId", defaultId.toString());
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải danh sách workspace cho AI Chat:", err);
      } finally {
        if (isSubscribed) setIsLoadingWorkspaces(false);
      }
    }
    loadWorkspaces();
    return () => {
      isSubscribed = false;
    };
  }, [workspaceId]);

  // Load Danh sách cuộc hội thoại AI
  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const res = await fetchAiConversations({ limit: 50, skip: 0 });
      const list = res.conversations || res.data?.conversations || [];
      const total = res.total || res.data?.total || list.length;
      setConversations(list);
      setTotalConversations(total);
    } catch (err) {
      console.error("Lỗi khi tải danh sách AI conversations:", err);
      setConversations([]);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Load Lịch sử tin nhắn khi chọn một hội thoại
  const loadMessages = useCallback(async (convId) => {
    if (!convId) {
      setMessages([]);
      setActiveMeta({ title: "", summary: "" });
      return;
    }

    setIsLoadingMessages(true);
    try {
      const res = await fetchAiMessages(convId, { limit: 100, skip: 0, order: "asc" });
      const msgs = res.messages || res.data?.messages || [];
      const title = res.title || res.data?.title || "";
      const summary = res.summary || res.data?.summary || "";

      setMessages(msgs);
      setActiveMeta({ title, summary });
    } catch (err) {
      console.error("Lỗi khi tải tin nhắn AI:", err);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // Effect khởi tạo danh sách cuộc trò chuyện
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Effect nạp tin nhắn mỗi khi activeConversationId thay đổi
  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
    }
  }, [activeConversationId, loadMessages]);

  // Chọn cuộc hội thoại
  const selectConversation = useCallback((convId) => {
    setActiveConversationId(convId);
    setQuotaError(null);
  }, []);

  // Tạo cuộc hội thoại mới (Clear active session)
  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setActiveMeta({ title: "Đoạn chat AI mới", summary: "" });
    setQuotaError(null);
  }, []);

  // Gửi tin nhắn đến AI Copilot
  const sendMessage = useCallback(
    async (promptText, { forceNew = false } = {}) => {
      if (!promptText || !promptText.trim()) return;

      const trimmedMsg = promptText.trim();
      setQuotaError(null);
      setIsSending(true);

      // Thêm ngay tin nhắn người dùng vào UI để phản hồi mượt mà
      const tempUserMsg = {
        id: `temp-${Date.now()}`,
        role: "user",
        content: trimmedMsg,
        timestamp: new Date().toISOString(),
        tokens_count: Math.ceil(trimmedMsg.length / 4),
      };

      setMessages((prev) => [...prev, tempUserMsg]);

      try {
        const payload = {
          workspaceId,
          projectId: projectId ? Number(projectId) : undefined,
          conversation_id: forceNew ? null : activeConversationId,
          message: trimmedMsg,
          provider: selectedProvider,
          model: selectedModel,
          temperature: 0.7,
          force_new: forceNew,
        };

        const res = await sendAiChatMessage(payload);
        const data = res.data || res;

        // Cập nhật quota nếu có
        if (typeof data.remaining_quota === "number") {
          setRemainingQuota(data.remaining_quota);
        }

        // Nếu là hội thoại mới hoặc chưa có ID, cập nhật conversation_id
        const newConvId = data.conversation_id || activeConversationId;
        if (newConvId && newConvId !== activeConversationId) {
          setActiveConversationId(newConvId);
        }

        // Thêm tin nhắn trả lời từ AI Copilot
        const aiResponseMsg = {
          id: `ai-${Date.now()}`,
          conversation_id: newConvId,
          role: "assistant",
          content:
            data.response ||
            data.message ||
            data.content ||
            (typeof data === "string" ? data : "Không nhận được phản hồi từ AI."),
          timestamp: new Date().toISOString(),
          tokens_count: data.usage?.completion_tokens || 0,
        };

        setMessages((prev) => [...prev, aiResponseMsg]);

        // Cập nhật lại danh sách hội thoại ở Khu A nếu tạo mới hoặc tiêu đề thay đổi
        if (forceNew || !activeConversationId || data.title_status === "updated") {
          loadConversations();
        }
      } catch (err) {
        console.error("Lỗi khi gửi tin nhắn AI:", err);
        const errData = err?.response?.data || {};

        if (err?.response?.status === 403 || errData.errorCode === "AI_QUOTA_EXCEEDED") {
          setQuotaError({
            message: errData.message || "Đã đạt giới hạn truy vấn AI hàng tháng.",
            errorCode: "AI_QUOTA_EXCEEDED",
          });
        } else {
          setQuotaError({
            message: errData.message || "Có lỗi xảy ra khi kết nối tới AI Copilot.",
            errorCode: "UNKNOWN_ERROR",
          });
        }
      } finally {
        setIsSending(false);
      }
    },
    [workspaceId, activeConversationId, selectedProvider, selectedModel, loadConversations]
  );

  // Lọc conversations ở Khu A theo từ khóa tìm kiếm
  const filteredConversations = conversations.filter((c) => {
    if (!conversationsSearchQuery) return true;
    const q = conversationsSearchQuery.toLowerCase();
    return (
      (c.title || "").toLowerCase().includes(q) ||
      (c.summary || "").toLowerCase().includes(q)
    );
  });

  return {
    workspacesList,
    isLoadingWorkspaces,
    workspaceId,
    projectId,
    setWorkspaceId,
    conversations: filteredConversations,
    totalConversations,
    isLoadingConversations,
    conversationsSearchQuery,
    setConversationsSearchQuery,
    activeConversationId,
    activeMeta,
    messages,
    isLoadingMessages,
    isSending,
    quotaError,
    remainingQuota,
    selectedModel,
    setSelectedModel,
    selectedProvider,
    setSelectedProvider,
    handleModelChange,
    selectConversation,
    startNewChat,
    sendMessage,
    loadConversations,
  };
}
