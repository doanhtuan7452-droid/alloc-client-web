import { useState, useEffect } from "react";
import { Download, Search, Calendar, UserPlus, CheckCircle2, XCircle, Award, TrendingUp, Clock, UserCheck } from "lucide-react";
import { 
  fetchWorkspaceMembers, fetchMemberProfile, 
  fetchLeaveRequests, fetchOTRequests, approveRequest,
  fetchReviewCycles, fetchEvaluations
} from "../../services/mockApi";

import { useOutletContext } from "react-router-dom";

export default function Team() {
  // Nhận context từ WorkspaceLayout
  const { workspaceId } = useOutletContext() || { workspaceId: 12 };

  const [members, setMembers] = useState([]);
  const [memberProfiles, setMemberProfiles] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [otRequests, setOtRequests] = useState([]);

  const [reviewCycles, setReviewCycles] = useState([]);
  const [evaluations, setEvaluations] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const memRes = await fetchWorkspaceMembers(workspaceId);
        setMembers(memRes.items || []);

        const leaves = await fetchLeaveRequests(workspaceId);
        setLeaveRequests(leaves);

        const ots = await fetchOTRequests(workspaceId);
        setOtRequests(ots);

        const cycles = await fetchReviewCycles(workspaceId);
        setReviewCycles(cycles);

        // Fetch evaluations for all cycles
        const evalsMap = {};
        for (const c of cycles) {
          const evals = await fetchEvaluations(c.cycleID);
          evalsMap[c.cycleID] = evals;
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
    if (!memberProfiles[member.workspaceMemberId]) {
      const p = await fetchMemberProfile(member.workspaceMemberId);
      if (p) {
        setMemberProfiles(prev => ({...prev, [member.workspaceMemberId]: p}));
      }
    }
    setSelectedMember(member);
  };

  const handleActionRequest = async (type, id, action) => {
    try {
      const status = action === 'approve' ? 'Approved' : 'Rejected';
      const updatedReq = await approveRequest(type, id, { status, approvalNote: status });
      
      if (type === "Leave") {
        setLeaveRequests(prev => prev.map(r => r.requestId === id ? updatedReq : r));
      } else {
        setOtRequests(prev => prev.map(r => r.requestId === id ? updatedReq : r));
      }
      alert(`${action === 'approve' ? 'Phê duyệt' : 'Từ chối'} đơn ${type} thành công!`);
    } catch (e) {
      alert("Lỗi: " + e.message);
    }
  };

  const getPendingRequests = () => {
    const p1 = leaveRequests.filter(r => r.status === "Pending").map(r => ({...r, type: "Leave"}));
    const p2 = otRequests.filter(r => r.status === "Pending").map(r => ({...r, type: "OT"}));
    return [...p1, ...p2];
  };
  
  const pendingRequests = getPendingRequests();

  return (
    <div className="flex-1 overflow-y-auto h-full p-4 md:p-6 custom-scrollbar">
      <div className="max-w-6xl mx-auto pb-10">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Team Overview</h1>
            <p className="text-content-muted text-sm">
              Quản lý thành viên, xem hồ sơ kỹ năng, duyệt đơn từ (Leave/OT) và theo dõi đợt Performance Review.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-border-default rounded-md bg-surface hover:bg-surface-hover text-sm text-content-secondary transition-colors cursor-pointer">
              <Download className="w-4 h-4" /> Export Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors shadow-lg shadow-blue-600/10 cursor-pointer">
              <UserPlus className="w-4 h-4" /> Mời Thành Viên
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          
          <div className="xl:col-span-2 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-content-primary">Core Team ({members.length})</h3>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-content-muted" />
                <input
                  type="text"
                  placeholder="Tìm thành viên..."
                  className="bg-inset border border-border-default rounded-md pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-blue-500 w-48 text-content-secondary"
                />
              </div>
            </div>

            {isLoading ? (
               <div className="text-center py-10 text-slate-400 text-sm">Loading members...</div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                {members.map((member) => (
                  <div 
                    key={member.workspaceMemberId} 
                    onClick={() => fetchProfile(member)}
                    className="flex items-center justify-between p-3 hover:bg-surface-hover/50 rounded-lg transition-colors border border-transparent hover:border-border-default cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-inset overflow-hidden border-2 border-border-default flex items-center justify-center font-mono font-bold text-xs text-content-muted shrink-0">
                        {member.resource.avatarUrl ? (
                          <img src={member.resource.avatarUrl} alt={member.resource.fullName} className="w-full h-full object-cover" />
                        ) : (
                          member.resource.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-content-primary text-sm line-clamp-1">{member.resource.fullName}</h4>
                          <span className="text-[10px] font-mono text-content-muted bg-inset px-1.5 py-0.5 rounded border border-white/5 shrink-0">
                            {member.employeeCode}
                          </span>
                        </div>
                        <p className="text-xs text-content-muted mt-0.5">
                          {member.role.roleName} • <span className={member.status === "Active" ? "text-emerald-400" : "text-amber-400"}>{member.status}</span>
                        </p>
                      </div>
                    </div>
                    
                    <button className="text-[10px] whitespace-nowrap text-blue-400 hover:text-blue-300 font-mono px-3 py-1.5 bg-blue-950/20 rounded border border-blue-900/30">
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6 flex flex-col">
            
            {/* Request Inbox */}
            <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl p-6 flex flex-col h-fit">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-content-muted" />
                  <h3 className="font-bold text-sm">Request Inbox</h3>
                </div>
                {pendingRequests.length > 0 && (
                  <span className="bg-amber-900/20 text-amber-400 border border-amber-800/30 text-[10px] font-mono px-2 py-0.5 rounded">
                    {pendingRequests.length} Pending
                  </span>
                )}
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                {isLoading ? (
                  <p className="text-xs text-content-muted italic py-4 text-center">Loading requests...</p>
                ) : pendingRequests.length === 0 ? (
                  <p className="text-xs text-content-muted italic py-4 text-center">Không có đơn từ nào cần duyệt.</p>
                ) : (
                  pendingRequests.map((req) => (
                    <div key={req.requestId + req.type} className="bg-surface/40 border border-white/5 p-3 rounded-lg hover:border-border-default transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-xs font-semibold text-content-primary">{req.requesterName}</h4>
                        <span className={`text-[9px] font-mono px-1.5 rounded ${req.type === "Leave" ? "bg-purple-950 text-purple-400 border border-purple-800/30" : "bg-blue-950 text-blue-400 border border-blue-800/30"}`}>
                          {req.type}
                        </span>
                      </div>
                      
                      {req.type === "Leave" ? (
                        <p className="text-[11px] text-content-muted font-mono mb-2">{req.startDate} to {req.endDate}</p>
                      ) : (
                        <p className="text-[11px] text-content-muted font-mono mb-2">{req.requestedDate} - {req.expectedHours}h</p>
                      )}
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleActionRequest(req.type, req.requestId, 'deny')}
                          className="flex-1 py-1 flex items-center justify-center gap-1 text-[11px] border border-border-default rounded bg-surface text-content-muted hover:text-rose-400 hover:bg-rose-950/20 hover:border-rose-900/30 transition-all cursor-pointer"
                        >
                          <XCircle className="w-3 h-3" /> Deny
                        </button>
                        <button 
                          onClick={() => handleActionRequest(req.type, req.requestId, 'approve')}
                          className="flex-1 py-1 flex items-center justify-center gap-1 text-[11px] bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 rounded hover:bg-emerald-600/30 transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Performance Cycle Monitor */}
            <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl p-6 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-content-muted" />
                  <h3 className="font-bold text-sm">Performance Cycle</h3>
                </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                  <p className="text-xs text-content-muted italic py-4 text-center">Loading cycles...</p>
                ) : reviewCycles.length === 0 ? (
                  <p className="text-xs text-content-muted italic py-4 text-center">Không có chu kỳ đánh giá nào.</p>
                ) : (
                  reviewCycles.map((cycle) => {
                    const cycleEvals = evaluations[cycle.cycleID] || [];
                    const selfEvals = cycleEvals.filter(e => e.evaluationType === "Self").length;
                    const isLive = cycle.status === "Active";

                    return (
                      <div key={cycle.cycleID} className="bg-inset/40 border border-white/5 p-3 rounded-lg flex flex-col justify-between h-full">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-xs font-semibold text-content-primary leading-snug pr-2">
                              {cycle.cycleName}
                            </h4>
                            {isLive && (
                              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/30 text-[9px] font-mono px-1.5 rounded shrink-0">
                                Live
                              </span>
                            )}
                          </div>
                          
                          <div className="space-y-2 font-mono text-[11px]">
                            <div className="flex justify-between items-center bg-white/[0.01] p-1.5 rounded border border-white/5">
                              <span className="text-content-muted">Self evals:</span>
                              <span className="text-purple-400 font-bold">{selfEvals} / {members.length}</span>
                            </div>
                            <div className="flex justify-between items-center bg-white/[0.01] p-1.5 rounded border border-white/5">
                              <span className="text-content-muted">Timeline:</span>
                              <span className="text-content-secondary font-bold text-[9px]">{cycle.endDate}</span>
                            </div>
                          </div>
                        </div>

                        <button className="w-full mt-4 py-1.5 text-[11px] font-mono flex items-center justify-center gap-1 bg-white/[0.04] text-content-secondary hover:text-white border border-white/10 rounded hover:bg-white/[0.08] transition-colors cursor-pointer">
                          <TrendingUp className="w-3.5 h-3.5" /> Xem Kết Quả Chi Tiết
                        </button>
                      </div>
                    )
                  })
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* MODAL MEMBER DETAILS */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-xl text-white animate-scaleUp max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-full bg-inset overflow-hidden border border-white/20">
                  {selectedMember.resource.avatarUrl ? (
                    <img src={selectedMember.resource.avatarUrl} className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-xl font-bold bg-zinc-800 text-zinc-500">{selectedMember.resource.fullName[0]}</div>}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedMember.resource.fullName} 
                    {selectedMember.status === "Active" && <UserCheck className="w-4 h-4 text-emerald-400"/>}
                  </h3>
                  <p className="text-sm text-zinc-400 font-mono mt-1">
                    {selectedMember.role.roleName} | {selectedMember.employeeCode}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="text-zinc-500 hover:text-white transition-colors cursor-pointer">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {memberProfiles[selectedMember.workspaceMemberId] ? (
              <div className="space-y-6">
                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-zinc-800/50 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] text-zinc-400 font-mono block">Performance</span>
                    <span className={`text-lg font-bold font-mono ${memberProfiles[selectedMember.workspaceMemberId].performanceRating === 'Outstanding' ? 'text-blue-400' : 'text-emerald-400'}`}>
                      {memberProfiles[selectedMember.workspaceMemberId].performanceRating}
                    </span>
                  </div>
                  <div className="bg-zinc-800/50 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] text-zinc-400 font-mono block">Education</span>
                    <span className="text-sm font-bold text-content-primary mt-1 block">
                      {memberProfiles[selectedMember.workspaceMemberId].educationLevel}
                    </span>
                  </div>
                  <div className="bg-zinc-800/50 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] text-zinc-400 font-mono block">Attendance</span>
                    <span className="text-lg font-bold font-mono text-content-secondary">
                      {memberProfiles[selectedMember.workspaceMemberId].attendanceRate}%
                    </span>
                  </div>
                  <div className="bg-zinc-800/50 p-3 rounded-lg border border-white/5">
                    <span className="text-[10px] text-zinc-400 font-mono block">Total Exp.</span>
                    <span className="text-lg font-bold font-mono text-content-secondary">
                      {memberProfiles[selectedMember.workspaceMemberId].totalExperienceYears} Yrs
                    </span>
                  </div>
                </div>

                {/* Radar Chart / Skills Simulation */}
                <div>
                  <h4 className="font-bold text-sm mb-3 text-content-primary border-b border-white/5 pb-2">Skill Overview</h4>
                  <div className="space-y-3 px-1">
                    {[
                      { l: "Technical Skills", v: memberProfiles[selectedMember.workspaceMemberId].technicalSkillScore, c: "bg-blue-500" },
                      { l: "Communication", v: memberProfiles[selectedMember.workspaceMemberId].communicationScore, c: "bg-purple-500" },
                      { l: "Problem Solving", v: memberProfiles[selectedMember.workspaceMemberId].problemSolvingScore, c: "bg-emerald-500" },
                      { l: "Leadership", v: memberProfiles[selectedMember.workspaceMemberId].leadershipScore, c: "bg-amber-500" }
                    ].map(skill => (
                      <div key={skill.l} className="flex items-center gap-4">
                        <span className="text-xs text-zinc-400 font-mono w-32 shrink-0">{skill.l}</span>
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full ${skill.c}`} style={{ width: `${skill.v}%` }}></div>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-300 w-8">{skill.v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-white/10">
                  <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3"/> Last Evaluated: {new Date(memberProfiles[selectedMember.workspaceMemberId].lastEvaluatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center flex flex-col items-center">
                <div className="w-8 h-8 border-2 border-t-blue-500 border-zinc-800 rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-zinc-500">Loading member profile...</p>
              </div>
            )}
            
          </div>
        </div>
      )}

    </div>
  );
}