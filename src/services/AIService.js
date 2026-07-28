import axiosClient from "../utils/axiosClient";

const AIService = {
  askAI: async (data) => {
    const { projectId, analysisType, taskId } = data;
    
    if (analysisType === "Risk Warning") {
      return axiosClient.post(`/projects/${projectId}/ai-insights/risk-assessment`);
    } else if (analysisType === "Resource Optimization") {
      const tId = taskId || 1; // Mặc định là 1 nếu không có taskId
      return axiosClient.post(`/projects/${projectId}/ai-insights/allocation-assessment`, {
        taskId: tId
      });
    } else if (analysisType === "Budget Forecast") {
      // Fallback về risk-assessment do server chưa triển khai Budget Forecast riêng
      return axiosClient.post(`/projects/${projectId}/ai-insights/risk-assessment`);
    }
    
    // Fallback mặc định
    return axiosClient.post(`/projects/${projectId}/ai-insights/risk-assessment`);
  },

  askAIAllocation: async ({ projectId, taskId, workspaceMemberIds }) => {
    return axiosClient.post(`/projects/${projectId}/ai-insights/allocation-assessment`, {
      taskId,
      workspaceMemberIds
    });
  },
};

export default AIService;
