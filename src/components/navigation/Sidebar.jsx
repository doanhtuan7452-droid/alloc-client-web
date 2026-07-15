import { useState, useEffect } from 'react';
import { Plus, Bell, Clock, Sparkles, X, Loader2 } from 'lucide-react';
import { NavLink, useSearchParams } from 'react-router-dom';
import HomeIcon from '../icons/home-icon';
import Stack3Icon from '../icons/stack-3-icon';
import UsersIcon from '../icons/users-icon';
import MessageCircleIcon from '../icons/message-circle-icon';
import GearIcon from '../icons/gear-icon';
import InfoCircleIcon from '../icons/info-circle-icon';
import WorkspaceService from '../../services/WorkspaceService';

export default function Sidebar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentWorkspaceId = searchParams.get("workspaceId");
  const [workspacesList, setWorkspacesList] = useState([]);
  
  // State quản lý việc tạo Workspace
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [workspaceType, setWorkspaceType] = useState('Company');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Hàm fetch danh sách workspace tách riêng để tái sử dụng
  const fetchWorkspaces = () => {
    WorkspaceService.getWorkspaces()
      .then((data) => setWorkspacesList(data.items || data))
      .catch((err) => console.error("Error fetching workspaces in sidebar:", err));
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  // Xử lý submit form tạo mới
  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) {
      setFormError('Vui lòng nhập tên Workspace');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const payload = {
        name: newWorkspaceName.trim(),
        type: workspaceType
      };
      
      const createdWorkspace = await WorkspaceService.createWorkspace(payload);
      
      // Reset form & Đóng modal
      setNewWorkspaceName('');
      setWorkspaceType('Company');
      setIsModalOpen(false);
      
      // Tải lại danh sách danh mục
      fetchWorkspaces();
      
      // Điều hướng tự động tới Workspace mới tạo (nếu API trả về cấu trúc có Id)
      const newId = createdWorkspace?.workspaceId || createdWorkspace?.id;
      if (newId) {
        setSearchParams({ workspaceId: newId.toString() });
      }
    } catch (err) {
      console.error("Error creating workspace:", err);
      setFormError(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo Workspace.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <aside className="w-56 bg-white/10 backdrop-blur-md border border-white/10 rounded-md h-full flex flex-col justify-between shrink-0 overflow-hidden shadow-xl">
        
        {/* Vùng Menu điều hướng */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-3">
            <p className="text-xs text-slate-500 font-mono tracking-widest font-bold uppercase">Executive Management</p>
          </div>

          <nav className="px-2 flex flex-col gap-1">
            <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive ? 'bg-neutral-800 text-white' : 'text-content-muted hover:text-white hover:bg-neutral-800/50'}`}>
              <HomeIcon size={16} color="currentColor" /> Home
            </NavLink>
            
            {/* Hàng tiêu đề Workspaces có nút thêm nhanh */}
            <div className="flex items-center justify-between pr-2 mt-2">
              <NavLink to="/workspaces" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all flex-1 ${isActive ? 'bg-neutral-800 text-white' : 'text-content-muted hover:text-white hover:bg-neutral-800/50'}`}>
                <Stack3Icon size={16} color="currentColor" /> Workspaces
              </NavLink>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
                title="Tạo Workspace mới"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Danh sách Workspace con */}
            <div className="pl-6 pr-2 flex flex-col gap-1 mt-1 mb-2.5">
              {workspacesList.map((workspace) => {
                const isWorkspaceActive = currentWorkspaceId === workspace.workspaceId.toString();
                const indicatorColor = workspace.type === "Company" ? "bg-blue-400" : "bg-purple-400";

                return (
                  <NavLink
                    key={workspace.workspaceId}
                    to={`/workspaces/active?workspaceId=${workspace.workspaceId}`}
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

        {/* Vùng Footer Actions */}
        <div className="p-3 border-t border-white/10 bg-transparent">
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

      {/* MODAL TẠO WORKSPACE MỚI (Glassmorphism dark theme hợp với UI hiện tại) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Tạo Workspace Mới</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-md">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Tên Không gian làm việc</label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="Ví dụ: Dự án Tốt Nghiệp, Công ty ABC..."
                  className="w-full px-3.5 py-2 text-sm bg-white/[0.04] border border-white/10 rounded-md text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  maxLength={50}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Loại hình</label>
                <select
                  value={workspaceType}
                  onChange={(e) => setWorkspaceType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-800 border border-white/10 rounded-md text-white focus:outline-none focus:border-blue-500 transition-colors"
                  disabled={isSubmitting}
                >
                  <option value="Company">Company (Doanh nghiệp - Chỉ báo xanh dương)</option>
                  <option value="Personal">Personal (Cá nhân - Chỉ báo tím)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Đang tạo...
                    </>
                  ) : (
                    'Tạo không gian'
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}