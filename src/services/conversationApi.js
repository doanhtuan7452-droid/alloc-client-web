import axiosClient from "../utils/axiosClient";
import WorkspaceService from "./WorkspaceService";

// Bỏ /api/v1 ở đầu các route vì axiosClient đã có sẵn base url này

export async function fetchWorkspaceConversations(workspaceId) {
  return axiosClient.get(`/workspaces/${workspaceId}/conversations`);
}

export async function fetchConversationDetails(conversationId) {
  return axiosClient.get(`/conversations/${conversationId}`);
}

export async function fetchConversationMessages(
  conversationId,
  pageSize = 20,
  beforeMessageId = null,
) {
  return axiosClient.get(`/conversations/${conversationId}/messages`, {
    params: {
      PageSize: pageSize,
      BeforeMessageId: beforeMessageId,
    },
  });
}

export async function sendConversationMessage(conversationId, content, assetIds = []) {
  return axiosClient.post(`/conversations/${conversationId}/messages`, {
    content,
    assetIds,
  });
}

export async function markConversationAsRead(conversationId) {
  return axiosClient.put(`/conversations/${conversationId}/read`);
}

export async function editConversationMessage(messageId, content) {
  return axiosClient.put(`/messages/${messageId}`, { content });
}

export async function deleteConversationMessage(messageId) {
  return axiosClient.delete(`/messages/${messageId}`);
}

export async function createConversation({
  workspaceId,
  type,
  name,
  workspaceMemberIds,
  projectId = null,
}) {
  return axiosClient.post(`/workspaces/${workspaceId}/conversations`, {
    workspaceMemberIds,
    name,
    type,
    projectId,
  });
}

export async function fetchWorkspaceMembers(workspaceId) {
  const response = await WorkspaceService.getWorkspaceMembers(workspaceId);
  return response.items || response;
}

export async function renameConversation(conversationId, name) {
  return axiosClient.put(`/conversations/${conversationId}`, { name });
}

export async function deleteConversation(conversationId) {
  return axiosClient.delete(`/conversations/${conversationId}`);
}