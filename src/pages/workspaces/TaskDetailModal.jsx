import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  X, Calendar, Edit2, Trash2, Check, ShieldAlert, 
  BarChart2, Users, Clock, Loader2, UserPlus, UserMinus,
  MessageSquare, Send, LinkIcon, Paperclip, Plus, FileIcon, ChevronRight, Search, ChevronDown
} from "lucide-react";
import TaskService from "../../services/TaskService";
import WorkspaceService from "../../services/WorkspaceService";
import { useUser } from "../../contexts/UserContext"; 
import { useNotification } from "../../contexts/NotificationContext"; 
import { useLanguage } from "../../contexts/LanguageContext";
import TaskAssigneeSelectionSkeleton from "../../components/skeletons/TaskAssigneeSelectionSkeleton";

export default function TaskDetailModal({ task: initialTask, allTasks = [], onClose }) {
  const { t, locale } = useLanguage();
  const { fetchTasks, workspaceId } = useOutletContext() || { workspaceId: 12 };
  const { currentUser, hasPermission, currentWorkspaceRole } = useUser(); 
  const { toast, confirm } = useNotification(); 

  // Kiểm tra quyền hạn
  const isOwner = currentWorkspaceRole?.roleName?.toLowerCase() === "owner";
  const canEditTask = isOwner || hasPermission("Task.Update") || hasPermission("task:update");
  const canDeleteTask = isOwner || hasPermission("Task.Delete") || hasPermission("task:delete");
  const canManageAssignees = isOwner || canEditTask;

  const [task, setTask] = useState(initialTask);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Quản lý Thành viên Workspace & Phân công trong Task
  const [allMembers, setAllMembers] = useState([]); 
  const [assignedMembers, setAssignedMembers] = useState([]); 
  const [assignedMemberIds, setAssignedMemberIds] = useState([]); 
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isUpdatingAssign, setIsUpdatingAssign] = useState({});
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("comments"); 

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [dependencies, setDependencies] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  useEffect(() => {
    if (!task?.taskId) return;

    loadWorkspaceMembers();
    loadAssignedMembers();
    fetchComments();
    fetchDependencies();
    fetchAttachments();
  }, [task?.taskId]);

  const loadWorkspaceMembers = async () => {
    if (!canManageAssignees) return; 
    setIsLoadingMembers(true);
    try {
      const res = await WorkspaceService.getWorkspaceMembers(workspaceId);
      const members = res?.items || res?.data?.items || res?.data || res || [];
      setAllMembers(members);
    } catch (err) { 
      console.error("Lỗi lấy danh sách thành viên workspace:", err); 
      setAllMembers([]);
    } finally { 
      setIsLoadingMembers(false); 
    }
  };

  // Tìm kiếm thành viên workspace (hiển thị đầy đủ tất cả thành viên)
  const filteredMembers = useMemo(() => {
    return allMembers.filter((m) => {
      const displayName = m.resource?.fullName || `Member ${m.workspaceMemberId}`;
      return displayName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [allMembers, searchQuery]);

  // Bộ lọc danh sách chọn các task khác (Loại bỏ ID của chính nó để tránh self-reference)
  const availableTasksToBind = useMemo(() => {
    return allTasks.filter(t => t.taskId !== task.taskId);
  }, [allTasks, task.taskId]);

  const loadAssignedMembers = async () => {
    try {
      const res = await TaskService.getTaskAssignees(task.taskId);
      const assigneesData = res?.data || res || [];
      setAssignedMembers(assigneesData);
      const memberIds = assigneesData.map(m => m.workspaceMemberId || m.memberId || m.id);
      setAssignedMemberIds(memberIds);
    } catch (err) {
      console.error("Lỗi lấy danh sách thành viên được phân công:", err);
    }
  };

  // ==================== LOGIC COMMENTS ====================
  const fetchComments = async () => {
    try {
      const res = await TaskService.getTaskComments(task.taskId);
      setComments(res || []);
    } catch (err) { console.error(err); }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await TaskService.createTaskComment(task.taskId, { content: newComment });
      setNewComment("");
      fetchComments();
    } catch (err) { setError(t("taskDetail.errComment")); }
  };

  // ==================== LOGIC DEPENDENCIES ====================
  const fetchDependencies = async () => {
    try {
      const res = await TaskService.getTaskDependencies(task.taskId);
      setDependencies(res || []);
    } catch (err) { console.error(err); }
  };

  const handleAddDependency = async (e) => {
    e.preventDefault();
    if (!canEditTask) return; 
    const fd = new FormData(e.target);
    const targetTaskId = fd.get("targetTaskId");
    const depType = fd.get("dependencyType");
    if(!targetTaskId) return;

    try {
      await TaskService.createTaskDependency(task.taskId, {
        predecessorTaskId: parseInt(targetTaskId),
        successorTaskId: task.taskId,
        dependencyType: depType
      });
      e.target.reset();
      fetchDependencies();
      if (fetchTasks) fetchTasks(); // Refresh ngoài board để cập nhật icon Lock kịp thời
    } catch (err) { toast.error(t("taskDetail.errAddDependency")); }
  };

  const handleDeleteDependency = async (depId) => {
    if (!canEditTask) return;
    if (!(await confirm(t("taskDetail.confirmDeleteDependency"), t("taskDetail.deleteDependencyTitle")))) return;
    try {
      await TaskService.deleteTaskDependency(depId);
      fetchDependencies();
      if (fetchTasks) fetchTasks();
    } catch (err) { toast.error(t("taskDetail.errDeleteDependency")); }
  };

  // Helper hàm để tìm tên Task hiển thị trên UI Ràng Buộc dựa vào ID
  const getTaskNameById = (id) => {
    const found = allTasks.find(t => t.taskId === id);
    return found ? found.taskName : (locale === "vi" ? `Nhiệm vụ #${id}` : `Task #${id}`);
  };

  // ==================== LOGIC ATTACHMENTS ====================
  const fetchAttachments = async () => {
    try {
      const res = await TaskService.getTaskAssets(task.taskId);
      setAttachments(res || []);
    } catch (err) { console.error(err); }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingFile(true);
    try {
      await TaskService.createTaskAsset(task.taskId, formData);
      fetchAttachments();
    } catch (err) { toast.error(t("projectCard.importError") || "Error uploading file"); }
    finally { setIsUploadingFile(false); }
  };

  const handleDeleteAttachment = async (attachId) => {
    if (!(await confirm(t("taskDetail.confirmDeleteAttachment"), t("taskDetail.deleteAttachmentTitle")))) return;
    try {
      await TaskService.deleteTaskAsset(task.taskId, attachId);
      fetchAttachments();
    } catch (err) { toast.error(t("taskDetail.errDeleteAttachment")); }
  };

  // ==================== UPDATE & DELETE TASK ====================
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const fd = new FormData(e.target);
    const payload = {
      ...task,
      taskName: fd.get("taskName"),
      durationType: fd.get("durationType"),
      estimatedValue: parseFloat(fd.get("estimatedValue")) || 0,
      startDate: fd.get("startDate"),
      endDate: fd.get("endDate"),
      status: fd.get("status"),
      priority: fd.get("priority"),
      complexity: fd.get("complexity"),
      requiredSkillLevel: fd.get("requiredSkillLevel"),
      expectedTeamSize: parseInt(fd.get("expectedTeamSize")) || 1,
    };

    try {
      await TaskService.updateTask(task.taskId, payload);
      setTask(payload);
      if (fetchTasks) await fetchTasks();
      setIsEditing(false);
    } catch (err) { setError(t("taskDetail.errUpdateTask")); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteTask = async () => {
    if (!(await confirm(t("taskDetail.confirmDeleteTask"), t("taskDetail.deleteTaskTitle")))) return;
    try {
      await TaskService.deleteTask(task.taskId);
      if (fetchTasks) fetchTasks();
      onClose();
    } catch (err) { setError(t("taskDetail.errDeleteTask")); }
  };

  const toggleMemberAssignment = async (memberId) => {
    if (!canManageAssignees) return; 
    const isAssigned = assignedMemberIds.includes(memberId);
    setIsUpdatingAssign(prev => ({ ...prev, [memberId]: true }));
    try {
      if (!isAssigned) {
        await TaskService.assignTaskMember(task.taskId, { assigneeType: "Assignee", memberId });
      } else {
        await TaskService.removeTaskAssignee(task.taskId, memberId);
      }
      await loadAssignedMembers();
      if (fetchTasks) await fetchTasks();
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsUpdatingAssign(prev => ({ ...prev, [memberId]: false })); 
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left overflow-y-auto lg:overflow-hidden" onClick={onClose}>
      <div className="flex flex-col lg:flex-row gap-4 w-full max-w-7xl max-h-[92vh] justify-center items-stretch" onClick={e => e.stopPropagation()}>
        
        {/* PHẦN 1: ĐẢO BÊN TRÁI (Comments & Attachments) */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl w-full lg:w-96 flex flex-col h-[50vh] lg:h-auto shadow-2xl overflow-hidden">
          
          {/* Header Đảo */}
          <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-white/[0.02] shrink-0">
            <MessageSquare size={16} className="text-blue-400"/>
            <span className="text-sm font-bold text-white font-mono uppercase tracking-wider">{t("taskDetail.tabTitle")}</span>
          </div>

          {/* Attachments Section */}
          <div className="p-4 border-b border-white/10 shrink-0 bg-white/[0.01]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <Paperclip size={12}/> Attachments
              </h3>
              {canEditTask && (
                <label className="p-1 bg-zinc-800 text-zinc-300 border border-white/10 rounded cursor-pointer hover:bg-zinc-700 hover:text-white transition-all">
                  {isUploadingFile ? <Loader2 size={12} className="animate-spin"/> : <Plus size={12}/>}
                  <input type="file" onChange={handleUploadFile} className="hidden" disabled={isUploadingFile} />
                </label>
              )}
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar pr-1">
              {attachments.length === 0 ? (
                <p className="text-zinc-600 text-[11px] font-mono italic">{t("taskDetail.noAttachments")}</p>
              ) : (
                attachments.map(file => (
                  <div key={file.attachmentId} className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded-lg text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <FileIcon size={14} className="text-zinc-400 shrink-0"/>
                      <a href={file.fileUrl} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-blue-400 truncate hover:underline">{file.fileName || t("taskDetail.attachmentLabel")}</a>
                    </div>
                    {canEditTask && (
                      <button onClick={() => handleDeleteAttachment(file.attachmentId)} className="text-zinc-500 hover:text-rose-400 p-0.5 ml-1"><X size={12}/></button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 pt-4 pb-2 shrink-0">
              <h3 className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={12}/> Comments ({comments.length})
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 custom-scrollbar">
              {comments.length === 0 ? (
                <p className="text-zinc-500 text-xs font-mono text-center py-6">{t("taskDetail.noComments")}</p>
              ) : (
                comments.map(c => (
                  <div key={c.commentId} className="flex gap-3 bg-white/[0.02] border border-white/5 p-3 rounded-xl">
                    <div className="w-7 h-7 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-xs text-blue-400 shrink-0">
                      {c.memberName?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-200">{c.memberName}</span>
                        <span className="text-[9px] font-mono text-zinc-500">{new Date(c.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1">{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-white/10 bg-zinc-900 shrink-0">
              <form onSubmit={handlePostComment} className="relative">
                <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder={t("taskDetail.commentPlaceholder")} className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl pl-4 pr-12 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500" />
                <button type="submit" className="absolute right-2 top-1.5 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500"><Send size={12} /></button>
              </form>
            </div>
          </div>

        </div>

        {/* THẺ THÔNG TIN CHÍNH (Phần 2 + Phần 3) */}
        <div className="bg-[#121214] border border-white/10 rounded-2xl flex-1 w-full lg:max-w-4xl flex flex-col h-[70vh] lg:h-auto shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex justify-between items-start bg-white/[0.02] shrink-0">
            <div className="flex items-start gap-4">
              <div className="bg-zinc-800 p-2.5 rounded-lg border border-white/5 text-blue-400">
                <BarChart2 className="w-6 h-6"/>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-white/5">TASK-{task.taskId}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">{task.status}</span>
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{task.taskName}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
                  <span className="flex items-center gap-1"><Calendar size={13}/> {task.startDate?.split("T")[0]} {t("taskDetail.to")} {task.endDate?.split("T")[0]}</span>
                  <span className="flex items-center gap-1"><Clock size={13}/> {task.estimatedValue} {task.durationType}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && canEditTask && (
                <button onClick={() => setIsEditing(true)} className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg transition-colors cursor-pointer border border-white/5">
                  <Edit2 size={16}/>
                </button>
              )}
              {canDeleteTask && (
                <button onClick={handleDeleteTask} className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-lg transition-colors cursor-pointer border border-rose-500/20">
                  <Trash2 size={16}/>
                </button>
              )}
              <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer">
                <X size={20}/>
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* PHẦN 2: CỘT GIỮA (Thông tin chi tiết Task & Dependencies) */}
            <div className="flex-1 flex flex-col border-r border-white/10 overflow-hidden">
              <form onSubmit={handleUpdateTask} className="p-6 border-b border-white/10 bg-zinc-900/20 space-y-4 max-h-[360px] overflow-y-auto custom-scrollbar">
                {error && <div className="text-xs text-rose-400 flex items-center gap-1"><ShieldAlert size={14}/> {error}</div>}
                
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("board.taskNameRequired")?.replace(" *", "")}</label>
                  <input name="taskName" defaultValue={task.taskName} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("board.status")}</label>
                    <select name="status" defaultValue={task.status} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-2 py-2 text-sm text-white disabled:opacity-60">
                      <option value="To-do">To-do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("board.priority")}</label>
                    <select name="priority" defaultValue={task.priority} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-2 py-2 text-sm text-white disabled:opacity-60">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("board.startDateRequired")?.replace(" *", "")}</label>
                    <input type="date" name="startDate" defaultValue={task.startDate?.split("T")[0]} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("board.endDateRequired")?.replace(" *", "")}</label>
                    <input type="date" name="endDate" defaultValue={task.endDate?.split("T")[0]} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("board.estimatedValue")}</label>
                    <input type="number" step="any" name="estimatedValue" defaultValue={task.estimatedValue || 0} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("board.durationType")}</label>
                    <select name="durationType" defaultValue={task.durationType} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-2 py-2 text-sm text-white disabled:opacity-60">
                      <option value="Hour">Hour</option>
                      <option value="Day">Day</option>
                      <option value="StoryPoint">Story Point</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("board.complexity")}</label>
                    <select name="complexity" defaultValue={task.complexity} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-2 py-2 text-sm text-white disabled:opacity-60">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("board.skillLevel")}</label>
                    <select name="requiredSkillLevel" defaultValue={task.requiredSkillLevel} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-2 py-2 text-sm text-white disabled:opacity-60">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("board.teamSize")}</label>
                    <input type="number" name="expectedTeamSize" defaultValue={task.expectedTeamSize || 1} min="1" disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60" />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-white">{t("common.cancel")}</button>
                    <button type="submit" disabled={isSubmitting} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-mono text-white flex items-center gap-1">
                      {isSubmitting ? <Loader2 size={12} className="animate-spin"/> : <Check size={12}/>} {t("common.save") || "Save"}
                    </button>
                  </div>
                )}
              </form>

              {/* Ràng buộc Tab Header */}
              <div className="flex border-b border-white/10 px-6 shrink-0 bg-zinc-900/40">
                <span className="py-3 px-4 font-mono text-xs flex items-center gap-2 border-b-2 border-blue-500 text-blue-400">
                  <LinkIcon size={14}/> {t("board.dependenciesTitle")?.replace(" (Tùy chọn)", "")} ({dependencies.length})
                </span>
              </div>

              {/* Ràng buộc Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="space-y-4 text-left">
                  {canEditTask && (
                    <form onSubmit={handleAddDependency} className="flex gap-3 items-end p-3 bg-zinc-900 border border-white/5 rounded-xl">
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400">{t("taskDetail.selectPredecessor")}</label>
                        <div className="relative">
                          <select name="targetTaskId" required className="w-full pl-2 pr-6 py-1 bg-[#1A1A1C] border border-white/10 rounded text-xs text-white appearance-none cursor-pointer">
                            <option value="">{t("taskDetail.selectTaskPrompt")}</option>
                            {availableTasksToBind.map(tk => (
                              <option key={tk.taskId} value={tk.taskId}>TASK-{tk.taskId}: {tk.taskName}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                      <div className="w-36 space-y-1">
                        <label className="text-[9px] font-mono text-zinc-400">{t("board.dependencyType")}</label>
                        <div className="relative">
                          <select name="dependencyType" className="w-full pl-2 pr-6 py-1 bg-[#1A1A1C] border border-white/10 rounded text-xs text-white appearance-none cursor-pointer">
                            <option value="FS">Finish-to-Start</option>
                            <option value="SS">Start-to-Start</option>
                          </select>
                          <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1 rounded flex items-center gap-1 font-mono shrink-0 h-[28px]"><Plus size={12}/> {t("taskDetail.addBtn")}</button>
                    </form>
                  )}

                  <div className="space-y-2">
                    {dependencies.length === 0 ? (
                      <p className="text-zinc-500 text-xs font-mono text-center py-6">{t("taskDetail.noDependencies")}</p>
                    ) : (
                      dependencies.map(dep => (
                        <div key={dep.dependencyId} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg text-xs font-mono">
                          <div className="flex items-center gap-2 text-zinc-300 flex-1 min-w-0 pr-2">
                            <span className="text-blue-400 font-bold shrink-0" title={getTaskNameById(dep.predecessorTaskId)}>TASK-{dep.predecessorTaskId}</span>
                            <ChevronRight size={12} className="text-zinc-600 shrink-0" />
                            <span className="text-zinc-400 truncate" title={getTaskNameById(dep.successorTaskId)}>{getTaskNameById(dep.predecessorTaskId)}</span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-500 border border-white/5 font-semibold ml-2 shrink-0">{dep.dependencyType}</span>
                          </div>
                          {canEditTask && (
                            <button onClick={() => handleDeleteDependency(dep.dependencyId)} className="text-rose-400 hover:text-rose-300 shrink-0"><X size={14}/></button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PHẦN 3: CỘT PHẢI (Sidebar Phân công & Metadata Details) */}
            <div className="w-72 bg-zinc-900/40 p-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
              <div>
                <h3 className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5"><Users size={12}/> Assignees</h3>
                {canManageAssignees ? (
                  <>
                    <div className="relative mb-3">
                      <Search size={12} className="absolute left-2.5 top-2 text-zinc-500" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("taskDetail.searchMembersPlaceholder")} 
                        className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="space-y-1.5 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                      {isLoadingMembers ? (
                        <TaskAssigneeSelectionSkeleton count={3} />
                      ) : filteredMembers.length === 0 ? (
                        <p className="text-zinc-500 text-[11px] font-mono italic text-center py-2">{searchQuery ? t("taskDetail.noResults") : t("taskDetail.noOtherMembers")}</p>
                      ) : (
                        filteredMembers.map((m) => {
                          const mId = m.workspaceMemberId || m.memberId || m.id;
                          const isAssigned = assignedMemberIds.includes(mId);
                          const displayName = m.resource?.fullName || `Member ${mId}`;

                          return (
                            <div key={mId} className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded-lg text-xs">
                              <span className="text-zinc-300 truncate max-w-[140px]">{displayName}</span>
                              <button 
                                type="button" 
                                onClick={() => toggleMemberAssignment(mId)} 
                                disabled={isUpdatingAssign[mId]} 
                                className={`p-1 rounded font-mono text-[10px] flex items-center gap-1 transition-all ${
                                  isAssigned ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
                                }`}
                              >
                                {isUpdatingAssign[mId] ? <Loader2 size={10} className="animate-spin"/> : isAssigned ? <UserMinus size={10}/> : <UserPlus size={10}/>}
                                {isAssigned ? t("common.remove") : t("taskCard.assignBtn")}
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                    {assignedMembers.length === 0 ? (
                      <p className="text-zinc-500 text-[11px] font-mono italic text-center py-2">{t("taskDetail.noAssignedMembers")}</p>
                    ) : (
                      assignedMembers.map((m) => (
                        <div key={m.workspaceMemberId || m.memberId || m.id} className="flex flex-col gap-0.5 p-2 bg-white/[0.02] border border-white/5 rounded-lg text-xs">
                          <span className="text-zinc-200 font-medium truncate">{m.fullName || m.memberName || t("taskDetail.anonymous")}</span>
                          {m.email && <span className="text-[10px] text-zinc-500 truncate">{m.email}</span>}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Phần 3: Metadata Details */}
              <div className="border-t border-white/5 pt-4 text-[11px] space-y-2 font-mono text-zinc-400 bg-white/[0.01] p-3 rounded-xl border border-white/5 mt-auto">
                <div className="flex justify-between"><span className="text-zinc-500">{t("board.complexity")}:</span><span className="text-zinc-300 font-bold">{task.complexity}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">{t("board.skillLevel")}:</span><span className="text-zinc-300 font-bold">{task.requiredSkillLevel}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">{t("board.teamSize")}:</span><span className="text-zinc-300 font-bold">{task.expectedTeamSize} {t("taskDetail.people")}</span></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}