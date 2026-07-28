import axiosClient from "../utils/axiosClient";

const mapNotification = (notif) => {
  if (!notif) return notif;
  return {
    notificationId: notif.notificationID !== undefined ? notif.notificationID : notif.notificationId,
    type: notif.notificationType || notif.type,
    title: notif.title,
    content: notif.message || notif.content,
    isRead: notif.isRead,
    createdAt: notif.createdAt,
    referenceId: notif.referenceID !== undefined ? notif.referenceID : notif.referenceId,
    referenceType: notif.referenceType,
    referenceData: notif.referenceData
  };
};

const NotificationService = {
  getNotifications: async (page = 1, pageSize = 50) => {
    try {
      const response = await axiosClient.get("/notifications", { 
        params: { page, pageSize } 
      });
      if (response && response.items) {
        return {
          ...response,
          items: response.items.map(mapNotification)
        };
      }
      if (Array.isArray(response)) {
        return response.map(mapNotification);
      }
      return response;
    } catch (error) {
      console.error("Lỗi lấy danh sách thông báo:", error);
      return [];
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await axiosClient.get("/notifications/unread-count");
      return response; // Trả về object { unreadCount: X }
    } catch (error) {
      console.error("Lỗi lấy số lượng thông báo chưa đọc:", error);
      return { unreadCount: 0 };
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