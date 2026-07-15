import axiosClient from "../utils/axiosClient";

const WorkspaceService = {
  createWorkspace: (data) => axiosClient.post("/workspaces", data),
  getWorkspaces: () => axiosClient.get("/workspaces"),
  getWorkspaceById: (id) => axiosClient.get(`/workspaces/${id}`),
  updateWorkspace: (id, data) => axiosClient.put(`/workspaces/${id}`, data),
  deleteWorkspace: (id) => axiosClient.delete(`/workspaces/${id}`),
  getWorkspaceProjects: (id) => axiosClient.get(`/workspaces/${id}/Projects`),
  getWorkspaceMembers: (id) => axiosClient.get(`/workspaces/${id}/Members`),
  getWorkspaceRoles: (id) => axiosClient.get(`/workspaces/${id}/Roles`),
  updateMemberStatus: (workspaceId, memberId) => 
  axiosClient.put(`/workspaces/${workspaceId}/members/${memberId}/status`),
  inviteWorkspaceMember: (workspaceId, memberData) => 
    axiosClient.post(`/workspaces/${workspaceId}/members`, memberData),
  getMemberProfile: (workspaceId, memberId) =>
    axiosClient.get(`/workspaces/${workspaceId}/members/${memberId}/profile`),
  createMemberProfile: (workspaceId, memberId, data) =>
    axiosClient.post(
      `/workspaces/${workspaceId}/members/${memberId}/profile`,
      data,
    ),
  updateMemberProfile: (workspaceId, memberId, data) =>
    axiosClient.put(
      `/workspaces/${workspaceId}/members/${memberId}/profile`,
      data,
    ),
  deleteMemberProfile: (workspaceId, memberId) =>
    axiosClient.delete(
      `/workspaces/${workspaceId}/members/${memberId}/profile`,
    ),

  // Review Cycles & Requests for Workspace level
  createReviewCycle: (workspaceId, data) =>
    axiosClient.post(`/workspaces/${workspaceId}/review-cycles`, data),
  getReviewCycles: (id) => axiosClient.get(`/workspaces/${id}/review-cycles`),
  startReviewCycle: (workspaceId, cycleId) =>
    axiosClient.post(
      `/workspaces/${workspaceId}/review-cycles/${cycleId}/start`,
    ),
  completeReviewCycle: (workspaceId, cycleId) =>
    axiosClient.post(
      `/workspaces/${workspaceId}/review-cycles/${cycleId}/complete`,
    ),
  submitEvaluation: (workspaceId, cycleId, data) =>
    axiosClient.post(
      `/workspaces/${workspaceId}/review-cycles/${cycleId}/evaluations`,
      data,
    ),
  getEvaluations: (workspaceId, cycleId) =>
    axiosClient.get(
      `/workspaces/${workspaceId}/review-cycles/${cycleId}/evaluations`,
    ),
  getLeaveRequests: (id) => axiosClient.get(`/workspaces/${id}/leave-requests`),
  getOTRequests: (id) => axiosClient.get(`/workspaces/${id}/ot-requests`),
  createLeaveRequest: (workspaceId, data) =>
    axiosClient.post(`/workspaces/${workspaceId}/leave-requests`, data),
  createOTRequest: (workspaceId, data) =>
    axiosClient.post(`/workspaces/${workspaceId}/ot-requests`, data),
  approveRequest: (type, reqId, data) =>
    axiosClient.put(`/requests/${type.toLowerCase()}/${reqId}/approval`, data),

  createWorkspaceRole: (workspaceId, data) => 
    axiosClient.post(`/workspaces/${workspaceId}/roles`, data),
  updateWorkspaceRole: (workspaceId, roleId, data) => 
    axiosClient.put(`/workspaces/${workspaceId}/roles/${roleId}`, data),
  deleteWorkspaceRole: (workspaceId, roleId) => 
    axiosClient.delete(`/workspaces/${workspaceId}/roles/${roleId}`),
  getWorkspaceRoleDetails: (workspaceId, roleId) => 
    axiosClient.get(`/workspaces/${workspaceId}/roles/${roleId}`),
  updateRolePermissions: (workspaceId, roleId, data) => 
    axiosClient.put(`/workspaces/${workspaceId}/roles/${roleId}/permissions`, data),
  getWorkspacePermissions: (workspaceId) => 
    axiosClient.get(`/workspaces/${workspaceId}/permissions`),
};

export default WorkspaceService;
