export default function TaskCard({ task, onClick }) {
  const { taskId, taskName, endDate, status, priority, complexity } = task;
  
  // Kiểm tra trễ hạn (so sánh với ngày simulated 2026-06-15)
  const isOverdue = new Date(endDate) < new Date("2026-06-15") && status !== "Done";
  
  // Phân bổ ngẫu nhiên avatar người phụ trách dựa trên ID công việc
  const mockAssignees = [
    { name: "AK", bg: "bg-blue-600/25 text-blue-200 border-blue-500/20" },
    { name: "EV", bg: "bg-emerald-600/25 text-emerald-200 border-emerald-500/20" },
    { name: "MJ", bg: "bg-purple-600/25 text-purple-200 border-purple-500/20" },
    { name: "IK", bg: "bg-orange-600/25 text-orange-200 border-orange-500/20" },
  ];
  const assignee = mockAssignees[taskId % mockAssignees.length];

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

  return (
    <div 
      onClick={onClick}
      className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-lg p-4 flex flex-col transition-all duration-200 cursor-pointer shadow-md group"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-mono text-slate-500 font-semibold">
          #TASK-{taskId}
        </span>
        <div className="flex gap-1.5">
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

      <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-2 border-t border-white/5">
        <span className={`font-mono text-[10px] ${isOverdue ? "text-red-400 font-bold" : "text-slate-450 text-slate-400"}`}>
          Hạn: {endDate} {isOverdue && "(Trễ)"}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-500" title="Expected team size">
            👤 {task.expectedTeamSize || 1}
          </span>
          <div className={`w-5 h-5 rounded-full border ${assignee.bg} flex items-center justify-center text-[9px] font-bold`}>
            {assignee.name}
          </div>
        </div>
      </div>
    </div>
  );
}
