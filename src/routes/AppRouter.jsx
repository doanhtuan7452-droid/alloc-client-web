import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import LayoutLogin from "../layouts/LayoutLogin";
import LoginOption from "../features/auth/LoginOption";
import LoginEmail from "../features/auth/LoginEmail";
import ActiveProjects from "../pages/workspaces/ActiveProjects";
import Board from "../pages/workspaces/Board";
import Gantt from "../pages/workspaces/Gantt";
import Finance from "../pages/workspaces/Finance";
import Team from "../pages/members/Team";
import Conversations from "../pages/conversations/Conversations";

export default function AppRouter() {
  return (
    <Routes>
      {/* Khu vực test riêng cho Login */}
      <Route path="/login-test" element={<LayoutLogin />}>
        <Route index element={<LoginOption />} />
        <Route path="email" element={<LoginEmail />} />
      </Route>

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/workspaces" replace />} />
        <Route path="workspaces" element={<ActiveProjects />} />
        <Route path="workspaces/board" element={<Board />} />
        <Route path="workspaces/gantt" element={<Gantt />} />
        <Route path="workspaces/finance" element={<Finance />} />
        <Route path="members" element={<Team />} />
        <Route path="conversations" element={<Conversations />} />
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center justify-center h-full text-content-secondary gap-4 mt-20">
              <h2 className="text-2xl font-bold">Coming Soon</h2>
              <p>This module is under construction.</p>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
