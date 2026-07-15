import { useState, useEffect } from "react";
import {
  Clock,
  Plus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Edit3,
} from "lucide-react";
import TimesheetService from "../../services/TimesheetService";

export default function Timesheets() {
  const [timeLogs, setTimeLogs] = useState([]);
  const [projects, setProjects] = useState([]); // Lưu danh sách Dự án từ API
  const [tasks, setTasks] = useState([]);       // Lưu danh sách Task từ API theo dự án được chọn
  const [selectedProjectId, setSelectedProjectId] = useState(""); // Dự án đang chọn trong Modal
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Lấy Workspace ID hiện tại từ localStorage
  const currentWorkspaceId = Number(localStorage.getItem("lastActiveWorkspaceId") || 12);

  // 1. Hàm tải danh sách Timesheet từ API
  const fetchTimesheets = () => {
    setIsLoading(true);
    TimesheetService.getTimesheets(currentWorkspaceId)
      .then((res) => {
        const items = res.items || res.data?.items || res.data || [];
        setTimeLogs(items);

        // Tự động chọn ngày có log đầu tiên để hiển thị
        if (items.length > 0 && !selectedDate) {
          setSelectedDate(items[0].workDate);
        } else if (!selectedDate) {
          setSelectedDate(new Date().toISOString().split("T")[0]);
        }
      })
      .catch((err) => console.error("Lỗi tải Timesheets:", err))
      .finally(() => setIsLoading(false));
  };

  // 2. Tải danh sách Dự án khi mở ứng dụng hoặc khi đổi Workspace
  useEffect(() => {
    fetchTimesheets();
    
    TimesheetService.getProjects(currentWorkspaceId)
      .then((res) => {
        const projectList = res.data || res || [];
        setProjects(projectList);
      })
      .catch((err) => console.error("Lỗi tải danh sách dự án:", err));
  }, [currentWorkspaceId]);

  // 3. Tự động tải danh sách Task khi người dùng chọn một Dự án cụ thể trong Modal
  useEffect(() => {
    if (!selectedProjectId) {
      setTasks([]);
      return;
    }

    TimesheetService.getTasksByProject(selectedProjectId)
      .then((res) => {
        // Hứng dữ liệu theo cấu trúc phân trang từ Test 16 (res.data.items hoặc res.items)
        const taskList = res.data?.items || res.items || res.data || [];
        setTasks(taskList);
      })
      .catch((err) => console.error("Lỗi tải danh sách task:", err));
  }, [selectedProjectId]);

  // Thống kê tổng giờ từ dữ liệu thật
  const totalHours = timeLogs.reduce((sum, log) => sum + (log.normalHours || 0) + (log.otHours || 0), 0);
  const normalHoursSum = timeLogs.reduce((sum, log) => sum + (log.normalHours || 0), 0);
  const otHoursSum = timeLogs.reduce((sum, log) => sum + (log.otHours || 0), 0);

  // Submit form gửi dữ liệu lên Backend
  const handleLogTime = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const submitData = {
      workspaceId: currentWorkspaceId,
      taskId: parseInt(formData.get("taskId")),
      workDate: formData.get("date"),
      normalHours: parseFloat(formData.get("normalHours") || 0),
      otHours: parseFloat(formData.get("otHours") || 0),
      comment: formData.get("comment") || "",
    };

    try {
      await TimesheetService.createTimesheet(submitData);
      setIsModalOpen(false);
      setSelectedProjectId(""); // Reset dự án đã chọn
      setTasks([]);             // Reset danh sách task cũ
      fetchTimesheets();        // Tải lại dữ liệu để đồng bộ hiển thị
      alert("Ghi nhận giờ làm việc thành công!");
    } catch (e) {
      alert("Lỗi: " + (e.response?.data?.message || e.message));
    }
  };

  // Xử lý lọc danh sách hiển thị
  const getFilteredLogs = () => {
    return timeLogs.filter((log) => log.workDate === selectedDate);
  };

  const uniqueDates = [...new Set(timeLogs.map((t) => t.workDate))].sort().reverse();
  if (selectedDate && !uniqueDates.includes(selectedDate)) {
    uniqueDates.unshift(selectedDate);
  }

  return (
    <div className="flex-1 overflow-y-auto h-full p-4 md:p-6 custom-scrollbar">
      <div className="max-w-6xl mx-auto pb-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Clock className="w-8 h-8 text-blue-400" /> Timesheets
            </h1>
            <p className="text-content-muted text-sm">
              Ghi nhận nhật ký công việc hàng ngày, Normal Hours, OT Hours và theo dõi số giờ công tích lũy.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors shadow-lg shadow-blue-600/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Log Time
          </button>
        </div>

        {/* Thống kê số giờ công */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-content-muted block mb-1">TỔNG GIỜ LÀM</span>
              <span className="text-2xl font-bold font-mono text-content-primary">{totalHours.toFixed(1)}h</span>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-content-muted block mb-1">NORMAL HOURS</span>
              <span className="text-2xl font-bold font-mono text-emerald-400">{normalHoursSum.toFixed(1)}h</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-content-muted block mb-1">OT HOURS</span>
              <span className="text-2xl font-bold font-mono text-amber-400">{otHoursSum.toFixed(1)}h</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Bố cục chính */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Cột trái: Chọn ngày */}
          <div className="md:col-span-1 bg-white/[0.02] border border-white/10 rounded-xl p-4 h-fit">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2 text-content-primary">
              <Calendar className="w-4 h-4 text-content-muted" /> Chọn Ngày
            </h3>

            <div className="flex items-center justify-between bg-inset p-2 rounded border border-border-default mb-4">
              <button className="text-content-muted hover:text-white p-1 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-content-secondary">
                Tháng {selectedDate ? selectedDate.split("-")[1] : "--"} / {selectedDate ? selectedDate.split("-")[0] : "----"}
              </span>
              <button className="text-content-muted hover:text-white p-1 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 font-mono text-xs">
              {uniqueDates.map((date) => {
                const dailyTotal = timeLogs
                  .filter((l) => l.workDate === date)
                  .reduce((s, l) => s + (l.normalHours || 0) + (l.otHours || 0), 0);

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`w-full text-left p-2 rounded transition-colors flex justify-between cursor-pointer ${
                      selectedDate === date
                        ? "bg-blue-600/10 text-blue-400 border border-blue-500/30"
                        : "hover:bg-white/[0.04] text-content-muted"
                    }`}
                  >
                    <span>{date}</span>
                    <span className="font-bold">{dailyTotal.toFixed(1)}h</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cột phải: Chi tiết hoạt động */}
          <div className="md:col-span-3 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-content-primary">
              <FileText className="w-5 h-5 text-content-muted" /> Nhật Ký Hoạt Động (Ngày {selectedDate})
            </h3>

            {isLoading ? (
              <div className="text-center py-10 text-slate-400 text-sm">Đang tải dữ liệu...</div>
            ) : getFilteredLogs().length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">Chưa có nhật ký nào cho ngày này.</div>
            ) : (
              <div className="space-y-4">
                {getFilteredLogs().map((log) => (
                  <div
                    key={log.timesheetId}
                    className="p-4 rounded-xl bg-surface/40 border border-white/5 hover:border-border-default transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/[0.05] border border-white/5 text-content-secondary">
                          {log.projectName || "Dự án chung"}
                        </span>
                        <h4 className="text-sm font-semibold text-content-primary mt-1.5">
                          {log.taskName}
                        </h4>
                        {log.comment && <p className="text-xs text-zinc-400 mt-1 italic">"{log.comment}"</p>}
                      </div>

                      <div className="flex flex-col items-end gap-1 self-end sm:self-center">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/20 px-2 py-0.5 border border-emerald-900/30 rounded">
                            {(log.normalHours || 0).toFixed(1)}h Normal
                          </span>
                          {(log.otHours || 0) > 0 && (
                            <span className="text-xs font-mono text-amber-400 bg-amber-950/20 px-2 py-0.5 border border-amber-900/30 rounded">
                              {log.otHours.toFixed(1)}h OT
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/5 flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-mono">Thành viên: {log.memberName}</span>
                      <button
                        onClick={() => alert("Tính năng đang được phát triển")}
                        className="text-[11px] font-mono flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" /> Sửa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Form Log Time */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-md text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400">
              <Clock className="w-5 h-5" /> Ghi Nhận Giờ Làm Việc
            </h3>

            <form onSubmit={handleLogTime} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Ngày làm việc</label>
                <input
                  type="date"
                  name="date"
                  defaultValue={selectedDate}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white font-mono"
                  required
                />
              </div>

              {/* Ô chọn Dự án - Dữ liệu lấy từ API */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Thuộc dự án</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">-- Chọn dự án --</option>
                  {projects.map((proj) => (
                    <option key={proj.projectId} value={proj.projectId}>
                      {proj.projectName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ô chọn Đầu việc - Chỉ hiển thị khi đã chọn Dự án và dữ liệu được load tự động từ API */}
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Đầu việc (Task)</label>
                <select
                  name="taskId"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  disabled={!selectedProjectId}
                  required
                >
                  <option value="">
                    {!selectedProjectId ? "Vui lòng chọn dự án trước" : "-- Chọn công việc --"}
                  </option>
                  {tasks.map((task) => (
                    <option key={task.taskId} value={task.taskId}>
                      [{task.status}] {task.taskName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Normal Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    name="normalHours"
                    defaultValue="8"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">OT Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    name="otHours"
                    defaultValue="0"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Ghi chú công việc</label>
                <textarea
                  name="comment"
                  placeholder="Hôm nay bạn làm được những gì..."
                  rows="2"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                ></textarea>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedProjectId("");
                    setTasks([]);
                  }}
                  className="flex-1 py-2 cursor-pointer text-xs border border-zinc-700 rounded bg-transparent hover:bg-zinc-800 text-zinc-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 cursor-pointer text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                >
                  Nộp Nhật Ký
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}