import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader, LayoutGrid, AlertCircle, X, Loader2, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useUser } from "../../contexts/UserContext";
import WorkspaceService from "../../services/WorkspaceService";
import WorkspaceCard from "../../features/workspaces/WorkSpaceCard";
import CreateProjectModal from "../../features/workspaces/CreateProjectModal";

export default function WorkspaceListPage() {
  const navigate = useNavigate();
  const { currentUser } = useUser(); // Lấy thông tin user hiện tại từ context
  
  const [workspaces, setWorkspaces] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [workspaceOwners, setWorkspaceOwners] = useState({}); // Lưu danh sách owner ID của từng workspace { workspaceId: ownerResourceId }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Quản lý trạng thái đóng/mở menu 3 chấm
  const [activeMenuWsId, setActiveMenuWsId] = useState(null);
  const menuRef = useRef(null);

  // Modal tạo dự án hiện tại
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);

  // States quản lý việc tạo Workspace mới
  const [isWsModalOpen, setIsWsModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [workspaceType, setWorkspaceType] = useState('Company');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // States quản lý việc CHỈNH SỬA Workspace
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editWorkspaceId, setEditWorkspaceId] = useState(null);
  const [editWorkspaceName, setEditWorkspaceName] = useState('');
  const [editWorkspaceType, setEditWorkspaceType] = useState('Company');

  // Đóng menu 3 chấm khi click ra ngoài màn hình
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuWsId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const wsResponse = await WorkspaceService.getWorkspaces();
      const wsData = Array.isArray(wsResponse) ? wsResponse : (wsResponse.items || []);
      setWorkspaces(wsData);

      const ownersMap = {};
      const projectPromises = wsData.map(async (ws) => {
        // 1. Tải danh sách dự án
        let projects = [];
        try {
          const projResponse = await WorkspaceService.getWorkspaceProjects(ws.workspaceId);
          projects = Array.isArray(projResponse) ? projResponse : (projResponse.items || []);
        } catch (err) {
          console.error(`Error loading projects for workspace ${ws.workspaceId}:`, err);
        }

        // 2. Tìm Owner của Workspace qua API lấy danh sách thành viên (Members)
        // Đồng bộ hoàn toàn với logic so sánh resourceId trong UserContext của bạn
        try {
          const memberRes = await WorkspaceService.getWorkspaceMembers(ws.workspaceId);
          const members = memberRes.items || memberRes;
          
          const ownerMember = members.find(
            m => m.role?.roleName?.toLowerCase() === "owner" || m.role?.name?.toLowerCase() === "owner" || m.isOwner === true
          );

          if (ownerMember) {
            // Lưu lại resourceId của Owner để đối chiếu với currentUser
            ownersMap[ws.workspaceId] = ownerMember.resource?.resourceId;
          }
        } catch (err) {
          console.error(`Error loading members for workspace ${ws.workspaceId}:`, err);
        }

        return {
          workspaceId: ws.workspaceId,
          projects: projects
        };
      });

      const results = await Promise.all(projectPromises);
      setWorkspaceOwners(ownersMap);
      
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
  }, [currentUser]); // Gọi lại nếu thông tin currentUser thay đổi

  const handleWorkspaceNavigate = (workspaceId) => {
    navigate(`/workspaces/active?workspaceId=${workspaceId}`);
  };

  const handleProjectNavigate = (workspaceId, projectId) => {
    navigate(`/workspaces/board?workspaceId=${workspaceId}&projectId=${projectId}`);
  };

  // Mở modal Sửa Workspace
  const handleOpenEditModal = (ws) => {
    setEditWorkspaceId(ws.workspaceId);
    setEditWorkspaceName(ws.name);
    setEditWorkspaceType(ws.type || 'Company');
    setIsEditModalOpen(true);
    setActiveMenuWsId(null);
  };

  // API Cập nhật Workspace
  const handleUpdateWorkspace = async (e) => {
    e.preventDefault();
    if (!editWorkspaceName.trim()) return;
    setIsSubmitting(true);
    try {
      await WorkspaceService.updateWorkspace(editWorkspaceId, {
        name: editWorkspaceName.trim(),
        type: editWorkspaceType
      });
      setIsEditModalOpen(false);
      await fetchAllData();
    } catch (err) {
      console.error("Error updating workspace:", err);
      alert(err?.response?.data?.message || "Không thể cập nhật Workspace");
    } finally {
      setIsSubmitting(false);
    }
  };

  // API Xóa Workspace
  const handleDeleteWorkspace = async (wsId, wsName) => {
    setActiveMenuWsId(null);
    if (window.confirm(`Bạn có chắc muốn xóa "${wsName}"? Mọi dữ liệu liên quan sẽ bị xóa vĩnh viễn.`)) {
      try {
        setIsLoading(true);
        await WorkspaceService.deleteWorkspace(wsId);
        await fetchAllData();
      } catch (err) {
        console.error("Error deleting workspace:", err);
        alert(err?.response?.data?.message || "Không thể xóa Workspace");
      } finally {
        setIsLoading(false);
      }
    }
  };

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
      setNewWorkspaceName('');
      setWorkspaceType('Company');
      setIsWsModalOpen(false);
      
      await fetchAllData();
      
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
            
            <button
              onClick={() => setIsWsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" /> Khởi tạo Workspace đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {workspaces.map((ws) => {
              // Đối chiếu chính xác theo cơ chế ResourceId từ UserContext của bạn
              const isOwner = currentUser && workspaceOwners[ws.workspaceId] === currentUser.profile?.resourceId;

              return (
                // Thêm "relative block" để cố định tọa độ chính xác cho phần tử con absolute
                <div key={ws.workspaceId} className="relative block">
                  <WorkspaceCard
                    workspace={ws}
                    projects={projectsMap[ws.workspaceId] || []}
                    onWorkspaceClick={handleWorkspaceNavigate}
                    onProjectClick={handleProjectNavigate}
                  />

                  
                  {isOwner && (
                    <div 
                      className="absolute top-5 right-5 z-10" 
                      ref={activeMenuWsId === ws.workspaceId ? menuRef : null}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn hành vi click mở Workspace của Card cha
                          setActiveMenuWsId(activeMenuWsId === ws.workspaceId ? null : ws.workspaceId);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800/90 border border-white/5 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center shadow-md"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {/* Dropdown menu căn chỉnh mượt mà theo vị trí nút mới */}
                      {activeMenuWsId === ws.workspaceId && (
                        <div className="absolute left-0 mt-1 w-40 bg-zinc-900 border border-white/10 rounded-lg shadow-xl py-1 z-20">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(ws);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 hover:text-white text-left cursor-pointer"
                          >
                            <Edit2 size={13} /> Chỉnh sửa
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWorkspace(ws.workspaceId, ws.name);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-left cursor-pointer"
                          >
                            <Trash2 size={13} /> Xóa Workspace
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceId={selectedWorkspaceId}
        onProjectCreated={fetchAllData}
      />

      {/* MODAL TẠO WORKSPACE MỚI */}
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
                  <option value="Company">Company (Doanh nghiệp)</option>
                  <option value="Personal">Personal (Cá nhân)</option>
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
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Tạo không gian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHỈNH SỬA WORKSPACE */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Chỉnh sửa Workspace</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateWorkspace} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Tên Không gian làm việc</label>
                <input
                  type="text"
                  value={editWorkspaceName}
                  onChange={(e) => setEditWorkspaceName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white/[0.04] border border-white/10 rounded-md text-white focus:outline-none focus:border-blue-500 transition-colors"
                  maxLength={50}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Loại hình</label>
                <select
                  value={editWorkspaceType}
                  onChange={(e) => setEditWorkspaceType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-neutral-800 border border-white/10 rounded-md text-white focus:outline-none focus:border-blue-500 transition-colors"
                  disabled={isSubmitting}
                >
                  <option value="Company">Company (Doanh nghiệp)</option>
                  <option value="Personal">Personal (Cá nhân)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-all cursor-pointer"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}