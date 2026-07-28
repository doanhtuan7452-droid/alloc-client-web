import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Download,
  Search,
  Calendar,
  UserPlus,
  CheckCircle2,
  XCircle,
  Award,
  TrendingUp,
  Clock,
  UserCheck,
  Edit2,
  Save,
  Trash2,
  Plus,
  Send,
  Users,
  ClipboardList,
  Shield,
  ShieldAlert,
  Loader2,
  DollarSign,
  UserX,
  Check,
  X,
  PlayCircle,
  ChevronDown
} from "lucide-react";
import WorkspaceService from "../../services/WorkspaceService";
import ReviewCycleService from "../../services/ReviewCycleService";
import { useUser } from "../../contexts/UserContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { MemberListSkeleton, RequestListSkeleton, ReviewCycleListSkeleton } from "../../components/skeletons/TeamSkeletons";
import Skeleton from "../../components/skeletons/Skeleton";

export default function HRManagement() {
  const { t } = useLanguage();
  const { toast, confirm } = useNotification();
  const [searchParams] = useSearchParams();
  const { currentUser, currentWorkspaceRole, hasPermission } = useUser();
  const workspaceIdParam = searchParams.get("workspaceId");
  const workspaceId = workspaceIdParam ? parseInt(workspaceIdParam) : 12;

  // Tabs: "members", "requests", "performance", "roles"
  const [activeTab, setActiveTab] = useState("members");

  // Core loading states
  const [isLoading, setIsLoading] = useState(true);

  // States Tab 1: Members & Profiles
  const [members, setMembers] = useState([]);
  const [memberProfiles, setMemberProfiles] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    priorExperienceYears: 0,
    educationLevel: "Bachelor"
  });
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [currentUserMember, setCurrentUserMember] = useState(null);

  // States Tab 2: Requests & Approvals
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [otRequests, setOtRequests] = useState([]);
  const [requestType, setRequestType] = useState("Leave"); // Form nộp đơn: Leave hoặc OT
  const [leaveFormData, setLeaveFormData] = useState({ startDate: "", endDate: "", reason: "" });
  const [otFormData, setOtFormData] = useState({ requestedDate: "", expectedHours: 1, reason: "" });
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [processingRequestId, setProcessingRequestId] = useState(null);

  // States Tab 3: Performance Reviews (Review Cycles)
  const [reviewCycles, setReviewCycles] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [isCreatingCycle, setIsCreatingCycle] = useState(false);
  const [newCycleName, setNewCycleName] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [isActionProcessing, setIsActionProcessing] = useState(null);

  // States Tab 4: Roles & Permissions
  const [workspaceRoles, setWorkspaceRoles] = useState([]);
  const [systemPermissions, setSystemPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingRoleName, setEditingRoleName] = useState("");
  const [isSavingRole, setIsSavingRole] = useState(false);

  // Modal Mời Thành Viên
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [baseSalary, setBaseSalary] = useState("");
  const [otRate, setOtRate] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // State Chỉnh sửa Vai trò, Lương & OT của thành viên hiện hữu
  const [salaryOTData, setSalaryOTData] = useState({});
  const [editSalaryData, setEditSalaryData] = useState({ baseSalaryMonth: 0, otRatePerHour: 0, roleId: "" });
  const [isSalaryLoading, setIsSalaryLoading] = useState(false);

  // State Đánh giá hiệu suất nhân sự
  const [isEvaluatingCycle, setIsEvaluatingCycle] = useState(null);
  const [evalRevieweeId, setEvalRevieweeId] = useState("");
  const [evalReviewerId, setEvalReviewerId] = useState("");
  const [evalType, setEvalType] = useState("Manager");
  const [evalCommScore, setEvalCommScore] = useState(80);
  const [evalLeadScore, setEvalLeadScore] = useState(80);
  const [evalProbScore, setEvalProbScore] = useState(80);
  const [evalFeedback, setEvalFeedback] = useState("");
  const [isSubmittingEval, setIsSubmittingEval] = useState(false);
  const [evaluationsList, setEvaluationsList] = useState([]);
  const [isRevieweeDropdownOpen, setIsRevieweeDropdownOpen] = useState(false);
  const [isEvalTypeDropdownOpen, setIsEvalTypeDropdownOpen] = useState(false);

  // Quyền hạn
  const isOwner = currentWorkspaceRole?.roleName?.toLowerCase() === "owner";
  const canApprove = isOwner || hasPermission("request:approve");
  const canViewProfile = hasPermission("member_profiles:view");
  const canManageProfile = hasPermission("member_profiles:manage");

  // Tự động pre-fill điểm số và feedback cũ khi đổi nhân sự (Reviewee)
  useEffect(() => {
    if (!isEvaluatingCycle || !evalRevieweeId || !evalReviewerId) {
      return;
    }
    const existing = (evaluationsList || []).find(
      e => e.revieweeID === Number(evalRevieweeId) && e.reviewerID === Number(evalReviewerId)
    );
    if (existing) {
      setEvalCommScore(existing.communicationScore);
      setEvalLeadScore(existing.leadershipScore);
      setEvalProbScore(existing.problemSolvingScore);
      setEvalFeedback(existing.feedbackNotes || "");
      setEvalType(existing.evaluationType || "Manager");
    } else {
      setEvalCommScore(80);
      setEvalLeadScore(80);
      setEvalProbScore(80);
      setEvalFeedback("");
      setEvalType("Manager");
    }
  }, [evalRevieweeId, evalReviewerId, evaluationsList, isEvaluatingCycle]);

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Members & Roles
      const [memRes, rolesRes, permsRes] = await Promise.all([
        WorkspaceService.getWorkspaceMembers(workspaceId),
        WorkspaceService.getWorkspaceRoles(workspaceId),
        WorkspaceService.getWorkspacePermissions(workspaceId)
      ]);

      const membersList = memRes.items || memRes || [];
      setMembers(membersList);
      setWorkspaceRoles(rolesRes || []);
      setSystemPermissions(permsRes?.items || permsRes || []);

      if (rolesRes && rolesRes.length > 0) {
        const defaultRole = rolesRes.find(r => (r.roleName || "").toLowerCase() === "member") || rolesRes[0];
        setInviteRoleId(defaultRole.workspaceRoleId || defaultRole.WorkspaceRoleId);
        if (!selectedRole) setSelectedRole(rolesRes[0]);
      }

      // Xác định thông tin member của user hiện tại
      const me = membersList.find(m => String(m.resource?.resourceId) === String(currentUser?.profile?.resourceId));
      setCurrentUserMember(me);

      // 2. Fetch Requests
      const [leaves, ots] = await Promise.all([
        WorkspaceService.getLeaveRequests(workspaceId),
        WorkspaceService.getOTRequests(workspaceId)
      ]);
      setLeaveRequests(leaves || []);
      setOtRequests(ots || []);

      // 3. Fetch Performance Reviews
      const cycles = await ReviewCycleService.getReviewCycles(workspaceId);
      setReviewCycles(cycles || []);

      const evalsMap = {};
      for (const c of (cycles || [])) {
        // Backend (server) does not provide GET /review-cycles/{id}/evaluations,
        // so we default to an empty list to avoid HTTP 404/405 errors.
        evalsMap[c.cycleID || c.reviewCycleId] = [];
      }
      setEvaluations(evalsMap);

    } catch (e) {
      console.error("Lỗi khi tải dữ liệu HR Management:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm format số tiền nhập vào có phân tách hàng nghìn (ví dụ: "15.000.000")
  const formatInputAmount = (val) => {
    if (!val) return "";
    const clean = val.replace(/\D/g, "");
    if (!clean) return "";
    return new Intl.NumberFormat("vi-VN").format(clean);
  };

  useEffect(() => {
    if (workspaceId) {
      loadData();
    }
  }, [workspaceId, currentUser]);

  // Load Role Permissions Details
  useEffect(() => {
    if (!selectedRole || !workspaceId) return;

    async function fetchRoleDetails() {
      try {
        const rId = selectedRole.workspaceRoleId || selectedRole.WorkspaceRoleId;
        const details = await WorkspaceService.getWorkspaceRoleDetails(workspaceId, rId);
        setRolePermissions(
          details?.permissions?.map(p => typeof p === "string" ? p : p.permissionId || p.PermissionId) || []
        );
      } catch (err) {
        console.error("Lỗi lấy chi tiết quyền của Role:", err);
        setRolePermissions([]);
      }
    }

    fetchRoleDetails();
  }, [selectedRole, workspaceId]);

  // Tab 1 Actions: Profile & Member Status
  const fetchProfile = async (member) => {
    setSelectedMember(member);
    setIsEditingProfile(false);
    setEditSalaryData({
      baseSalaryMonth: 0,
      otRatePerHour: 0,
      roleId: member.role?.workspaceRoleId || member.role?.workspaceRoleID || ""
    });

    try {
      const p = await WorkspaceService.getMemberProfile(workspaceId, member.workspaceMemberId);
      if (p) {
        setMemberProfiles((prev) => ({ ...prev, [member.workspaceMemberId]: p }));
        setEditProfileData({
          priorExperienceYears: p.priorExperienceYears ?? 0,
          educationLevel: p.educationLevel || "Bachelor"
        });
      } else {
        resetProfileForm();
      }
    } catch (e) {
      resetProfileForm();
    }

    if (hasPermission("member_profiles:manage") || isOwner) {
      setIsSalaryLoading(true);
      try {
        const s = await WorkspaceService.getMemberSalaryOT(workspaceId, member.workspaceMemberId);
        if (s) {
          setSalaryOTData((prev) => ({ ...prev, [member.workspaceMemberId]: s }));
          setEditSalaryData({
            baseSalaryMonth: s.baseSalaryMonth ?? 0,
            otRatePerHour: s.otRatePerHour ?? 0,
            roleId: member.role?.workspaceRoleId || member.role?.workspaceRoleID || ""
          });
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin lương/OT:", err);
      } finally {
        setIsSalaryLoading(false);
      }
    }
  };

  const resetProfileForm = () => {
    setEditProfileData({ priorExperienceYears: 0, educationLevel: "Bachelor" });
  };

  const handleSaveProfile = async () => {
    if (!canManageProfile) return toast.warning(t("activeProjects.errGeneral"));
    try {
      const profileExists = memberProfiles[selectedMember.workspaceMemberId];
      const payload = {
        priorExperienceYears: Math.floor(Number(editProfileData.priorExperienceYears ?? 0)),
        educationLevel: editProfileData.educationLevel || "Bachelor"
      };

      if (profileExists) {
        await WorkspaceService.updateMemberProfile(workspaceId, selectedMember.workspaceMemberId, payload);
      } else {
        await WorkspaceService.createMemberProfile(workspaceId, selectedMember.workspaceMemberId, payload);
      }

      const cleanBaseSalary = String(editSalaryData.baseSalaryMonth).replace(/\./g, "");
      const cleanOTRate = String(editSalaryData.otRatePerHour).replace(/\./g, "");
      await WorkspaceService.updateMemberSalaryOT(workspaceId, selectedMember.workspaceMemberId, {
        baseSalaryMonth: Number(cleanBaseSalary) || 0,
        otRatePerHour: Number(cleanOTRate) || 0
      });

      setSalaryOTData((prev) => ({
        ...prev,
        [selectedMember.workspaceMemberId]: {
          baseSalaryMonth: Number(cleanBaseSalary) || 0,
          otRatePerHour: Number(cleanOTRate) || 0
        }
      }));

      const currentRoleId = selectedMember.role?.workspaceRoleId || selectedMember.role?.workspaceRoleID;
      if (editSalaryData.roleId && String(editSalaryData.roleId) !== String(currentRoleId)) {
        await WorkspaceService.updateMemberRole(workspaceId, selectedMember.workspaceMemberId, {
          workspaceRoleID: Number(editSalaryData.roleId)
        });
      }

      await loadData();

      const updatedRole = workspaceRoles.find(r => String(r.workspaceRoleId || r.WorkspaceRoleId) === String(editSalaryData.roleId));
      if (updatedRole) {
        setSelectedMember(prev => ({
          ...prev,
          role: {
            workspaceRoleId: updatedRole.workspaceRoleId || updatedRole.WorkspaceRoleId,
            roleName: updatedRole.roleName
          }
        }));
      }

      const updatedProfile = await WorkspaceService.getMemberProfile(workspaceId, selectedMember.workspaceMemberId);
      if (updatedProfile) {
        setMemberProfiles((prev) => ({ ...prev, [selectedMember.workspaceMemberId]: updatedProfile }));
      }
      setIsEditingProfile(false);
      toast.success(t("common.success"));
    } catch (e) {
      toast.error("Error: " + (e.response?.data?.message || e.message));
    }
  };

  const handleDeleteProfile = async () => {
    if (!canManageProfile) return toast.warning(t("activeProjects.errGeneral"));
    if (!(await confirm(t("activeProjects.confirmDeactivate"), "Delete Profile"))) return;
    try {
      await WorkspaceService.deleteMemberProfile(workspaceId, selectedMember.workspaceMemberId);
      setMemberProfiles((prev) => {
        const copy = { ...prev };
        delete copy[selectedMember.workspaceMemberId];
        return copy;
      });
      resetProfileForm();
      setIsEditingProfile(false);
      setSelectedMember(null);
      toast.success(t("common.success"));
    } catch (e) {
      toast.error("Error: " + e.message);
    }
  };

  const handleToggleMemberStatus = async (memberId, currentStatus) => {
    const confirmMessage = currentStatus
      ? t("activeProjects.confirmDeactivate")
      : t("activeProjects.confirmActivate");
    if (!(await confirm(confirmMessage, t("common.confirm")))) return;

    setStatusUpdatingId(memberId);
    try {
      const targetStatus = currentStatus ? "Deactivated" : "Active";
      await WorkspaceService.updateMemberStatus(workspaceId, memberId, { status: targetStatus });
      toast.success(t("activeProjects.toggleMemberSuccess"));

      if (selectedMember && selectedMember.workspaceMemberId === memberId) {
        setSelectedMember(prev => ({
          ...prev,
          status: targetStatus
        }));
      }

      // Refresh Member List
      const memRes = await WorkspaceService.getWorkspaceMembers(workspaceId);
      setMembers(memRes.items || memRes || []);
    } catch (err) {
      console.error(err);
      toast.error(t("activeProjects.toggleMemberFailed"));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // Tab 1 Actions: Invite Member
  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      const cleanBaseSalary = String(baseSalary).replace(/\./g, "");
      const cleanOTRate = String(otRate).replace(/\./g, "");

      const payload = {
        email: inviteEmail.trim(),
        workspaceRoleID: parseInt(inviteRoleId),
        baseSalaryMonth: Number(cleanBaseSalary) || 0,
        otRatePerHour: Number(cleanOTRate) || 0
      };

      await WorkspaceService.inviteWorkspaceMember(workspaceId, payload);
      toast.success(t("activeProjects.inviteSuccess"));
      setIsInviteModalOpen(false);
      setInviteEmail("");
      setBaseSalary("");
      setOtRate("");

      // Refresh Member List
      const memRes = await WorkspaceService.getWorkspaceMembers(workspaceId);
      setMembers(memRes.items || memRes || []);
    } catch (err) {
      console.error(err);
      toast.error(t("activeProjects.inviteFailed"));
    } finally {
      setIsInviting(false);
    }
  };

  // Tab 2 Actions: Requests & Approvals
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setIsSubmittingRequest(true);
    try {
      if (requestType === "Leave") {
        await WorkspaceService.createLeaveRequest(workspaceId, leaveFormData);
        setLeaveFormData({ startDate: "", endDate: "", reason: "" });
      } else {
        await WorkspaceService.createOTRequest(workspaceId, otFormData);
        setOtFormData({ requestedDate: "", expectedHours: 1, reason: "" });
      }
      toast.success(t("common.success"));
      // Refresh requests list
      const [leaves, ots] = await Promise.all([
        WorkspaceService.getLeaveRequests(workspaceId),
        WorkspaceService.getOTRequests(workspaceId)
      ]);
      setLeaveRequests(leaves || []);
      setOtRequests(ots || []);
    } catch (e) {
      toast.error("Error: " + e.message);
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const handleActionRequest = async (type, id, action) => {
    const isApprove = action === "approve";
    const confirmMessage = isApprove ? t("timesheets.approveConfirm") : t("timesheets.rejectConfirm");
    if (!(await confirm(confirmMessage, t("common.confirm")))) return;

    setProcessingRequestId(id);
    try {
      const status = isApprove ? "Approved" : "Rejected";
      await WorkspaceService.approveRequest(type, id, {
        status,
        approvalNote: isApprove ? "Approved by Admin/Owner" : "Rejected by Admin/Owner"
      });
      toast.success(isApprove ? t("timesheets.approveSuccess") : t("timesheets.rejectSuccess"));

      // Refresh requests list
      const [leaves, ots] = await Promise.all([
        WorkspaceService.getLeaveRequests(workspaceId),
        WorkspaceService.getOTRequests(workspaceId)
      ]);
      setLeaveRequests(leaves || []);
      setOtRequests(ots || []);
    } catch (e) {
      toast.error("Error: " + e.message);
    } finally {
      setProcessingRequestId(null);
    }
  };

  // Tab 3 Actions: Review Cycles
  const handleCreateReviewCycle = async (e) => {
    e.preventDefault();
    if (!newCycleName.trim() || !newStartDate || !newEndDate) return;

    setIsActionProcessing("creating");
    try {
      const payload = {
        cycleName: newCycleName.trim(),
        startDate: newStartDate, // Input type="date" defaults to YYYY-MM-DD
        endDate: newEndDate      // Input type="date" defaults to YYYY-MM-DD
      };

      await ReviewCycleService.createReviewCycle(workspaceId, payload);
      toast.success(t("activeProjects.createCycleSuccess"));
      setNewCycleName("");
      setNewStartDate("");
      setNewEndDate("");
      setIsCreatingCycle(false);

      // Refresh Review Cycles
      const cycles = await ReviewCycleService.getReviewCycles(workspaceId);
      setReviewCycles(cycles || []);
    } catch (err) {
      console.error(err);
      toast.error(t("activeProjects.errCreateCycle"));
    } finally {
      setIsActionProcessing(null);
    }
  };

  const handleStartReviewCycle = async (cycleId) => {
    if (!(await confirm(t("activeProjects.confirmStartCycle"), t("activeProjects.startCycleBtn")))) return;
    setIsActionProcessing(cycleId);
    try {
      await ReviewCycleService.startReviewCycle(workspaceId, cycleId);
      toast.success(t("activeProjects.startCycleSuccess"));
      // Refresh Review Cycles
      const cycles = await ReviewCycleService.getReviewCycles(workspaceId);
      setReviewCycles(cycles || []);
    } catch (err) {
      console.error(err);
      toast.error(t("activeProjects.errStartCycle"));
    } finally {
      setIsActionProcessing(null);
    }
  };

  const handleCompleteReviewCycle = async (cycleId) => {
    if (!(await confirm(t("activeProjects.confirmCompleteCycle"), t("activeProjects.completeBtn")))) return;
    setIsActionProcessing(cycleId);
    try {
      await ReviewCycleService.completeReviewCycle(workspaceId, cycleId);
      toast.success(t("activeProjects.completeCycleSuccess"));
      // Refresh Review Cycles
      const cycles = await ReviewCycleService.getReviewCycles(workspaceId);
      setReviewCycles(cycles || []);
    } catch (err) {
      console.error(err);
      toast.error(t("activeProjects.errCompleteCycle"));
    } finally {
      setIsActionProcessing(null);
    }
  };

  const handleOpenEvaluationModal = async (cycle) => {
    setIsEvaluatingCycle(cycle);
    const cycleId = cycle.reviewCycleId || cycle.id || cycle.cycleID;
    try {
      const res = await ReviewCycleService.getEvaluations(workspaceId, cycleId);
      const evals = res.items || res.data || res || [];
      setEvaluationsList(evals);

      // Mặc định chọn reviewee là thành viên đầu tiên đang hoạt động
      const firstMember = members.find(m => m.status === "Active") || null;
      const revieweeId = firstMember ? (firstMember.workspaceMemberId || firstMember.workspaceMemberID || "") : "";
      setEvalRevieweeId(revieweeId);
      const reviewerId = currentUserMember ? (currentUserMember.workspaceMemberId || currentUserMember.workspaceMemberID || "") : "";
      setEvalReviewerId(reviewerId);
      setEvalType("Manager");

      // Tìm xem đã có đánh giá cũ chưa để điền vào
      const existing = evals.find(e => e.revieweeID === Number(revieweeId) && e.reviewerID === Number(reviewerId));
      if (existing) {
        setEvalCommScore(existing.communicationScore);
        setEvalLeadScore(existing.leadershipScore);
        setEvalProbScore(existing.problemSolvingScore);
        setEvalFeedback(existing.feedbackNotes || "");
        setEvalType(existing.evaluationType || "Manager");
      } else {
        setEvalCommScore(80);
        setEvalLeadScore(80);
        setEvalProbScore(80);
        setEvalFeedback("");
      }
    } catch (err) {
      console.error("Lỗi tải evaluations:", err);
      setEvaluationsList([]);
      const firstMember = members.find(m => m.status === "Active") || null;
      setEvalRevieweeId(firstMember ? (firstMember.workspaceMemberId || firstMember.workspaceMemberID || "") : "");
      setEvalReviewerId(currentUserMember ? (currentUserMember.workspaceMemberId || currentUserMember.workspaceMemberID || "") : "");
      setEvalType("Manager");
      setEvalCommScore(80);
      setEvalLeadScore(80);
      setEvalProbScore(80);
      setEvalFeedback("");
    }
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!isEvaluatingCycle || !evalRevieweeId || !evalReviewerId) return;

    const cycleId = isEvaluatingCycle.reviewCycleId || isEvaluatingCycle.id || isEvaluatingCycle.cycleID;
    setIsSubmittingEval(true);
    try {
      const payload = {
        revieweeID: Number(evalRevieweeId),
        reviewerID: Number(evalReviewerId),
        evaluationType: evalType,
        communicationScore: Number(evalCommScore),
        leadershipScore: Number(evalLeadScore),
        problemSolvingScore: Number(evalProbScore),
        feedbackNotes: evalFeedback.trim() || null
      };

      await ReviewCycleService.submitEvaluation(workspaceId, cycleId, payload);
      toast.success(t("activeProjects.submitEvalSuccess"));

      // Tải lại evaluations để dropdown cập nhật dấu ✓ lập tức
      const res = await ReviewCycleService.getEvaluations(workspaceId, cycleId);
      const evals = res.items || res.data || res || [];
      setEvaluationsList(evals);

      await loadData();
    } catch (err) {
      console.error(err);
      toast.error(t("activeProjects.errSubmitEval"));
    } finally {
      setIsSubmittingEval(false);
    }
  };

  // Tab 4 Actions: Roles & Permissions (CRUD)
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setIsSavingRole(true);
    try {
      await WorkspaceService.createWorkspaceRole(workspaceId, { roleName: newRoleName.trim() });
      toast.success(t("activeProjects.createRoleSuccess"));
      setNewRoleName("");
      setIsCreatingRole(false);

      // Refresh Roles List
      const rolesRes = await WorkspaceService.getWorkspaceRoles(workspaceId);
      setWorkspaceRoles(rolesRes || []);
    } catch (err) {
      console.error(err);
      toast.error(t("activeProjects.createRoleFailed"));
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleUpdateRoleName = async (roleId) => {
    if (!editingRoleName.trim()) return;

    setIsSavingRole(true);
    try {
      await WorkspaceService.updateWorkspaceRole(workspaceId, roleId, { roleName: editingRoleName.trim() });
      toast.success(t("activeProjects.updateRoleSuccess"));

      if (selectedRole && (selectedRole.workspaceRoleId === roleId || selectedRole.WorkspaceRoleId === roleId)) {
        setSelectedRole(prev => ({ ...prev, roleName: editingRoleName.trim(), RoleName: editingRoleName.trim() }));
      }
      setEditingRoleId(null);
      setEditingRoleName("");

      // Refresh Roles List
      const rolesRes = await WorkspaceService.getWorkspaceRoles(workspaceId);
      setWorkspaceRoles(rolesRes || []);
    } catch (err) {
      console.error(err);
      toast.error(t("activeProjects.updateRoleFailed"));
    } finally {
      setIsSavingRole(false);
    }
  };

  const handleDeleteRole = async (roleId, roleName) => {
    if (!(await confirm(t("activeProjects.confirmDeleteRole").replace("{name}", roleName), t("activeProjects.deleteRoleTitle")))) return;
    try {
      await WorkspaceService.deleteWorkspaceRole(workspaceId, roleId);
      toast.success(t("activeProjects.deleteRoleSuccess"));

      if (selectedRole && (selectedRole.workspaceRoleId === roleId || selectedRole.WorkspaceRoleId === roleId)) {
        setSelectedRole(null);
      }

      // Refresh Roles List
      const rolesRes = await WorkspaceService.getWorkspaceRoles(workspaceId);
      setWorkspaceRoles(rolesRes || []);
    } catch (err) {
      console.error(err);
      toast.error(t("activeProjects.deleteRoleFailed"));
    }
  };

  const handlePermissionCheck = (permissionId) => {
    setRolePermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setIsUpdatingPermissions(true);
    try {
      const rId = selectedRole.workspaceRoleId || selectedRole.WorkspaceRoleId;
      await WorkspaceService.updateRolePermissions(workspaceId, rId, { permissionIds: rolePermissions });
      toast.success(t("activeProjects.savePermissionsSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("activeProjects.savePermissionsFailed"));
    } finally {
      setIsUpdatingPermissions(false);
    }
  };

  // Filters & Calculations
  const filteredMembers = members.filter(m =>
    m.resource?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentUserWorkspaceMemberId = currentUserMember?.workspaceMemberId || currentUserMember?.id;

  // Lọc danh sách requests hiển thị
  // Admin/Owner: xem tất cả đơn. Member: chỉ xem đơn của chính mình.
  const displayLeaveRequests = canApprove
    ? leaveRequests
    : leaveRequests.filter(r => r.workspaceMemberId === currentUserWorkspaceMemberId);

  const displayOTRequests = canApprove
    ? otRequests
    : otRequests.filter(r => r.workspaceMemberId === currentUserWorkspaceMemberId);

  const pendingLeaves = displayLeaveRequests.filter(r => r.status === "Pending");
  const processedLeaves = displayLeaveRequests.filter(r => r.status !== "Pending");

  const pendingOTs = displayOTRequests.filter(r => r.status === "Pending");
  const processedOTs = displayOTRequests.filter(r => r.status !== "Pending");

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto h-full p-4 md:p-6 custom-scrollbar text-content-primary">
        <div className="max-w-6xl mx-auto pb-10 space-y-6 animate-pulse">
          {/* HEADER SKELETON */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-6">
            <div className="space-y-2 flex-1">
              <Skeleton variant="text" className="h-9 w-60 bg-white/10" />
              <Skeleton variant="text" className="h-4 w-full max-w-sm mt-2 bg-white/10" />
            </div>
            <div className="flex gap-3">
              <Skeleton variant="rect" className="h-9 w-24 rounded-lg bg-white/10" />
              <Skeleton variant="rect" className="h-9 w-32 rounded-lg bg-white/10" />
            </div>
          </div>

          {/* TABS SKELETON */}
          <div className="flex gap-4 border-b border-white/10 bg-black/20 p-1 rounded-lg mb-6 overflow-x-auto select-none">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} variant="rect" className="h-8 w-28 rounded-md shrink-0 bg-white/10" />
            ))}
          </div>

          {/* CONTENT SKELETON: MEMBERS LIST GRID */}
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Skeleton variant="text" className="h-6 w-44 bg-white/10" />
              <Skeleton variant="rect" className="h-8 w-full sm:w-64 rounded-lg bg-white/10" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white/[0.02] border border-white/10 rounded-xl p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <Skeleton variant="circle" className="w-10 h-10 border border-white/10 shrink-0 bg-white/10" />
                      <div className="space-y-2">
                        <Skeleton variant="text" className="h-4 w-28 bg-white/10" />
                        <Skeleton variant="text" className="h-3 w-36 bg-white/10" />
                      </div>
                    </div>
                    <Skeleton variant="rect" className="h-4 w-12 rounded bg-white/10" />
                  </div>
                  <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    <Skeleton variant="text" className="h-3 w-16 bg-white/10" />
                    <Skeleton variant="rect" className="h-6 w-20 rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto h-full p-4 md:p-6 custom-scrollbar text-content-primary">
      <div className="max-w-6xl mx-auto pb-10">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r lg:text-4xl from-white to-zinc-400 bg-clip-text text-transparent">
              {t("hr.title")}
            </h1>
            <p className="text-content-muted text-sm mt-1">
              {t("hr.subTitle")}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] text-sm text-content-secondary transition-colors cursor-pointer">
              <Download className="w-4 h-4" /> Export
            </button>
            {isOwner && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-blue-600/10 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> {t("activeProjects.inviteMember")}
              </button>
            )}
          </div>
        </div>

        {/* TABS CONTROLLER */}
        <div className="flex gap-4 border-b border-white/10 bg-black/20 p-1 rounded-lg mb-6 overflow-x-auto custom-scrollbar select-none">
          {[
            { id: "members", label: t("hr.tabMembers"), icon: Users },
            { id: "requests", label: t("hr.tabApprovals"), icon: ClipboardList },
            { id: "performance", label: t("hr.tabPerformance"), icon: Award },
            ...(isOwner ? [{ id: "roles", label: t("hr.tabPermissions"), icon: Shield }] : [])
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider font-mono transition-all rounded-md cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-content-muted hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT: MEMBERS */}
        {activeTab === "members" && (
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="font-bold text-lg text-white">
                {t("activeProjects.teamMembers")} ({filteredMembers.length})
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, mã số..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-blue-500 text-content-secondary placeholder-content-muted/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((member) => (
                <div
                  key={member.workspaceMemberId}
                  onClick={() => fetchProfile(member)}
                  className="flex items-center justify-between p-4 bg-white/[0.04] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 rounded-xl cursor-pointer transition-all group shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/20 border border-white/10 overflow-hidden flex items-center justify-center font-mono font-bold text-xs text-content-secondary shrink-0 shadow-inner">
                      {member.resource?.avatarUrl ? (
                        <img src={member.resource.avatarUrl} alt={member.resource.fullName} className="w-full h-full object-cover" />
                      ) : (
                        member.resource?.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-semibold text-content-primary text-sm group-hover:text-blue-400 transition-colors">
                          {member.resource?.fullName}
                        </h4>
                        <span className="text-[9px] font-mono text-content-muted bg-black/20 px-1.5 py-0.5 rounded border border-white/10 shrink-0">
                          {member.employeeCode}
                        </span>
                      </div>
                      <p className="text-xs text-content-muted mt-0.5">
                        {member.role?.roleName} •{" "}
                        <span className={member.status === "Active" ? "text-emerald-400 font-medium" : "text-rose-400 font-medium"}>
                          {member.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <button className="text-xs text-content-muted group-hover:text-white font-medium px-3 py-1.5 bg-black/20 group-hover:bg-blue-600/20 rounded-lg border border-white/10 group-hover:border-blue-500/30 transition-all cursor-pointer">
                    Hồ sơ
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CONTENT: REQUESTS & APPROVALS */}
        {activeTab === "requests" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* CỘT TRÁI: FORM NỘP ĐƠN (Cho Member) */}
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 h-max">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                <h3 className="font-bold text-base text-white">{t("hr.createRequest")}</h3>
                <span className="text-[10px] font-mono bg-black/20 text-content-muted border border-white/10 px-2 py-0.5 rounded uppercase">
                  {currentWorkspaceRole?.roleName}
                </span>
              </div>

              <form onSubmit={handleCreateRequest} className="space-y-4">
                <div className="flex bg-black/20 p-0.5 rounded-lg border border-white/10">
                  <button
                    type="button"
                    onClick={() => setRequestType("Leave")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${requestType === "Leave" ? "bg-white/[0.06] text-white shadow" : "text-content-muted hover:text-content-primary"}`}
                  >
                    Nghỉ phép (Leave)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestType("OT")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${requestType === "OT" ? "bg-white/[0.06] text-white shadow" : "text-content-muted hover:text-content-primary"}`}
                  >
                    Tăng ca (OT)
                  </button>
                </div>

                {requestType === "Leave" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-content-muted font-mono uppercase block">{t("common.startDate")}</label>
                      <input
                        type="date"
                        required
                        value={leaveFormData.startDate}
                        onChange={e => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-content-primary focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-content-muted font-mono uppercase block">{t("common.endDate")}</label>
                      <input
                        type="date"
                        required
                        value={leaveFormData.endDate}
                        onChange={e => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-content-primary focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-content-muted font-mono uppercase block">Ngày đăng ký</label>
                      <input
                        type="date"
                        required
                        value={otFormData.requestedDate}
                        onChange={e => setOtFormData({ ...otFormData, requestedDate: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-content-primary focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-content-muted font-mono uppercase block">Số giờ dự kiến</label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        required
                        value={otFormData.expectedHours}
                        onChange={e => setOtFormData({ ...otFormData, expectedHours: Number(e.target.value) })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-content-primary font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] text-content-muted font-mono uppercase block">Lý do cụ thể</label>
                  <textarea
                    rows="3"
                    placeholder="Nhập lý do chi tiết..."
                    required
                    value={requestType === "Leave" ? leaveFormData.reason : otFormData.reason}
                    onChange={e => requestType === "Leave" ? setLeaveFormData({ ...leaveFormData, reason: e.target.value }) : setOtFormData({ ...otFormData, reason: e.target.value })}
                    className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-content-primary focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingRequest}
                  className="w-full py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  {isSubmittingRequest ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Nộp đơn yêu cầu
                </button>
              </form>
            </div>

            {/* CỘT PHẢI: PHÊ DUYỆT ĐƠN & LỊCH SỬ (Cho Admin/Owner hoặc Lịch sử của chính Member) */}
            <div className="xl:col-span-2 bg-white/[0.02] border border-white/10 rounded-xl p-6 flex flex-col gap-6">

              {/* PHẦN ĐƠN CHỜ DUYỆT (Chỉ Admin/Owner có quyền duyệt thấy, hoặc chỉ hiển thị danh sách của Member) */}
              <div>
                <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Yêu cầu chờ xử lý ({pendingLeaves.length + pendingOTs.length})
                </h3>

                {pendingLeaves.length === 0 && pendingOTs.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-white/10 bg-black/10 text-center text-xs text-content-muted italic">
                    Không có yêu cầu chờ xử lý.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Render Đơn Phép Chờ Duyệt */}
                    {pendingLeaves.map(req => (
                      <div key={"leave-" + req.requestId} className="p-4 bg-white/[0.04] border border-white/5 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-white/10 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white">{req.requesterName}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">Nghỉ phép</span>
                          </div>
                          <p className="text-xs text-content-secondary font-mono">
                            Thời gian: {new Date(req.startDate).toLocaleDateString("vi-VN")} đến {new Date(req.endDate).toLocaleDateString("vi-VN")}
                          </p>
                          <p className="text-xs text-content-muted">Lý do: {req.reason}</p>
                        </div>
                        {canApprove && (
                          <div className="flex gap-2 shrink-0">
                            <button
                              disabled={processingRequestId === req.requestId}
                              onClick={() => handleActionRequest("Leave", req.requestId, "deny")}
                              className="px-3 py-1.5 border border-white/10 rounded-lg bg-black/25 text-xs text-content-secondary hover:text-rose-400 hover:bg-rose-950/20 hover:border-rose-900/30 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Từ chối
                            </button>
                            <button
                              disabled={processingRequestId === req.requestId}
                              onClick={() => handleActionRequest("Leave", req.requestId, "approve")}
                              className="px-3 py-1.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt đơn
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Render Đơn OT Chờ Duyệt */}
                    {pendingOTs.map(req => (
                      <div key={"ot-" + req.requestId} className="p-4 bg-white/[0.04] border border-white/5 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-white/10 transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white">{req.requesterName}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">Tăng ca (OT)</span>
                          </div>
                          <p className="text-xs text-content-secondary font-mono">
                            Ngày: {new Date(req.requestedDate).toLocaleDateString("vi-VN")} — Số giờ: <span className="font-bold text-white">{req.expectedHours}h</span>
                          </p>
                          {req.projectName && <p className="text-xs text-content-muted">Dự án: {req.projectName} {req.taskName ? `• Công việc: ${req.taskName}` : ""}</p>}
                          <p className="text-xs text-content-muted">Lý do: {req.reason}</p>
                        </div>
                        {canApprove && (
                          <div className="flex gap-2 shrink-0">
                            <button
                              disabled={processingRequestId === req.requestId}
                              onClick={() => handleActionRequest("OT", req.requestId, "deny")}
                              className="px-3 py-1.5 border border-white/10 rounded-lg bg-black/25 text-xs text-content-secondary hover:text-rose-400 hover:bg-rose-950/20 hover:border-rose-900/30 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Từ chối
                            </button>
                            <button
                              disabled={processingRequestId === req.requestId}
                              onClick={() => handleActionRequest("OT", req.requestId, "approve")}
                              className="px-3 py-1.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt đơn
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* LỊCH SỬ ĐÃ XỬ LÝ */}
              <div>
                <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
                  Lịch sử yêu cầu ({processedLeaves.length + processedOTs.length})
                </h3>

                {processedLeaves.length === 0 && processedOTs.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-white/10 bg-black/10 text-center text-xs text-content-muted italic">
                    Chưa có lịch sử giao dịch.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    {/* Render lịch sử nghỉ phép */}
                    {processedLeaves.map(req => (
                      <div key={"history-leave-" + req.requestId} className="p-3 bg-black/20 border border-white/5 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-content-secondary">{req.requesterName}</span>
                            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-blue-500/5 text-blue-400 border border-blue-500/10 uppercase">Leave</span>
                          </div>
                          <p className="text-[10px] text-content-muted mt-0.5">
                            {new Date(req.startDate).toLocaleDateString("vi-VN")} → {new Date(req.endDate).toLocaleDateString("vi-VN")}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${req.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                            {req.status}
                          </span>
                          {req.approverName && <p className="text-[9px] text-content-muted mt-1">Duyệt bởi: {req.approverName}</p>}
                        </div>
                      </div>
                    ))}

                    {/* Render lịch sử OT */}
                    {processedOTs.map(req => (
                      <div key={"history-ot-" + req.requestId} className="p-3 bg-black/20 border border-white/5 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-content-secondary">{req.requesterName}</span>
                            <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-blue-500/5 text-blue-400 border border-blue-500/10 uppercase">OT</span>
                          </div>
                          <p className="text-[10px] text-content-muted mt-0.5">
                            Ngày: {new Date(req.requestedDate).toLocaleDateString("vi-VN")} ({req.expectedHours}h)
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${req.status === "Approved" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                            {req.status}
                          </span>
                          {req.approverName && <p className="text-[9px] text-content-muted mt-1">Duyệt bởi: {req.approverName}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB CONTENT: PERFORMANCE REVIEWS */}
        {activeTab === "performance" && (
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-lg text-white">
                  {t("activeProjects.reviewCyclesTitle")} ({reviewCycles.length})
                </h3>
                <p className="text-xs text-content-muted mt-0.5">Quản lý và kích hoạt các chu kỳ đánh giá chất lượng công việc nhân sự.</p>
              </div>
              {isOwner && !isCreatingCycle && (
                <button
                  onClick={() => setIsCreatingCycle(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <Plus size={14} /> {t("activeProjects.addCycle")}
                </button>
              )}
            </div>

            {/* FORM TẠO CHU KỲ MỚI */}
            {isCreatingCycle && (
              <form onSubmit={handleCreateReviewCycle} className="bg-black/25 border border-white/10 p-4 rounded-xl space-y-4 mb-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">
                    {t("activeProjects.createCycleTitle")}
                  </h4>
                  <button type="button" onClick={() => setIsCreatingCycle(false)} className="text-xs text-rose-400 hover:underline cursor-pointer">
                    {t("activeProjects.cancelBtn")}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-content-muted uppercase block">{t("activeProjects.cycleName")}</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Thống kê Q1-2026"
                      value={newCycleName}
                      onChange={(e) => setNewCycleName(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-xs text-content-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-content-muted uppercase block">{t("activeProjects.startDate")}</label>
                    <input
                      type="date"
                      required
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-xs text-content-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono text-content-muted uppercase block">{t("activeProjects.endDate")}</label>
                    <input
                      type="date"
                      required
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2 text-xs text-content-primary focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isActionProcessing === "creating"}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-semibold cursor-pointer disabled:opacity-40 transition-colors flex items-center gap-1.5"
                  >
                    {isActionProcessing === "creating" ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    {t("activeProjects.saveDraft")}
                  </button>
                </div>
              </form>
            )}

            {/* BẢNG CHU KỲ ĐÁNH GIÁ */}
            {reviewCycles.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/10 rounded-xl bg-black/10 text-content-muted text-sm italic">
                {t("activeProjects.noCycles")}
              </div>
            ) : (
              <div className="overflow-x-auto w-full border border-white/10 rounded-xl bg-black/20">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03] text-content-muted font-mono uppercase tracking-wider">
                      <th className="p-4 font-semibold">{t("activeProjects.cycleNameTable")}</th>
                      <th className="p-4 font-semibold">{t("activeProjects.startDateTable")}</th>
                      <th className="p-4 font-semibold">{t("activeProjects.endDateTable")}</th>
                      <th className="p-4 font-semibold text-center">{t("activeProjects.statusTable")}</th>
                      <th className="p-4 font-semibold text-right">{t("activeProjects.actionsTable")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-content-secondary">
                    {reviewCycles.map((cycle) => {
                      const cId = cycle.reviewCycleId || cycle.id || cycle.cycleID;
                      const cycleName = cycle.name || cycle.cycleName || "Chu kỳ đánh giá";
                      const startDate = cycle.startDate ? new Date(cycle.startDate).toLocaleDateString("vi-VN") : "---";
                      const endDate = cycle.endDate ? new Date(cycle.endDate).toLocaleDateString("vi-VN") : "---";
                      const status = cycle.status || "Draft";

                      return (
                        <tr key={cId} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-bold text-white text-sm">{cycleName}</td>
                          <td className="p-4 text-content-muted font-mono">{startDate}</td>
                          <td className="p-4 text-content-muted font-mono">{endDate}</td>
                          <td className="p-4 text-center">
                            {status === "Active" ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">Active</span>
                            ) : status === "Completed" ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Completed</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-500/10 text-content-muted border border-white/10">Draft</span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {/* 1. Bắt đầu chu kỳ (Draft -> Active) - Chỉ dành cho Owner */}
                              {status === "Draft" && isOwner && (
                                <button
                                  type="button"
                                  disabled={isActionProcessing !== null}
                                  onClick={() => handleStartReviewCycle(cId)}
                                  className="inline-flex items-center gap-1 bg-blue-600 text-white px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 hover:bg-blue-750 transition-all"
                                >
                                  {isActionProcessing === cId ? <Loader2 size={12} className="animate-spin" /> : <PlayCircle size={12} />}
                                  {t("activeProjects.startCycleBtn")}
                                </button>
                              )}

                              {/* 2. Chu kỳ Active - Phân quyền Đánh giá và Hoàn thành */}
                              {status === "Active" && (
                                <div className="flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
                                  {/* Nút Đánh giá: Dành cho tất cả mọi người trừ Viewer */}
                                  {currentWorkspaceRole?.roleName?.toLowerCase() !== "viewer" && (
                                    <button
                                      type="button"
                                      disabled={isActionProcessing !== null}
                                      onClick={() => handleOpenEvaluationModal(cycle)}
                                      className="inline-flex items-center gap-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-400 px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 transition-all min-w-[max-content]"
                                    >
                                      <Award size={12} />
                                      {t("activeProjects.evaluateBtn")}
                                    </button>
                                  )}

                                  {/* Nút Hoàn thành: Trước hạn chỉ Owner, đúng/sau hạn cho Owner và Admin */}
                                  {(() => {
                                    const isEarly = cycle.endDate ? new Date() < new Date(cycle.endDate) : false;
                                    const canComplete = isOwner || (!isEarly && canManageProfile);
                                    if (canComplete) {
                                      return (
                                        <button
                                          type="button"
                                          disabled={isActionProcessing !== null}
                                          onClick={() => handleCompleteReviewCycle(cId)}
                                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer disabled:opacity-40 transition-colors min-w-[max-content]"
                                        >
                                          {isActionProcessing === cId ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                          {t("activeProjects.completeBtn")}
                                        </button>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              )}

                              {/* 3. Chu kỳ Completed */}
                              {status === "Completed" && (
                                <span className="text-[11px] text-content-muted font-mono italic">{t("activeProjects.noActions")}</span>
                              )}

                              {/* 4. Là Draft nhưng không phải Owner */}
                              {status === "Draft" && !isOwner && (
                                <span className="text-[11px] text-content-muted font-mono italic">{t("activeProjects.noActions")}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: ROLES & PERMISSIONS */}
        {activeTab === "roles" && isOwner && (
          <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">

            {/* CỘT TRÁI: DANH SÁCH ROLE */}
            <div className="w-full md:w-2/5 border-r border-white/10 bg-black/20 p-6 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <span className="text-xs font-bold text-content-muted uppercase tracking-wider font-mono">
                  {t("activeProjects.rolesList")}
                </span>
                {!isCreatingRole ? (
                  <button
                    onClick={() => setIsCreatingRole(true)}
                    className="text-[10px] font-mono font-semibold bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 px-2 py-0.5 rounded cursor-pointer transition-all"
                  >
                    {t("activeProjects.addRole")}
                  </button>
                ) : (
                  <button
                    onClick={() => { setIsCreatingRole(false); setNewRoleName(""); }}
                    className="text-[10px] font-mono text-rose-400 cursor-pointer hover:underline"
                  >
                    {t("activeProjects.cancelRole")}
                  </button>
                )}
              </div>

              {/* Form tạo mới Role */}
              {isCreatingRole && (
                <form onSubmit={handleCreateRole} className="mb-4 bg-white/[0.04] p-2.5 rounded-lg flex items-center gap-2 border border-white/10">
                  <input
                    type="text"
                    required
                    placeholder={t("activeProjects.roleNamePlaceholder")}
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="flex-1 bg-black/20 border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isSavingRole || !newRoleName.trim()}
                    className="bg-blue-600 text-white rounded p-1 cursor-pointer disabled:opacity-40 flex items-center justify-center"
                  >
                    {isSavingRole ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                  </button>
                </form>
              )}

              {/* Danh sách các vai trò */}
              <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                {workspaceRoles.map(role => {
                  const rId = role.workspaceRoleId || role.WorkspaceRoleId;
                  const rName = role.roleName || role.RoleName;
                  const isSelected = selectedRole && (selectedRole.workspaceRoleId === rId || selectedRole.WorkspaceRoleId === rId);
                  const isEditing = editingRoleId === rId;

                  return (
                    <div
                      key={rId}
                      className={`flex items-center justify-between group px-3.5 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-sm"
                          : "hover:bg-white/[0.04] text-content-secondary border-transparent bg-transparent"
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex-1 flex items-center gap-1.5 mr-2">
                          <input
                            type="text"
                            value={editingRoleName}
                            onChange={(e) => setEditingRoleName(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-blue-500"
                          />
                          <button
                            disabled={isSavingRole}
                            onClick={() => handleUpdateRoleName(rId)}
                            className="text-emerald-400 p-0.5 hover:bg-emerald-500/20 rounded cursor-pointer"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={() => setEditingRoleId(null)}
                            className="text-content-muted p-0.5 hover:bg-white/10 rounded cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedRole(role)}
                          className="flex-1 text-left cursor-pointer truncate py-0.5 font-bold hover:text-white"
                        >
                          {rName}
                        </button>
                      )}

                      {!isEditing && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 transition-opacity pl-2">
                          <button
                            onClick={() => { setEditingRoleId(rId); setEditingRoleName(rName); }}
                            className="text-content-muted hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                            title={t("activeProjects.editRoleTitle")}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(rId, rName)}
                            className="text-rose-500 hover:text-rose-400 p-0.5 rounded transition-colors cursor-pointer"
                            title={t("activeProjects.deleteRoleTitle")}
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

            {/* CỘT PHẢI: CONFIG PERMISSIONS */}
            <div className="w-full md:w-3/5 p-6 flex flex-col overflow-hidden">
              {selectedRole ? (
                <>
                  <div className="mb-4 pb-2 border-b border-white/10">
                    <h3 className="text-sm font-bold text-white">
                      {t("activeProjects.configurePermissions")} <span className="text-blue-400 font-mono font-bold">{selectedRole?.roleName || selectedRole?.RoleName}</span>
                    </h3>
                    <p className="text-[11px] text-content-muted mt-1">{t("activeProjects.permissionsSubText")}</p>
                  </div>

                  {/* List Checkbox */}
                  <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
                    {systemPermissions.map((perm) => {
                      if (!perm) return null;
                      const isString = typeof perm === "string";
                      const pId = isString ? perm : (perm.permissionId || perm.PermissionId || perm.id || perm.code);
                      const pName = isString ? perm : (perm.permissionName || perm.PermissionName || perm.name || perm.displayName || pId);
                      const pDesc = isString ? `${t("activeProjects.permissionDefaultDesc")} ${perm}` : (perm.description || perm.Description || t("activeProjects.permissionDefaultDesc"));
                      const isChecked = rolePermissions.includes(pId);

                      return (
                        <label
                          key={pId}
                          className="flex items-start gap-3 p-3 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handlePermissionCheck(pId)}
                            className="mt-0.5 rounded text-blue-600 focus:ring-0 bg-white/[0.02] border-white/10 w-4 h-4 cursor-pointer"
                          />
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold font-mono text-content-primary block bg-white/5 px-2 py-0.5 rounded w-max">
                              {pName}
                            </span>
                            <span className="text-[11px] text-content-secondary block leading-normal pt-1">
                              {pDesc}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Save Button */}
                  <div className="border-t border-white/10 pt-4 mt-4 flex justify-end">
                    <button
                      onClick={handleSavePermissions}
                      disabled={isUpdatingPermissions}
                      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-40"
                    >
                      {isUpdatingPermissions ? <Loader2 size={12} className="animate-spin" /> : t("activeProjects.savePermissionsBtn")}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-content-muted">
                  <ShieldAlert size={36} className="mb-2 text-content-muted/60" />
                  <p className="text-xs">{t("activeProjects.selectRolePrompt")}</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* MODAL CHI TIẾT & CHỈNH SỬA PROFILE */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-6 w-full max-w-xl text-white max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-xl bg-black/20 overflow-hidden border border-white/10 flex items-center justify-center text-base font-bold font-mono text-content-secondary shrink-0">
                  {selectedMember.resource?.avatarUrl ? (
                    <img src={selectedMember.resource.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    selectedMember.resource?.fullName?.[0]
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedMember.resource?.fullName}
                    {selectedMember.status === "Active" && <UserCheck className="w-4 h-4 text-emerald-400" />}
                  </h3>
                  <p className="text-xs text-content-muted font-mono">
                    {selectedMember.role?.roleName} | {selectedMember.employeeCode}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canManageProfile && (
                  <>
                    {!isEditingProfile && (
                      <button onClick={() => setIsEditingProfile(true)} className="p-1.5 text-blue-400 hover:bg-white/5 border border-transparent rounded-lg cursor-pointer" title="Sửa hồ sơ">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {memberProfiles[selectedMember.workspaceMemberId] && (
                      <button onClick={handleDeleteProfile} className="p-1.5 text-rose-400 hover:bg-rose-500/10 border border-transparent rounded-lg cursor-pointer" title="Xóa hồ sơ">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
                {isOwner && selectedMember.resource?.resourceId !== currentUser?.profile?.resourceId && (
                  <button
                    disabled={statusUpdatingId === selectedMember.workspaceMemberId}
                    onClick={() => handleToggleMemberStatus(selectedMember.workspaceMemberId, selectedMember.status === "Active")}
                    className={`p-1.5 border border-transparent rounded-lg cursor-pointer transition-all ${selectedMember.status === "Active" ? "text-rose-400 hover:bg-rose-500/10" : "text-emerald-400 hover:bg-emerald-500/10"}`}
                    title={selectedMember.status === "Active" ? "Deactivate User" : "Activate User"}
                  >
                    {statusUpdatingId === selectedMember.workspaceMemberId ? <Loader2 size={16} className="animate-spin" /> : selectedMember.status === "Active" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                )}
                <button onClick={() => setSelectedMember(null)} className="text-content-muted hover:text-white p-1.5 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            {isEditingProfile && canManageProfile ? (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-blue-400 border-b border-white/10 pb-1.5 font-mono uppercase flex items-center gap-2">
                  <Plus className="w-4 h-4"/> Cấu hình Hồ sơ Năng lực
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-content-muted font-mono block uppercase">{t("hr.experienceYears")}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={editProfileData.priorExperienceYears}
                      onChange={e => setEditProfileData({ ...editProfileData, priorExperienceYears: e.target.value === "" ? "" : Number(e.target.value) })}
                      className="w-full bg-black/20 border border-white/10 p-2 text-xs rounded-lg font-mono text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-content-muted font-mono block uppercase">{t("hr.educationLevel")}</label>
                    <select
                      value={editProfileData.educationLevel}
                      onChange={e => setEditProfileData({ ...editProfileData, educationLevel: e.target.value })}
                      className="w-full bg-[#1A1A1C] border border-white/10 p-2 text-xs rounded-lg text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="High School" className="bg-[#1A1A1C] text-white">High School</option>
                      <option value="Diploma" className="bg-[#1A1A1C] text-white">Diploma</option>
                      <option value="Bachelor" className="bg-[#1A1A1C] text-white">Bachelor</option>
                      <option value="Master" className="bg-[#1A1A1C] text-white">Master</option>
                      <option value="PhD" className="bg-[#1A1A1C] text-white">PhD</option>
                    </select>
                  </div>
                </div>

                {/* Cấu hình Vai trò, Lương & OT (chỉ khi có quyền manage) */}
                <h4 className="text-xs font-bold text-blue-400 border-b border-white/10 pb-1.5 pt-2 font-mono uppercase flex items-center gap-2">
                  <Shield className="w-4 h-4"/> Phân quyền & Đãi ngộ
                </h4>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-content-muted font-mono block uppercase">Vai trò thành viên (Role)</label>
                    <select
                      value={editSalaryData.roleId}
                      onChange={e => setEditSalaryData({ ...editSalaryData, roleId: e.target.value })}
                      className="w-full bg-[#1A1A1C] border border-white/10 p-2 text-xs rounded-lg text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#1A1A1C] text-white">-- Chọn vai trò --</option>
                      {workspaceRoles
                        .filter(r => r.roleName?.toLowerCase() !== "owner")
                        .map(role => (
                          <option key={role.workspaceRoleId || role.WorkspaceRoleId} value={role.workspaceRoleId || role.WorkspaceRoleId} className="bg-[#1A1A1C] text-white">
                            {role.roleName}
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-content-muted font-mono block uppercase">Lương cơ bản / Tháng (VND)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={new Intl.NumberFormat("vi-VN").format(editSalaryData.baseSalaryMonth || 0)}
                        onChange={e => {
                          const clean = e.target.value.replace(/\D/g, "");
                          setEditSalaryData({ ...editSalaryData, baseSalaryMonth: Number(clean) || 0 });
                        }}
                        className="w-full bg-black/20 border border-white/10 p-2 text-xs rounded-lg font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-content-muted font-mono block uppercase">Tỷ giá OT / Giờ (VND)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={new Intl.NumberFormat("vi-VN").format(editSalaryData.otRatePerHour || 0)}
                        onChange={e => {
                          const clean = e.target.value.replace(/\D/g, "");
                          setEditSalaryData({ ...editSalaryData, otRatePerHour: Number(clean) || 0 });
                        }}
                        className="w-full bg-black/20 border border-white/10 p-2 text-xs rounded-lg font-mono text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-black/20 rounded-lg border border-white/10 text-xs text-content-muted space-y-1.5">
                  <p className="font-semibold text-content-secondary">💡 Lưu ý từ hệ thống:</p>
                  <p>• Các chỉ số chuyên môn, kỹ năng mềm và xếp loại hiệu suất được tổng hợp tự động sau khi kết thúc các đợt Review định kỳ.</p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10">
                  <button onClick={() => setIsEditingProfile(false)} className="flex-1 py-2 text-xs bg-black/20 hover:bg-white/[0.04] border border-white/10 rounded-lg text-content-secondary font-semibold transition-all cursor-pointer">
                    {t("activeProjects.cancelBtn")}
                  </button>
                  <button onClick={handleSaveProfile} className="flex-1 py-2 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10 transition-colors cursor-pointer">
                    <Save className="w-3.5 h-3.5"/> {t("common.save")}
                  </button>
                </div>
              </div>
            ) : memberProfiles[selectedMember.workspaceMemberId] && canViewProfile ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/10">
                    <span className="text-[9px] text-content-muted font-mono block uppercase tracking-wider">{t("hr.performanceRating")}</span>
                    <span className="text-sm font-bold font-mono text-white block mt-1">
                      {memberProfiles[selectedMember.workspaceMemberId].performanceRating || "N/A"}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/10">
                    <span className="text-[9px] text-content-muted font-mono block uppercase tracking-wider">{t("hr.educationLevel")}</span>
                    <span className="text-xs font-bold text-white mt-1.5 block truncate">
                      {memberProfiles[selectedMember.workspaceMemberId].educationLevel || "N/A"}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/10">
                    <span className="text-[9px] text-content-muted font-mono block uppercase tracking-wider">Chuyên Cần</span>
                    <span className="text-sm font-bold font-mono text-white block mt-1">
                      {memberProfiles[selectedMember.workspaceMemberId].attendanceRate ?? 100}%
                    </span>
                  </div>
                  <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/10">
                    <span className="text-[9px] text-content-muted font-mono block uppercase tracking-wider">Kinh Nghiệm</span>
                    <span className="text-sm font-bold font-mono text-white block mt-1">
                      {memberProfiles[selectedMember.workspaceMemberId].totalExperienceYears ?? 0} Năm
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs mb-3 text-white border-b border-white/10 pb-2 font-mono uppercase tracking-wider">
                    {t("hr.skillsRadar")}
                  </h4>
                  <div className="space-y-3 font-mono">
                    {[
                      { l: "Technical Skills", v: memberProfiles[selectedMember.workspaceMemberId].technicalSkillScore ?? 0, c: "bg-blue-400" },
                      { l: "Communication", v: memberProfiles[selectedMember.workspaceMemberId].communicationScore ?? 0, c: "bg-sky-400" },
                      { l: "Problem Solving", v: memberProfiles[selectedMember.workspaceMemberId].problemSolvingScore ?? 0, c: "bg-emerald-500" },
                      { l: "Leadership", v: memberProfiles[selectedMember.workspaceMemberId].leadershipScore ?? 0, c: "bg-amber-500" },
                    ].map((skill) => (
                      <div key={skill.l} className="flex items-center gap-4">
                        <span className="text-xs text-content-secondary w-28 shrink-0">{skill.l}</span>
                        <div className="flex-1 h-1.5 bg-black/20 rounded-full overflow-hidden border border-white/10">
                          <div className={`h-full ${skill.c} transition-all duration-500`} style={{ width: `${skill.v}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-white w-16 text-right">{Math.round(skill.v)}/100</span>
                      </div>
                    ))}
                  </div>
                </div>

                {(hasPermission("member_profiles:manage") || isOwner) && (
                  <div>
                    <h4 className="font-bold text-xs mb-3 text-white border-b border-white/10 pb-2 font-mono uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400"/> Phân quyền & Đãi ngộ
                    </h4>
                    {isSalaryLoading ? (
                      <div className="flex items-center gap-2 text-xs text-content-muted">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang tải thông tin lương & OT...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs text-content-secondary">
                        <div className="bg-white/[0.01] p-3 rounded-lg border border-white/5 space-y-1">
                          <span className="text-[10px] text-content-muted uppercase block">Lương cơ bản / Tháng</span>
                          <span className="text-sm font-bold text-white">
                            {salaryOTData[selectedMember.workspaceMemberId]
                              ? new Intl.NumberFormat("vi-VN").format(salaryOTData[selectedMember.workspaceMemberId].baseSalaryMonth) + " VND"
                              : "0 VND"}
                          </span>
                        </div>
                        <div className="bg-white/[0.01] p-3 rounded-lg border border-white/5 space-y-1">
                          <span className="text-[10px] text-content-muted uppercase block">Tỷ giá OT / Giờ</span>
                          <span className="text-sm font-bold text-white">
                            {salaryOTData[selectedMember.workspaceMemberId]
                              ? new Intl.NumberFormat("vi-VN").format(salaryOTData[selectedMember.workspaceMemberId].otRatePerHour) + " VND"
                              : "0 VND"}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <span className="text-[10px] text-content-muted font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Cập nhật lần cuối:{" "}
                    {memberProfiles[selectedMember.workspaceMemberId].lastEvaluatedAt ?
                      new Date(memberProfiles[selectedMember.workspaceMemberId].lastEvaluatedAt).toLocaleDateString("vi-VN") : "N/A"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center flex flex-col items-center">
                {!canViewProfile ? (
                  <p className="text-sm text-content-muted mb-4">Bạn không có quyền xem thông tin hồ sơ năng lực này.</p>
                ) : (
                  <>
                    <p className="text-sm text-content-muted mb-4">Thành viên này chưa được khởi tạo hồ sơ năng lực.</p>
                    {canManageProfile && (
                      <button onClick={() => setIsEditingProfile(true)} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-750 transition-all cursor-pointer">
                        Khởi tạo Profile ngay
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL MỜI THÀNH VIÊN */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-md p-6 shadow-2xl relative overflow-y-auto text-white">
            <button onClick={() => setIsInviteModalOpen(false)} className="absolute right-4 top-4 text-content-muted hover:text-white cursor-pointer">
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold text-blue-400 mb-4 font-mono uppercase tracking-wider">
              {t("activeProjects.inviteTitle")}
            </h2>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-content-muted uppercase block">{t("activeProjects.emailRequired")}</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-content-muted uppercase block">{t("activeProjects.workspaceRole")}</label>
                <select
                  value={inviteRoleId}
                  onChange={(e) => setInviteRoleId(e.target.value)}
                  className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  {workspaceRoles.map((role) => {
                    const roleId = role.workspaceRoleId || role.WorkspaceRoleId;
                    return (
                      <option key={roleId} value={roleId} className="bg-[#1A1A1C] text-white">
                        {role.roleName || role.RoleName} (ID: {roleId})
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-content-muted uppercase block">{t("activeProjects.baseSalary")}</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={t("activeProjects.baseSalaryPlaceholder")}
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(formatInputAmount(e.target.value))}
                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <DollarSign className="w-3.5 h-3.5 text-content-muted absolute left-2.5 top-2.5" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-content-muted uppercase block">{t("activeProjects.otRate")}</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={t("activeProjects.otRatePlaceholder")}
                    value={otRate}
                    onChange={(e) => setOtRate(formatInputAmount(e.target.value))}
                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <DollarSign className="w-3.5 h-3.5 text-content-muted absolute left-2.5 top-2.5" />
                </div>
              </div>
              <div className="border-t border-white/10 pt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="px-4 py-2 border border-white/10 rounded-lg bg-black/20 text-content-secondary text-xs font-semibold hover:bg-white/[0.04] transition-all cursor-pointer"
                >
                  {t("activeProjects.cancelBtn")}
                </button>
                <button
                  type="submit"
                  disabled={isInviting || !inviteEmail}
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                >
                  {isInviting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  {t("activeProjects.sendInvite")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NỘP ĐÁNH GIÁ HIỆU SUẤT */}
      {isEvaluatingCycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl w-full max-w-lg p-6 shadow-2xl relative overflow-y-auto max-h-[90vh] text-white">
            <button onClick={() => setIsEvaluatingCycle(null)} className="absolute right-4 top-4 text-content-muted hover:text-white cursor-pointer">
              <X size={18} />
            </button>
            <h2 className="text-sm font-bold text-blue-400 mb-5 font-mono uppercase tracking-wider">
              {t("activeProjects.evaluationModalTitle")}
            </h2>
            <div className="text-xs text-content-muted mb-4 border-b border-white/5 pb-2">
              <span className="font-semibold text-content-primary">Chu kỳ: </span>
              <span className="font-mono text-blue-400">{isEvaluatingCycle.name || isEvaluatingCycle.cycleName}</span>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-4">
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-mono text-content-muted uppercase block">{t("activeProjects.revieweeLabel")}</label>
                {(() => {
                  const selectedReviewee = members.find(m => (m.workspaceMemberId || m.workspaceMemberID) === Number(evalRevieweeId));
                  return (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsRevieweeDropdownOpen(!isRevieweeDropdownOpen)}
                        className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white text-left cursor-pointer focus:outline-none focus:border-blue-500 flex items-center justify-between"
                      >
                        <span>
                          {selectedReviewee 
                            ? `${selectedReviewee.resource?.fullName} (${selectedReviewee.employeeCode})` 
                            : "-- Chọn nhân sự --"}
                        </span>
                        <ChevronDown size={14} className={`text-content-muted transition-transform ${isRevieweeDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {isRevieweeDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setIsRevieweeDropdownOpen(false)} />
                          <div className="absolute left-0 right-0 mt-1 bg-[#1A1A1C] border border-white/10 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
                            {members.filter(m => m.status === "Active").map((member) => {
                              const mId = member.workspaceMemberId || member.workspaceMemberID;
                              const hasEval = (evaluationsList || []).some(
                                e => e.revieweeID === Number(mId) && e.reviewerID === Number(evalReviewerId)
                              );
                              return (
                                <button
                                  key={mId}
                                  type="button"
                                  onClick={() => {
                                    setEvalRevieweeId(mId.toString());
                                    setIsRevieweeDropdownOpen(false);
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs hover:bg-white/[0.04] transition-colors flex items-center justify-between ${
                                    Number(evalRevieweeId) === mId ? "bg-white/[0.02]" : ""
                                  }`}
                                >
                                  <span className="text-white">
                                    {member.resource?.fullName} ({member.employeeCode})
                                  </span>
                                  {hasEval && (
                                    <span className="text-emerald-400 font-semibold shrink-0 ml-2">
                                      - {t("activeProjects.evaluatedTag")}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-mono text-content-muted uppercase block">{t("activeProjects.evalTypeLabel")}</label>
                <button
                  type="button"
                  onClick={() => setIsEvalTypeDropdownOpen(!isEvalTypeDropdownOpen)}
                  className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-xs text-white text-left cursor-pointer focus:outline-none focus:border-blue-500 flex items-center justify-between"
                >
                  <span>
                    {evalType === "Self" && t("activeProjects.evalTypeSelf")}
                    {evalType === "Manager" && t("activeProjects.evalTypeManager")}
                    {evalType === "Peer" && t("activeProjects.evalTypePeer")}
                  </span>
                  <ChevronDown size={14} className={`text-content-muted transition-transform ${isEvalTypeDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isEvalTypeDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsEvalTypeDropdownOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1 bg-[#1A1A1C] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                      {[
                        { val: "Self", label: t("activeProjects.evalTypeSelf") },
                        { val: "Manager", label: t("activeProjects.evalTypeManager") },
                        { val: "Peer", label: t("activeProjects.evalTypePeer") }
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => {
                            setEvalType(item.val);
                            setIsEvalTypeDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs hover:bg-white/[0.04] text-white transition-colors flex items-center justify-between ${
                            evalType === item.val ? "bg-white/[0.02] text-blue-400 font-semibold" : ""
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-content-muted uppercase block text-center sm:text-left sm:min-h-[28px]">{t("activeProjects.communicationScoreLabel")}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={evalCommScore}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setEvalCommScore("");
                      } else {
                        const num = Number(val);
                        if (!isNaN(num)) {
                          setEvalCommScore(Math.min(100, Math.max(0, num)));
                        }
                      }
                    }}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-content-muted uppercase block text-center sm:text-left sm:min-h-[28px]">{t("activeProjects.leadershipScoreLabel")}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={evalLeadScore}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setEvalLeadScore("");
                      } else {
                        const num = Number(val);
                        if (!isNaN(num)) {
                          setEvalLeadScore(Math.min(100, Math.max(0, num)));
                        }
                      }
                    }}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-content-muted uppercase block text-center sm:text-left sm:min-h-[28px]">{t("activeProjects.problemSolvingScoreLabel")}</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={evalProbScore}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "") {
                        setEvalProbScore("");
                      } else {
                        const num = Number(val);
                        if (!isNaN(num)) {
                          setEvalProbScore(Math.min(100, Math.max(0, num)));
                        }
                      }
                    }}
                    className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-center"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-content-muted uppercase block">{t("activeProjects.feedbackNotesLabel")}</label>
                <textarea
                  rows="3"
                  placeholder="Ghi chú đánh giá hiệu suất của nhân sự trong chu kỳ..."
                  value={evalFeedback}
                  onChange={(e) => setEvalFeedback(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-white/10 resize-none"
                />
              </div>

              <div className="border-t border-white/10 pt-5 flex justify-end gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsEvaluatingCycle(null)}
                  className="px-4 py-2 border border-white/10 rounded-lg bg-black/20 text-content-secondary text-xs font-semibold hover:bg-white/[0.04] transition-all cursor-pointer min-w-[80px]"
                >
                  {t("activeProjects.cancelBtn")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEval || !evalRevieweeId || !evalReviewerId}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/10 cursor-pointer min-w-[120px] justify-center"
                >
                  {isSubmittingEval ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  {t("activeProjects.submitEvalBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
