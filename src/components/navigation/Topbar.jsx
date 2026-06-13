import { NavLink, useLocation } from 'react-router-dom';
import logoAlloc from '../../assets/images/logo_alloc_267x329.png';
import FilledBellIcon from '../icons/filled-bell-icon';

export default function Topbar() {
  const location = useLocation();
  const showWorkspaceTabs = location.pathname.startsWith('/workspaces');

  return (
    // Đồng bộ hiệu ứng glassmorphism với Outlet
    <header className="h-12 shrink-0 border-b border-white/10 flex items-center justify-between px-4 bg-white/10 backdrop-blur-md">

      <div className="flex items-center gap-8">
        {/* Logo kích thước được tăng lên */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-md overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 shadow-lg shadow-blue-500/5">
            <img src={logoAlloc} alt="Alloc Logo" className="w-full h-full object-contain p-0.5" />
          </div>
          <div>
            <h1 className="text-content-primary font-bold text-base leading-tight tracking-wide">Alloc</h1>
          </div>
        </div>

        {/* Đồng bộ kích thước text thành text-sm và khoảng cách tab xuống gap-5 */}
        {showWorkspaceTabs && (
          <div className="flex items-center gap-5 text-sm font-medium text-content-secondary">
            <NavLink to="/workspaces/board" className={({ isActive }) => isActive ? "text-content-primary border-b-2 border-content-primary pb-0.5" : "hover:text-content-primary transition-colors"}>Board</NavLink>
            <NavLink to="/workspaces/gantt" className={({ isActive }) => isActive ? "text-content-primary border-b-2 border-content-primary pb-0.5" : "hover:text-content-primary transition-colors"}>Gantt</NavLink>
            <NavLink to="/workspaces/calendar" className={({ isActive }) => isActive ? "text-content-primary border-b-2 border-content-primary pb-0.5" : "hover:text-content-primary transition-colors"}>Calendar</NavLink>
            <NavLink to="/workspaces/list" className={({ isActive }) => isActive ? "text-content-primary border-b-2 border-content-primary pb-0.5" : "hover:text-content-primary transition-colors"}>List</NavLink>
            <NavLink to="/workspaces/finance" className={({ isActive }) => isActive ? "text-white border-b-2 border-content-primary pb-0.5" : "hover:text-content-primary transition-colors"}>Finance</NavLink>
          </div>
        )}
      </div>

      {/* Khu vực góc phải tinh chỉnh lại kích thước tỉ lệ */}
      <div className="flex items-center gap-4">
        <button className="relative text-content-secondary hover:text-content-primary transition-colors flex items-center justify-center">
          <FilledBellIcon size={16} color="currentColor" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-cyan-400 rounded-full border border-header"></span>
        </button>
        <div className="w-7 h-7 rounded-md bg-slate-700 overflow-hidden border border-neutral-700 hover:border-white transition-colors cursor-pointer">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User Avatar" className="w-full h-full object-cover" />
        </div>
      </div>

    </header>
  );
}
