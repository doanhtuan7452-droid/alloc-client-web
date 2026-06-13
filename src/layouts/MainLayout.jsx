import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import Topbar from "../components/navigation/Topbar";

export default function MainLayout() {
  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      <Topbar />
      
      {/* Giảm padding xuống p-1.5 và gap giữa các khối xuống gap-1.5 */}
      <div className="flex-1 flex overflow-hidden p-1.5 gap-1.5">
        
        <Sidebar />
        
        {/* Thay đổi rounded-xl thành rounded-md để giữ cảm giác khối vuông cứng cáp */}
        <main className="flex-1 overflow-auto bg-white/10 backdrop-blur-md border border-white/10 rounded-md p-4 shadow-2xl relative">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}
