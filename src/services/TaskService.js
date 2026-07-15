import axiosClient from "../utils/axiosClient";

const TaskService = {
  getTaskById: (id) => axiosClient.get(`/tasks/${id}`),
  updateTask: (id, data) => axiosClient.put(`/tasks/${id}`, data),
  deleteTask: (id) => axiosClient.delete(`/tasks/${id}`),
  getTaskAssignees: (id) => axiosClient.get(`/tasks/${id}/assignees`),
  assignTaskMember: (id, data) =>
    axiosClient.post(`/tasks/${id}/assignees`, data),
  removeTaskAssignee: (taskId, memberId) =>
    axiosClient.delete(`/tasks/${taskId}/assignees/${memberId}`),
  getTaskDependencies: (id) => axiosClient.get(`/tasks/${id}/dependencies`),
  createTaskDependency: (id, data) =>
    axiosClient.post(`/tasks/${id}/dependencies`, data),
  deleteTaskDependency: (id) => axiosClient.delete(`/tasks/dependencies/${id}`),
  getTaskComments: (id) => axiosClient.get(`/tasks/${id}/comments`),
  createTaskComment: (id, data) =>
    axiosClient.post(`/tasks/${id}/comments`, data),
  updateComment: (commentId, data) =>
    axiosClient.put(`/comments/${commentId}`, data),
  deleteComment: (commentId) => axiosClient.delete(`/comments/${commentId}`),
  getTaskAssets: (taskId) =>
    axiosClient.get(`/tasks/${taskId}/assets`),

  createTaskAsset: (taskId, formData) =>
    axiosClient.post(`/tasks/${taskId}/assets`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  deleteTaskAsset: (taskId, assetId) =>
    axiosClient.delete(`/tasks/${taskId}/assets/${assetId}`),
};

export default TaskService;
