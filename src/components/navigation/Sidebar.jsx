import { useState, useEffect } from 'react';
import { Plus, Bell, Clock, Sparkles } from 'lucide-react';
import { NavLink, useSearchParams } from 'react-router-dom';
import HomeIcon from '../icons/home-icon';
import Stack3Icon from '../icons/stack-3-icon';
import UsersIcon from '../icons/users-icon';
import MessageCircleIcon from '../icons/message-circle-icon';
import GearIcon from '../icons/gear-icon';
import InfoCircleIcon from '../icons/info-circle-icon';
import { fetchWorkspaces } from '../../services/mockApi';

export default function Sidebar() {
  const [searchParams] = useSearchParams();
  const currentWorkspaceId = searchParams.get("workspaceId");
  const [workspacesList, setWorkspacesList] = useState([]);

  useEffect(() => {
    fetchWorkspaces()
      .then((data) => setWorkspacesList(data))
      .catch((err) => console.error("Error fetching workspaces in sidebar:", err));
  }, []);

  return (
    // Tăng chiều rộng lên w-56 để có không gian rộng rãi hơn
    <aside className="w-56 bg-white/10 backdrop-blur-md border border-white/10 rounded-md h-full flex flex-col justify-between shrink-0 overflow-hidden shadow-xl">

      {/* Vùng Menu điều hướng tinh chỉnh mật độ */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-3">
          <p className="text-xs text-slate-500 font-mono tracking-widest font-bold uppercase">Executive Management</p>
        </div>

        <nav className="px-2 flex flex-col gap-1">
          <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-neutral-800 text-white' : 'text-content-muted hover:text-white hover:bg-neutral-800/50'}`}>
            <HomeIcon size={16} color="currentColor" /> Home
          </NavLink>
          <NavLink to="/workspaces" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-neutral-800 text-white' : 'text-content-muted hover:text-white hover:bg-neutral-800/50'}`}>
            <Stack3Icon size={16} color="currentColor" /> Workspaces
          </NavLink>

          <div className="pl-6 pr-2 flex flex-col gap-1 mt-1 mb-2.5">
            {workspacesList.map((workspace) => {
              // Set fallback check: if no workspaceId in URL, we don't force highlight here; ActiveProjects will handle redirection.
              const isWorkspaceActive = currentWorkspaceId === workspace.workspaceId.toString();
              const indicatorColor = workspace.type === "Company" ? "bg-blue-400" : "bg-purple-400";

              return (
                <NavLink
                  key={workspace.workspaceId}
                  to={`/workspaces?workspaceId=${workspace.workspaceId}`}
                  className={`flex items-center gap-2.5 text-xs px-3 py-1.5 rounded-md transition-all ${isWorkspaceActive
                      ? 'bg-neutral-800 text-white font-medium'
                      : 'text-content-muted hover:text-white hover:bg-neutral-800/30'
                    }`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${indicatorColor} shrink-0`} />
                  <span className="truncate">{workspace.name}</span>
                </NavLink>
              );
            })}
          </div>


          <NavLink to="/conversations" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-neutral-800 text-white' : 'text-content-muted hover:text-white hover:bg-neutral-800/50'}`}>
            <MessageCircleIcon size={16} color="currentColor" /> Conversations
          </NavLink>
          <NavLink to="/timesheets" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-neutral-800 text-white' : 'text-content-muted hover:text-white hover:bg-neutral-800/50'}`}>
            <Clock size={16} color="currentColor" /> Timesheets
          </NavLink>

          <NavLink to="/ai-insights" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-neutral-800 text-white' : 'text-content-muted hover:text-white hover:bg-neutral-800/50'}`}>
            <Sparkles size={16} color="currentColor" /> AI Insights
          </NavLink>
        </nav>
      </div>

      {/* Vùng Footer Actions thu gọn kích thước */}
      <div className="p-3 border-t border-white/10 bg-transparent">
        {/* <button className="flex items-center justify-center gap-2 w-full py-2.5 mb-2.5 bg-gradient-to-r from-blue-600/20 to-blue-600/40 border border-blue-500/30 text-blue-400 hover:text-blue-300 rounded-md text-sm font-medium transition-all">
          <Plus className="w-4 h-4" /> New Research
        </button> */}
        <div className="flex flex-col gap-0.5">
          <button className="flex items-center gap-3 px-3 py-2 rounded-md text-content-muted hover:text-white hover:bg-neutral-800/50 text-sm font-medium w-full text-left transition-all">
            <GearIcon size={16} color="currentColor" /> Settings
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-md text-content-muted hover:text-white hover:bg-neutral-800/50 text-sm font-medium w-full text-left transition-all">
            <InfoCircleIcon size={16} color="currentColor" /> Support
          </button>
        </div>
      </div>

    </aside>
  );
}
