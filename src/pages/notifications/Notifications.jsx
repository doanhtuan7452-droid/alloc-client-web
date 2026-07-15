import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCircle2,
  MessageSquare,
  AlertTriangle,
  Calendar,
  Clock,
  RefreshCw,
} from "lucide-react";
import NotificationService from "../../services/NotificationService";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Khởi chạy lấy dữ liệu ban đầu
  useEffect(() => {
    loadNotificationsData();
  }, []);

  const loadNotificationsData = async () => {
    setIsLoading(true);
    try {
      // 1. Gọi API lấy danh sách thông báo
      const listRes = await NotificationService.getNotifications(1, 50);
      // Backend có thể trả trực tiếp mảng hoặc trả về dạng { items: [...] }
      const items = Array.isArray(listRes) ? listRes : (listRes?.items || []);
      setNotifications(items);

      // 2. Gọi API lấy số lượng chưa đọc
      const countRes = await NotificationService.getUnreadCount();
      const count = typeof countRes === "number" ? countRes : (countRes?.count || 0);
      setUnreadCount(count);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu thông báo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý đọc một thông báo cụ thể
  const handleMarkAsRead = async (id, isAlreadyRead) => {
    if (isAlreadyRead) return; // Nếu đã đọc rồi thì không gọi API nữa

    try {
      await NotificationService.markRead(id);
      
      // Cập nhật State cục bộ ngay lập tức để UI mượt mà
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notificationId === id ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Không thể cập nhật trạng thái đã đọc:", error);
    }
  };

  // Xử lý đọc tất cả thông báo cùng lúc
  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    try {
      await NotificationService.markAllRead();
      
      // Cập nhật tất cả thành đã đọc trên giao diện
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Không thể đánh dấu đã đọc tất cả:", error);
    }
  };

  // Hàm chọn Icon tương ứng với loại thông báo sinh động
  const getIconForType = (type) => {
    switch (type) {
      case "Message":
      case "Chat":
        return <MessageSquare className="w-5 h-5 text-blue-400" />;
      case "Warning":
      case "Risk":
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case "Calendar":
      case "Meeting":
        return <Calendar className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-emerald-400" />;
    }
  };

  // Định dạng thời gian hiển thị gọn gàng
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " - " + date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  return (
    <div className="flex-1 overflow-y-auto h-full p-4 md:p-6 custom-scrollbar">
      <div className="max-w-4xl mx-auto pb-10">
        
        {/* Header điều khiển */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-5">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-content-primary">Thông Báo</h1>
              {unreadCount > 0 && (
                <span className="bg-blue-500/10 text-blue-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-500/20">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>
            <p className="text-content-muted text-sm">
              Cập nhật các hoạt động mới nhất liên quan đến dự án, cuộc hội thoại và hệ thống.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={loadNotificationsData}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg bg-white/[0.02] text-sm text-content-secondary hover:bg-white/5 transition-all"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || isLoading}
              className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" /> Đánh dấu đã đọc tất cả
            </button>
          </div>
        </div>

        {/* Nội dung danh sách */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-content-muted">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm">Đang tải danh sách thông báo...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/[0.01]">
            <Bell className="w-12 h-12 text-content-muted mb-3 opacity-40" />
            <p className="text-content-secondary font-medium">Hộp thư thông báo trống</p>
            <p className="text-xs text-content-muted mt-1">Bạn sẽ nhìn thấy thông báo khi hệ thống có cập nhật mới.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] divide-y divide-white/5 shadow-xl">
            {notifications.map((notif) => (
              <div
                key={notif.notificationId}
                onClick={() => handleMarkAsRead(notif.notificationId, notif.isRead)}
                className={`flex gap-4 p-5 hover:bg-white/[0.04] transition-colors cursor-pointer relative group ${
                  notif.isRead ? "opacity-60" : "bg-blue-900/[0.08]"
                }`}
              >
                {/* Icon Loại thông báo */}
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {getIconForType(notif.type)}
                </div>

                {/* Chi tiết nội dung */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h4
                      className={`text-sm truncate ${
                        notif.isRead ? "text-zinc-300 font-medium" : "text-white font-bold"
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[11px] font-mono text-zinc-500 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${notif.isRead ? "text-zinc-500" : "text-zinc-300"}`}>
                    {notif.content}
                  </p>
                </div>

                {/* Chấm xanh trạng thái chưa đọc */}
                {!notif.isRead && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}