import axiosClient from "../utils/axiosClient";

/**
 * Service giao tiếp với các Endpoint AI Chat Copilot (theo spec chats.md)
 */

/**
 * Lấy danh sách lịch sử các đoạn chat AI của người dùng
 * @param {Object} params
 * @param {number} params.limit - Trả về tối đa số lượng record (1 - 100, default 20)
 * @param {number} params.skip - Số record bỏ qua cho phân trang (default 0)
 */
export async function fetchAiConversations({ limit = 20, skip = 0 } = {}) {
  return axiosClient.get("/ai/chat/conversations", {
    params: { limit, skip },
  });
}

/**
 * Lấy danh sách tin nhắn thoại trong một đoạn chat AI
 * @param {string} conversationId - AI Conversation UUID
 * @param {Object} params
 * @param {number} params.limit - Tối đa số tin nhắn (1 - 100, default 50)
 * @param {number} params.skip - Bỏ qua tin nhắn
 * @param {string} params.order - Sắp xếp theo thời gian ('asc' | 'desc', default 'asc')
 */
export async function fetchAiMessages(conversationId, { limit = 50, skip = 0, order = "asc" } = {}) {
  if (!conversationId) return { conversation_id: null, messages: [], total: 0 };
  return axiosClient.get(`/ai/chat/conversations/${conversationId}/messages`, {
    params: { limit, skip, order },
  });
}

/**
 * Gửi tin nhắn tới AI Copilot
 * @param {Object} payload
 * @param {number} payload.workspaceId - ID không gian làm việc
 * @param {string} [payload.conversation_id] - UUID cuộc hội thoại hiện tại (nếu gửi tiếp)
 * @param {string} payload.message - Nội dung tin nhắn người dùng
 * @param {Array} [payload.attachments] - Danh sách tệp đính kèm
 * @param {string} [payload.provider="openai"] - AI Provider
 * @param {string} [payload.model="gpt-4o-mini"] - Tên model AI
 * @param {number} [payload.temperature=0.7] - Độ sáng tạo
 * @param {boolean} [payload.force_new=false] - Buộc tạo hội thoại mới
 */
export async function sendAiChatMessage({
  workspaceId,
  conversation_id = null,
  message,
  attachments = [],
  provider = "openai",
  model = "gpt-4o-mini",
  temperature = 0.7,
  force_new = false,
}) {
  return axiosClient.post("/ai/chat", {
    workspaceId,
    conversation_id,
    message,
    attachments,
    provider,
    model,
    temperature,
    force_new,
  });
}
