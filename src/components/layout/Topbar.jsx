import { NavLink } from 'react-router-dom';

export default function Topbar() {
  return (
    <header className="h-16 border-b border-[#1f2937] flex items-center justify-between px-8 bg-[#0b0f19]">
      <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
        <NavLink to="/workspaces/board" className={({isActive}) => isActive ? "text-white border-b-2 border-white pb-1" : "hover:text-white"}>Board</NavLink>
        <NavLink to="/workspaces/gantt" className={({isActive}) => isActive ? "text-white border-b-2 border-white pb-1" : "hover:text-white"}>Gantt</NavLink>
        <NavLink to="/workspaces/calendar" className={({isActive}) => isActive ? "text-white border-b-2 border-white pb-1" : "hover:text-white"}>Calendar</NavLink>
        <NavLink to="/workspaces/list" className={({isActive}) => isActive ? "text-white border-b-2 border-white pb-1" : "hover:text-white"}>List</NavLink>
        <NavLink to="/workspaces/finance" className={({isActive}) => isActive ? "text-white border-b-2 border-white pb-1" : "hover:text-white"}>Finance</NavLink>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative text-slate-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          <span className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border-2 border-[#1f2937]">
          <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User Avatar" className="w-full h-full object-cover" />
        </div>
      </div>
    </header>
  );
}
