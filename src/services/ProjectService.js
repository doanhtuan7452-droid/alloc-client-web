import axiosClient from "../utils/axiosClient";

const ProjectService = {
  getProjects: (workspaceId) =>
    axiosClient.get(`/workspaces/${workspaceId}/projects`),
  getProjectById: (id) => axiosClient.get(`/projects/${id}`),
  updateProject: (id, data) => axiosClient.put(`/projects/${id}`, data),
  deleteProject: (id) => axiosClient.delete(`/projects/${id}`),
  getProjectProgress: (id) => axiosClient.get(`/projects/${id}/progress`),
  getProjectTasks: (id, params = {}) =>
    axiosClient.get(`/projects/${id}/tasks`, { params }),
  createProjectTask: (projectId, data) =>
    axiosClient.post(`/projects/${projectId}/tasks`, data),
  updateTask: (taskId, data) => axiosClient.put(`/tasks/${taskId}`, data),
  deleteTask: (taskId) => axiosClient.delete(`/tasks/${taskId}`),
  getExpenses: (id, params = {}) =>
    axiosClient.get(`/projects/${id}/expenses`, { params }),
  createExpense: (projectId, data) =>
    axiosClient.post(`/projects/${projectId}/expenses`, data),
  getRevenues: (id, params = {}) =>
    axiosClient.get(`/projects/${id}/revenues`, { params }),
  createRevenue: (projectId, data) =>
    axiosClient.post(`/projects/${projectId}/revenues`, data),
  getRisks: (id) => axiosClient.get(`/projects/${id}/risks`),
  createRisk: (projectId, data) =>
    axiosClient.post(`/projects/${projectId}/risks`, data),
  createRiskMitigation: (riskId, data) =>
  axiosClient.post(`/risks/${riskId}/mitigations`, data),

  getRiskLifecycle: (riskId) =>
    axiosClient.get(`/risks/${riskId}/lifecycle`),
  updateRisk: (riskId, data) =>
    axiosClient.put(`/risks/${riskId}`, data),
  getFinancialSummary: async (projectId) => {
    const [expensesRes, revenuesRes] = await Promise.all([
      axiosClient.get(`/projects/${projectId}/expenses`, {
        params: { page: 1, pageSize: 100 }, 
      }),
      axiosClient.get(`/projects/${projectId}/revenues`, {
        params: { page: 1, pageSize: 100 }, 
      }),
    ]);

    const expenses = expensesRes.items || [];
    const revenues = revenuesRes.items || [];
    
    return {
      totalSpent: expenses.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      ),
      totalRevenue: revenues.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      ),
    };
  },
  
  createProject: (workspaceId, data) =>
    axiosClient.post(`/workspaces/${workspaceId}/projects`, data),
};

export default ProjectService;
