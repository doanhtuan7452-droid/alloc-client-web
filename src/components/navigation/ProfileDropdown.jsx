import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Clock3,
  LogOut,
  MessageSquareText,
  Sparkles,
  User,
} from "lucide-react";
import Avatar from "../ui/Avatar";
import AuthService from "../../services/AuthService";

const menuItems = [
  { label: "Hồ sơ của tôi", to: "/profile", icon: User },
  { label: "Thông báo", to: "/notifications", icon: Bell },
  { label: "Tin nhắn", to: "/conversations", icon: MessageSquareText },
  { label: "Timesheets", to: "/timesheets", icon: Clock3 },
  { label: "AI Insights", to: "/ai-insights", icon: Sparkles },
];

export default function ProfileDropdown() {
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  // Quản lý thông tin User lấy từ API
  const [userData, setUserData] = useState({
    name: "Đang tải...",
    email: "...",
    avatarUrl: "",
  });

  // Tự động kích hoạt gọi API /accounts/me
  useEffect(() => {
    const loadUserProfile = async () => {
      const response = await AuthService.getCurrentUser();
      if (response) {
        const profile = response.profile || {};
        setUserData({
          name: profile.fullName || "User Alloc",
          email: response.email || "nguoidung@gmail.com",
          avatarUrl: profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || "U")}`,
        });
      }
    };

    loadUserProfile();
  }, []);

  const updateMenuPosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 10,
      right: Math.max(12, window.innerWidth - rect.right),
    });
  };

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
      navigate("/login/email", { replace: true });
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
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
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] pl-1 pr-2 py-1.5 text-left transition-all hover:border-white/20 hover:bg-white/[0.08]"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar src={userData.avatarUrl} alt={userData.name} size="w-7 h-7" />
        <div className="hidden sm:flex flex-col leading-tight pr-1 max-w-[120px]">
          <span className="text-xs font-semibold text-content-primary truncate">
            {userData.name}
          </span>
          <span className="text-[11px] text-content-muted truncate">
            {userData.email}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-content-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed z-[100] w-72 overflow-hidden rounded-2xl border border-slate-700/80 bg-[#0b1220] shadow-2xl shadow-black/50 ring-1 ring-white/5"
            style={{
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`,
            }}
            role="menu"
          >
            <div className="border-b border-white/10 px-4 py-4">
              <div className="flex items-center gap-3">
                {/* 🌟 ĐÃ FIX: Thay đổi từ biến chết sang dữ liệu state userData thật */}
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
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-content-secondary transition-colors hover:bg-white/5 hover:text-white"
                  >
                    <Icon className="w-4 h-4 text-content-muted" />
                    <span>{item.label}</span>
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
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}