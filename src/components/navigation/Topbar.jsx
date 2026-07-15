import { useLocation, Link } from "react-router-dom";
import { Search } from "lucide-react";
import logoAlloc from "../../assets/images/logo_alloc_267x329.png";
import FilledBellIcon from "../icons/filled-bell-icon";
import ProfileDropdown from "./ProfileDropdown";

export default function Topbar({ searchQuery, setSearchQuery }) {
  const location = useLocation();

  const isWorkspacesList =
    location.pathname === "/workspaces" || location.pathname === "/workspaces/";
  const isWorkspaceBoard =
    location.pathname === "/workspaces/board" ||
    location.pathname === "/workspaces/board/";

  const showSearchBar = isWorkspacesList || isWorkspaceBoard;
  const placeholderText = isWorkspacesList
    ? "Search projects..."
    : "Tìm mã hoặc tên công việc...";

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
      <div className="flex items-center gap-4">
        <Link
          to="/notifications"
          className="relative text-content-secondary hover:text-content-primary transition-colors flex items-center justify-center"
        >
          <FilledBellIcon size={16} color="currentColor" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full border border-header"></span>
        </Link>
        <ProfileDropdown />
      </div>
    </header>
  );
}
