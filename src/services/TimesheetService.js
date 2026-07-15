import axiosClient from "../utils/axiosClient";

const TimesheetService = {
  // 1. Lấy danh sách nhật ký công việc (Timesheets) theo Workspace ID
  getTimesheets: (workspaceId, params = {}) =>
    axiosClient.get(`/timesheets`, { params: { workspaceId, ...params } }),

  // 2. Ghi nhận hoặc cập nhật (Upsert) giờ làm việc
  createTimesheet: (data) => axiosClient.post(`/timesheets`, data),

  // 3. Lấy danh sách dự án của Workspace để người dùng có thể chọn trước khi chọn Task
  getProjects: (workspaceId) => 
    axiosClient.get(`/workspaces/${workspaceId}/projects`),

  // 4. Lấy danh sách Task tương ứng theo Project ID dựa trên kết quả Test 16
  getTasksByProject: (projectId, params = { page: 1, pageSize: 50 }) =>
    axiosClient.get(`/projects/${projectId}/tasks`, { params }),
};

export default TimesheetService;