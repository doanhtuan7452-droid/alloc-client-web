import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import {
  List as ListIcon,
  LayoutList,
  Grid,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Plus,
  Lock,
  EyeOff,
  User,
  ShieldAlert,
  BarChart2
} from "lucide-react";
import TaskDetailModal from "./TaskDetailModal";
import TaskListSkeleton from "../../components/skeletons/TaskListSkeleton";
import TaskService from "../../services/TaskService";
import { useUser } from "../../contexts/UserContext";

export default function List() {
  const { activeProject, tasksList, isLoading, error, searchQuery, fetchTasks } = useOutletContext();
  const { hasPermission, currentUser } = useUser();

  const [selectedTask, setSelectedTask] = useState(null);
  const [taskAssigneesMap, setTaskAssigneesMap] = useState({});
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("endDate");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("grouped"); // "grouped" | "table"
  const [collapsedSections, setCollapsedSections] = useState({});

  const canViewBoard = hasPermission("task:view");
  const canUpdateTask = hasPermission("task:update");

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
      console.error("Lỗi lấy danh sách assignees cho List view:", err);
    }
  };

  // Fetch assignees cho tất cả các task
  useEffect(() => {
    if (tasksList && tasksList.length > 0) {
      fetchAllAssignees(tasksList);
    }
  }, [tasksList]);


  const toggleSection = (sectionId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Ưu tiên sắp xếp theo priority
  const priorityWeight = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };

  // Lọc và sắp xếp danh sách công việc
  const filteredAndSortedTasks = useMemo(() => {
    if (!tasksList) return [];

    return tasksList
      .filter((task) => {
        // Lọc theo search query
        const query = (searchQuery || "").toLowerCase();
        const matchesSearch =
          task.taskName?.toLowerCase().includes(query) ||
          task.taskId?.toString().includes(query);

        // Lọc theo Status
        const matchesStatus =
          statusFilter === "ALL" || task.status === statusFilter;

        // Lọc theo Priority
        const matchesPriority =
          priorityFilter === "ALL" || task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (sortBy === "priority") {
          valA = priorityWeight[a.priority] || 0;
          valB = priorityWeight[b.priority] || 0;
        } else if (sortBy === "endDate" || sortBy === "startDate") {
          valA = a[sortBy] ? new Date(a[sortBy]).getTime() : 0;
          valB = b[sortBy] ? new Date(b[sortBy]).getTime() : 0;
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [tasksList, searchQuery, statusFilter, priorityFilter, sortBy, sortOrder]);

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Done":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "Review":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "In Progress":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case "Done":
        return "bg-emerald-400";
      case "Review":
        return "bg-amber-400";
      case "In Progress":
        return "bg-cyan-400";
      default:
        return "bg-blue-500";
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500/20 text-red-200 border-red-500/30";
      case "High":
        return "bg-amber-500/20 text-amber-200 border-amber-500/30";
      case "Medium":
        return "bg-cyan-500/20 text-cyan-200 border-cyan-500/30";
      default:
        return "bg-neutral-500/20 text-neutral-300 border-neutral-500/30";
    }
  };

  const formatDateText = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} thg ${d.getMonth() + 1}, ${d.getFullYear()}`;
  };

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

  const statusGroups = [
    { id: "To-do", label: "To Do", dotColor: "bg-blue-500" },
    { id: "In Progress", label: "In Progress", dotColor: "bg-cyan-400" },
    { id: "Review", label: "Review", dotColor: "bg-amber-400" },
    { id: "Done", label: "Done", dotColor: "bg-emerald-400" },
  ];

  if (isLoading) {
    return <TaskListSkeleton />;
  }

  if (!canViewBoard) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 gap-4">
        <div className="bg-rose-500/10 p-4 rounded-full border border-rose-500/20 text-rose-400 animate-pulse">
          <EyeOff className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-white font-mono uppercase tracking-wider">Access Denied</h2>
        <p className="text-xs text-slate-500 text-center max-w-sm">
          Bạn không có quyền xem danh sách công việc trong workspace này.
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
          Vui lòng chọn một dự án hợp lệ để xem danh sách công việc.
        </p>
      </div>
    );
  }

  const renderTaskRow = (task) => {
    const assignees = taskAssigneesMap[task.taskId] || [];
    const isOverdue = new Date(task.endDate) < new Date() && task.status !== "Done";

    return (
      <tr
        key={task.taskId}
        onClick={() => setSelectedTask(task)}
        className="hover:bg-white/[0.03] transition-colors cursor-pointer border-b border-white/5 group"
      >
        {/* ID */}
        <td className="px-4 py-3 text-xs font-mono text-slate-400 whitespace-nowrap">
          #TASK-{task.taskId}
        </td>

        {/* Tên Task */}
        <td className="px-4 py-3">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors line-clamp-1">
              {task.taskName}
            </span>
            {isOverdue && (
              <span className="text-[10px] text-red-400 font-mono flex items-center gap-1 mt-0.5">
                <Clock size={10} /> Đã quá hạn!
              </span>
            )}
          </div>
        </td>

        {/* Trạng thái */}
        <td className="px-4 py-3 whitespace-nowrap">
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(
              task.status
            )}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(task.status)}`}></span>
            {task.status}
          </span>
        </td>

        {/* Độ ưu tiên */}
        <td className="px-4 py-3 whitespace-nowrap">
          <span
            className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded border ${getPriorityStyle(
              task.priority
            )}`}
          >
            {task.priority || "Medium"}
          </span>
        </td>

        {/* Thời gian (Start - End) */}
        <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-slate-400">
          <span className={isOverdue ? "text-red-400 font-semibold" : ""}>
            {formatDateText(task.startDate)} - {formatDateText(task.endDate)}
          </span>
        </td>

        {/* Phụ trách (Assignees) */}
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="flex -space-x-1.5 overflow-hidden">
            {assignees.length > 0 ? (
              assignees.slice(0, 3).map((member, idx) => (
                <div
                  key={member.memberId || member.resourceId || idx}
                  title={member.fullName || member.email || "Thành viên"}
                  className="w-6 h-6 rounded-full border border-zinc-700 bg-blue-600/30 text-blue-200 flex items-center justify-center text-[9px] font-bold overflow-hidden"
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(member.fullName)
                  )}
                </div>
              ))
            ) : (
              <span className="text-xs text-slate-500 font-mono">—</span>
            )}
            {assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-300 flex items-center justify-center text-[9px] font-bold">
                +{assignees.length - 3}
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      <div className="px-6 pt-4 pb-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
        {/* Thanh Toolbar Lọc & Sắp Xếp */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Lọc theo Trạng thái */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-neutral-900 border border-white/10 text-xs text-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500/80 cursor-pointer"
              >
                <option value="ALL">Tất cả Trạng thái</option>
                <option value="To-do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Lọc theo Độ ưu tiên */}
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-neutral-900 border border-white/10 text-xs text-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500/80 cursor-pointer"
              >
                <option value="ALL">Tất cả Mức độ</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Sắp xếp */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-neutral-900 border border-white/10 text-xs text-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:border-blue-500/80 cursor-pointer"
              >
                <option value="endDate">Hạn hoàn thành (Due Date)</option>
                <option value="priority">Mức độ ưu tiên</option>
                <option value="taskName">Tên công việc</option>
                <option value="taskId">Mã Task ID</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-2 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-xs text-slate-300 font-mono cursor-pointer"
                title="Đổi chiều sắp xếp"
              >
                {sortOrder === "asc" ? "↑ ASC" : "↓ DESC"}
              </button>
            </div>
          </div>

          {/* Toggle Chế độ xem: Nhóm vs Bảng */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">
              Tổng số: <strong className="text-white">{filteredAndSortedTasks.length}</strong> tasks
            </span>
            <div className="flex border border-white/10 rounded-lg p-0.5 bg-neutral-900">
              <button
                onClick={() => setViewMode("grouped")}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-all cursor-pointer ${
                  viewMode === "grouped"
                    ? "bg-blue-600/30 text-blue-400 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LayoutList size={14} /> Grouped
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-blue-600/30 text-blue-400 font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Grid size={14} /> Flat Table
              </button>
            </div>
          </div>
        </div>

        {/* Nội dung danh sách công việc */}
        {filteredAndSortedTasks.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/10 rounded-xl p-12 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
            <ListIcon className="w-10 h-10 text-slate-500 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">Không tìm thấy công việc phù hợp</h3>
            <p className="text-xs text-slate-500 text-center max-w-sm">
              Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm để hiển thị các công việc khác.
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* Chế độ Bảng Phẳng (Flat Table) */
          <div className="glass-card-light rounded-xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/[0.02] border-b border-white/10 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Tên nhiệm vụ</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3">Ưu tiên</th>
                    <th className="px-4 py-3">Thời gian</th>
                    <th className="px-4 py-3">Phụ trách</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAndSortedTasks.map((task) => renderTaskRow(task))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Chế độ Nhóm theo Status (Grouped View) */
          <div className="space-y-4">
            {statusGroups.map((group) => {
              const groupTasks = filteredAndSortedTasks.filter(
                (t) => t.status === group.id
              );
              const isCollapsed = collapsedSections[group.id];

              if (statusFilter !== "ALL" && statusFilter !== group.id) return null;

              return (
                <div
                  key={group.id}
                  className="glass-card-light rounded-xl border border-white/10 overflow-hidden"
                >
                  {/* Header Nhóm */}
                  <div
                    onClick={() => toggleSection(group.id)}
                    className="px-4 py-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between cursor-pointer hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                      <span className={`w-2.5 h-2.5 rounded-full ${group.dotColor}`}></span>
                      <h4 className="font-bold text-sm text-white">{group.label}</h4>
                      <span className="text-xs font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                        {groupTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Danh sách công việc trong Nhóm */}
                  {!isCollapsed && (
                    <div className="overflow-x-auto custom-scrollbar">
                      {groupTasks.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-500 italic">
                          Không có task nào trong trạng thái này.
                        </div>
                      ) : (
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-white/[0.01] border-b border-white/5 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-2">ID</th>
                              <th className="px-4 py-2">Tên nhiệm vụ</th>
                              <th className="px-4 py-2">Trạng thái</th>
                              <th className="px-4 py-2">Ưu tiên</th>
                              <th className="px-4 py-2">Thời gian</th>
                              <th className="px-4 py-2">Phụ trách</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {groupTasks.map((task) => renderTaskRow(task))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

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
