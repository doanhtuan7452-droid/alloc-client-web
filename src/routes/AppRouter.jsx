import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../routes/ProtectedRoute";
import MainLayout from "../layouts/MainLayout";
import LayoutLogin from "../layouts/LayoutLogin";
import LoginOption from "../features/auth/LoginOption";
import LoginEmail from "../features/auth/LoginEmail";
import ActiveProjects from "../pages/workspaces/ActiveProjects";
import Board from "../pages/workspaces/Board";
import Gantt from "../pages/workspaces/Gantt";
import List from "../pages/workspaces/List";
import Calendar from "../pages/workspaces/Calendar";
import Finance from "../pages/workspaces/Finance";
import Conversations from "../pages/conversations/Conversations";
import WorkspaceLayout from "../layouts/WorkspaceLayout";
import ProjectLayout from "../layouts/ProjectLayout"; // Import file mới tạo
import Risks from "../pages/workspaces/Risks";
import Timesheets from "../pages/timesheets/Timesheets";
import Register from "../features/auth/Register";
import ForgotPassword from "../features/auth/ForgotPassword";
import VerifyOTP from "../features/auth/VerifyOTP";
import Profile from "../pages/profile/Profile";

import AIChatPage from "../pages/ai/AIChatPage";
import WorkspaceListPage from "../pages/workspaces/WorkspaceListPage";
import HRManagement from "../pages/hr/HRManagement";

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
              <Route path="hr" element={<HRManagement />} /> 
              <Route element={<ProjectLayout />}>
                <Route path="board" element={<Board />} />
                <Route path="gantt" element={<Gantt />} />
                <Route path="list" element={<List />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="finance" element={<Finance />} />
                <Route path="risks" element={<Risks />} />
              </Route>
            </Route>
          </Route>

          <Route path="timesheets" element={<Timesheets />} />
          <Route path="profile" element={<Profile />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="ai-chat" element={<AIChatPage />} />
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