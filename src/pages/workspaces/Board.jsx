import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Plus, Calendar, AlertTriangle, X } from "lucide-react";
import TaskCard from "../../features/board/TaskCard";
import BoardColumn from "../../features/board/BoardColumn";
import BoardSkeleton from "../../components/skeletons/BoardSkeleton";

export default function Board() {
  const { activeProject, tasksList, isLoading, error, searchQuery } = useOutletContext();
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(null);

  // Bộ lọc công việc theo từ khóa tìm kiếm
  const filteredTasks = tasksList.filter(task => 
    task.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.taskId.toString().includes(searchQuery)
  );

  const getTasksByStatus = (status) => {
    return filteredTasks.filter(t => t.status === status);
  };

  if (isLoading) {
    return <BoardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 gap-3">
        <AlertTriangle className="w-8 h-8 text-rose-450 text-rose-400" />
        <p className="text-sm font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-white/5 border border-white/10 rounded text-xs text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 gap-4">
        <h2 className="text-xl font-bold text-white">Không có dự án nào</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Workspace này chưa có dự án nào được khởi tạo. Vui lòng tạo dự án mới để hiển thị bảng công việc.
        </p>
      </div>
    );
  }

  const todoTasks = getTasksByStatus("To-do");
  const inProgressTasks = getTasksByStatus("In Progress");
  const reviewTasks = getTasksByStatus("Review");
  const doneTasks = getTasksByStatus("Done");

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Content block with centered contents */}
      <div className="px-6 pt-4 pb-6 flex-1 overflow-hidden flex flex-col">
        <div className="w-full flex-1 flex flex-col overflow-hidden">
          {/* Grid cột Kanban */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start flex-1 overflow-y-auto custom-scrollbar pr-1">
            <BoardColumn title="To Do" count={todoTasks.length} ActionIcon={Plus}>
              {todoTasks.map(t => (
                <TaskCard key={t.taskId} task={t} onClick={() => setSelectedTask(t)} />
              ))}
            </BoardColumn>

            <BoardColumn title="In Progress" count={inProgressTasks.length} dotColor="bg-cyan-400">
              {inProgressTasks.map(t => (
                <TaskCard key={t.taskId} task={t} onClick={() => setSelectedTask(t)} />
              ))}
            </BoardColumn>

            <BoardColumn title="Review" count={reviewTasks.length} dotColor="bg-amber-450 bg-amber-400">
              {reviewTasks.map(t => (
                <TaskCard key={t.taskId} task={t} onClick={() => setSelectedTask(t)} />
              ))}
            </BoardColumn>

            <BoardColumn title="Done" count={doneTasks.length} dotColor="bg-emerald-400">
              {doneTasks.map(t => (
                <TaskCard key={t.taskId} task={t} onClick={() => setSelectedTask(t)} />
              ))}
            </BoardColumn>
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" onClick={() => setSelectedTask(null)}></div>
          
          <div className="bg-neutral-900 border border-white/10 rounded-xl max-w-md w-full p-6 shadow-2xl relative z-10 animate-fadeIn">
            <button 
              onClick={() => setSelectedTask(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-[10px] font-mono text-slate-500 font-semibold mb-1">
              #TASK-{selectedTask.taskId}
            </div>
            
            <h3 className="text-xl font-bold text-white mb-6 pr-8 leading-snug">
              {selectedTask.taskName}
            </h3>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/5">
                <div>
                  <span className="text-[11px] font-mono text-slate-500 block mb-1">Trạng thái</span>
                  <span className="inline-block bg-white/10 text-white border border-white/5 px-2.5 py-1 rounded text-xs font-semibold uppercase">
                    {selectedTask.status}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-500 block mb-1">Độ phức tạp</span>
                  <span className="inline-block bg-white/10 text-white border border-white/5 px-2.5 py-1 rounded text-xs font-semibold uppercase">
                    {selectedTask.complexity}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/5">
                <div>
                  <span className="text-[11px] font-mono text-slate-500 block mb-1">Mức độ ưu tiên</span>
                  <span className="inline-block bg-white/10 text-white border border-white/5 px-2.5 py-1 rounded text-xs font-semibold uppercase">
                    {selectedTask.priority}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-500 block mb-1">Trình độ chuyên môn</span>
                  <span className="inline-block bg-white/10 text-white border border-white/5 px-2.5 py-1 rounded text-xs font-semibold uppercase">
                    {selectedTask.requiredSkillLevel}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-white/5">
                <div>
                  <span className="text-[11px] font-mono text-slate-500 block mb-1">Ước tính nỗ lực</span>
                  <span className="font-mono text-white text-sm font-semibold">
                    {selectedTask.estimatedValue} {selectedTask.durationType === "Hour" ? "giờ" : selectedTask.durationType === "Day" ? "ngày" : "Story Points"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-500 block mb-1">Nhân sự kỳ vọng</span>
                  <span className="font-mono text-white text-sm font-semibold">
                    👤 {selectedTask.expectedTeamSize || 1} người
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-500 block mb-1">Thời gian thực hiện</span>
                <div className="flex items-center gap-2 text-white">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="font-mono text-xs text-slate-350">
                    {selectedTask.startDate} / {selectedTask.endDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium rounded transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
