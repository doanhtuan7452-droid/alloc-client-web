import { useState, useEffect } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { MessageSquare, RefreshCw } from "lucide-react";
import { useUser } from "../../contexts/UserContext";
import ReviewCycleService from "../../services/ReviewCycleService";
import {
  Plus,
  Users,
  LayoutGrid,
  CheckCircle2,
  ClipboardList,
  PlayCircle,
  UserPlus,
  X,
  Loader2,
  DollarSign,
  ShieldAlert,
  Settings,
  Edit2,
  Trash2,
  Check,
  UserX,
  UserCheck,
  Shield
} from "lucide-react";
import WorkspaceService from "../../services/WorkspaceService";
import ProjectCard from "../../features/workspaces/ProjectCard";
import ProjectSkeleton from "../../features/workspaces/ProjectSkeleton";
import CreateProjectModal from "../../features/workspaces/CreateProjectModal";
import ProjectService from "../../services/ProjectService";

export default function ActiveProjects() {
  const [searchParams] = useSearchParams();
  const workspaceIdParam = searchParams.get("workspaceId");
  
  const { 
    workspaceInfo, 
    projectsList, 
    isLoading, 
    error, 
    searchQuery, 
    setSearchQuery, 
    setRefreshTrigger,
  } = useOutletContext() || {};
  const [progressMap, setProgressMap] = useState({});

  
  const { currentWorkspaceRole } = useUser() || {};
  const isWorkspaceOwner = currentWorkspaceRole?.roleName?.toLowerCase() === "owner";


  const [isModalOpen, setIsModalOpen] = useState(false);

  // STATES: Quản lý Review Cycles
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewCycles, setReviewCycles] = useState([]);
  const [isLoadingCycles, setIsLoadingCycles] = useState(false);
  const [isActionProcessing, setIsActionProcessing] = useState(null); // Lưu ID của cycle đang xử lý hành động

  // Thêm các state này để xử lý Form tạo mới
  const [isCreatingCycle, setIsCreatingCycle] = useState(false);
  const [newCycleName, setNewCycleName] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");

  // States quản lý modal mời thành viên
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [baseSalary, setBaseSalary] = useState(0);
  const [otRate, setOtRate] = useState(0);
  const [isInviting, setIsInviting] = useState(false);
  const [workspaceRoles, setWorkspaceRoles] = useState([]); 

  // STATES: Quản lý Role & Permission Giao diện
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [systemPermissions, setSystemPermissions] = useState([]); // Tất cả quyền hệ thống có sẵn
  const [selectedRole, setSelectedRole] = useState(null); // Role đang được chọn để cấu hình quyền
  const [rolePermissions, setRolePermissions] = useState([]); // Quyền hiện tại của Role được chọn
  const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false);

  // STATES: CRUD Role bổ sung
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleName, setEditingRoleName] = useState("");
  const [isSavingRole, setIsSavingRole] = useState(false);

  // ===== STATES THÀNH VIÊN MỚI THÊM BỔ SUNG =====
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const handleCreateReviewCycle = async (e) => {
    e.preventDefault();
    if (!workspaceIdParam || !newCycleName.trim() || !newStartDate || !newEndDate) return;

    setIsActionProcessing("creating");
    try {
      const wId = parseInt(workspaceIdParam);
      const payload = {
        name: newCycleName.trim(),
        startDate: new Date(newStartDate).toISOString(),
        endDate: new Date(newEndDate).toISOString()
      };

      // Đảm bảo ReviewCycleService của bạn đã định nghĩa hàm createReviewCycle
      await ReviewCycleService.createReviewCycle(wId, payload);
      
      alert("Tạo chu kỳ đánh giá mới thành công!");
      setNewCycleName("");
      setNewStartDate("");
      setNewEndDate("");
      setIsCreatingCycle(false);
      await loadReviewCycles(); // Tải lại danh sách sau khi tạo
    } catch (err) {
      console.error("Lỗi khi tạo chu kỳ đánh giá:", err);
      alert(err?.response?.data?.message || "Không thể tạo chu kỳ đánh giá mới.");
    } finally {
      setIsActionProcessing(null);
    }
  };

  const loadReviewCycles = async () => {
    if (!workspaceIdParam) return;
    setIsLoadingCycles(true);
    try {
      const parsedId = parseInt(workspaceIdParam);
      const response = await ReviewCycleService.getReviewCycles(parsedId);
      // Tùy theo cấu trúc trả về, lấy mảng từ response.items hoặc response.data hoặc trực tiếp response
      const cyclesArray = response?.items || response?.data || response;
      setReviewCycles(Array.isArray(cyclesArray) ? cyclesArray : []);
    } catch (err) {
      console.error("Lỗi khi tải chu kỳ đánh giá:", err);
      setReviewCycles([]);
    } finally {
      setIsLoadingCycles(false);
    }
  };

  // Tự động tải lại danh sách chu kỳ mỗi khi người dùng mở Modal lên
  useEffect(() => {
    if (isReviewModalOpen) {
      loadReviewCycles();
    }
  }, [isReviewModalOpen, workspaceIdParam]);


  const handleStartReviewCycle = async (cycleId) => {
  if (!workspaceIdParam) return;
  if (!window.confirm("Bạn có chắc chắn muốn bắt đầu chu kỳ đánh giá này (Draft -> Active)?")) return;

  setIsActionProcessing(cycleId);
  try {
    const wId = parseInt(workspaceIdParam);
    await ReviewCycleService.startReviewCycle(wId, cycleId);
    alert("Đã bắt đầu chu kỳ đánh giá thành công!");
    await loadReviewCycles(); // Refresh lại danh sách
  } catch (err) {
    console.error(err);
    alert(err?.response?.data?.message || "Không thể bắt đầu chu kỳ đánh giá.");
  } finally {
    setIsActionProcessing(null);
  }
};

