import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  X, Calendar, Edit2, Trash2, Check, ShieldAlert, 
  BarChart2, Users, Clock, Loader2, ChevronDown, UserPlus, UserMinus,
  MessageSquare, Send, LinkIcon, Paperclip, Plus, FileIcon, ChevronRight
} from "lucide-react";
import TaskService from "../../services/TaskService";
import WorkspaceService from "../../services/WorkspaceService";

export default function TaskDetailModal({ task: initialTask, onClose }) {
  const { fetchTasks, workspaceId } = useOutletContext() || { workspaceId: 12 };
  
  // Toàn bộ State quản lý Task và Edit giống file gốc
  const [task, setTask] = useState(initialTask);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Quản lý Thành viên & Phân công
  const [allMembers, setAllMembers] = useState([]);
  const [assignedMemberIds, setAssignedMemberIds] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isUpdatingAssign, setIsUpdatingAssign] = useState({});

  // Tabs điều khiển nội dung bên Trái (Comments / Dependencies)
  const [activeTab, setActiveTab] = useState("comments"); 

  // Các States tính năng mới tích hợp
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [dependencies, setDependencies] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Khởi tạo và đồng bộ dữ liệu liên quan khi mở Task
  useEffect(() => {
    if (!task?.taskId) return;

    // refreshTaskDetails();   <-- bỏ

    loadWorkspaceMembers();
    fetchComments();
    fetchDependencies();
    fetchAttachments();
  }, [task?.taskId]);

  const refreshTaskDetails = async () => {
    try {
      const res = await TaskService.getTaskById(initialTask.taskId);
      if (res) {
        setTask(res);
        const apiAssignments = res.taskAssignments || res.assignments || [];
        setAssignedMemberIds(apiAssignments.map(asm => asm.workspaceMemberId || asm.memberId).filter(Boolean));
      }
    } catch (err) { console.error(err); }
  };

  const loadWorkspaceMembers = async () => {
    setIsLoadingMembers(true);
    try {
      const res = await WorkspaceService.getWorkspaceMembers(workspaceId);
      setAllMembers(res.items || []);
    } catch (err) { console.error(err); } 
    finally { setIsLoadingMembers(false); }
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
    } catch (err) { setError("Không thể gửi bình luận."); }
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
    } catch (err) { alert("Lỗi khi thêm liên kết phụ thuộc"); }
  };

  const handleDeleteDependency = async (depId) => {
    if(!window.confirm("Xóa liên kết phụ thuộc này?")) return;
    try {
      await TaskService.deleteTaskDependency(depId);
      fetchDependencies();
    } catch (err) { alert("Không thể xóa mối quan hệ này"); }
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
    } catch (err) { alert("Lỗi tải tệp lên hệ thống"); }
    finally { setIsUploadingFile(false); }
  };

  const handleDeleteAttachment = async (attachId) => {
    if(!window.confirm("Bạn muốn xóa tệp đính kèm này?")) return;
    try {
      await TaskService.deleteTaskAsset(task.taskId, attachId);
      fetchAttachments();
    } catch (err) { alert("Không thể xóa file"); }
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

      if (fetchTasks) {
        await fetchTasks();
      }

      setIsEditing(false);
          } catch (err) { setError("Lỗi cập nhật thông tin nhiệm vụ."); }
          finally { setIsSubmitting(false); }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa nhiệm vụ này không? Hành động này không thể hoàn tác.")) return;
    try {
      await TaskService.deleteTask(task.taskId);
      if (fetchTasks) fetchTasks();
      onClose();
    } catch (err) { setError("Lỗi xảy ra khi xóa nhiệm vụ."); }
  };

  const toggleMemberAssignment = async (memberId) => {
    const isAssigned = assignedMemberIds.includes(memberId);
    setIsUpdatingAssign(prev => ({ ...prev, [memberId]: true }));
    try {
      if (!isAssigned) {
        await TaskService.assignTaskMember(task.taskId, { assigneeType: "Assignee", memberId });
        setAssignedMemberIds(prev => [...prev, memberId]);
      } else {
        await TaskService.removeTaskAssignee(task.taskId, memberId);
        setAssignedMemberIds(prev => prev.filter(id => id !== memberId));
      }
    } catch (err) { console.error(err); }
    finally { setIsUpdatingAssign(prev => ({ ...prev, [memberId]: false })); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-5xl flex flex-col max-h-[92vh] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header giống file gốc */}
        <div className="p-5 border-b border-white/10 flex justify-between items-start bg-white/[0.02]">
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
                <span className="flex items-center gap-1"><Calendar size={13}/> {task.startDate?.split("T")[0]} to {task.endDate?.split("T")[0]}</span>
                <span className="flex items-center gap-1"><Clock size={13}/> {task.estimatedValue} {task.durationType}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg transition-colors cursor-pointer border border-white/5">
                <Edit2 size={16}/>
              </button>
            )}
            <button onClick={handleDeleteTask} className="p-2 text-rose-400 hover:text-rose-300 bg-rose-500/10 rounded-lg transition-colors cursor-pointer border border-rose-500/20">
              <Trash2 size={16}/>
            </button>
            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors cursor-pointer">
              <X size={20}/>
            </button>
          </div>
        </div>

        {/* Cột chính hiển thị nội dung */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* CỘT TRÁI: Form thông tin & Khu vực Tab (Comments/Dependencies) */}
          <div className="flex-1 flex flex-col border-r border-white/10 overflow-hidden">
            
            {/* Khu vực Form Điền thông tin Task - CHỨA ĐẦY ĐỦ 10 TRƯỜNG API */}
            <form onSubmit={handleUpdateTask} className="p-6 border-b border-white/10 bg-zinc-900/20 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
              {error && <div className="text-xs text-rose-400 flex items-center gap-1"><ShieldAlert size={14}/> {error}</div>}
              
              {/* Hàng 1: Task Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Task Name</label>
                <input name="taskName" defaultValue={task.taskName} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60" />
              </div>

              {/* Hàng 2: Status & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Status</label>
                  <select name="status" defaultValue={task.status} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-2 py-2 text-sm text-white disabled:opacity-60">
                    <option value="To-do">To-do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Priority</label>
                  <select name="priority" defaultValue={task.priority} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-2 py-2 text-sm text-white disabled:opacity-60">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              {/* Hàng 3: Start Date & End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Start Date</label>
                  <input type="date" name="startDate" defaultValue={task.startDate?.split("T")[0]} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">End Date</label>
                  <input type="date" name="endDate" defaultValue={task.endDate?.split("T")[0]} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60" />
                </div>
              </div>

              {/* Hàng 4: Estimated Value & Duration Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Estimated Value</label>
                  <input type="number" step="any" name="estimatedValue" defaultValue={task.estimatedValue || 0} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Duration Type</label>
                  <select name="durationType" defaultValue={task.durationType} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-2 py-2 text-sm text-white disabled:opacity-60">
                    <option value="Hour">Hour</option>
                    <option value="Day">Day</option>
                    <option value="StoryPoint">Story Point</option>
                  </select>
                </div>
              </div>

              {/* Hàng 5: Complexity, Required Skill Level & Expected Team Size */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Complexity</label>
                  <select name="complexity" defaultValue={task.complexity} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-2 py-2 text-sm text-white disabled:opacity-60">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Required Skill</label>
                  <select name="requiredSkillLevel" defaultValue={task.requiredSkillLevel} disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-2 py-2 text-sm text-white disabled:opacity-60">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Team Size</label>
                  <input type="number" name="expectedTeamSize" defaultValue={task.expectedTeamSize || 1} min="1" disabled={!isEditing} className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white disabled:opacity-60" />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-white">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-xs font-mono text-white flex items-center gap-1">
                    {isSubmitting ? <Loader2 size={12} className="animate-spin"/> : <Check size={12}/>} Save
                  </button>
                </div>
              )}
            </form>

            {/* Menu Tab */}
            <div className="flex border-b border-white/10 px-6 shrink-0 bg-zinc-900/40">
              <button onClick={() => setActiveTab("comments")} className={`py-3 px-4 font-mono text-xs flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'comments' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500'}`}>
                <MessageSquare size={14}/> Comments ({comments.length})
              </button>
              <button onClick={() => setActiveTab("dependencies")} className={`py-3 px-4 font-mono text-xs flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${activeTab === 'dependencies' ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500'}`}>
                <LinkIcon size={14}/> Dependencies ({dependencies.length})
              </button>
            </div>

            {/* Nội dung Tab */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              
              {/* TAB 1: COMMENTS */}
              {activeTab === "comments" && (
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-zinc-500 text-xs font-mono text-center py-6">Chưa có bình luận nào.</p>
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
              )}

              {/* TAB 2: DEPENDENCIES */}
              {activeTab === "dependencies" && (
                <div className="space-y-4">
                  <form onSubmit={handleAddDependency} className="flex gap-2 items-end p-3 bg-zinc-900 border border-white/5 rounded-xl">
                    <div className="flex-1 space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400">Target Task ID (Tiền đề)</label>
                      <input type="number" name="targetTaskId" required placeholder="Nhập ID Task..." className="w-full bg-[#1A1A1C] border border-white/10 rounded px-2 py-1 text-xs text-white" />
                    </div>
                    <div className="w-32 space-y-1">
                      <label className="text-[9px] font-mono text-zinc-400">Loại Ràng Buộc</label>
                      <select name="dependencyType" className="w-full bg-[#1A1A1C] border border-white/10 rounded px-2 py-1 text-xs text-white">
                        <option value="Finish-to-Start">Finish-to-Start</option>
                        <option value="Start-to-Start">Start-to-Start</option>
                      </select>
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 font-mono"><Plus size={12}/> Add</button>
                  </form>

                  <div className="space-y-2">
                    {dependencies.length === 0 ? (
                      <p className="text-zinc-500 text-xs font-mono text-center py-6">Nhiệm vụ này chưa có ràng buộc phụ thuộc.</p>
                    ) : (
                      dependencies.map(dep => (
                        <div key={dep.dependencyId} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg text-xs font-mono">
                          <div className="flex items-center gap-2 text-zinc-300">
                            <span className="text-blue-400 font-bold">Task {dep.predecessorTaskId}</span>
                            <ChevronRight size={12} className="text-zinc-600" />
                            <span className="text-zinc-400">Task {dep.successorTaskId}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-500 border border-white/5 ml-2">{dep.dependencyType}</span>
                          </div>
                          <button onClick={() => handleDeleteDependency(dep.dependencyId)} className="text-rose-400 hover:text-rose-300"><X size={14}/></button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Hộp thoại gửi bình luận cố định */}
            {activeTab === "comments" && (
              <div className="p-4 border-t border-white/10 bg-zinc-900 shrink-0">
                <form onSubmit={handlePostComment} className="relative">
                  <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Viết bình luận thảo luận..." className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl pl-4 pr-12 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500" />
                  <button type="submit" className="absolute right-2 top-1.5 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500"><Send size={12} /></button>
                </form>
              </div>
            )}
          </div>

          {/* CỘT PHẢI (SIDEBAR): Quản lý Assignees & Upload File đính kèm */}
          <div className="w-72 bg-zinc-900/40 p-5 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
            
            {/* Phần 1: Assignees */}
            <div>
              <h3 className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5"><Users size={12}/> Assignees</h3>
              <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                {allMembers.map((m) => {
                  const isAssigned = assignedMemberIds.includes(m.workspaceMemberId);
                  return (
                    <div key={m.workspaceMemberId} className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded-lg text-xs">
                      <span className="text-zinc-300 truncate max-w-[140px]">{m.user?.fullName || `Member ${m.workspaceMemberId}`}</span>
                      <button type="button" onClick={() => toggleMemberAssignment(m.workspaceMemberId)} disabled={isUpdatingAssign[m.workspaceMemberId]} className={`p-1 rounded font-mono text-[10px] flex items-center gap-1 transition-all ${isAssigned ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {isUpdatingAssign[m.workspaceMemberId] ? <Loader2 size={10} className="animate-spin"/> : isAssigned ? <UserMinus size={10}/> : <UserPlus size={10}/>}
                        {isAssigned ? "Remove" : "Assign"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Phần 2: Attachments (Tệp đính kèm) */}
            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5"><Paperclip size={12}/> Attachments</h3>
                <label className="p-1 bg-zinc-800 text-zinc-300 border border-white/10 rounded cursor-pointer hover:bg-zinc-700 hover:text-white transition-all">
                  {isUploadingFile ? <Loader2 size={12} className="animate-spin"/> : <Plus size={12}/>}
                  <input type="file" onChange={handleUploadFile} className="hidden" disabled={isUploadingFile} />
                </label>
              </div>

              <div className="space-y-1.5">
                {attachments.length === 0 ? (
                  <p className="text-zinc-600 text-[11px] font-mono italic">Chưa có tệp đính kèm.</p>
                ) : (
                  attachments.map(file => (
                    <div key={file.attachmentId} className="flex items-center justify-between p-2 bg-white/[0.02] border border-white/5 rounded-lg text-xs">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileIcon size={14} className="text-zinc-400 shrink-0"/>
                        <a href={file.fileUrl} target="_blank" rel="noreferrer" className="text-zinc-300 hover:text-blue-400 truncate hover:underline">{file.fileName || "Tài liệu đính kèm"}</a>
                      </div>
                      <button onClick={() => handleDeleteAttachment(file.attachmentId)} className="text-zinc-500 hover:text-rose-400 p-0.5 ml-1"><X size={12}/></button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Phần 3: Metadata Details */}
            <div className="border-t border-white/5 pt-4 text-[11px] space-y-2 font-mono text-zinc-400 bg-white/[0.01] p-3 rounded-xl border border-white/5">
              <div className="flex justify-between"><span className="text-zinc-500">Complexity:</span><span className="text-zinc-300 font-bold">{task.complexity}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Skill Level:</span><span className="text-zinc-300 font-bold">{task.requiredSkillLevel}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Team Size:</span><span className="text-zinc-300 font-bold">{task.expectedTeamSize} người</span></div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}