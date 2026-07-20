import axiosClient from "../utils/axiosClient";

const ReviewCycleService = {
  // Lấy tất cả chu kỳ đánh giá trong Workspace
  // GET /api/v1/workspaces/{workspaceId}/review-cycles
  getReviewCycles: (workspaceId) =>
    axiosClient.get(`/workspaces/${workspaceId}/review-cycles`),

  // Tạo chu kỳ đánh giá mới (Draft)
  // POST /api/v1/workspaces/{workspaceId}/review-cycles
  createReviewCycle: (workspaceId, data) =>
    axiosClient.post(`/workspaces/${workspaceId}/review-cycles`, data),

  // Bắt đầu chu kỳ đánh giá (Draft -> Active)
  // POST /api/v1/workspaces/{workspaceId}/review-cycles/{cycleId}/start
  startReviewCycle: (workspaceId, cycleId) =>
    axiosClient.post(`/workspaces/${workspaceId}/review-cycles/${cycleId}/start`),

  // Hoàn thành chu kỳ đánh giá (Active -> Completed) và kích hoạt tính lại điểm
  // POST /api/v1/workspaces/{workspaceId}/review-cycles/{cycleId}/complete
  completeReviewCycle: (workspaceId, cycleId) =>
    axiosClient.post(`/workspaces/${workspaceId}/review-cycles/${cycleId}/complete`),

  // Nộp đánh giá cho một thành viên trong chu kỳ
  // POST /api/v1/workspaces/{workspaceId}/review-cycles/{cycleId}/evaluations
  submitEvaluation: (workspaceId, cycleId, data) =>
    axiosClient.post(`/workspaces/${workspaceId}/review-cycles/${cycleId}/evaluations`, data),
};

export default ReviewCycleService;