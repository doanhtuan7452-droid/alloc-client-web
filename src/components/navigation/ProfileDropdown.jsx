import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Clock3,
  LogOut,
  MessageSquareText,
  User,
  Settings,
  HelpCircle,
  ChevronLeft,
  Check,
} from "lucide-react";
import Avatar from "../ui/Avatar";
import AuthService from "../../services/AuthService";
import { useUser } from "../../contexts/UserContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useLanguage } from "../../contexts/LanguageContext";

const menuItems = [
  { key: "myProfile", labelKey: "profileDropdown.myProfile", to: "/profile", icon: User },
  { key: "timesheets", labelKey: "sidebar.timesheets", to: "/timesheets", icon: Clock3 },
  { key: "settings", labelKey: "profileDropdown.settings", icon: Settings, isSettingsToggle: true },
  { key: "support", labelKey: "profileDropdown.support", icon: HelpCircle, isPlaceholder: true },
];

export default function ProfileDropdown({ isSidebarCollapsed = false }) {
  const { toast } = useNotification();
  const { t, locale, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("main"); // "main" or "settings"
  const [menuPosition, setMenuPosition] = useState({ bottom: 0, left: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  
  const { currentUser, setCurrentUser, setPermissions, setCurrentWorkspaceRole } = useUser();

  const profile = currentUser?.profile || {};
  const userData = {
    name: profile.fullName || "User Alloc",
    email: currentUser?.email || "nguoidung@gmail.com",
    avatarUrl: profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || "U")}`,
  };

  const updateMenuPosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPosition({
      bottom: window.innerHeight - rect.top + 10,
      left: rect.left,
    });
  };

  // Reset view to main when closed
  useEffect(() => {
    if (!open) {
      setView("main");
    }
  }, [open]);

  // Click bên ngoài hoặc nhấn ESC để đóng dropdown
  useEffect(() => {
    const handlePointerDown = (event) => {
      const clickedInsideTrigger = dropdownRef.current && dropdownRef.current.contains(event.target);
      const clickedInsidePanel = panelRef.current && panelRef.current.contains(event.target);

      if (!clickedInsideTrigger && !clickedInsidePanel) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Theo dõi vị trí khi cuộn hoặc resize màn hình
  useEffect(() => {
    if (!open) return undefined;

    updateMenuPosition();
    const handleReposition = () => updateMenuPosition();

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await AuthService.logoutLocal();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // 1. Reset sạch sẽ Global State của user cũ để bảo mật
      if (setCurrentUser) setCurrentUser(null);
      if (setPermissions) setPermissions([]);
      if (setCurrentWorkspaceRole) setCurrentWorkspaceRole(null);

      // 2. Điều hướng về trang đăng nhập
      navigate("/login", { replace: true });
    }
  };

  const btnClass = isSidebarCollapsed
    ? "flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] p-1.5 transition-all hover:border-white/20 hover:bg-white/[0.08] cursor-pointer"
    : "flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] p-2 text-left transition-all hover:border-white/20 hover:bg-white/[0.08] w-full cursor-pointer";

  return (
    <div ref={dropdownRef} className={isSidebarCollapsed ? "relative" : "relative w-full"}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() =>
          setOpen((value) => {
            const nextOpen = !value;
            if (nextOpen) {
              requestAnimationFrame(updateMenuPosition);
            }
            return nextOpen;
          })
        }
        className={btnClass}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar src={userData.avatarUrl} alt={userData.name} size="w-7 h-7" />
        {!isSidebarCollapsed && (
          <>
            <div className="flex flex-col leading-tight pr-1 max-w-[120px] flex-1 min-w-0">
              <span className="text-xs font-semibold text-content-primary truncate">
                {userData.name}
              </span>
              <span className="text-[11px] text-content-muted truncate">
                {userData.email}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-content-muted transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
          </>
        )}
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[100] w-72 overflow-hidden rounded-2xl border border-slate-700/80 bg-neutral-900/95 shadow-2xl shadow-black/50 ring-1 ring-white/5 transition-all duration-300"
            style={{
              bottom: `${menuPosition.bottom}px`,
              left: `${menuPosition.left}px`,
            }}
            role="menu"
          >
            {view === "main" ? (
              <>
                <div className="border-b border-white/10 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={userData.avatarUrl} alt={userData.name} size="w-11 h-11" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-content-primary">
                        {userData.name}
                      </p>
                      <p className="truncate text-xs text-content-muted">
                        {userData.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    if (item.isSettingsToggle) {
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setView("settings")}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-content-secondary transition-colors hover:bg-white/5 hover:text-white text-left cursor-pointer"
                        >
                          <Icon className="w-4 h-4 text-content-muted" />
                          <span>{t(item.labelKey)}</span>
                        </button>
                      );
                    }
                    if (item.isPlaceholder) {
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            setOpen(false);
                            toast.info(t(item.labelKey + "Toast"));
                          }}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-content-secondary transition-colors hover:bg-white/5 hover:text-white text-left cursor-pointer"
                        >
                          <Icon className="w-4 h-4 text-content-muted" />
                          <span>{t(item.labelKey)}</span>
                        </button>
                      );
                    }
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-content-secondary transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <Icon className="w-4 h-4 text-content-muted" />
                        <span>{t(item.labelKey)}</span>
                      </Link>
                    );
                  })}
                </div>

                <div className="border-t border-white/10 px-2 py-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-300 transition-colors hover:bg-rose-500/10 hover:text-rose-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("profileDropdown.logout")}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col animate-slide-in">
                {/* Header settings */}
                <div className="flex items-center gap-2 border-b border-white/10 px-3 py-3.5 bg-white/[0.01]">
                  <button
                    onClick={() => setView("main")}
                    className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
                    title={t("settings.backBtn")}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold text-content-primary">{t("settings.header")}</span>
                </div>

                {/* Body settings */}
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">{t("settings.languageLabel")}</span>
                    
                    <div className="flex flex-col gap-1.5 mt-1">
                      <button
                        onClick={() => changeLanguage("en")}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          locale === "en"
                            ? "bg-blue-600/10 border-blue-500/30 text-blue-400 font-semibold"
                            : "bg-white/[0.02] border-white/5 text-slate-350 hover:bg-white/5"
                        }`}
                      >
                        <span>{t("settings.enOption")}</span>
                        {locale === "en" && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </button>

                      <button
                        onClick={() => changeLanguage("vi")}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          locale === "vi"
                            ? "bg-blue-600/10 border-blue-500/30 text-blue-400 font-semibold"
                            : "bg-white/[0.02] border-white/5 text-slate-350 hover:bg-white/5"
                        }`}
                      >
                        <span>{t("settings.viOption")}</span>
                        {locale === "vi" && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Back button at footer */}
                <div className="border-t border-white/10 px-4 py-3 bg-white/[0.01] text-right">
                  <button
                    onClick={() => setView("main")}
                    className="text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {t("settings.backBtn")}
                  </button>
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}