const handleCompleteReviewCycle = async (cycleId) => {
  if (!workspaceIdParam) return;
  if (!window.confirm("Bạn có chắc chắn muốn kết thúc chu kỳ này và kích hoạt tính lại điểm?")) return;

  setIsActionProcessing(cycleId);
  try {
    const wId = parseInt(workspaceIdParam);
    await ReviewCycleService.completeReviewCycle(wId, cycleId);
    alert("Đã hoàn thành chu kỳ đánh giá thành công!");
    await loadReviewCycles(); // Refresh lại danh sách
  } catch (err) {
    console.error(err);
    alert(err?.response?.data?.message || "Không thể hoàn thành chu kỳ đánh giá.");
  } finally {
    setIsActionProcessing(null);
  }
};


  useEffect(() => {
    // Tránh chạy khi projectsList chưa có dữ liệu thật
    if (!projectsList || projectsList.length === 0) return;

    let isMounted = true; // Flag chống tràn memory leak khi component unmount

    const fetchAllProgress = async () => {
      try {
        const progressData = {};
        
        // Gọi API song song cho tất cả các project hiện có
        await Promise.all(
          projectsList.map(async (project) => {
            if (!project.projectId) return;
            try {
              const res = await ProjectService.getProjectProgress(project.projectId);
              progressData[project.projectId] = res?.simpleProgress ?? 0;
            } catch (err) {
              console.error(`Lỗi khi lấy tiến độ project ${project.projectId}:`, err);
              progressData[project.projectId] = 0; 
            }
          })
        );

        // Chỉ cập nhật state nếu component vẫn đang hiển thị
        if (isMounted) {
          setProgressMap(progressData);
        }
      } catch (globalErr) {
        console.error("Lỗi tổng hợp fetch progress:", globalErr);
      }
    };

    fetchAllProgress();

    return () => {
      isMounted = false; // Dọn dẹp flag khi unmount
    };
  }, [projectsList]);

  // Đặt lại ô tìm kiếm về rỗng khi chuyển trang
  useEffect(() => {
    if (setSearchQuery && typeof setSearchQuery === "function") {
      setSearchQuery("");
    }
  }, [setSearchQuery]);

  const loadRolesAndPermissions = async () => {
    if (!workspaceIdParam) return;

    try {
      const parsedId = parseInt(workspaceIdParam);

      const [roles, perms] = await Promise.all([
        WorkspaceService.getWorkspaceRoles(parsedId),
        WorkspaceService.getWorkspacePermissions(parsedId),
      ]);

      // ===== GIỮ PHẦN CRUD =====
      setWorkspaceRoles(roles);

      if (roles.length > 0 && !selectedRole) {
        setSelectedRole(roles[0]);
      }

      const finalPerms = perms?.items || perms || [];
      setSystemPermissions(finalPerms);

      if (roles.length > 0) {
        const defaultRole =
          roles.find(
            (r) =>
              (r.roleName || r.RoleName || "").toLowerCase() === "member"
          ) || roles[0];

        setInviteRoleId(
          defaultRole.workspaceRoleId || defaultRole.WorkspaceRoleId
        );
      }
    } catch (err) {
      console.error("Không thể lấy roles:", err);

      const mockRoles = [
        { workspaceRoleId: 1, roleName: "Owner" },
        { workspaceRoleId: 2, roleName: "Admin" },
        { workspaceRoleId: 3, roleName: "Member" },
      ];

      setWorkspaceRoles(mockRoles);

      if (!selectedRole) {
        setSelectedRole(mockRoles[0]);
      }
    }
  };

  useEffect(() => {
    loadRolesAndPermissions();
  }, [workspaceIdParam]);

  // ===== HÀM ĐỌC DANH SÁCH THÀNH VIÊN (GỌI API) =====
  const loadWorkspaceMembers = async () => {
    if (!workspaceIdParam) return;

    setIsLoadingMembers(true);

    try {
      const parsedId = parseInt(workspaceIdParam);

      const response = await WorkspaceService.getWorkspaceMembers(parsedId);

      console.log("API Response:", response);

      const membersArray = response.items;

      console.log("Members:", membersArray);

      setWorkspaceMembers(membersArray ?? []);
    } catch (err) {
      console.error(err);
      setWorkspaceMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
};

  // Tự động tải danh sách thành viên khi người dùng mở Modal lên
  useEffect(() => {
    if (isMemberModalOpen) {
      loadWorkspaceMembers();
    }
  }, [isMemberModalOpen, workspaceIdParam]);

  useEffect(() => {
    if (!selectedRole || !workspaceIdParam) return;

    async function fetchRoleDetails() {
      try {
        const wId = parseInt(workspaceIdParam);
        const rId =
          selectedRole.workspaceRoleId ||
          selectedRole.WorkspaceRoleId;

        const details =
          await WorkspaceService.getWorkspaceRoleDetails(wId, rId);

        setRolePermissions(
          details?.permissions?.map(p =>
            typeof p === "string"
              ? p
              : p.permissionId || p.PermissionId
          ) || []
        );
      } catch (err) {
        console.error(err);
        setRolePermissions([]);
      }
    }

    fetchRoleDetails();
  }, [selectedRole, workspaceIdParam]);

  // 1. Thêm mới Role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!workspaceIdParam || !newRoleName.trim()) return;

    setIsSavingRole(true);
    try {
      const wId = parseInt(workspaceIdParam);
      const payload = { roleName: newRoleName.trim() };
      
      await WorkspaceService.createWorkspaceRole(wId, payload);
      alert("Thêm vai trò mới thành công!");
      setNewRoleName("");
      setIsCreatingRole(false);
      await loadRolesAndPermissions();
    } catch (err) {
      console.error("Lỗi khi tạo vai trò mới:", err);
      alert(err?.response?.data?.message || "Không thể tạo vai trò mới.");
    } finally {
      setIsSavingRole(false);
    }
  };

  // 2. Cập nhật tên Role
  const handleUpdateRoleName = async (roleId) => {
    if (!workspaceIdParam || !editingRoleName.trim()) return;
    
    setIsSavingRole(true);
    try {
      const wId = parseInt(workspaceIdParam);
      const payload = { roleName: editingRoleName.trim() };
      
      await WorkspaceService.updateWorkspaceRole(wId, roleId, payload);
      alert("Cập nhật tên vai trò thành công!");
      
      if (selectedRole && (selectedRole.workspaceRoleId === roleId || selectedRole.WorkspaceRoleId === roleId)) {
        setSelectedRole(prev => ({ ...prev, roleName: editingRoleName.trim(), RoleName: editingRoleName.trim() }));
      }
      
      setEditingRoleId(null);
      setEditingRoleName("");
      await loadRolesAndPermissions();
    } catch (err) {
      console.error("Lỗi khi sửa vai trò:", err);
      alert(err?.response?.data?.message || "Không thể sửa tên vai trò.");
    } finally {
      setIsSavingRole(false);
    }
  };

  // 3. Xóa Role
  const handleDeleteRole = async (roleId, roleName) => {
    if (!workspaceIdParam) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vai trò "${roleName}" không?`)) return;

    try {
      const wId = parseInt(workspaceIdParam);
      await WorkspaceService.deleteWorkspaceRole(wId, roleId);
      alert("Đã xóa vai trò thành công!");
      
      if (selectedRole && (selectedRole.workspaceRoleId === roleId || selectedRole.WorkspaceRoleId === roleId)) {
        setSelectedRole(null);
      }
      
      await loadRolesAndPermissions();
    } catch (err) {
      console.error("Lỗi khi xóa vai trò:", err);
      alert(err?.response?.data?.message || "Không thể xóa vai trò này.");
    }
  };

  // ===== HÀM CẬP NHẬT TRẠNG THÁI THÀNH VIÊN =====
  const handleToggleMemberStatus = async (memberId, currentStatus) => {
    if (!workspaceIdParam) return;
    const actionText = currentStatus ? "vô hiệu hóa" : "kích hoạt lại";
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} thành viên này?`)) return;

    setStatusUpdatingId(memberId);
    try {
      const wId = parseInt(workspaceIdParam);
      // Gọi API: updateMemberStatus: (workspaceId, memberId) => axiosClient.put(`/workspaces/${workspaceId}/members/${memberId}/status`)
      await WorkspaceService.updateMemberStatus(wId, memberId);
      alert("Cập nhật trạng thái thành viên thành công!");
      await loadWorkspaceMembers(); // Làm mới danh sách trong modal bảng
      if (typeof setRefreshTrigger === "function") {
        setRefreshTrigger((prev) => prev + 1); // Cập nhật lại bộ đếm ngoài giao diện
      }
    } catch (err) {
      console.error("Lỗi thay đổi trạng thái nhân sự:", err);
      alert(err?.response?.data?.message || "Không thể cập nhật trạng thái nhân viên.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Mời thành viên vào Workspace
  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!workspaceIdParam || !inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const parsedId = parseInt(workspaceIdParam);
      
      const payload = {
        email: inviteEmail.trim(),
        workspaceRoleID: parseInt(inviteRoleId), 
        baseSalaryMonth: Number(baseSalary) || 0, 
        otRatePerHour: Number(otRate) || 0        
      };

      await WorkspaceService.inviteWorkspaceMember(parsedId, payload);
      
      alert("Đã gửi lời mời thành viên vào Workspace thành công!");
      setIsInviteModalOpen(false);
      setInviteEmail("");
      setBaseSalary(0);
      setOtRate(0);
      
      if (typeof setRefreshTrigger === "function") {
        setRefreshTrigger((prev) => prev + 1);
      }

      // Nếu đang mở cả bảng quản lý thành viên thì làm mới lại danh sách dữ liệu luôn
      if (isMemberModalOpen) {
        await loadWorkspaceMembers();
      }
    } catch (err) {
      console.error("Lỗi khi mời thành viên:", err);
      alert(err?.response?.data?.message || "Không thể mời thành viên.");
    } finally {
      setIsInviting(false);
    }
  };

  // Xử lý bật/tắt checkbox quyền hạn cho Role
  const handlePermissionCheck = (permissionId) => {
    setRolePermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId) 
        : [...prev, permissionId]
    );
  };

  // Lưu cấu hình phân quyền mới lên Backend
  const handleSavePermissions = async () => {
    if (!workspaceIdParam || !selectedRole) return;
    setIsUpdatingPermissions(true);
    try {
      const wId = parseInt(workspaceIdParam);
      const rId = selectedRole.workspaceRoleId || selectedRole.WorkspaceRoleId;
      
      const payload = {
        permissionIds: rolePermissions 
      };

      await WorkspaceService.updateRolePermissions(wId, rId, payload);
      alert("Cập nhật phân quyền cho vai trò thành công!");
    } catch (err) {
      console.error("Lỗi cập nhật quyền:", err);
      alert("Không thể cập nhật phân quyền hệ thống.");
    } finally {
      setIsUpdatingPermissions(false);
    }
  };

  const filteredProjects = projectsList?.filter((project) =>
    project.projectName.toLowerCase().includes((searchQuery || "").toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-content-secondary gap-4 mt-20">
        <h2 className="text-2xl font-bold text-rose-400">Đã xảy ra lỗi</h2>
        <p className="text-sm text-content-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
      {/* HEADER BLOCK */}
      <div className="px-6 py-5 border-b border-white/10 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-content-muted mb-2">
              <span>WORKSPACES</span>
              <span>›</span>
              <span className="text-slate-400 uppercase">
                {workspaceInfo ? workspaceInfo.name : "..."}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-content-primary">
              {workspaceInfo ? `${workspaceInfo.name} Workspace` : "Workspace"}
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
          
          {isWorkspaceOwner && (
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              disabled={!workspaceIdParam || isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 hover:text-amber-300 rounded-md text-sm font-medium transition-all cursor-pointer disabled:opacity-40"
            >
              <ClipboardList className="w-4 h-4" /> Review Cycles
            </button>
          )}

          {/* 1. NÚT MANAGE ROLES (Chỉ hiện nếu là Owner) */}
          {isWorkspaceOwner && (
            <button
              type="button"
              onClick={() => {
                setIsRoleModalOpen(true);
                if (workspaceRoles.length > 0) {
                  setSelectedRole(workspaceRoles[0]);
                }
              }}
              disabled={!workspaceIdParam || isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-300 hover:text-white rounded-md text-sm font-medium transition-all cursor-pointer disabled:opacity-40"
            >
              <Settings className="w-4 h-4" /> Manage Roles
            </button>
          )}
          
          {/* Nút Chat Room giữ nguyên cho tất cả mọi người */}
          <button
            type="button"
            onClick={() => {
              window.location.href = `/conversations?workspaceId=${workspaceIdParam}&isCreating=true`;
            }}
            disabled={!workspaceIdParam || isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 rounded-md text-sm font-medium transition-all cursor-pointer disabled:opacity-40"
          >
            <MessageSquare className="w-4 h-4" /> Chat Room
          </button>

          {/* 2. NÚT INVITE MEMBER (Chỉ hiện nếu là Owner) */}
          {isWorkspaceOwner && (
            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              disabled={!workspaceIdParam || isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 hover:border-purple-500/50 text-purple-400 hover:text-purple-300 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(147,51,234,0.1)] cursor-pointer disabled:opacity-40"
            >
              <UserPlus className="w-4 h-4" /> Invite Member
            </button>
          )}

          {/* 3. NÚT NEW PROJECT (Chỉ hiện nếu là Owner) */}
          {isWorkspaceOwner && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              disabled={!workspaceIdParam || isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] cursor-pointer disabled:opacity-40"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          )}
        </div>
        </div>
      </div>

      {/* STATS SUMMARY BAR */}
      <div className="px-6 py-6 space-y-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {workspaceInfo && !isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-surface/40 border border-white/5 rounded-lg p-3 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5" /> Total Projects
                </span>
                <span className="text-xl font-bold mt-1 text-content-primary">
                  {workspaceInfo.projectSummary?.totalProjects || 0}
                </span>
              </div>
              <div className="bg-surface/40 border border-white/5 rounded-lg p-3 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5 text-sky-400" /> In Progress
                </span>
                <span className="text-xl font-bold mt-1 text-sky-400">
                  {workspaceInfo.projectSummary?.inProgressProjects || 0}
                </span>
              </div>
              <div className="bg-surface/40 border border-white/5 rounded-lg p-3 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed
                </span>
                <span className="text-xl font-bold mt-1 text-emerald-400">
                  {workspaceInfo.projectSummary?.completedProjects || 0}
                </span>
              </div>
              <div className="bg-surface/40 border border-white/5 rounded-lg p-3 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-amber-400" /> Planning
                </span>
                <span className="text-xl font-bold mt-1 text-amber-400">
                  {workspaceInfo.projectSummary?.planningProjects || 0}
                </span>
              </div>
              
              {/* KHỐI TEAM MEMBERS: CLICK VÀO ĐÂY ĐỂ HIỂN THỊ DANH SÁCH CHI TIẾT */}
              <div 
                onClick={() => setIsMemberModalOpen(true)}
                className="bg-surface/40 border border-purple-500/10 hover:border-purple-500/30 rounded-lg p-3 flex flex-col justify-center cursor-pointer hover:bg-purple-600/[0.02] transition-all group select-none"
              >
                <span className="text-[10px] font-mono text-content-muted group-hover:text-purple-400 uppercase tracking-wider flex items-center gap-1.5 transition-colors">
                  <Users className="w-3.5 h-3.5 text-purple-400" /> Team Members
                </span>
                <span className="text-xl font-bold mt-1 text-purple-400">
                  {workspaceInfo.memberSummary?.activeMembers || 0}{" "}
                  <span className="text-xs text-content-muted font-normal">
                    / {workspaceInfo.memberSummary?.totalMembers || 0}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* PROJECTS CARDS CONTAINER */}
          {isLoading ? (
            <ProjectSkeleton />
          ) : filteredProjects.length === 0 ? (
            <div className="border border-dashed border-border-default rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface/50 border border-white/5 flex items-center justify-center mb-4 text-content-muted">
                <ClipboardList className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-content-primary mb-1">No Projects Found</h3>
              <p className="text-sm text-content-muted mb-6 max-w-sm">
                {searchQuery ? "Không tìm thấy dự án khớp từ khóa." : "Workspace này chưa có dự án nào."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredProjects.map((project) => {
                const progress = progressMap[String(project.projectId)] ?? project.progress ?? 0;

                // 🌟 BẬT NÚT 3 CHẤM: Nếu vai trò hiện tại trong Workspace được xác định là "Owner"
                const isWorkspaceOwner = currentWorkspaceRole?.roleName?.toLowerCase() === "owner";

                return (
                  <ProjectCard
                    key={project.projectId}
                    isOwner={isWorkspaceOwner} 
                    project={{ ...project, progress: progress }}
                    onMenuClick={() => typeof setRefreshTrigger === "function" && setRefreshTrigger((prev) => prev + 1)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ==================== MODAL 5: BẢNG QUẢN LÝ CHU KỲ ĐÁNH GIÁ (REVIEW CYCLES) ==================== */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-4xl h-[75vh] flex flex-col shadow-2xl relative overflow-hidden">
            
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  Quản lý Chu kỳ Đánh giá Hiệu suất
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {isWorkspaceOwner && !isCreatingCycle && (
                  <button 
                    type="button"
                    onClick={() => setIsCreatingCycle(true)}
                    className="text-xs font-mono font-semibold bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 border border-amber-500/30 px-3 py-1 rounded-md cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Plus size={14} /> Thêm chu kỳ
                  </button>
                )}
                <button onClick={() => { setIsReviewModalOpen(false); setIsCreatingCycle(false); }} className="text-slate-500 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Nội dung Modal */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-4">
              
              {/* FORM TẠO MỚI CHU KỲ ĐÁNH GIÁ */}
              {isCreatingCycle && (
                <form onSubmit={handleCreateReviewCycle} className="bg-white/[0.02] border border-white/10 p-4 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wide font-mono">Tạo thiết lập chu kỳ mới</h3>
                    <button type="button" onClick={() => setIsCreatingCycle(false)} className="text-xs text-rose-400 hover:underline">Hủy bỏ</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Tên chu kỳ</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ví dụ: Thống kê Q1-2026" 
                        value={newCycleName}
                        onChange={(e) => setNewCycleName(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Ngày bắt đầu</label>
                      <input 
                        type="date" 
                        required 
                        value={newStartDate}
                        onChange={(e) => setNewStartDate(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono text-slate-400 uppercase">Ngày kết thúc</label>
                      <input 
                        type="date" 
                        required 
                        value={newEndDate}
                        onChange={(e) => setNewEndDate(e.target.value)}
                        className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button 
                      type="submit"
                      disabled={isActionProcessing === "creating"}
                      className="bg-amber-600 hover:bg-amber-500 text-white rounded-md px-4 py-2 text-xs font-semibold cursor-pointer disabled:opacity-40 transition-colors flex items-center gap-1.5"
                    >
                      {isActionProcessing === "creating" ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      Lưu chu kỳ nháp
                    </button>
                  </div>
                </form>
              )}

              {/* BẢNG HIỂN THỊ DANH SÁCH CHU KỲ */}
              {isLoadingCycles ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 gap-2">
                  <Loader2 size={20} className="animate-spin text-amber-500" /> Đang tải danh sách chu kỳ...
                </div>
              ) : reviewCycles.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-xs py-12">
                  Chưa có chu kỳ đánh giá nào được thiết lập trong Workspace này.
                </div>
              ) : (
                <div className="overflow-x-auto w-full border border-white/5 rounded-xl bg-black/20">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-mono uppercase tracking-wider">
                        <th className="p-4 font-semibold">Tên chu kỳ</th>
                        <th className="p-4 font-semibold">Thời gian bắt đầu</th>
                        <th className="p-4 font-semibold">Thời gian kết thúc</th>
                        <th className="p-4 font-semibold text-center">Trạng thái</th>
                        <th className="p-4 font-semibold text-right">Thao tác kích hoạt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {reviewCycles.map((cycle) => {
                        const cId = cycle.reviewCycleId || cycle.id;
                        const cycleName = cycle.name || "Chu kỳ đánh giá";
                        const startDate = cycle.startDate ? new Date(cycle.startDate).toLocaleDateString("vi-VN") : "---";
                        const endDate = cycle.endDate ? new Date(cycle.endDate).toLocaleDateString("vi-VN") : "---";
                        const status = cycle.status || "Draft";

                        return (
                          <tr key={cId} className="hover:bg-white/[0.01] transition-colors">
                            <td className="p-4 font-bold text-white text-sm">{cycleName}</td>
                            <td className="p-4 text-slate-400 font-mono">{startDate}</td>
                            <td className="p-4 text-slate-400 font-mono">{endDate}</td>
                            <td className="p-4 text-center">
                              {status === "Active" ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">Active</span>
                              ) : status === "Completed" ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Completed</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">Draft</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              {isWorkspaceOwner && (
                                <div className="flex items-center justify-end gap-2">
                                  {status === "Draft" && (
                                    <button
                                      type="button"
                                      disabled={isActionProcessing !== null}
                                      onClick={() => handleStartReviewCycle(cId)}
                                      className="inline-flex items-center gap-1 bg-sky-600 hover:bg-sky-500 text-white px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 transition-colors"
                                    >
                                      {isActionProcessing === cId ? <Loader2 size={12} className="animate-spin" /> : <PlayCircle size={12} />}
                                      Start Cycle
                                    </button>
                                  )}
                                  
                                  {status === "Active" && (
                                    <button
                                      type="button"
                                      disabled={isActionProcessing !== null}
                                      onClick={() => handleCompleteReviewCycle(cId)}
                                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 transition-colors"
                                    >
                                      {isActionProcessing === cId ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                      Complete
                                    </button>
                                  )}

                                  {status === "Completed" && (
                                    <span className="text-[11px] text-slate-500 font-mono italic">No actions</span>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: TẠO DỰ ÁN MỚI */}
      {workspaceIdParam && (
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          workspaceId={workspaceIdParam}
          onProjectCreated={() => typeof setRefreshTrigger === "function" && setRefreshTrigger((prev) => prev + 1)}
        />
      )}

      {/* MODAL 2: MỜI THÀNH VIÊN */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-y-auto">
            <button onClick={() => setIsInviteModalOpen(false)} className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer">
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold text-purple-400 mb-4 font-mono uppercase tracking-wider">Mời nhân sự mới vào Workspace</h2>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Địa chỉ Email (* Required)</label>
                <input type="email" required placeholder="user@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Vai trò hệ thống (Workspace Role)</label>
                <select value={inviteRoleId} onChange={(e) => setInviteRoleId(e.target.value)} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500">
                  {workspaceRoles.map((role) => {
                    const roleId = role.workspaceRoleId || role.WorkspaceRoleId;
                    return <option key={roleId} value={roleId}>{role.roleName || role.RoleName} (ID: {roleId})</option>;
                  })}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Lương cơ bản tháng (baseSalaryMonth)</label>
                <div className="relative">
                  <input type="number" min="0" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500" />
                  <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">Lương OT mỗi giờ (otRatePerHour)</label>
                <div className="relative">
                  <input type="number" min="0" value={otRate} onChange={(e) => setOtRate(e.target.value)} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500" />
                  <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                </div>
              </div>
              <div className="border-t border-white/10 pt-5 flex justify-end gap-3">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 border border-white/10 rounded-md bg-white/5 text-slate-300 text-sm font-medium transition-all">Hủy bỏ</button>
                <button type="submit" disabled={isInviting || !inviteEmail} className="px-5 py-2 rounded-md bg-slate-200 hover:bg-white text-neutral-950 text-sm font-medium flex items-center gap-2">{isInviting ? <Loader2 size={14} className="animate-spin" /> : "Gửi lời mời"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: QUẢN LÝ ROLES & PERMISSIONS */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
            
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-zinc-400" />
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  Quản lý Vai trò & Phân quyền
                </h2>
              </div>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-slate-500 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Thân Modal - Phân bổ hai cột */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* CỘT TRÁI: QUẢN LÝ & CHỌN ROLE */}
              <div className="w-2/5 border-r border-white/10 bg-black/20 p-4 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Danh sách vai trò</span>
                  {!isCreatingRole ? (
                    <button 
                      type="button" 
                      onClick={() => setIsCreatingRole(true)} 
                      className="text-[10px] font-mono font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 px-2 py-0.5 rounded cursor-pointer transition-all"
                    >
                      + Thêm Role
                    </button>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => { setIsCreatingRole(false); setNewRoleName(""); }} 
                      className="text-[10px] font-mono text-rose-400 cursor-pointer"
                    >
                      Hủy
                    </button>
                  )}
                </div>

                {/* Form Tạo Role mới */}
                {isCreatingRole && (
                  <form onSubmit={handleCreateRole} className="mb-4 bg-white/[0.02] border border-white/5 p-2 rounded-lg flex items-center gap-2">
                    <input 
                      type="text" 
                      required 
                      placeholder="Tên role..." 
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      className="flex-1 bg-neutral-900 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500" 
                    />
                    <button 
                      type="submit" 
                      disabled={isSavingRole || !newRoleName.trim()} 
                      className="bg-blue-600 hover:bg-blue-500 text-white rounded p-1 cursor-pointer disabled:opacity-40"
                    >
                      {isSavingRole ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    </button>
                  </form>
                )}

                {/* Render danh sách vai trò */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {workspaceRoles.map((role) => {
                    const rId = role.workspaceRoleId || role.WorkspaceRoleId;
                    const rName = role.roleName || role.RoleName;
                    const isSelected = selectedRole && (selectedRole.workspaceRoleId === rId || selectedRole.WorkspaceRoleId === rId);
                    const isEditing = editingRoleId === rId;

                    return (
                      <div 
                        key={rId} 
                        className={`flex items-center justify-between group px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                          isSelected 
                            ? "bg-blue-600/10 border-blue-500/30 text-blue-400" 
                            : "hover:bg-white/5 text-slate-400 border-transparent bg-transparent"
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex-1 flex items-center gap-2 mr-2">
                            <input 
                              type="text" 
                              value={editingRoleName}
                              onChange={(e) => setEditingRoleName(e.target.value)}
                              className="w-full bg-neutral-900 border border-white/20 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-blue-500" 
                            />
                            <button 
                              type="button" 
                              disabled={isSavingRole}
                              onClick={() => handleUpdateRoleName(rId)}
                              className="text-emerald-400 p-0.5 hover:bg-emerald-500/20 rounded cursor-pointer"
                            >
                              <Check size={12} />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setEditingRoleId(null)}
                              className="text-slate-400 p-0.5 hover:bg-white/10 rounded cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedRole(role)}
                            className="flex-1 text-left cursor-pointer truncate py-0.5 text-zinc-200 hover:text-white"
                          >
                            {rName}
                          </button>
                        )}

                        {/* Nhóm nút Sửa / Xóa */}
                        {!isEditing && (
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity pl-2">
                            <button 
                              type="button" 
                              onClick={() => { setEditingRoleId(rId); setEditingRoleName(rName); }}
                              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                              title="Sửa tên vai trò"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button 
                              type="button" 
                              onClick={() => handleDeleteRole(rId, rName)}
                              className="text-rose-500 hover:text-rose-400 p-0.5 rounded transition-colors cursor-pointer"
                              title="Xóa vai trò"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CỘT PHẢI: TÍCH CHỌN QUYỀN HẠN HỆ THỐNG */}
              <div className="w-3/5 p-6 flex flex-col overflow-hidden">
                {selectedRole ? (
                  <>
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-white">
                        Cấu hình quyền: <span className="text-blue-400 font-mono">{selectedRole?.roleName || selectedRole?.RoleName}</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1">Bật/tắt các quyền hạn hệ thống mà vai trò này được phép thực thi.</p>
                    </div>

                    {/* Danh sách Checkbox */}
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                      {systemPermissions.map((perm) => {
                        if (!perm) return null;

                        const isString = typeof perm === "string";
                        const pId = isString ? perm : (perm.permissionId || perm.PermissionId || perm.id || perm.code);
                        const pName = isString ? perm : (perm.permissionName || perm.PermissionName || perm.name || perm.displayName || pId);
                        const pDesc = isString ? `Quyền thực thi tác vụ ${perm}` : (perm.description || perm.Description || "Không có mô tả chi tiết.");
                        
                        const isChecked = rolePermissions.includes(pId);

                        return (
                          <label 
                            key={pId} 
                            className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all"
                          >
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => handlePermissionCheck(pId)}
                              className="mt-0.5 rounded text-blue-600 focus:ring-0 bg-neutral-800 border-white/20 w-4 h-4 cursor-pointer"
                            />
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-slate-200 block font-mono bg-white/5 px-1.5 py-0.5 rounded w-max">
                                {pName}
                              </span>
                              <span className="text-[11px] text-slate-400 block leading-normal pt-1">
                                {pDesc}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {/* Nút lưu quyền hạn */}
                    <div className="border-t border-white/10 pt-4 mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSavePermissions}
                        disabled={isUpdatingPermissions}
                        className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-40"
                      >
                        {isUpdatingPermissions ? <Loader2 size={12} className="animate-spin" /> : "Lưu thay đổi quyền"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
                    <ShieldAlert size={36} className="mb-2 text-slate-600" />
                    <p className="text-xs">Vui lòng chọn hoặc tạo một vai trò ở cột bên trái để cấu hình phân quyền hệ thống.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL 4: BẢNG DANH SÁCH THÀNH VIÊN (MỚI BỔ SUNG) ==================== */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-4xl h-[75vh] flex flex-col shadow-2xl relative overflow-hidden">
            
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  Quản lý thành viên Workspace
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {/* Tích hợp nút mời trực tiếp ngay tại Header bảng quản lý */}
                {isWorkspaceOwner && (
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-400 rounded-md text-xs font-medium transition-all cursor-pointer"
                >
                  <UserPlus size={12} /> Mời thành viên
                </button>
                )}
                <button onClick={() => setIsMemberModalOpen(false)} className="text-slate-500 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Nội dung bảng danh sách */}
            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              {isLoadingMembers ? (
                <div className="h-full flex items-center justify-center text-slate-400 gap-2">
                  <Loader2 size={20} className="animate-spin text-purple-500" /> Đang tải danh sách thành viên...
                </div>
              ) : (
                (() => {
                  // Xác định chính xác vị trí mảng dữ liệu dù nó nằm ở đâu
                  const members = Array.isArray(workspaceMembers) 
                    ? workspaceMembers 
                    : (workspaceMembers?.items || workspaceMembers?.data || []);

                  if (members.length === 0) {
                    return (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-12">
                        Chưa có dữ liệu thành viên hoặc không thể tìm thấy dữ liệu.
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto w-full border border-white/5 rounded-xl bg-black/20">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-mono uppercase tracking-wider">
                            <th className="p-4 font-semibold">Nhân sự</th>
                            <th className="p-4 font-semibold">Vai trò</th>
                            <th className="p-4 font-semibold text-center">Trạng thái</th>
                            <th className="p-4 font-semibold text-right">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-slate-300">
                          {members.map((member) => {
                            const mId = member.workspaceMemberId || member.id;
                            // Khớp chính xác với Object "resource" và "role" từ API của bạn
                            const fullName = member.resource?.fullName || "Chưa thiết lập";
                            const email = member.resource?.email || "N/A";
                            const roleName = member.role?.roleName || "Member";
                            const isActive = member.status === "Active"; 

                            return (
                              <tr key={mId} className="hover:bg-white/[0.01] transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-xs uppercase">
                                      {fullName.charAt(0)}
                                    </div>
                                    <div>
                                      <div className="font-bold text-white text-sm">{fullName}</div>
                                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/5 font-mono text-[11px]">
                                    <Shield size={10} className="text-blue-400" /> {roleName}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  {isActive ? (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                      Active
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                      Inactive
                                    </span>
                                  )}
                                </td>
                                <td className="p-4 text-right">
                                  {isWorkspaceOwner && (
                                  <button
                                    type="button"
                                    disabled={statusUpdatingId === mId}
                                    onClick={() => handleToggleMemberStatus(mId, isActive)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all border ${
                                      isActive
                                        ? "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                                    } disabled:opacity-40`}
                                  >
                                    {statusUpdatingId === mId ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : isActive ? (
                                      <>
                                        <UserX size={12} /> Deactivate
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck size={12} /> Activate
                                      </>
                                    )}
                                  </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}