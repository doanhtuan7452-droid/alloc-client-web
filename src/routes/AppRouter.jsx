import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../routes/ProtectedRoute";
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
import ProjectLayout from "../layouts/ProjectLayout"; // Import file mới tạo
import Risks from "../pages/workspaces/Risks";
import Timesheets from "../pages/timesheets/TimeSheets";
import Register from "../features/auth/Register";
import ForgotPassword from "../features/auth/ForgotPassword";
import VerifyOTP from "../features/auth/VerifyOTP";
import Profile from "../pages/profile/Profile";
import Notifications from "../pages/notifications/Notifications";
import AIInsights from "../pages/ai/AIInsights";
import WorkspaceListPage from "../pages/workspaces/WorkspaceListPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LayoutLogin />}>
        <Route index element={<LoginOption />} />
        <Route path="email" element={<LoginEmail />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verify-otp" element={<VerifyOTP />} />
      </Route>
      <Route path="/register" element={<LayoutLogin />}>
        <Route index element={<Register />} />
      </Route>
      
      {/* Tuyến đường được bảo vệ - Bắt buộc phải đăng nhập */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/workspaces" replace />} />
          
          <Route path="workspaces">
            <Route index element={<WorkspaceListPage />} /> 
            
            <Route element={<WorkspaceLayout />}>
              <Route path="active" element={<ActiveProjects />} /> 
              <Route element={<ProjectLayout />}>
                <Route path="board" element={<Board />} />
                <Route path="gantt" element={<Gantt />} />
                <Route path="finance" element={<Finance />} />
                <Route path="risks" element={<Risks />} />
                <Route path="members" element={<Team />} />
              </Route>
            </Route>
          </Route>

          <Route path="timesheets" element={<Timesheets />} />
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
      </Route>
    </Routes>
  );
}