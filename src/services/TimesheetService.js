import axiosClient from "../utils/axiosClient";

const TimesheetService = {
  // 1. Lấy danh sách nhật ký công việc (Timesheets) theo Workspace ID
  getTimesheets: (workspaceId, params = {}) =>
    axiosClient.get(`/timesheets`, { params: { workspaceId, ...params } }),

  // 2. Ghi nhận hoặc cập nhật (Upsert) giờ làm việc
  createTimesheet: (data) => axiosClient.post(`/timesheets`, data),
};

export default TimesheetService;