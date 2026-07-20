import { Clock } from "lucide-react";

export default function TaskCard({ task, onClick, assignees = [], isAssignedToMe = false }) {
  const { taskId, taskName, startDate, endDate, status, priority, complexity } = task;

  const isOverdue = new Date(endDate) < new Date() && status !== "Done";

  const formatDateText = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} thg ${d.getMonth() + 1}`;
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

  // Trích xuất tên ngắn (Initials) khi không có Avatar URL
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

  return (
    <div 
      onClick={onClick}
      className="relative bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 rounded-lg p-4 flex flex-col transition-all duration-200 cursor-pointer shadow-md group"
    >
      {/* Hiển thị dấu ★ màu vàng ở góc trên phải nếu user hiện tại được gán công việc này */}
      {isAssignedToMe && (
        <span 
          className="absolute -top-1.5 -right-1.5 text-amber-400 font-bold text-base leading-none select-none drop-shadow-[0_0_6px_rgba(251,191,36,0.8)] z-10" 
          title="Nhiệm vụ được giao cho bạn"
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

      <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-2 border-t border-white/5">
        <span className={`font-mono text-[10px] ${isOverdue ? "text-red-400 font-bold" : "text-slate-400"}`}>
          Hạn: {endDate} {isOverdue && "(Trễ)"}
        </span>

        <div className="flex items-center gap-1.5">
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-colors
            ${isOverdue 
              ? "bg-red-900/40 text-red-400 border border-red-500/20" 
              : "bg-white/[0.04] text-slate-400"
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> 
            <span>
              {formatDateText(startDate)} - {formatDateText(endDate)}
            </span>
          </div>

          {/* Render danh sách Assignees thực tế */}
          <div className="flex -space-x-1.5 overflow-hidden">
            {assignees.length > 0 ? (
              assignees.slice(0, 3).map((member, idx) => (
                <div
                  key={member.memberId || member.resourceId || idx}
                  title={member.fullName || member.email || "Thành viên"}
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
                title="Chưa có người phụ trách"
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
    </div>
  );
}