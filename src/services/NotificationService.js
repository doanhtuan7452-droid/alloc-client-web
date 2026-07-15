import axiosClient from "../utils/axiosClient";

const NotificationService = {
  getNotifications: async (pageNumber = 1, pageSize = 50) => {
    try {
      const response = await axiosClient.get("/notifications", { 
        params: { pageNumber, pageSize } 
      });
      return response;
    } catch (error) {
      console.error("Lỗi lấy danh sách thông báo:", error);
      return [];
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await axiosClient.get("/notifications/unread-count");
      return response; // Thường trả về số lượng hoặc object { count: X }
    } catch (error) {
      console.error("Lỗi lấy số lượng thông báo chưa đọc:", error);
      return 0;
    }
  },

  markRead: async (id) => {
    try {
      return await axiosClient.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error(`Lỗi đánh dấu đã đọc thông báo ${id}:`, error);
      return null;
    }
  },

  markAllRead: async () => {
    try {
      return await axiosClient.put("/notifications/read-all");
    } catch (error) {
      console.error("Lỗi đánh dấu đọc tất cả thông báo:", error);
      return null;
    }
  },

  registerDeviceToken: async (data) => {
    try {
      return await axiosClient.post("/notifications/device-tokens", data);
    } catch (error) {
      console.error("Lỗi đăng ký token thiết bị:", error);
      return null;
    }
  },

  revokeDeviceToken: async (data) => {
    try {
      return await axiosClient.delete("/notifications/device-tokens", { data });
    } catch (error) {
      console.error("Lỗi hủy token thiết bị:", error);
      return null;
    }
  },
};

export default NotificationService;