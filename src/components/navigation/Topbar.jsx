import { useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Search, Sparkles } from "lucide-react";
import logoAlloc from "../../assets/images/logo_alloc_267x329.png";
import FilledBellIcon from "../icons/filled-bell-icon";
import NotificationsPopup from "./NotificationsPopup";
import NotificationService from "../../services/NotificationService";
import { useLanguage } from "../../contexts/LanguageContext";

export default function Topbar({ searchQuery, setSearchQuery, isAiChatOpen, onToggleAiChat }) {
  const { t } = useLanguage();
  const location = useLocation();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const bellButtonRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const countRes = await NotificationService.getUnreadCount();
      const count = typeof countRes === "number" 
        ? countRes 
        : (countRes?.unreadCount !== undefined ? countRes.unreadCount : (countRes?.count || 0));
      setUnreadCount(count);
    } catch (error) {
      console.error(t("notifications.fetchCountError"), error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const handleNewNotification = () => {
      fetchUnreadCount();
    };

    window.addEventListener("new-notification", handleNewNotification);
    return () => {
      window.removeEventListener("new-notification", handleNewNotification);
    };
  }, []);
 
  const isWorkspacesList =
    location.pathname === "/workspaces" || location.pathname === "/workspaces/";
  const isWorkspaceBoard =
    location.pathname === "/workspaces/board" ||
    location.pathname === "/workspaces/board/";
 
  const showSearchBar = isWorkspacesList || isWorkspaceBoard;
  const placeholderText = isWorkspacesList
    ? t("topbar.searchProjects")
    : t("topbar.searchTasks");

  return (
    // Đồng bộ hiệu ứng glassmorphism với Outlet
    <header className="h-12 shrink-0 border-b border-white/10 flex items-center justify-between px-4 bg-white/10 backdrop-blur-md">
      <div className="flex items-center gap-8">
        {/* Logo kích thước được tăng lên */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-md overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 shadow-lg shadow-blue-500/5">
            <img
              src={logoAlloc}
              alt="Alloc Logo"
              className="w-full h-full object-contain p-0.5"
            />
          </div>
          <div>
            <h1 className="text-content-primary font-bold text-base leading-tight tracking-wide">
              Alloc
            </h1>
          </div>
        </div>
      </div>

      {/* Thanh tìm kiếm chuyển từ các trang con lên Topbar */}
      {showSearchBar && (
        <div className="relative w-64 hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
          <input
            type="text"
            placeholder={placeholderText}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/10 rounded-md pl-9 pr-4 py-2 text-sm text-content-primary placeholder-slate-500 focus:outline-none focus:border-white/25 transition-colors"
          />
        </div>
      )}

      {/* Khu vực góc phải tinh chỉnh lại kích thước tỉ lệ */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleAiChat}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 ${
            isAiChatOpen
              ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              : "bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/30 text-purple-300 hover:text-white"
          }`}
          title={t("topbar.toggleAi")}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
          <span className="hidden sm:inline">{t("topbar.allocAi")}</span>
        </button>

        <button
          ref={bellButtonRef}
          onClick={() => setIsNotificationOpen(!isNotificationOpen)}
          className="relative text-content-secondary hover:text-content-primary transition-colors flex items-center justify-center p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
          title={t("topbar.notifications")}
        >
          <span className={`flex items-center justify-center ${unreadCount > 0 ? "animate-bellShake" : ""}`}>
            <FilledBellIcon size={16} color="currentColor" />
          </span>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-extrabold text-white bg-rose-500 rounded-full border border-zinc-950 shadow-md">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        <NotificationsPopup
          isOpen={isNotificationOpen}
          onClose={() => setIsNotificationOpen(false)}
          buttonRef={bellButtonRef}
          onUnreadCountChange={setUnreadCount}
        />
      </div>
    </header>
  );
}
