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
import WorkspaceLayout from "../layouts/WorkspaceLayout";
import Risks from "../pages/workspaces/Risks";
import Timesheets from "../pages/timesheets/Timesheets";
import Register from "../features/auth/Register";
import ForgotPassword from "../features/auth/ForgotPassword";
import VerifyOTP from "../features/auth/VerifyOTP";
import Profile from "../pages/profile/Profile";
import Notifications from "../pages/notifications/Notifications";
import AIInsights from "../pages/ai/AIInsights";

export default function AppRouter() {
  return (
    <Routes>
      {/* Khu vực test riêng cho Login */}
      <Route path="/login-test" element={<LayoutLogin />}>
        <Route index element={<LoginOption />} />
        <Route path="email" element={<LoginEmail />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verify-otp" element={<VerifyOTP />} />
      </Route>

      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/workspaces" replace />} />
        
        {/* Nhóm định tuyến workspaces đồng nhất */}
        <Route path="workspaces">
          {/* URL: /workspaces -> Danh sách dự án */}
          <Route index element={<ActiveProjects />} />
          
          {/* URL: /workspaces/board, /workspaces/gantt, /workspaces/finance -> Qua Layout chung */}
          <Route element={<WorkspaceLayout />}>
            <Route path="board" element={<Board />} />
            <Route path="gantt" element={<Gantt />} />
            <Route path="finance" element={<Finance />} />
            <Route path="risks" element={<Risks />} />
          </Route>
        </Route>

        <Route path="timesheets" element={<Timesheets />} />
        <Route path="members" element={<Team />} />
        <Route path="profile" element={<Profile />} />
        <Route path="conversations" element={<Conversations />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="ai-insights" element={<AIInsights />} />
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
