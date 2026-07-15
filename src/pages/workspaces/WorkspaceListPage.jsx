import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader, LayoutGrid, AlertCircle, X, Loader2 } from "lucide-react";
import WorkspaceService from "../../services/WorkspaceService";
import WorkspaceCard from "../../features/workspaces/WorkSpaceCard";
import CreateProjectModal from "../../features/workspaces/CreateProjectModal";

export default function WorkspaceListPage() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal tạo dự án hiện tại
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);

  // States lấy từ Sidebar quản lý việc tạo Workspace mới
  const [isWsModalOpen, setIsWsModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [workspaceType, setWorkspaceType] = useState('Company');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const wsResponse = await WorkspaceService.getWorkspaces();
      const wsData = Array.isArray(wsResponse) ? wsResponse : (wsResponse.items || []);
      setWorkspaces(wsData);

      const projectPromises = wsData.map(async (ws) => {
        try {
          const projResponse = await WorkspaceService.getWorkspaceProjects(ws.workspaceId);
          return {
            workspaceId: ws.workspaceId,
            projects: Array.isArray(projResponse) ? projResponse : (projResponse.items || [])
          };
        } catch (err) {
          console.error(`Error loading projects for workspace ${ws.workspaceId}:`, err);
          return { workspaceId: ws.workspaceId, projects: [] };
        }
      });

      const results = await Promise.all(projectPromises);
      
      const mappedProjects = {};
      results.forEach((item) => {
        mappedProjects[item.workspaceId] = item.projects;
      });
      setProjectsMap(mappedProjects);

      if (wsData.length > 0 && !selectedWorkspaceId) {
        setSelectedWorkspaceId(wsData[0].workspaceId);
      }
    } catch (err) {
      console.error("Error standardizing dashboard data:", err);
      setError("Không thể tải dữ liệu không gian làm việc. Vui lòng kiểm tra lại kết nối.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleWorkspaceNavigate = (workspaceId) => {
    navigate(`/workspaces/active?workspaceId=${workspaceId}`);
  };

  const handleProjectNavigate = (workspaceId, projectId) => {
    navigate(`/workspaces/board?workspaceId=${workspaceId}&projectId=${projectId}`);
  };

  const handleOpenCreateModal = (wsId) => {
    setSelectedWorkspaceId(wsId || workspaces[0]?.workspaceId);
    setIsModalOpen(true);
  };

  // Hàm xử lý submit form tạo mới đồng bộ logic và điều hướng từ Sidebar
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
      setIsWsModalOpen(false);
      
      // Tải lại danh sách dự án và workspace trên trang hiện tại
      await fetchAllData();
      
      // Điều hướng tự động tới Workspace mới tạo
      const newId = createdWorkspace?.workspaceId || createdWorkspace?.id;
      if (newId) {
        navigate(`/workspaces/active?workspaceId=${newId}`);
      }
    } catch (err) {
      console.error("Error creating workspace:", err);
      setFormError(err?.response?.data?.message || 'Có lỗi xảy ra khi tạo Workspace.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-3">
        <Loader className="w-7 h-7 text-blue-500 animate-spin" />
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Đang thiết lập không gian...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-transparent text-zinc-100 px-4 sm:px-6 py-12 flex justify-center">
      <div className="w-full max-w-4xl space-y-8">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Workspaces Hệ Thống
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Quản lý các không gian làm việc hiện tại và truy cập nhanh vào các dự án đang thực thi.
            </p>
          </div>
          
          <div className="flex gap-2 shrink-0">
            {/* Nút kích hoạt mở form tạo Workspace mới */}
            <button
              onClick={() => setIsWsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-all border border-white/5 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-400" /> Tạo Workspace mới
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/5 border border-rose-500/10 text-rose-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {workspaces.length === 0 ? (
          <div className="border border-dashed border-white/5 rounded-2xl p-16 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <LayoutGrid className="w-10 h-10 text-zinc-700 mb-3" />
            <h3 className="text-sm font-bold text-zinc-300">Không tìm thấy Không gian làm việc</h3>
            <p className="text-xs text-zinc-500 mt-1 mb-6">Tài khoản của bạn chưa liên kết với bất cứ Workspace nào.</p>
            
            {/* Nút khi không có dữ liệu */}
            <button
              onClick={() => setIsWsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Khởi tạo Workspace đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {workspaces.map((ws) => (
              <WorkspaceCard
                key={ws.workspaceId}
                workspace={ws}
                projects={projectsMap[ws.workspaceId] || []}
                onWorkspaceClick={handleWorkspaceNavigate}
                onProjectClick={handleProjectNavigate}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Tạo Dự Án */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceId={selectedWorkspaceId}
        onProjectCreated={fetchAllData}
      />

      {/* MODAL TẠO WORKSPACE MỚI (Trùng khớp thiết kế từ Sidebar) */}
      {isWsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Tạo Workspace Mới</h3>
              <button 
                onClick={() => setIsWsModalOpen(false)}
                className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
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
                  onClick={() => setIsWsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] disabled:opacity-50 cursor-pointer"
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
    </div>
  );
}