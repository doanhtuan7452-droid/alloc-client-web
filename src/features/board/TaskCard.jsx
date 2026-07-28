import { useState, useEffect, useMemo } from "react";
import { Clock, Sparkles, ChevronDown, ChevronUp, Loader2, Search, Check } from "lucide-react";
import { useTaskAI } from "../../contexts/TaskAIContext";
import { useNotification } from "../../contexts/NotificationContext";
import TaskService from "../../services/TaskService";
import { useLanguage } from "../../contexts/LanguageContext";

export default function TaskCard({ 
  task, 
  onClick, 
  assignees = [], 
  isAssignedToMe = false,
  projectId,
  workspaceId,
  onAssignChange
}) {
  const { t, locale } = useLanguage();
  const { taskId, taskName, startDate, endDate, status, priority, complexity } = task;
  const { toast } = useNotification();

  const { 
    workspaceMembers, 
    isLoadingMembers, 
    fetchWorkspaceMembers, 
    aiCacheMap, 
    isLoadingAI, 
    aiError, 
    fetchAISuggestions,
    resetCacheForTask
  } = useTaskAI();

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [expandedMemberId, setExpandedMemberId] = useState(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [isUpdatingAssignId, setIsUpdatingAssignId] = useState(null);

  const isOverdue = new Date(endDate) < new Date() && status !== "Done";

  // Load danh sách thành viên workspace khi mở panel
  useEffect(() => {
    if (isPanelOpen && workspaceId) {
      fetchWorkspaceMembers(workspaceId);
    }
  }, [isPanelOpen, workspaceId]);

  // Mặc định chọn tất cả thành viên khi danh sách load lần đầu
  useEffect(() => {
    if (workspaceMembers.length > 0 && selectedMemberIds.length === 0) {
      setSelectedMemberIds(workspaceMembers.map(m => m.workspaceMemberId));
    }
  }, [workspaceMembers]);

  // Bộ lọc tìm kiếm thành viên
  const filteredMembers = useMemo(() => {
    return workspaceMembers.filter(m => {
      const name = m.resource?.fullName || "";
      return name.toLowerCase().includes(memberSearchQuery.toLowerCase());
    });
  }, [workspaceMembers, memberSearchQuery]);

  const formatDateText = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    if (locale === "vi") {
      return `${d.getDate()} thg ${d.getMonth() + 1}`;
    }
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "Critical": return "bg-red-500/20 text-red-200 border-red-500/30";
      case "High": return "bg-amber-500/20 text-amber-200 border-amber-500/30";
      case "Medium": return "bg-cyan-500/20 text-cyan-200 border-cyan-500/30";
      default: return "bg-neutral-500/20 text-neutral-300 border-neutral-500/30";
    }
  };

  const getComplexityStyle = (complexity) => {
    switch (complexity) {
      case "Critical": return "bg-rose-500/20 text-rose-200 border-rose-500/30";
      case "High": return "bg-orange-500/20 text-orange-200 border-orange-500/30";
      case "Medium": return "bg-indigo-500/20 text-indigo-200 border-indigo-500/30";
      default: return "bg-slate-500/20 text-slate-350 border-slate-500/30";
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleTogglePanel = (e) => {
    e.stopPropagation();
    setIsPanelOpen(!isPanelOpen);
  };

  const handleToggleSelectMember = (e, memberId) => {
    e.stopPropagation();
    if (selectedMemberIds.includes(memberId)) {
      setSelectedMemberIds(selectedMemberIds.filter(id => id !== memberId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, memberId]);
    }
  };

  const handleSubmitAI = async (e) => {
    e.stopPropagation();
    if (selectedMemberIds.length === 0) return;
    try {
      await fetchAISuggestions(projectId, taskId, selectedMemberIds);
    } catch (err) {
      console.error(err);
    }
  };

  const isMemberAssigned = (memberId) => {
    return assignees.some(a => a.workspaceMemberId === memberId || a.memberId === memberId);
  };

  const handleAssignDirect = async (e, memberId) => {
    e.stopPropagation();
    const assigned = isMemberAssigned(memberId);
    setIsUpdatingAssignId(memberId);
    try {
      if (!assigned) {
        await TaskService.assignTaskMember(taskId, {
          memberId,
          assigneeType: "Developer"
        });
      } else {
        await TaskService.removeTaskAssignee(taskId, memberId);
      }
      if (onAssignChange) {
        onAssignChange();
      }
    } catch (err) {
      console.error("Lỗi thay đổi phân công nhân sự:", err);
      toast.error(err?.response?.data?.message || err?.message || t("taskCard.errAssignDirect"));
    } finally {
      setIsUpdatingAssignId(null);
    }
  };

  return (
    <div 
      onClick={onClick}
      className="relative bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-lg p-4 flex flex-col transition-all duration-200 cursor-pointer shadow-md group"
    >
      {isAssignedToMe && (
        <span 
          className="absolute -top-1.5 -right-1.5 text-amber-400 font-bold text-base leading-none select-none drop-shadow-[0_0_6px_rgba(251,191,36,0.8)] z-10" 
          title={t("taskCard.assignedToYou")}
        >
          ★
        </span>
      )}

      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-mono text-slate-500 font-semibold">
          #TASK-{taskId}
        </span>
        <div className="flex gap-1.5 pr-2">
          <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border ${getPriorityStyle(priority)}`}>
            {priority}
          </span>
          <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border ${getComplexityStyle(complexity)}`}>
            {complexity}
          </span>
        </div>
      </div>

      <h4 className="font-semibold text-sm mb-3 leading-snug text-white group-hover:text-blue-400 transition-colors line-clamp-2">
        {taskName}
      </h4>

      <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-2 border-t border-white/5 gap-1.5 w-full overflow-hidden">
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors min-w-0 flex-shrink
          ${isOverdue 
            ? "bg-red-900/40 text-red-400 border border-red-500/20" 
            : "bg-white/[0.04] text-slate-400"
          }`}
        >
          <Clock className="w-3 h-3 flex-shrink-0" /> 
          <span className="truncate ml-0.5">
            {formatDateText(startDate)} - {formatDateText(endDate)} {isOverdue && t("taskCard.overdue")}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
          {/* Nút Hỏi AI gợi ý */}
          {projectId && (
            <button
              onClick={handleTogglePanel}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium border transition-all cursor-pointer flex-shrink-0
                ${isPanelOpen 
                  ? "bg-purple-500/20 text-purple-200 border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.3)]" 
                  : "bg-white/[0.04] text-slate-400 border-transparent hover:bg-white/[0.08] hover:text-white"
                }`}
              title={t("taskCard.aiAssistantTitle")}
            >
              <Sparkles className="w-3 h-3 flex-shrink-0" />
              <span>AI</span>
            </button>
          )}

          {/* Render danh sách Assignees thực tế */}
          <div className="flex -space-x-1.5 overflow-hidden">
            {assignees.length > 0 ? (
              assignees.slice(0, 3).map((member, idx) => (
                <div
                  key={member.memberId || member.resourceId || idx}
                  title={member.fullName || member.email || t("taskCard.unassigned")}
                  className="w-5 h-5 rounded-full border border-zinc-700 bg-blue-600/30 text-blue-200 flex items-center justify-center text-[8px] font-bold overflow-hidden"
                >
                  {member.avatarUrl ? (
                    <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(member.fullName)
                  )}
                </div>
              ))
            ) : (
              <div 
                className="w-5 h-5 rounded-full border border-zinc-700 bg-zinc-800/50 text-zinc-500 flex items-center justify-center text-[8px]" 
                title={t("taskCard.unassigned")}
              >
                ?
              </div>
            )}

            {assignees.length > 3 && (
              <div className="w-5 h-5 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300 flex items-center justify-center text-[8px] font-bold">
                +{assignees.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Suggestion Panel (Collapsible) */}
      {isPanelOpen && (
        <div 
          onClick={e => e.stopPropagation()} 
          className="mt-4 pt-4 border-t border-white/10 text-xs text-white space-y-3 cursor-default"
        >
          <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded border border-white/5">
            <span className="font-semibold text-[11px] text-purple-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> {t("taskCard.aiAssistantTitle")}
            </span>
            <button 
              onClick={() => setIsPanelOpen(false)}
              className="text-slate-400 hover:text-white text-[10px] cursor-pointer"
            >
              {t("taskCard.collapse")}
            </button>
          </div>

          {/* Hiển thị kết quả từ cache nếu đã load thành công */}
          {aiCacheMap[taskId] ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>{t("taskCard.aiAnalysisHeader")}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    resetCacheForTask(taskId);
                  }}
                  disabled={isLoadingAI[taskId]}
                  className="text-purple-400 hover:text-purple-300 flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                >
                  {isLoadingAI[taskId] ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" /> {t("taskCard.analyzingBtn")}
                    </>
                  ) : (
                    t("taskCard.reanalyzeBtn")
                  )}
                </button>
              </div>

              {aiError[taskId] && (
                <div className="text-[10px] text-red-400 p-2 bg-red-950/20 border border-red-500/20 rounded">
                  {aiError[taskId]}
                </div>
              )}

              <div className="space-y-1.5 max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
                {aiCacheMap[taskId].length === 0 ? (
                  <div className="text-center py-4 text-slate-500">
                    {t("taskCard.noSuggestions")}
                  </div>
                ) : (
                  aiCacheMap[taskId].map((res) => {
                    const isExpanded = expandedMemberId === res.workspaceMemberId;
                    const assigned = isMemberAssigned(res.workspaceMemberId);
                    const isUpdating = isUpdatingAssignId === res.workspaceMemberId;

                    // Phân cấp màu sắc theo fitPercentage
                    let scoreColor = "text-red-400 bg-red-950/20 border-red-500/30";
                    if (res.fitPercentage >= 85) scoreColor = "text-emerald-400 bg-emerald-950/20 border-emerald-500/30";
                    else if (res.fitPercentage >= 65) scoreColor = "text-amber-400 bg-amber-950/20 border-amber-500/30";
                    else if (res.fitPercentage >= 45) scoreColor = "text-orange-400 bg-orange-950/20 border-orange-500/30";

                    return (
                      <div 
                        key={res.workspaceMemberId} 
                        className="bg-white/[0.02] border border-white/5 rounded p-2 space-y-2 hover:border-white/10 transition-colors"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <div 
                            onClick={() => setExpandedMemberId(isExpanded ? null : res.workspaceMemberId)}
                            className="flex items-center gap-1.5 flex-1 min-w-0 cursor-pointer select-none"
                          >
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" />}
                            <span className="font-medium truncate text-slate-200 hover:text-white transition-colors">{res.fullName}</span>
                            <span className={`text-[9px] px-1 rounded border font-mono font-semibold ${scoreColor}`}>
                              {res.fitPercentage.toFixed(1)}%
                            </span>
                          </div>

                          <button
                            onClick={(e) => handleAssignDirect(e, res.workspaceMemberId)}
                            disabled={isUpdating}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors
                              ${assigned
                                ? "bg-red-500/20 text-red-200 border border-red-500/30 hover:bg-red-500/30"
                                : "bg-blue-600/20 text-blue-200 border border-blue-500/30 hover:bg-blue-600/30"
                              }`}
                          >
                            {isUpdating ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : assigned ? (
                              t("taskCard.unassignBtn")
                            ) : (
                              t("taskCard.assignBtn")
                            )}
                          </button>
                        </div>

                        {isExpanded && (
                          <div className="pt-2 border-t border-white/5 text-[10px] text-slate-300 space-y-2 leading-relaxed animate-fade-in">
                            <div>
                              <span className="font-semibold text-slate-400">{t("taskCard.statusLabel")} </span>
                              <span className="text-slate-200">{res.businessStatusText}</span>
                            </div>
                            <div>
                              <span className="font-semibold text-slate-400">{t("taskCard.aiInsightLabel")} </span>
                              <p className="mt-0.5 text-slate-300 italic">{res.llmInsight}</p>
                            </div>
                            {res.successFactors?.length > 0 && (
                              <div>
                                <span className="font-semibold text-emerald-400">{t("taskCard.successFactors")}</span>
                                <ul className="list-disc pl-3.5 mt-0.5 space-y-0.5">
                                  {res.successFactors.map((f, i) => <li key={i} className="text-slate-300">{f}</li>)}
                                </ul>
                              </div>
                            )}
                            {res.potentialChallenges?.length > 0 && (
                              <div>
                                <span className="font-semibold text-orange-400">{t("taskCard.challenges")}</span>
                                <ul className="list-disc pl-3.5 mt-0.5 space-y-0.5">
                                  {res.potentialChallenges.map((c, i) => <li key={i} className="text-slate-300">{c}</li>)}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* Hiển thị form chọn thành viên khi chưa load gợi ý */
            <div className="space-y-2.5">
              <span className="text-[10px] text-slate-400">{t("taskCard.selectMembersPrompt")}</span>

              <div className="relative flex items-center bg-[#1E1E22] rounded border border-white/5">
                <Search className="w-3.5 h-3.5 absolute left-2 text-slate-500" />
                <input 
                  type="text"
                  placeholder={t("taskCard.searchPlaceholder")}
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-transparent pl-7 pr-2 py-1 text-xs text-white placeholder-slate-500 border-none outline-none"
                />
              </div>

              <div className="space-y-1 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                {isLoadingMembers ? (
                  <div className="flex items-center justify-center py-4 text-slate-500 gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("taskCard.membersLoading")}
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <div className="text-center py-4 text-slate-500">
                    {t("taskCard.noMembersFound")}
                  </div>
                ) : (
                  filteredMembers.map((m) => {
                    const isSelected = selectedMemberIds.includes(m.workspaceMemberId);
                    return (
                      <div 
                        key={m.workspaceMemberId}
                        onClick={(e) => handleToggleSelectMember(e, m.workspaceMemberId)}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-white/[0.04] cursor-pointer transition-colors"
                      >
                        <input 
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelectMember(e, m.workspaceMemberId)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-white/10 text-purple-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="truncate text-slate-300">{m.resource?.fullName || `Member ${m.workspaceMemberId}`}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {aiError[taskId] && (
                <div className="text-[10px] text-red-400 p-2 bg-red-950/20 border border-red-500/20 rounded font-mono">
                  {aiError[taskId]}
                </div>
              )}

              <button
                onClick={handleSubmitAI}
                disabled={isLoadingAI[taskId] || selectedMemberIds.length === 0}
                className="w-full py-1.5 rounded font-medium text-xs text-center cursor-pointer transition-all bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(147,51,234,0.3)]"
              >
                {isLoadingAI[taskId] ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("taskCard.submittingAiRequest")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> {t("taskCard.submitAiRequest")}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}