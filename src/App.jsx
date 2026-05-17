import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import ActiveProjects from "./pages/ActiveProjects";
import Board from "./pages/Board";
import Gantt from "./pages/Gantt";
import Finance from "./pages/Finance";
import Team from "./pages/Team";
import Conversations from "./pages/Conversations";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
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
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 mt-20">
                <h2 className="text-2xl font-bold">Coming Soon</h2>
                <p>This module is under construction.</p>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
