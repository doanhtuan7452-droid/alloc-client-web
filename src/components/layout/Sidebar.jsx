import { Home, Layers, Users, Settings, HelpCircle, Plus, MessageSquare } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-neutral-800 h-screen flex flex-col justify-between fixed">
      <div>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Layers className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Thesis OS</h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider">EXECUTIVE MANAGEMENT</p>
          </div>
        </div>

        <nav className="mt-4 px-4 flex flex-col gap-1">
          <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-neutral-800 text-white' : 'text-slate-400 hover:text-white hover:bg-neutral-800'}`}>
            <Home className="w-4 h-4" /> Home
          </NavLink>
          <NavLink to="/workspaces" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-neutral-800 text-white' : 'text-slate-400 hover:text-white hover:bg-neutral-800'}`}>
            <Layers className="w-4 h-4" /> Workspaces
          </NavLink>
          <div className="pl-10 flex flex-col gap-2 mt-1 mb-2">
            <div className="flex items-center gap-2 text-xs text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Workspace A</div>
            <div className="flex items-center gap-2 text-xs text-slate-500"><div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div> Workspace B</div>
          </div>
          <NavLink to="/members" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-neutral-800 text-white' : 'text-slate-400 hover:text-white hover:bg-neutral-800'}`}>
            <Users className="w-4 h-4" /> Members
          </NavLink>
          <NavLink to="/conversations" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-neutral-800 text-white' : 'text-slate-400 hover:text-white hover:bg-neutral-800'}`}>
            <MessageSquare className="w-4 h-4" /> Conversations
          </NavLink>
        </nav>
      </div>

      <div className="p-4 flex flex-col gap-4">
        <button className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-blue-600/20 to-blue-600/40 border border-blue-500/30 text-blue-400 hover:text-blue-300 rounded-md text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Research
        </button>
        <div className="flex flex-col gap-1">
          <button className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white text-sm font-medium w-full text-left">
            <Settings className="w-4 h-4" /> Settings
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white text-sm font-medium w-full text-left">
            <HelpCircle className="w-4 h-4" /> Support
          </button>
        </div>
      </div>
    </aside>
  );
}
