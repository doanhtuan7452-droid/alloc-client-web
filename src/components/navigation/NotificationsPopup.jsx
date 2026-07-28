import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  CheckCircle2,
  Clock,
  RefreshCw,
  MessageSquare,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import NotificationService from "../../services/NotificationService";
import { useLanguage } from "../../contexts/LanguageContext";
import NotificationListSkeleton from "./NotificationListSkeleton";

export default function NotificationsPopup({ isOpen, onClose, buttonRef, onUnreadCountChange }) {
  const { t, locale } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMoreLoading, setIsMoreLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0, left: "auto", width: 380 });
  const panelRef = useRef(null);

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth < 640;
    if (isMobile) {
      setMenuPosition({
        top: rect.bottom + 10,
        left: 12,
        right: 12,
        width: window.innerWidth - 24,
      });
    } else {
      setMenuPosition({
        top: rect.bottom + 10,
        right: Math.max(12, window.innerWidth - rect.right),
        left: "auto",
        width: 380,
      });
    }
  };

  // Tải dữ liệu thông báo trang đầu
  const loadData = async () => {
    setIsLoading(true);
    try {
      const listRes = await NotificationService.getNotifications(1, 10);
      const items = Array.isArray(listRes) ? listRes : (listRes?.items || []);
      const totalP = listRes?.totalPages || 1;
      
      setNotifications(items);
      setTotalPages(totalP);
      setPage(1);

      const countRes = await NotificationService.getUnreadCount();
      const count = typeof countRes === "number" 
        ? countRes 
        : (countRes?.unreadCount !== undefined ? countRes.unreadCount : (countRes?.count || 0));
      if (onUnreadCountChange) {
        onUnreadCountChange(count);
      }
    } catch (error) {
      console.error(t("notifications.fetchPopupError"), error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tải thêm các trang tiếp theo
  const loadMoreData = async () => {
    if (page >= totalPages || isMoreLoading) return;
    setIsMoreLoading(true);
    try {
      const nextPage = page + 1;
      const listRes = await NotificationService.getNotifications(nextPage, 10);
      const items = Array.isArray(listRes) ? listRes : (listRes?.items || []);
      
      setNotifications((prev) => [...prev, ...items]);
      setPage(nextPage);
    } catch (error) {
      console.error(t("notifications.fetchMoreError"), error);
    } finally {
      setIsMoreLoading(false);
    }
  };

  // Load data mỗi khi mở popup hoặc có thông báo mới
  useEffect(() => {
    if (isOpen) {
      loadData();
      updatePosition();

      const handleNewNotification = () => {
        loadData();
      };

      window.addEventListener("new-notification", handleNewNotification);
      return () => {
        window.removeEventListener("new-notification", handleNewNotification);
      };
    }
  }, [isOpen]);

  // Click bên ngoài hoặc ESC để đóng
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      const clickedInsideTrigger = buttonRef.current && buttonRef.current.contains(event.target);
      const clickedInsidePanel = panelRef.current && panelRef.current.contains(event.target);

      if (!clickedInsideTrigger && !clickedInsidePanel) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id, isAlreadyRead) => {
    if (isAlreadyRead) return;
    try {
      await NotificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
      );
      if (onUnreadCountChange) {
        onUnreadCountChange((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error(t("notifications.markAsReadError"), error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
    } catch (error) {
      console.error(t("notifications.markAllReadError"), error);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case "Message":
      case "Chat":
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case "Warning":
      case "Risk":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "Calendar":
      case "Meeting":
        return <Calendar className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-emerald-400" />;
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const dateLocale = locale === "vi" ? "vi-VN" : "en-US";
    return (
      date.toLocaleTimeString(dateLocale, { hour: "2-digit", minute: "2-digit" }) +
      " - " +
      date.toLocaleDateString(dateLocale, { day: "2-digit", month: "2-digit" })
    );
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={panelRef}
      className="fixed z-[100] overflow-hidden rounded-2xl border border-slate-700/80 bg-white/5 backdrop-blur-md shadow-2xl shadow-black/50 ring-1 ring-white/5 flex flex-col"
      style={{
        top: `${menuPosition.top}px`,
        right: menuPosition.right === "auto" ? "auto" : `${menuPosition.right}px`,
        left: menuPosition.left === "auto" ? "auto" : `${menuPosition.left}px`,
        width: `${menuPosition.width}px`,
        maxHeight: "500px",
      }}
    >
      {/* Header popup */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-content-primary">{t("notifications.title")}</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-content-secondary hover:text-white hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
            title={t("notifications.refresh")}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleMarkAllAsRead}
            disabled={isLoading || notifications.filter(n => !n.isRead).length === 0}
            className="p-1.5 rounded-lg text-content-secondary hover:text-white hover:bg-white/5 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title={t("notifications.markAllRead")}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
 
      {/* Danh sách thông báo */}
      <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[360px] divide-y divide-white/5">
        {isLoading && notifications.length === 0 ? (
          <NotificationListSkeleton count={4} />
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <Bell className="w-8 h-8 text-content-muted mb-2 opacity-40" />
            <p className="text-xs text-content-secondary font-medium">{t("notifications.empty")}</p>
            <p className="text-[10px] text-content-muted mt-0.5">{t("notifications.emptySubText")}</p>
          </div>
        ) : (
          <>
            {notifications.map((notif) => (
              <div
                key={notif.notificationId}
                onClick={() => handleMarkAsRead(notif.notificationId, notif.isRead)}
                className={`flex gap-3 p-3.5 hover:bg-white/[0.04] transition-colors cursor-pointer relative group ${
                  notif.isRead ? "opacity-60" : "bg-blue-900/[0.08]"
                }`}
              >
                {/* Icon */}
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  {getIconForType(notif.type)}
                </div>
 
                {/* Chi tiết */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-0.5">
                    <h4
                      className={`text-xs truncate ${
                        notif.isRead ? "text-zinc-300 font-medium" : "text-white font-bold"
                      }`}
                    >
                      {notif.title}
                    </h4>
                    <span className="text-[9px] text-zinc-500 shrink-0 flex items-center gap-0.5 font-mono">
                      <Clock className="w-2.5 h-2.5" />
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  <p className={`text-[11px] leading-relaxed line-clamp-2 ${notif.isRead ? "text-zinc-500" : "text-zinc-300"}`}>
                    {notif.content}
                  </p>
                </div>
 
                {/* Chấm xanh chưa đọc */}
                {!notif.isRead && (
                  <div className="absolute left-1.5 top-1/2 -translate-y-1/2 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,1)]"></span>
                  </div>
                )}
              </div>
            ))}
 
            {/* Nút Tái thêm */}
            {!isLoading && page < totalPages && (
              <div className="p-3 text-center bg-white/[0.01]">
                <button
                  onClick={loadMoreData}
                  disabled={isMoreLoading}
                  className="px-4 py-2 w-full text-xs font-semibold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  {isMoreLoading ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" />
                      {t("notifications.loadingMore")}
                    </span>
                  ) : (
                    t("notifications.loadMore")
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
 
      {/* Footer popup */}
      <div className="border-t border-white/10 p-2 bg-white/[0.01] flex items-center justify-between px-4 py-2.5 shrink-0">
        <span className="text-[10px] text-content-muted">
          {notifications.length > 0 ? t("notifications.showingCount").replace("{count}", notifications.length) : ""}
        </span>
        <button
          onClick={onClose}
          className="text-[10px] font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {t("common.close")}
        </button>
      </div>
    </div >        ,
    document.body
  );
}
