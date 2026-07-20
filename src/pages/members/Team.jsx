import { useState, useEffect } from "react";
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
  Send
} from "lucide-react";
import WorkspaceService from "../../services/WorkspaceService";
import { useOutletContext } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";

export default function Team() {
  const { workspaceId } = useOutletContext() || { workspaceId: 12 };
  const { currentUser, currentWorkspaceRole, hasPermission } = useUser();

  const [members, setMembers] = useState([]);
  const [memberProfiles, setMemberProfiles] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // States hỗ trợ Edit Profile
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    priorExperienceYears: 0,
    educationLevel: "Bachelor"
  });

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [otRequests, setOtRequests] = useState([]);
  const [reviewCycles, setReviewCycles] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // States hỗ trợ Tạo đơn mới (Dành cho Member)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [requestType, setRequestType] = useState("Leave"); // Leave hoặc OT
  const [leaveFormData, setLeaveFormData] = useState({ startDate: "", endDate: "", reason: "" });
  const [otFormData, setOtFormData] = useState({ requestedDate: "", expectedHours: 1, reason: "" });

  // Kiểm tra quyền động cho chức năng Hồ sơ năng lực & Approval
  const canViewProfile = hasPermission("member_profiles:view");
  const canManageProfile = hasPermission("member_profiles:manage");
  
  // ĐIỀU KIỆN PHÂN QUYỀN DUYỆT ĐƠN: Là Owner HOẶC có quyền "request:approve"
  const isOwner = currentWorkspaceRole?.roleName?.toLowerCase() === "owner";
  const canApprove = isOwner || hasPermission("request:approve");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const memRes = await WorkspaceService.getWorkspaceMembers(workspaceId);
        setMembers(memRes.items || memRes || []);

        const leaves = await WorkspaceService.getLeaveRequests(workspaceId);
        setLeaveRequests(leaves || []);

        const ots = await WorkspaceService.getOTRequests(workspaceId);
        setOtRequests(ots || []);

        const cycles = await WorkspaceService.getReviewCycles(workspaceId);
        setReviewCycles(cycles || []);

        const evalsMap = {};
        for (const c of (cycles || [])) {
          const evals = await WorkspaceService.getEvaluations(workspaceId, c.cycleID);
          evalsMap[c.cycleID] = evals || [];
        }
        setEvaluations(evalsMap);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [workspaceId]);

  const fetchProfile = async (member) => {
    setSelectedMember(member);
    setIsEditing(false);
    try {
      const p = await WorkspaceService.getMemberProfile(workspaceId, member.workspaceMemberId);
      if (p) {
        setMemberProfiles((prev) => ({ ...prev, [member.workspaceMemberId]: p }));
        setEditFormData({
          priorExperienceYears: p.priorExperienceYears ?? 0,
          educationLevel: p.educationLevel || "Bachelor"
        });
      } else {
        resetForm();
      }
    } catch (e) {
      console.log("Profile chưa tồn tại hoặc lỗi:", e);
      resetForm();
    }
  };

  const resetForm = () => {
    setEditFormData({
      priorExperienceYears: 0,
      educationLevel: "Bachelor"
    });
  };

  const handleSaveProfile = async () => {
    if (!canManageProfile) return alert("Bạn không có quyền thực hiện thao tác này.");
    try {
      const profileExists = memberProfiles[selectedMember.workspaceMemberId];
      
      const payload = {
        priorExperienceYears: Math.floor(Number(editFormData.priorExperienceYears ?? 0)),
        educationLevel: editFormData.educationLevel || "Bachelor"
      };
      
      if (profileExists) {
        await WorkspaceService.updateMemberProfile(workspaceId, selectedMember.workspaceMemberId, payload);
      } else {
        await WorkspaceService.createMemberProfile(workspaceId, selectedMember.workspaceMemberId, payload);
      }

      const updatedProfile = await WorkspaceService.getMemberProfile(workspaceId, selectedMember.workspaceMemberId);
      
      if (updatedProfile) {
        setMemberProfiles((prev) => ({ ...prev, [selectedMember.workspaceMemberId]: updatedProfile }));
        setEditFormData({
          priorExperienceYears: updatedProfile.priorExperienceYears ?? 0,
          educationLevel: updatedProfile.educationLevel || "Bachelor"
        });
      }

      setIsEditing(false);
      alert("Cập nhật hồ sơ năng lực thành công!");
    } catch (e) {
      alert("Lỗi lưu hồ sơ: " + e.message);
    }
  };

  const handleDeleteProfile = async () => {
    if (!canManageProfile) return alert("Bạn không có quyền thực hiện thao tác này.");
    if (!window.confirm("Bạn có chắc chắn muốn xóa hồ sơ năng lực này không?")) return;
    try {
      await WorkspaceService.deleteMemberProfile(workspaceId, selectedMember.workspaceMemberId);
      setMemberProfiles((prev) => {
        const copy = { ...prev };
        delete copy[selectedMember.workspaceMemberId];
        return copy;
      });
      resetForm();
      setIsEditing(false);
      setSelectedMember(null);
      alert("Đã xóa hồ sơ thành công!");
    } catch (e) {
      alert("Lỗi khi xóa hồ sơ: " + e.message);
    }
  };

  // Xử lý duyệt/từ chối đơn hàng loạt (Dành cho cấp duyệt)
  const handleActionRequest = async (type, id, action) => {
    if (!canApprove) return alert("Bạn không có quyền duyệt đơn từ.");
    try {
      const status = action === "approve" ? "Approved" : "Rejected";
      const updatedReq = await WorkspaceService.approveRequest(type, id, {
        status,
        approvalNote: `Được duyệt bởi hệ thống quản lý`,
      });

      if (type === "Leave") {
        setLeaveRequests((prev) => prev.map((r) => (r.requestId === id ? updatedReq : r)));
      } else {
        setOtRequests((prev) => prev.map((r) => (r.requestId === id ? updatedReq : r)));
      }
      alert(`${action === "approve" ? "Phê duyệt" : "Từ chối"} đơn ${type} thành công!`);
    } catch (e) {
      alert("Lỗi duyệt đơn: " + e.message);
    }
  };

  // Xử lý nộp đơn mới (Dành cho Member)
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      if (requestType === "Leave") {
        const newLeave = await WorkspaceService.createLeaveRequest(workspaceId, leaveFormData);
        setLeaveRequests((prev) => [newLeave, ...prev]);
        setLeaveFormData({ startDate: "", endDate: "", reason: "" });
      } else {
        const newOt = await WorkspaceService.createOTRequest(workspaceId, otFormData);
        setOtRequests((prev) => [newOt, ...prev]);
        setOtFormData({ requestedDate: "", expectedHours: 1, reason: "" });
      }
      setShowCreateForm(false);
      alert("Nộp đơn yêu cầu thành công!");
    } catch (e) {
      alert("Lỗi khi gửi đơn: " + e.message);
    }
  };

  const filteredMembers = members.filter(m => 
    m.resource?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = [
    ...leaveRequests.filter((r) => r.status === "Pending").map((r) => ({ ...r, type: "Leave" })),
    ...otRequests.filter((r) => r.status === "Pending").map((r) => ({ ...r, type: "OT" }))
  ];

  return (
    <div className="flex-1 overflow-y-auto h-full p-4 md:p-6 custom-scrollbar text-white bg-zinc-950">
      <div className="max-w-6xl mx-auto pb-10">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r lg:text-4xl from-white to-zinc-400 bg-clip-text text-transparent">Team Overview</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Quản lý thành viên, cập nhật hồ sơ kỹ năng, duyệt đơn từ (Leave/OT) và theo dõi đợt Performance Review.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-zinc-800 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-sm text-zinc-300 transition-colors cursor-pointer">
              <Download className="w-4 h-4" /> Export
            </button>
            {isOwner && (
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors shadow-lg shadow-blue-600/20 cursor-pointer">
                <UserPlus className="w-4 h-4" /> Mời Thành Viên
              </button>
            )}
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          
          {/* CORE TEAM LIST */}
          <div className="xl:col-span-2 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h3 className="font-bold text-lg text-white">
                Thành viên ban dự án ({filteredMembers.length})
              </h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, mã số..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-blue-500 text-zinc-200 placeholder-zinc-600"
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-20 text-zinc-500 text-sm animate-pulse">
                Đang tải dữ liệu thành viên...
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 text-sm">
                Không tìm thấy thành viên nào phù hợp.
              </div>
            ) : (
              <div className="space-y-3 max-h-[550px] overflow-y-auto custom-scrollbar pr-2">
                {filteredMembers.map((member) => (
                  <div
                    key={member.workspaceMemberId}
                    onClick={() => fetchProfile(member)}
                    className="flex items-center justify-between p-3.5 bg-zinc-900/20 hover:bg-zinc-800/40 rounded-xl transition-all border border-zinc-900 hover:border-zinc-800 cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-zinc-800 overflow-hidden border border-zinc-700 flex items-center justify-center font-mono font-bold text-sm text-zinc-400 shrink-0 shadow-inner">
                        {member.resource?.avatarUrl ? (
                          <img src={member.resource.avatarUrl} alt={member.resource.fullName} className="w-full h-full object-cover" />
                        ) : (
                          member.resource?.fullName?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-zinc-100 text-sm group-hover:text-blue-400 transition-colors">
                            {member.resource?.fullName}
                          </h4>
                          <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 shrink-0">
                            {member.employeeCode}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          {member.role?.roleName} •{" "}
                          <span className={member.status === "Active" ? "text-emerald-400 font-medium" : "text-amber-500"}>
                            {member.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button className="text-xs text-zinc-400 group-hover:text-white font-medium px-3 py-1.5 bg-zinc-900 group-hover:bg-blue-600/20 rounded-lg border border-zinc-800 group-hover:border-blue-500/30 transition-all">
                      Hồ sơ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR RIGHT: APPROVAL / CREATE REQUEST & PERFORMANCE */}
          <div className="space-y-6 flex flex-col">
            
            {/* BLOCK APPROVAL (ĐỘNG THEO QUYỀN VÀ ROLE) */}
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-6 flex flex-col h-[320px]">
              
              {/* THỨ 1: NẾU CÓ QUYỀN DUYỆT -> HIỂN THỊ HỘP THƯ PHÊ DUYỆT */}
              {canApprove ? (
                <>
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-zinc-400" />
                      <h3 className="font-bold text-sm text-zinc-200">Duyệt Đơn Yêu Cầu</h3>
                    </div>
                    {pendingRequests.length > 0 && (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                        {pendingRequests.length} Chờ
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {isLoading ? (
                      <p className="text-xs text-zinc-600 italic py-4 text-center">Loading...</p>
                    ) : pendingRequests.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-zinc-500 text-xs italic">
                        Không có đơn từ nào cần xử lý.
                      </div>
                    ) : (
                      pendingRequests.map((req) => (
                        <div key={req.requestId + req.type} className="bg-zinc-950/40 border border-zinc-800/60 p-3 rounded-lg hover:border-zinc-700 transition-colors">
                          <div className="flex justify-between items-start mb-1.5">
                            <h4 className="text-xs font-semibold text-zinc-200">{req.requesterName}</h4>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${req.type === "Leave" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                              {req.type}
                            </span>
                          </div>

                          <p className="text-[11px] text-zinc-400 font-mono mb-3">
                            {req.type === "Leave" ? `${req.startDate} đến ${req.endDate}` : `${req.requestedDate} — ${req.expectedHours}h`}
                          </p>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleActionRequest(req.type, req.requestId, "deny")}
                              className="flex-1 py-1 flex items-center justify-center gap-1 text-[11px] border border-zinc-800 rounded-md bg-zinc-900 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 hover:border-rose-900/40 transition-all cursor-pointer"
                            >
                              <XCircle className="w-3 h-3" /> Từ Chối
                            </button>
                            <button
                              onClick={() => handleActionRequest(req.type, req.requestId, "approve")}
                              className="flex-1 py-1 flex items-center justify-center gap-1 text-[11px] bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 rounded-md hover:bg-emerald-600/20 transition-all cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Duyệt
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                /* THỨ 2: NẾU LÀ THÀNH VIÊN THƯỜNG KHÔNG CÓ QUYỀN DUYỆT -> HIỂN THỊ PHẦN TẠO ĐƠN */
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <h3 className="font-bold text-sm text-zinc-200">Tạo Đơn Yêu Cầu</h3>
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-0.5 rounded">Member</span>
                  </div>

                  {!showCreateForm ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 bg-zinc-950/20 border border-dashed border-zinc-800 rounded-lg">
                      <p className="text-xs text-zinc-500 mb-3">Bạn cần xin nghỉ phép hoặc đăng ký tăng ca công việc?</p>
                      <button 
                        onClick={() => setShowCreateForm(true)}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 rounded-lg text-xs font-medium transition-all cursor-pointer"
                      >
                        Tạo đơn mới ngay
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCreateRequest} className="flex-1 flex flex-col justify-between overflow-y-auto custom-scrollbar pr-1">
                      <div className="space-y-2">
                        <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
                          <button 
                            type="button"
                            onClick={() => setRequestType("Leave")}
                            className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all ${requestType === "Leave" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                          >
                            Nghỉ phép (Leave)
                          </button>
                          <button 
                            type="button"
                            onClick={() => setRequestType("OT")}
                            className={`flex-1 py-1 text-[11px] font-medium rounded-md transition-all ${requestType === "OT" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                          >
                            Tăng ca (OT)
                          </button>
                        </div>

                        {requestType === "Leave" ? (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-zinc-500 block mb-0.5">Từ ngày</label>
                              <input type="date" required value={leaveFormData.startDate} onChange={e => setLeaveFormData({...leaveFormData, startDate: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] text-zinc-200 focus:outline-none focus:border-blue-500"/>
                            </div>
                            <div>
                              <label className="text-[10px] text-zinc-500 block mb-0.5">Đến ngày</label>
                              <input type="date" required value={leaveFormData.endDate} onChange={e => setLeaveFormData({...leaveFormData, endDate: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] text-zinc-200 focus:outline-none focus:border-blue-500"/>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-zinc-500 block mb-0.5">Ngày tăng ca</label>
                              <input type="date" required value={otFormData.requestedDate} onChange={e => setOtFormData({...otFormData, requestedDate: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] text-zinc-200 focus:outline-none focus:border-blue-500"/>
                            </div>
                            <div>
                              <label className="text-[10px] text-zinc-500 block mb-0.5">Số giờ dự kiến</label>
                              <input type="number" min="1" max="24" required value={otFormData.expectedHours} onChange={e => setOtFormData({...otFormData, expectedHours: Number(e.target.value)})} className="w-full bg-zinc-950 border border-zinc-800 rounded p-1 text-[11px] font-mono text-zinc-200 focus:outline-none focus:border-blue-500"/>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="text-[10px] text-zinc-500 block mb-0.5">Lý do</label>
                          <input 
                            type="text" 
                            placeholder="Nhập lý do chi tiết..."
                            required
                            value={requestType === "Leave" ? leaveFormData.reason : otFormData.reason}
                            onChange={e => requestType === "Leave" ? setLeaveFormData({...leaveFormData, reason: e.target.value}) : setOtFormData({...otFormData, reason: e.target.value})}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-[11px] text-zinc-200 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2 shrink-0">
                        <button type="button" onClick={() => setShowCreateForm(false)} className="flex-1 py-1 text-[11px] bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded transition-colors">Hủy</button>
                        <button type="submit" className="flex-1 py-1 text-[11px] bg-blue-600 hover:bg-blue-700 text-white rounded font-medium flex items-center justify-center gap-1 transition-colors"><Send className="w-3 h-3"/> Gửi đơn</button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Performance Cycle Monitor */}
            <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-xl p-6 flex flex-col flex-1 min-h-[250px]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-zinc-400" />
                  <h3 className="font-bold text-sm text-zinc-200">Đánh Giá Định Kỳ</h3>
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <p className="text-xs text-zinc-600 italic py-4 text-center">Loading...</p>
                ) : reviewCycles.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-zinc-500 text-xs italic">
                    Chưa mở chu kỳ đánh giá nào.
                  </div>
                ) : (
                  reviewCycles.map((cycle) => {
                    const cycleEvals = evaluations[cycle.cycleID] || [];
                    const selfEvals = cycleEvals.filter((e) => e.evaluationType === "Self").length;
                    const isLive = cycle.status === "Active";

                    return (
                      <div key={cycle.cycleID} className="bg-zinc-950/40 border border-zinc-800/60 p-3 rounded-lg flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2.5">
                            <h4 className="text-xs font-semibold text-zinc-200 line-clamp-1 pr-2">{cycle.cycleName}</h4>
                            {isLive && (
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 animate-pulse">
                                Live
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5 font-mono text-[11px]">
                            <div className="flex justify-between items-center bg-zinc-900/30 p-1.5 rounded border border-zinc-800/40">
                              <span className="text-zinc-500">Tự đánh giá:</span>
                              <span className="text-purple-400 font-bold">{selfEvals} / {members.length}</span>
                            </div>
                            <div className="flex justify-between items-center bg-zinc-900/30 p-1.5 rounded border border-zinc-800/40">
                              <span className="text-zinc-500">Hạn chót:</span>
                              <span className="text-zinc-300 font-bold text-[10px]">{cycle.endDate}</span>
                            </div>
                          </div>
                        </div>

                        <button className="w-full mt-3 py-1.5 text-[11px] font-mono flex items-center justify-center gap-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-md transition-colors cursor-pointer">
                          <TrendingUp className="w-3.5 h-3.5" /> Xem Chi Tiết
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* MODAL CHI TIẾT & CHỈNH SỬA PROFILE */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-xl text-white animate-scaleUp max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-xl bg-zinc-800 overflow-hidden border border-zinc-700 flex items-center justify-center text-lg font-bold font-mono">
                  {selectedMember.resource?.avatarUrl ? (
                    <img src={selectedMember.resource.avatarUrl} className="w-full h-full object-cover" />
                  ) : (
                    selectedMember.resource?.fullName?.[0]
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {selectedMember.resource?.fullName}
                    {selectedMember.status === "Active" && <UserCheck className="w-4 h-4 text-emerald-400" />}
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono">
                    {selectedMember.role?.roleName} | {selectedMember.employeeCode}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canManageProfile && (
                  <>
                    {!isEditing && (
                      <button onClick={() => setIsEditing(true)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 rounded-lg transition-all cursor-pointer" title="Chỉnh sửa hồ sơ">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {memberProfiles[selectedMember.workspaceMemberId] && (
                      <button onClick={handleDeleteProfile} className="p-1.5 text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-blue-500/20 rounded-lg transition-all cursor-pointer" title="Xóa hồ sơ">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => setSelectedMember(null)} className="text-zinc-500 hover:text-white p-1.5 transition-colors cursor-pointer">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            {isEditing && canManageProfile ? (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-blue-400 border-b border-zinc-800 pb-1.5 flex items-center gap-2">
                  <Plus className="w-4 h-4"/> Thiết lập Hồ sơ Năng lực
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Số năm kinh nghiệm trước đây</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      value={editFormData.priorExperienceYears} 
                      onChange={e => setEditFormData({...editFormData, priorExperienceYears: Number(e.target.value)})} 
                      className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-lg font-mono text-white focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Trình độ Học vấn</label>
                    <select 
                      value={editFormData.educationLevel} 
                      onChange={e => setEditFormData({...editFormData, educationLevel: e.target.value})} 
                      className="w-full bg-zinc-950 border border-zinc-800 p-2 text-xs rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="High School">High School</option>
                      <option value="Diploma">Diploma</option>
                      <option value="Bachelor">Bachelor</option>
                      <option value="Master">Master</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-zinc-950/40 rounded-lg border border-zinc-800 text-xs text-zinc-500 space-y-1">
                  <p className="font-medium text-zinc-400">💡 Lưu ý từ hệ thống:</p>
                  <p>• Các chỉ số năng lực chuyên môn, kỹ năng mềm và xếp loại hiệu suất không thể cấu hình trực tiếp tại đây.</p>
                  <p>• Hệ thống sẽ tự động tổng hợp các điểm số này sau khi hoàn thành các đợt Review định kỳ.</p>
                </div>

                <div className="flex gap-2 pt-4 border-t border-zinc-800">
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 font-medium transition-colors cursor-pointer">
                    Hủy bỏ
                  </button>
                  <button onClick={handleSaveProfile} className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20 transition-colors cursor-pointer">
                    <Save className="w-3.5 h-3.5"/> Lưu thông tin
                  </button>
                </div>
              </div>
            ) : memberProfiles[selectedMember.workspaceMemberId] && canViewProfile ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase tracking-wider">Performance</span>
                    <span className={`text-base font-bold font-mono block mt-1 ${memberProfiles[selectedMember.workspaceMemberId].performanceRating === "Outstanding" || memberProfiles[selectedMember.workspaceMemberId].performanceRating === "Excellent" ? "text-blue-400" : "text-emerald-400"}`}>
                      {memberProfiles[selectedMember.workspaceMemberId].performanceRating || "N/A"}
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase tracking-wider">Học Vấn</span>
                    <span className="text-xs font-bold text-zinc-200 mt-1.5 block truncate">
                      {memberProfiles[selectedMember.workspaceMemberId].educationLevel || "N/A"}
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase tracking-wider">Chuyên Cần</span>
                    <span className="text-base font-bold font-mono text-zinc-200 block mt-1">
                      {memberProfiles[selectedMember.workspaceMemberId].attendanceRate ?? 100}%
                    </span>
                  </div>
                  <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 font-mono block uppercase tracking-wider">Kinh Nghiệm</span>
                    <span className="text-base font-bold font-mono text-zinc-200 block mt-1">
                      {memberProfiles[selectedMember.workspaceMemberId].totalExperienceYears ?? 0} Năm
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-sm mb-3 text-zinc-200 border-b border-zinc-800 pb-2">
                    Biểu đồ Khung Năng Lực
                  </h4>
                  <div className="space-y-3.5">
                    {[
                      { l: "Technical Skills", v: memberProfiles[selectedMember.workspaceMemberId].technicalSkillScore ?? 0, c: "bg-blue-500 shadow-blue-500/20" },
                      { l: "Communication", v: memberProfiles[selectedMember.workspaceMemberId].communicationScore ?? 0, c: "bg-purple-500 shadow-purple-500/20" },
                      { l: "Problem Solving", v: memberProfiles[selectedMember.workspaceMemberId].problemSolvingScore ?? 0, c: "bg-emerald-500 shadow-emerald-500/20" },
                      { l: "Leadership", v: memberProfiles[selectedMember.workspaceMemberId].leadershipScore ?? 0, c: "bg-amber-500 shadow-amber-500/20" },
                    ].map((skill) => (
                      <div key={skill.l} className="flex items-center gap-4">
                        <span className="text-xs text-zinc-400 font-mono w-28 shrink-0">{skill.l}</span>
                        <div className="flex-1 h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                          <div className={`h-full ${skill.c} transition-all duration-500 shadow-lg`} style={{ width: `${skill.v}%` }}></div>
                        </div>
                        <span className="text-xs font-mono text-zinc-300 w-8 text-right">{skill.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-800">
                  <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Cập nhật lần cuối:{" "}
                    {memberProfiles[selectedMember.workspaceMemberId].lastEvaluatedAt ? 
                      new Date(memberProfiles[selectedMember.workspaceMemberId].lastEvaluatedAt).toLocaleDateString("vi-VN") : "N/A"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center flex flex-col items-center">
                {!canViewProfile ? (
                  <p className="text-sm text-zinc-500 mb-4">Bạn không có quyền xem thông tin hồ sơ năng lực này.</p>
                ) : (
                  <>
                    <p className="text-sm text-zinc-500 mb-4">Thành viên này chưa có cấu hình hồ sơ năng lực.</p>
                    {canManageProfile && (
                      <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-medium rounded-lg text-white transition-colors cursor-pointer">
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
    </div>
  );
}