import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Calendar, AlertTriangle, X, Loader2, ChevronDown, BarChart2, ShieldAlert, Users, EyeOff, LinkIcon, Lock } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"; 
import TaskCard from "../../features/board/TaskCard";
import BoardColumn from "../../features/board/BoardColumn";
import BoardSkeleton from "../../components/skeletons/BoardSkeleton";
import TaskDetailModal from "./TaskDetailModal";
import ProjectService from "../../services/ProjectService";
import TaskService from "../../services/TaskService"; 
import { useUser } from "../../contexts/UserContext";

export default function Board() {
  const { activeProject, tasksList, isLoading, error, searchQuery, fetchTasks } = useOutletContext();
  const { hasPermission, currentUser } = useUser();
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [defaultStatus, setDefaultStatus] = useState("To-do");
  
  const [localTasks, setLocalTasks] = useState([]);
  const [allDependencies, setAllDependencies] = useState([]);
  
  // State lưu trữ danh sách assignees của từng task { [taskId]: assigneesArray }
  const [taskAssigneesMap, setTaskAssigneesMap] = useState({});

  // Khai báo các quyền trên Workspace
  const canViewBoard = hasPermission("task:view"); 
  const canCreateTask = hasPermission("task:create");
  const canUpdateTask = hasPermission("task:update");

  useEffect(() => {
    if (tasksList) {
      setLocalTasks(tasksList);
      fetchAllDependencies(tasksList);
      fetchAllAssignees(tasksList);
    }
  }, [tasksList]);

  // Fetch assignees cho toàn bộ danh sách task ở cấp parent (Board)
  const fetchAllAssignees = async (tasks) => {
    try {
      const assigneesPromises = tasks.map(async (t) => {
        try {
          const res = await TaskService.getTaskAssignees(t.taskId);
          const data = res?.data || res || [];
          return { taskId: t.taskId, assignees: data };
        } catch {
          return { taskId: t.taskId, assignees: [] };
        }
      });

      const results = await Promise.all(assigneesPromises);
      const map = {};
      results.forEach((item) => {
        map[item.taskId] = item.assignees;
      });
      setTaskAssigneesMap(map);
    } catch (err) {
      console.error("Lỗi lấy danh sách assignees cho Board:", err);
    }
  };

  // Lấy danh sách dependencies của tất cả task để quét trạng thái khóa công việc
  const fetchAllDependencies = async (tasks) => {
    try {
      const depPromises = tasks.map(t => TaskService.getTaskDependencies(t.taskId).catch(() => []));
      const results = await Promise.all(depPromises);
      setAllDependencies(results.flat());
    } catch (err) {
      console.error("Lỗi đồng bộ danh sách phụ thuộc dự án:", err);
    }
  };

  // Hàm kiểm tra xem Task có đang bị khóa (Blocked) bởi một task khác chưa Done không
  const isTaskBlocked = (taskId) => {
    const taskDeps = allDependencies.filter(d => d.successorTaskId === taskId);
    for (const dep of taskDeps) {
      const predecessorTask = localTasks.find(t => t.taskId === dep.predecessorTaskId);
      if (predecessorTask && predecessorTask.status !== "Done") {
        return predecessorTask;
      }
    }
    return null;
  };

  const filteredTasks = localTasks.filter(task =>
    task.taskName.toLowerCase().includes((searchQuery || "").toLowerCase()) ||
    task.taskId.toString().includes(searchQuery || "")
  );

  const getTasksByStatus = (status) => filteredTasks.filter(t => t.status === status);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    if (!canUpdateTask) {
      alert("Bạn không có quyền thay đổi trạng thái công việc trong workspace này.");
      return;
    }

    const columnStatusMap = {
      "todo": "To-do",
      "in-progress": "In Progress",
      "review": "Review",
      "done": "Done"
    };

    const newStatus = columnStatusMap[destination.droppableId];
    const taskIdStr = draggableId;
    const targetTaskId = parseInt(taskIdStr);

    const blockingTask = isTaskBlocked(targetTaskId);
    if (blockingTask && newStatus !== "To-do") {
      alert(`Không thể di chuyển! Nhiệm vụ này phụ thuộc và cần hoàn thành "TASK-${blockingTask.taskId}: ${blockingTask.taskName}" trước.`);
      return;
    }

    const updatedTasks = localTasks.map(task => {
      if (task.taskId.toString() === taskIdStr) {
        return { ...task, status: newStatus };
      }
      return task;
    });
    setLocalTasks(updatedTasks);

    try {
      const targetTask = localTasks.find(t => t.taskId.toString() === taskIdStr);
      if (targetTask) {
        const payload = { ...targetTask, status: newStatus };
        await TaskService.updateTask(targetTask.taskId, payload);
        if (fetchTasks) await fetchTasks();
      }
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái task qua API:", err);
      if (tasksList) setLocalTasks(tasksList);
    }
  };

  if (isLoading) return <BoardSkeleton />;

  if (!canViewBoard) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-4">
        <div className="bg-rose-500/10 p-4 rounded-full border border-rose-500/20 text-rose-400 animate-pulse">
          <EyeOff className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">Access Denied</h2>
        <p className="text-xs text-slate-500 text-center max-w-sm font-sans">
          Bạn không có quyền xem danh sách công việc trong không gian làm việc này. Vui lòng liên hệ Quản trị viên.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 gap-3">
        <AlertTriangle className="w-8 h-8 text-rose-400" />
        <p className="text-sm font-medium">{error}</p>
        <button 
          onClick={() => fetchTasks ? fetchTasks() : window.location.reload()} 
          className="px-4 py-2 bg-white/5 border border-white/10 rounded text-xs text-white hover:bg-white/10 transition-all cursor-pointer font-mono uppercase tracking-wider"
        >
          Tải lại dữ liệu
        </button>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 gap-4">
        <h2 className="text-xl font-bold text-white">Không có task nào</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Chưa có task nào được tạo trong project này.
        </p>
      </div>
    );
  }

  const openCreateModal = (statusValue) => {
    if (!canCreateTask) return; 
    setFormError("");
    setDefaultStatus(statusValue);
    setIsCreateOpen(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!activeProject?.projectId || !canCreateTask) return;
    setIsSubmitting(true);
    setFormError("");
    const fd = new FormData(e.target);
    const predecessorTaskId = fd.get("predecessorTaskId");
    const dependencyType = fd.get("dependencyType");

    const payload = {
      taskName: fd.get("taskName")?.trim(),
      status: fd.get("status"),
      durationType: fd.get("durationType"),
      estimatedValue: parseFloat(fd.get("estimatedValue") || 0),
      startDate: fd.get("startDate"),
      endDate: fd.get("endDate"),
      complexity: fd.get("complexity"),
      requiredSkillLevel: fd.get("requiredSkillLevel"),
      priority: fd.get("priority"),
      expectedTeamSize: parseInt(fd.get("expectedTeamSize") || 1, 10),
    };

    if (!payload.taskName) {
      setFormError("Vui lòng nhập tên task");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await ProjectService.createProjectTask(activeProject.projectId, payload);
      const newCreatedTask = res?.data || res;
      
      if (newCreatedTask?.taskId && predecessorTaskId) {
        await TaskService.createTaskDependency(newCreatedTask.taskId, {
          predecessorTaskId: parseInt(predecessorTaskId),
          successorTaskId: newCreatedTask.taskId,
          dependencyType: dependencyType
        });
      }

      setIsCreateOpen(false);
      if (fetchTasks) fetchTasks();
    } catch (err) {
      setFormError(err.response?.data?.message || "Lỗi tạo nhiệm vụ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columnsConfig = [
    { id: "todo", title: "To Do", tasks: getTasksByStatus("To-do"), dotColor: "bg-blue-500", statusVal: "To-do" },
    { id: "in-progress", title: "In Progress", tasks: getTasksByStatus("In Progress"), dotColor: "bg-cyan-400", statusVal: "In Progress" },
    { id: "review", title: "Review", tasks: getTasksByStatus("Review"), dotColor: "bg-amber-400", statusVal: "Review" },
    { id: "done", title: "Done", tasks: getTasksByStatus("Done"), dotColor: "bg-emerald-400", statusVal: "Done" },
  ];

  // Helper kiểm tra xem User hiện tại có nằm trong danh sách Assignees hay không
  const myResourceId = currentUser?.profile?.resourceId || currentUser?.userId || currentUser?.id;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      <div className="px-6 pt-4 pb-6 flex-1 overflow-hidden flex flex-col">
        <div className="w-full flex-1 flex flex-col overflow-hidden">
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start flex-1 overflow-y-auto custom-scrollbar pr-1">
              
              {columnsConfig.map((col) => (
                <BoardColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  count={col.tasks.length}
                  dotColor={col.dotColor}
                  ActionIcon={canCreateTask ? Plus : null}
                  onAction={canCreateTask ? () => openCreateModal(col.statusVal) : null}
                >
                  {col.tasks.map((t, index) => {
                    const blockingTask = isTaskBlocked(t.taskId);
                    const isBlocked = !!blockingTask;

                    // Lấy danh sách assignees của task hiện tại
                    const assignees = taskAssigneesMap[t.taskId] || [];

                    // Kiểm tra xem User hiện tại có được assign không
                    const isAssignedToMe = Boolean(
                      myResourceId && assignees.some((m) => 
                        m.resourceId === myResourceId || 
                        m.memberId === myResourceId || 
                        m.userId === myResourceId
                      )
                    );

                    return (
                      <Draggable 
                        key={t.taskId.toString()} 
                        draggableId={t.taskId.toString()} 
                        index={index}
                        isDragDisabled={!canUpdateTask || isBlocked}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.8 : 1,
                              cursor: isBlocked ? "not-allowed" : canUpdateTask ? "grab" : "not-allowed",
                            }}
                            className="mb-4 last:mb-0 transition-shadow duration-150 relative group"
                          >
                            {isBlocked && (
                              <div className="absolute top-2 right-2 bg-rose-950/80 border border-rose-500/30 text-rose-400 p-1 rounded z-10 opacity-80 group-hover:opacity-100 transition-opacity" title={`Bị khóa bởi Task-${blockingTask.taskId}`}>
                                <Lock size={12} className="animate-pulse" />
                              </div>
                            )}
                            <TaskCard 
                              task={t} 
                              assignees={assignees}
                              isAssignedToMe={isAssignedToMe}
                              onClick={() => setSelectedTask(t)} 
                            />
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                </BoardColumn>
              ))}

            </div>
          </DragDropContext>

        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          allTasks={localTasks}
          onClose={() => {
            setSelectedTask(null);
            if (fetchTasks) fetchTasks(); 
          }} 
        />
      )}

      {isCreateOpen && canCreateTask && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsCreateOpen(false)}
        >
          <div 
            className="bg-[#121214]/95 border border-white/10 rounded-xl w-full max-w-lg text-white shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto custom-scrollbar text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/[0.01]">
              <h3 className="text-xs font-mono font-bold flex items-center gap-2 text-blue-400 uppercase tracking-wider">
                <Plus className="w-4 h-4" /> Create New Task
              </h3>
              <button 
                type="button"
                onClick={() => setIsCreateOpen(false)} 
                className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
              >
                <X className="w-4 h-4"/>
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs font-mono bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-md">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Task Name *</label>
                <input 
                  type="text" 
                  name="taskName" 
                  required 
                  placeholder="e.g., Design database schema architecture..."
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/10 rounded-md text-white focus:outline-none focus:border-blue-500/80 transition-all"
                  disabled={isSubmitting}
                />
              </div>

              <div className="p-3 bg-zinc-900/60 border border-white/5 rounded-lg space-y-3">
                <span className="text-[10px] font-mono uppercase text-blue-400 flex items-center gap-1">
                  <LinkIcon size={12}/> Thiết lập Ràng buộc (Tùy chọn)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-400">Task Tiền Đề</label>
                    <div className="relative">
                      <select name="predecessorTaskId" className="w-full pl-2 pr-6 py-1.5 bg-neutral-950 border border-white/10 rounded text-xs text-zinc-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer">
                        <option value="">-- Không có --</option>
                        {localTasks.map(tk => (
                          <option key={tk.taskId} value={tk.taskId}>TASK-{tk.taskId}: {tk.taskName}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-zinc-400">Loại Ràng Buộc</label>
                    <div className="relative">
                      <select name="dependencyType" className="w-full pl-2 pr-6 py-1.5 bg-neutral-950 border border-white/10 rounded text-xs text-zinc-200 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer">
                        <option value="Finish-to-Start">Finish-to-Start</option>
                        <option value="Start-to-Start">Start-to-Start</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Status</label>
                  <div className="relative">
                    <select 
                      name="status" 
                      key={defaultStatus} 
                      defaultValue={defaultStatus} 
                      className="w-full px-3 py-2 text-sm bg-neutral-900 border border-white/10 rounded-md text-slate-200 focus:outline-none focus:border-blue-500/80 appearance-none cursor-pointer"
                      disabled={isSubmitting}
                    >
                      <option value="To-do">To-do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Done">Done</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-slate-500" /> Priority
                  </label>
                  <div className="relative">
                    <select 
                      name="priority" 
                      defaultValue="Medium" 
                      className="w-full px-3 py-2 text-sm bg-neutral-900 border border-white/10 rounded-md text-slate-200 focus:outline-none focus:border-blue-500/80 appearance-none cursor-pointer"
                      disabled={isSubmitting}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" /> Start Date *
                  </label>
                  <input 
                    type="date" 
                    name="startDate" 
                    required 
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full px-3 py-2 text-sm font-mono bg-white/[0.04] border border-white/10 rounded-md text-slate-300 focus:outline-none focus:border-blue-500/80" 
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" /> End Date *
                  </label>
                  <input 
                    type="date" 
                    name="endDate" 
                    required
                    className="w-full px-3 py-2 text-sm font-mono bg-white/[0.04] border border-white/10 rounded-md text-slate-300 focus:outline-none focus:border-blue-500/80" 
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Duration Type</label>
                  <div className="relative">
                    <select 
                      name="durationType" 
                      defaultValue="Hour" 
                      className="w-full px-3 py-2 text-sm bg-neutral-900 border border-white/10 rounded-md text-slate-200 focus:outline-none focus:border-blue-500/80 appearance-none cursor-pointer"
                      disabled={isSubmitting}
                    >
                      <option value="Hour">Hour</option>
                      <option value="Day">Day</option>
                      <option value="StoryPoint">Story Point</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Estimated Value</label>
                  <input 
                    type="number" 
                    name="estimatedValue" 
                    min="0" 
                    step="0.5" 
                    defaultValue="8"
                    className="w-full px-3 py-2 text-sm font-mono bg-white/[0.04] border border-white/10 rounded-md text-white focus:outline-none focus:border-blue-500/80" 
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <BarChart2 className="w-3 h-3 text-slate-500" /> Complexity
                  </label>
                  <div className="relative">
                    <select 
                      name="complexity" 
                      defaultValue="Medium" 
                      className="w-full pl-3 pr-8 py-2 text-xs bg-neutral-900 border border-white/10 rounded-md text-slate-200 focus:outline-none focus:border-blue-500/80 appearance-none cursor-pointer"
                      disabled={isSubmitting}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Skill Level</label>
                  <div className="relative">
                    <select 
                      name="requiredSkillLevel" 
                      defaultValue="Medium" 
                      className="w-full pl-3 pr-8 py-2 text-xs bg-neutral-900 border border-white/10 rounded-md text-slate-200 focus:outline-none focus:border-blue-500/80 appearance-none cursor-pointer"
                      disabled={isSubmitting}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-500" /> Team Size
                  </label>
                  <input 
                    type="number" 
                    name="expectedTeamSize" 
                    min="1" 
                    max="20" 
                    defaultValue="1"
                    className="w-full px-3 py-1.5 text-sm font-mono bg-white/[0.04] border border-white/10 rounded-md text-white focus:outline-none focus:border-blue-500/80" 
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsCreateOpen(false)} 
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 rounded-md text-xs font-mono uppercase tracking-wider font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Creating...
                    </>
                  ) : (
                    "Create Task"
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