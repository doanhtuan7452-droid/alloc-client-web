import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Calendar, AlertTriangle, X, Loader2, ChevronDown, BarChart2, ShieldAlert, Users } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"; 
import TaskCard from "../../features/board/TaskCard";
import BoardColumn from "../../features/board/BoardColumn";
import BoardSkeleton from "../../components/skeletons/BoardSkeleton";
import TaskDetailModal from "./TaskDetailModal";
import ProjectService from "../../services/ProjectService";
import TaskService from "../../services/TaskService"; 

export default function Board() {
  const { activeProject, tasksList, isLoading, error, searchQuery, fetchTasks } = useOutletContext();
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [defaultStatus, setDefaultStatus] = useState("To-do");
  
  const [localTasks, setLocalTasks] = useState([]);

  useEffect(() => {
    if (tasksList) setLocalTasks(tasksList);
  }, [tasksList]);

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

    const columnStatusMap = {
      "todo": "To-do",
      "in-progress": "In Progress",
      "review": "Review",
      "done": "Done"
    };

    const newStatus = columnStatusMap[destination.droppableId];
    const taskIdStr = draggableId;

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
        const payload = {
          ...targetTask,
          status: newStatus
        };
        
        // Gọi API cập nhật lên DB
        await TaskService.updateTask(targetTask.taskId, payload);
        
        // Gọi hàm của cha để cập nhật ngay lập tức `tasksList` dùng chung cho Gantt
        if (fetchTasks) {
          await fetchTasks();
        }
      }
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái task qua API:", err);
      if (tasksList) setLocalTasks(tasksList);
    }
  };

  if (isLoading) return <BoardSkeleton />;

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
        <h2 className="text-xl font-bold text-white">Không có dự án nào</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Workspace này chưa có dự án nào được khởi tạo.
        </p>
      </div>
    );
  }

  const openCreateModal = (statusValue) => {
    setFormError("");
    setDefaultStatus(statusValue);
    setIsCreateOpen(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!activeProject?.projectId) return;
    setIsSubmitting(true);
    setFormError("");
    const fd = new FormData(e.target);
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
      await ProjectService.createProjectTask(activeProject.projectId, payload);
      setIsCreateOpen(false);
      if (fetchTasks) {
        fetchTasks();
      } else {
        window.location.reload();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Lỗi tạo task.");
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
                  ActionIcon={Plus}
                  onAction={() => openCreateModal(col.statusVal)}
                >
                  {col.tasks.map((t, index) => (
                    <Draggable key={t.taskId.toString()} draggableId={t.taskId.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.8 : 1,
                          }}
                          className="mb-4 last:mb-0 transition-shadow duration-150"
                        >
                          <TaskCard task={t} onClick={() => setSelectedTask(t)} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                </BoardColumn>
              ))}

            </div>
          </DragDropContext>

        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}

      {/* KHÔI PHỤC LẠI PHẦN FORM CREATE TASK MODAL Ở ĐÂY */}
      {isCreateOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsCreateOpen(false)}
        >
          <div 
            className="bg-[#121214]/95 border border-white/10 rounded-xl w-full max-w-lg text-white shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[90vh] overflow-y-auto custom-scrollbar overflow-hidden"
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Status</label>
                  <div className="relative">
                    <select 
                      name="status" 
                      key={defaultStatus} 
                      defaultValue={defaultStatus} 
                      className="w-full px-3 py-2 text-sm bg-neutral-900 border border-white/10 rounded-md text-slate-200 focus:outline-none focus:border-blue-500/80 appearance-none cursor-pointer transition-colors"
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
                      className="w-full px-3 py-2 text-sm bg-neutral-900 border border-white/10 rounded-md text-slate-200 focus:outline-none focus:border-blue-500/80 appearance-none cursor-pointer transition-colors"
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
                    className="w-full px-3 py-2 text-sm font-mono bg-white/[0.04] border border-white/10 rounded-md text-slate-300 focus:outline-none focus:border-blue-500/80 transition-colors" 
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
                    className="w-full px-3 py-2 text-sm font-mono bg-white/[0.04] border border-white/10 rounded-md text-slate-300 focus:outline-none focus:border-blue-500/80 transition-colors" 
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
                      className="w-full px-3 py-2 text-sm bg-neutral-900 border border-white/10 rounded-md text-slate-200 focus:outline-none focus:border-blue-500/80 appearance-none cursor-pointer transition-colors"
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
                    className="w-full px-3 py-2 text-sm font-mono bg-white/[0.04] border border-white/10 rounded-md text-white focus:outline-none focus:border-blue-500/80 transition-colors" 
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
                      className="w-full pl-3 pr-8 py-2 text-xs bg-neutral-900 border border-white/10 rounded-md text-slate-200 focus:outline-none focus:border-blue-500/80 appearance-none cursor-pointer transition-colors"
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
                      className="w-full pl-3 pr-8 py-2 text-xs bg-neutral-900 border border-white/10 rounded-md text-slate-200 focus:outline-none focus:border-blue-500/80 appearance-none cursor-pointer transition-colors"
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
                    className="w-full px-3 py-1.5 text-sm font-mono bg-white/[0.04] border border-white/10 rounded-md text-white focus:outline-none focus:border-blue-500/80 transition-colors" 
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 rounded-md text-xs font-mono uppercase tracking-wider font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_20px_rgba(59,130,246,0.25)] cursor-pointer disabled:opacity-40"
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