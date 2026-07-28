import { useState, useEffect, useMemo } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  EyeOff,
  Filter,
  Plus,
  X
} from "lucide-react";
import TaskDetailModal from "./TaskDetailModal";
import CalendarSkeleton from "../../components/skeletons/CalendarSkeleton";
import TaskService from "../../services/TaskService";
import { useUser } from "../../contexts/UserContext";
import { useNotification } from "../../contexts/NotificationContext";

export default function Calendar() {
  const { toast } = useNotification();
  const { activeProject, tasksList, isLoading, error, searchQuery, fetchTasks } = useOutletContext();
  const { hasPermission } = useUser();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDayPopover, setSelectedDayPopover] = useState(null); // { dateStr, tasks }

  const canViewBoard = hasPermission("task:view");
  const canUpdateTask = hasPermission("task:update");

  // Lấy hoặc khởi tạo tháng/năm đang xem từ URL parameter ?month=YYYY-MM
  const monthParam = searchParams.get("month");
  const viewParam = searchParams.get("view") || "month"; // "month" | "week"

  const [currentDate, setCurrentDate] = useState(() => {
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split("-");
      return new Date(parseInt(y), parseInt(m) - 1, 1);
    }
    return new Date();
  });

  // Đồng bộ hoá URL parameter khi chuyển tháng
  const setCalendarMonth = (newDate) => {
    setCurrentDate(newDate);
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, "0");
    const newMonthStr = `${year}-${month}`;

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("month", newMonthStr);
      return next;
    }, { replace: true });
  };

  const handlePrev = () => {
    if (viewParam === "month") {
      setCalendarMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const prevWeek = new Date(currentDate);
      prevWeek.setDate(prevWeek.getDate() - 7);
      setCalendarMonth(prevWeek);
    }
  };

  const handleNext = () => {
    if (viewParam === "month") {
      setCalendarMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const nextWeek = new Date(currentDate);
      nextWeek.setDate(nextWeek.getDate() + 7);
      setCalendarMonth(nextWeek);
    }
  };

  const handleToday = () => {
    setCalendarMonth(new Date());
  };

  const setViewMode = (mode) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("view", mode);
      return next;
    }, { replace: true });
  };

  // Tính toán lưới các ngày trong Tháng (7 cột T2 -> CN)
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (viewParam === "week") {
      // Tính 7 ngày trong tuần của currentDate
      const dayOfWeek = currentDate.getDay();
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() + diffToMon);

      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        weekDays.push({
          date: d,
          isCurrentMonth: d.getMonth() === month,
          isToday: isSameDay(d, new Date()),
        });
      }
      return weekDays;
    }

    // Chế độ Month view
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay(); // 0: Sun, 1: Mon...
    const padPrev = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Đưa T2 thành cột đầu tiên

    const days = [];

    // Ngày padding tháng trước
    for (let i = padPrev; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: isSameDay(d, new Date()),
      });
    }

    // Các ngày trong tháng hiện tại
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        isToday: isSameDay(d, new Date()),
      });
    }

    // Ngày padding tháng sau cho tròn tuần
    const totalCells = Math.ceil(days.length / 7) * 7;
    const padNext = totalCells - days.length;
    for (let i = 1; i <= padNext; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        isToday: isSameDay(d, new Date()),
      });
    }

    return days;
  }, [currentDate, viewParam]);

  function isSameDay(d1, d2) {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  // Lọc task theo từ khóa tìm kiếm
  const filteredTasks = useMemo(() => {
    if (!tasksList) return [];
    const query = (searchQuery || "").toLowerCase();
    return tasksList.filter(
      (t) =>
        t.taskName?.toLowerCase().includes(query) ||
        t.taskId?.toString().includes(query)
    );
  }, [tasksList, searchQuery]);

  // Kiểm tra công việc rơi vào ngày cụ thể
  const getTasksForDay = (dateObj) => {
    const dayTime = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();

    return filteredTasks.filter((task) => {
      if (!task.startDate || !task.endDate) return false;
      const s = new Date(task.startDate);
      const e = new Date(task.endDate);

      const startTime = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime();
      const endTime = new Date(e.getFullYear(), e.getMonth(), e.getDate()).getTime();

      return dayTime >= startTime && dayTime <= endTime;
    });
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Done":
        return "bg-emerald-950/80 border-emerald-500/30 text-emerald-300 hover:border-emerald-400";
      case "Review":
        return "bg-amber-950/80 border-amber-500/30 text-amber-300 hover:border-amber-400";
      case "In Progress":
        return "bg-cyan-950/80 border-cyan-500/30 text-cyan-300 hover:border-cyan-400";
      default:
        return "bg-blue-950/80 border-blue-500/30 text-blue-300 hover:border-blue-400";
    }
  };

  // Kéo & Thả task đổi ngày trên Lịch
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("taskId", task.taskId.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDropOnDay = async (e, targetDateObj) => {
    e.preventDefault();
    if (!canUpdateTask) {
      toast.warning("Bạn không có quyền chỉnh sửa ngày hoàn thành của công việc.");
      return;
    }

    const taskIdStr = e.dataTransfer.getData("taskId");
    if (!taskIdStr) return;

    const targetTaskId = parseInt(taskIdStr);
    const task = tasksList.find((t) => t.taskId === targetTaskId);
    if (!task) return;

    // Tính khoảng cách ngày gốc (duration in days)
    const oldStart = new Date(task.startDate);
    const oldEnd = new Date(task.endDate);
    const durationDays = Math.max(
      0,
      Math.round((oldEnd.getTime() - oldStart.getTime()) / (1000 * 3600 * 24))
    );

    const newStartDate = new Date(targetDateObj);
    const newEndDate = new Date(targetDateObj);
    newEndDate.setDate(newEndDate.getDate() + durationDays);

    const newStartStr = newStartDate.toISOString().split("T")[0];
    const newEndStr = newEndDate.toISOString().split("T")[0];

    try {
      const payload = {
        ...task,
        startDate: newStartStr,
        endDate: newEndStr,
      };
      await TaskService.updateTask(task.taskId, payload);
      if (fetchTasks) await fetchTasks();
    } catch (err) {
      console.error("Lỗi cập nhật thời gian task qua Calendar:", err);
      toast.error("Không thể cập nhật ngày công việc. Vui lòng thử lại.");
    }
  };

  const monthYearTitle = currentDate.toLocaleString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  const weekDayHeaders = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"];

  if (isLoading) {
    return <CalendarSkeleton />;
  }

  if (!canViewBoard) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-4">
        <div className="bg-rose-500/10 p-4 rounded-full border border-rose-500/20 text-rose-400 animate-pulse">
          <EyeOff className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">Access Denied</h2>
        <p className="text-xs text-slate-500 text-center max-w-sm">
          Bạn không có quyền xem lịch công việc trong workspace này.
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
          onClick={() => (fetchTasks ? fetchTasks() : window.location.reload())}
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
        <h2 className="text-xl font-bold text-white">Không tìm thấy dự án</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Vui lòng chọn một dự án hợp lệ để xem lịch công việc.
        </p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      <div className="px-6 pt-4 pb-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
        {/* Header Thanh điều khiển Lịch */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white capitalize flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-400" />
              {monthYearTitle}
            </h3>

            <div className="flex items-center gap-1 border border-white/10 rounded-lg p-0.5 bg-neutral-900 ml-2">
              <button
                onClick={handlePrev}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
                title="Trước"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-mono text-slate-300 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
              >
                Hôm nay
              </button>
              <button
                onClick={handleNext}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
                title="Sau"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex border border-white/10 rounded-lg p-0.5 bg-neutral-900">
              <button
                onClick={() => setViewMode("month")}
                className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer ${
                  viewParam === "month"
                    ? "bg-blue-600/30 text-blue-400 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Tháng
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-3 py-1 text-xs rounded-md transition-all cursor-pointer ${
                  viewParam === "week"
                    ? "bg-blue-600/30 text-blue-400 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Tuần
              </button>
            </div>
          </div>
        </div>

        {/* Khung Lưới Lịch */}
        <div className="glass-card-light rounded-xl overflow-hidden border border-white/10 flex-1 flex flex-col min-h-[500px]">
          {/* Hàng Tiêu đề Thứ (T2 - CN) */}
          <div className="grid grid-cols-7 border-b border-white/10 bg-white/[0.02] text-center text-xs font-mono font-bold text-slate-400 py-2.5">
            {weekDayHeaders.map((day, i) => (
              <div key={i} className="border-r border-white/5 last:border-r-0 uppercase">
                {day}
              </div>
            ))}
          </div>

          {/* Ô Lưới Ngày trong Tháng / Tuần */}
          <div
            className={`grid grid-cols-7 flex-1 divide-x divide-y divide-white/5 bg-white/[0.002] ${
              viewParam === "week" ? "min-h-[400px]" : ""
            }`}
          >
            {calendarDays.map((dayItem, index) => {
              const dayTasks = getTasksForDay(dayItem.date);
              const visibleTasks = dayTasks.slice(0, 3);
              const extraCount = dayTasks.length - 3;

              return (
                <div
                  key={index}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDropOnDay(e, dayItem.date)}
                  className={`p-2 flex flex-col transition-colors min-h-[100px] relative ${
                    dayItem.isCurrentMonth
                      ? "bg-white/[0.005] hover:bg-white/[0.02]"
                      : "bg-black/40 opacity-40"
                  } ${dayItem.isToday ? "ring-1 ring-blue-500/50 bg-blue-500/[0.03]" : ""}`}
                >
                  {/* Số ngày */}
                  <div className="flex justify-between items-center mb-1.5">
                    <span
                      className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                        dayItem.isToday
                          ? "bg-blue-600 text-white shadow-sm"
                          : dayItem.isCurrentMonth
                          ? "text-slate-300"
                          : "text-slate-600"
                      }`}
                    >
                      {dayItem.date.getDate()}
                    </span>

                    {dayTasks.length > 0 && (
                      <span className="text-[9px] font-mono text-slate-500">
                        {dayTasks.length} task
                      </span>
                    )}
                  </div>

                  {/* Danh sách Task Chip trong Ngày */}
                  <div className="flex-1 space-y-1 overflow-hidden">
                    {visibleTasks.map((t) => (
                      <div
                        key={t.taskId}
                        draggable={canUpdateTask}
                        onDragStart={(e) => handleDragStart(e, t)}
                        onClick={() => setSelectedTask(t)}
                        className={`px-2 py-1 rounded text-[10px] font-medium border truncate cursor-pointer transition-all ${getStatusBadgeStyle(
                          t.status
                        )}`}
                        title={`#TASK-${t.taskId}: ${t.taskName} (${t.status})`}
                      >
                        <span className="font-mono opacity-70 mr-1">#{t.taskId}</span>
                        <span>{t.taskName}</span>
                      </div>
                    ))}

                    {extraCount > 0 && (
                      <button
                        onClick={() =>
                          setSelectedDayPopover({
                            dateStr: dayItem.date.toLocaleDateString("vi-VN"),
                            tasks: dayTasks,
                          })
                        }
                        className="w-full text-left px-1.5 py-0.5 text-[9px] font-mono text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                      >
                        +{extraCount} task khác...
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Popover/Modal hiển thị thêm công việc trùng ngày */}
      {selectedDayPopover && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDayPopover(null)}
        >
          <div
            className="bg-neutral-900 border border-white/10 rounded-xl w-full max-w-md p-5 text-white shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h4 className="font-bold text-sm text-blue-400 font-mono">
                Công việc ngày {selectedDayPopover.dateStr} ({selectedDayPopover.tasks.length})
              </h4>
              <button
                onClick={() => setSelectedDayPopover(null)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {selectedDayPopover.tasks.map((t) => (
                <div
                  key={t.taskId}
                  onClick={() => {
                    setSelectedTask(t);
                    setSelectedDayPopover(null);
                  }}
                  className={`p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${getStatusBadgeStyle(
                    t.status
                  )}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono font-bold text-[10px]">#TASK-{t.taskId}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/10 uppercase">
                      {t.status}
                    </span>
                  </div>
                  <div className="text-white line-clamp-1">{t.taskName}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết công việc */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          allTasks={tasksList}
          onClose={() => {
            setSelectedTask(null);
            if (fetchTasks) fetchTasks();
          }}
        />
      )}
    </div>
  );
}
