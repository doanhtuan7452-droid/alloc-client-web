import { useState } from "react";
import { Home, Layers, Users, Settings, HelpCircle, Plus } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#111827] border-r border-[#1f2937] h-screen flex flex-col justify-between fixed">
      <div>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Layers className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              Thesis OS
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider">
              EXECUTIVE MANAGEMENT
            </p>
          </div>
        </div>

        <nav className="mt-4 px-4 flex flex-col gap-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-[#1f2937] text-white" : "text-slate-400 hover:text-white hover:bg-[#1f2937]"}`
            }
          >
            <Home className="w-4 h-4" /> Home
          </NavLink>
          <NavLink
            to="/workspaces"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-[#1f2937] text-white" : "text-slate-400 hover:text-white hover:bg-[#1f2937]"}`
            }
          >
            <Layers className="w-4 h-4" /> Workspaces
          </NavLink>
          <div className="pl-10 flex flex-col gap-2 mt-1 mb-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>{" "}
              Workspace A
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>{" "}
              Workspace B
            </div>
          </div>
          <NavLink
            to="/members"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-[#1f2937] text-white" : "text-slate-400 hover:text-white hover:bg-[#1f2937]"}`
            }
          >
            <Users className="w-4 h-4" /> Members
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
};

const Topbar = () => {
  return (
    <header className="h-16 border-b border-[#1f2937] flex items-center justify-between px-8 bg-[#0b0f19]">
      <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
        <NavLink
          to="/workspaces/board"
          className={({ isActive }) =>
            isActive
              ? "text-white border-b-2 border-white pb-1"
              : "hover:text-white"
          }
        >
          Board
        </NavLink>
        <NavLink
          to="/workspaces/gantt"
          className={({ isActive }) =>
            isActive
              ? "text-white border-b-2 border-white pb-1"
              : "hover:text-white"
          }
        >
          Gantt
        </NavLink>
        <NavLink
          to="/workspaces/calendar"
          className={({ isActive }) =>
            isActive
              ? "text-white border-b-2 border-white pb-1"
              : "hover:text-white"
          }
        >
          Calendar
        </NavLink>
        <NavLink
          to="/workspaces/list"
          className={({ isActive }) =>
            isActive
              ? "text-white border-b-2 border-white pb-1"
              : "hover:text-white"
          }
        >
          List
        </NavLink>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-slate-400 hover:text-white">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            ></path>
          </svg>
          <span className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border-2 border-[#1f2937]">
          <img
            src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-white">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
