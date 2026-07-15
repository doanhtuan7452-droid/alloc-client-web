import axiosClient from "../utils/axiosClient";

const AIService = {
  askAI: (data) => axiosClient.post(`/ai/ask`, data),
  getProjectInsights: (projectId) =>
    axiosClient.get(`/projects/${projectId}/ai-insights`),
};

export default AIService;
