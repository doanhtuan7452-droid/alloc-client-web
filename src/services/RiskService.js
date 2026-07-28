import axiosClient from "../utils/axiosClient";

const RiskService = {
  getProjectRisks: (projectId) =>
    axiosClient.get(`/projects/${projectId}/risks`),
  createRisk: (projectId, data) =>
    axiosClient.post(`/projects/${projectId}/risks`, data),
  createMitigation: (riskId, data) =>
    axiosClient.post(`/risks/${riskId}/mitigations`, data),
  getLifecycle: (riskId) => axiosClient.get(`/risks/${riskId}/lifecycle`),
  updateRisk: (riskId, data) => axiosClient.put(`/risks/${riskId}`, data),
};

export default RiskService;
