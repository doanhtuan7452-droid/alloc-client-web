import { useRef, useMemo } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Filter, Calendar, AlertTriangle } from "lucide-react";
import GanttSkeleton from "../../components/skeletons/GanttSkeleton";

export default function Gantt() {
  const { activeProject, tasksList, isLoading, error } = useOutletContext();
  const navigate = useNavigate();

  // Tham chiếu đồng bộ cuộn giữa danh sách chi tiết (Trái) và lưới Gantt (Phải)
  const leftScrollRef = useRef(null);
  const rightHeaderRef = useRef(null);
  const rightBodyRef = useRef(null);
  const isScrollingRef = useRef(null);

  // Đồng bộ hóa hành động cuộn ngang và cuộn dọc của lưới Gantt
  const handleRightScroll = () => {
    if (isScrollingRef.current === "left") return;
    isScrollingRef.current = "right";
    if (rightBodyRef.current) {
      const { scrollLeft, scrollTop } = rightBodyRef.current;
      if (rightHeaderRef.current) {
        rightHeaderRef.current.scrollLeft = scrollLeft;
      }
      if (leftScrollRef.current) {
        leftScrollRef.current.scrollTop = scrollTop;
      }
    }
    requestAnimationFrame(() => {
      isScrollingRef.current = null;
    });
  };

  const handleLeftScroll = () => {
    if (isScrollingRef.current === "right") return;
    isScrollingRef.current = "left";
    if (leftScrollRef.current && rightBodyRef.current) {
      rightBodyRef.current.scrollTop = leftScrollRef.current.scrollTop;
    }
    requestAnimationFrame(() => {
      isScrollingRef.current = null;
    });
  };

  // Lập cấu trúc thời gian biểu tuần tự động dựa trên thời gian bắt đầu và kết thúc của dự án
  const timelineData = useMemo(() => {
    if (!activeProject) return { weeks: [], monthsHeader: [], timelineDuration: 0, timelineStart: 0 };
    
    const weeks = [];
    const monthsHeader = [];
    const start = new Date(activeProject.startDate);
    const end = new Date(activeProject.endDate);
    
    // Điều chỉnh ngày bắt đầu lùi về Thứ hai gần nhất
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    let current = new Date(new Date(start).setDate(diff));

    while (current <= end || weeks.length < 4) { // Đảm bảo tối thiểu 4 tuần hiển thị
      weeks.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }

    // Tính dải thời gian tuyệt đối của Gantt trục X
    const timelineStart = weeks[0].getTime();
    const timelineEnd = weeks[weeks.length - 1].getTime() + 7 * 24 * 60 * 60 * 1000;
    const timelineDuration = timelineEnd - timelineStart;

    // Nhóm các tuần vào các cột tháng hiển thị tương ứng
    weeks.forEach((week) => {
      const monthLabel = week.toLocaleString("vi-VN", { month: "short", year: "numeric" });
      const existing = monthsHeader.find((m) => m.label === monthLabel);
      if (existing) {
        existing.span += 1;
      } else {
        monthsHeader.push({ label: monthLabel, span: 1 });
      }
    });

    return { weeks, monthsHeader, timelineDuration, timelineStart };
  }, [activeProject]);

  const { weeks, monthsHeader, timelineDuration, timelineStart } = timelineData;

  if (isLoading) {
    return <GanttSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 gap-3">
        <AlertTriangle className="w-8 h-8 text-rose-400" />
        <p className="text-sm">{error}</p>
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
          Workspace này chưa có dự án nào được khởi tạo. Vui lòng tạo dự án mới để hiển thị biểu đồ Gantt.
        </p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {tasksList.length === 0 ? (
        <div className="bg-white/[0.03] border border-white/10 rounded-xl m-6 flex flex-col items-center justify-center p-12 text-slate-400 min-h-[300px]">
          <Calendar className="w-12 h-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">Không có công việc nào</h3>
          <p className="text-sm text-slate-500 text-center max-w-sm">
            Dự án này chưa có công việc nào được cấu hình. Vui lòng chuyển sang tab Board để khởi tạo công việc đầu tiên.
          </p>
        </div>
      ) : (
        <div className="bg-white/[0.03] border-t border-white/10 flex-1 overflow-hidden flex">
          
          {/* Cột trái: Tên & Thông tin chi tiết Task (Chiều ngang cố định, cuộn dọc ẩn) */}
          <div className="w-[320px] md:w-[350px] shrink-0 border-r border-white/10 bg-white/[0.01] flex flex-col overflow-hidden">
            {/* Header Cột Trái */}
            <div className="h-16 shrink-0 border-b border-white/10 px-6 flex items-center justify-between bg-white/[0.02]">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Chi tiết công việc
              </span>
              <Filter className="w-3.5 h-3.5 text-slate-500" />
            </div>
            {/* Danh sách Task Cột Trái */}
            <div className="flex-1 overflow-y-auto no-scrollbar" ref={leftScrollRef} onScroll={handleLeftScroll}>
              {tasksList.map((task) => {
                const { taskId, taskName, priority } = task;
                const mockAssignees = [
                  { name: "AK", bg: "bg-blue-600/25 text-blue-200 border-blue-500/20" },
                  { name: "EV", bg: "bg-emerald-600/25 text-emerald-200 border-emerald-500/20" },
                  { name: "MJ", bg: "bg-purple-600/25 text-purple-200 border-purple-500/20" },
                  { name: "IK", bg: "bg-orange-600/25 text-orange-200 border-orange-500/20" },
                ];
                const assignee = mockAssignees[taskId % mockAssignees.length];

                return (
                  <div key={taskId} className="h-16 border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0 bg-white/[0.005]">
                    <div className="flex flex-col gap-0.5 overflow-hidden pr-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-slate-500 font-semibold shrink-0">
                          #TASK-{taskId}
                        </span>
                        <span className={`text-[8px] uppercase font-mono px-1 rounded border scale-90 ${
                          priority === "Critical" ? "text-red-400 bg-red-950/20 border-red-500/25" :
                          priority === "High" ? "text-amber-400 bg-amber-950/20 border-amber-500/25" : "text-slate-400 bg-slate-900 border-white/5"
                        }`}>
                          {priority}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-white truncate" title={taskName}>
                        {taskName}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono">
                        {task.estimatedValue} {task.durationType === "Hour" ? "giờ" : task.durationType === "Day" ? "ngày" : "SP"} • 👤 {task.expectedTeamSize || 1}
                      </span>
                    </div>
                    
                    <div className={`w-6 h-6 rounded-full border shrink-0 ${assignee.bg} flex items-center justify-center text-[10px] font-bold`}>
                      {assignee.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Lưới Gantt cuộn ngang và dọc */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header Lưới Gantt (Chỉ cuộn ngang, đồng bộ cuộn Body) */}
            <div className="h-16 shrink-0 border-b border-white/10 overflow-hidden bg-white/[0.02]" ref={rightHeaderRef}>
              <div style={{ width: "100%", minWidth: `${weeks.length * 112}px` }} className="flex flex-col text-xs font-mono text-slate-400 text-center h-full">
                {/* Dòng 1: Tháng */}
                <div className="flex border-b border-white/10 bg-white/[0.02] h-8 items-center shrink-0 w-full">
                  {monthsHeader.map((m, idx) => (
                    <div 
                      key={idx} 
                      style={{
                        flexGrow: m.span,
                        flexShrink: 0,
                        minWidth: `${m.span * 112}px`,
                        width: `${m.span * 112}px`
                      }}
                      className="py-1 border-r border-white/5 last:border-r-0 font-bold text-slate-300 text-center shrink-0 truncate px-1"
                    >
                      {m.label}
                    </div>
                  ))}
                </div>
                {/* Dòng 2: Tuần */}
                <div className="flex bg-white/[0.01] h-8 items-center shrink-0 w-full">
                  {weeks.map((week, idx) => {
                    const day = week.getDate();
                    const month = week.getMonth() + 1;
                    return (
                      <div 
                        key={idx} 
                        style={{
                          flexGrow: 1,
                          flexShrink: 0,
                          minWidth: "112px",
                          width: "112px"
                        }}
                        className="py-1 border-r border-white/5 last:border-r-0 text-[10px] text-slate-400 font-mono text-center shrink-0"
                      >
                        W{idx + 1} ({month}/{day})
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Body Lưới Gantt (Cuộn ngang/dọc, gửi sự kiện đồng bộ) */}
            <div className="flex-1 overflow-auto custom-scrollbar bg-white/[0.005]" ref={rightBodyRef} onScroll={handleRightScroll}>
              <div style={{ width: "100%", minWidth: `${weeks.length * 112}px` }} className="relative divide-y divide-white/5">
                {tasksList.map((task) => {
                  const { taskId, startDate, endDate, status } = task;

                  // Tính toán tiến độ dựa trên trạng thái
                  let completion;
                  let barColor;
                  let innerBarColor;
                  let textColor;

                  if (status === "Done") {
                    completion = 100;
                    barColor = "from-emerald-500/15 to-emerald-500/5 border-emerald-500/30";
                    innerBarColor = "bg-emerald-500/30";
                    textColor = "text-emerald-300";
                  } else if (status === "Review") {
                    completion = 85;
                    barColor = "from-amber-500/15 to-amber-500/5 border-amber-500/30";
                    innerBarColor = "bg-amber-500/30";
                    textColor = "text-amber-300";
                  } else if (status === "In Progress") {
                    completion = 50;
                    barColor = "from-cyan-500/15 to-cyan-500/5 border-cyan-500/30";
                    innerBarColor = "bg-cyan-500/30";
                    textColor = "text-cyan-300";
                  } else {
                    completion = 0;
                    barColor = "from-slate-600/10 to-slate-650/5 border-white/10";
                    innerBarColor = "bg-slate-500/20";
                    textColor = "text-slate-400";
                  }

                  // Tính tọa độ pixel thanh Gantt trên lưới
                  const taskStart = new Date(startDate).getTime();
                  const taskEnd = new Date(endDate).getTime();
                  
                  let leftPercent = 0;
                  let widthPercent = 10;
                  if (timelineDuration > 0) {
                    leftPercent = Math.max(0, Math.min(100, ((taskStart - timelineStart) / timelineDuration) * 100));
                    widthPercent = Math.max(0, Math.min(100 - leftPercent, ((taskEnd - taskStart) / timelineDuration) * 100));
                  }

                  return (
                    <div key={taskId} className="h-16 relative flex items-center bg-white/[0.002]">
                      {/* Vẽ các vạch cột phân chia tuần */}
                      {weeks.map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute top-0 bottom-0 border-r border-white/5 pointer-events-none" 
                          style={{ left: `${(i / weeks.length) * 100}%` }}
                        ></div>
                      ))}
                      
                      {/* Thanh biểu đồ Gantt tiến độ */}
                      <div 
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          minWidth: "28px"
                        }}
                        className={`absolute h-8 bg-gradient-to-r ${barColor} border rounded-full overflow-hidden flex items-center p-0.5 shadow-[0_2px_8px_rgba(0,0,0,0.15)]`}
                        title={`${task.taskName} (${status}: ${completion}%)`}
                      >
                        {completion > 0 && (
                          <div 
                            className={`h-full ${innerBarColor} rounded-full transition-all duration-300`}
                            style={{ width: `${completion}%` }}
                          ></div>
                        )}
                        <span className={`absolute left-3 text-[9px] font-mono font-bold ${textColor} drop-shadow-md truncate max-w-[90%]`}>
                          {completion}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
