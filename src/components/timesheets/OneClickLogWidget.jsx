import { useState, useEffect } from "react";
import { Clock, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import WorkspaceService from "../../services/WorkspaceService";
import ProjectService from "../../services/ProjectService";
import TimesheetService from "../../services/TimesheetService";
import { useNotification } from "../../contexts/NotificationContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useUser } from "../../contexts/UserContext";
import AllocationModal from "./AllocationModal";

export default function OneClickLogWidget({ workspaceId, timeLogs, onSuccess, standardHours = 8 }) {
  const { t } = useLanguage();
  const { toast } = useNotification();
  const { currentUser } = useUser();
  const [status, setStatus] = useState("idle"); // idle, scanning, submitting, success
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocationData, setAllocationData] = useState({ tasks: [], otRequests: [] });
  const [todayLoggedHours, setTodayLoggedHours] = useState(0);

  const todayStr = new Date().toLocaleDateString("sv-SE"); // sv-SE format matches YYYY-MM-DD

  // Kiểm tra xem hôm nay đã chấm công chưa và tính tổng giờ đã chấm
  useEffect(() => {
    if (!timeLogs) return;
    const todayEntries = timeLogs.filter((log) => log.workDate === todayStr);
    const total = todayEntries.reduce((sum, log) => sum + (log.normalHours || 0) + (log.otHours || 0), 0);
    setTodayLoggedHours(total);
    if (total > 0) {
      setStatus("success");
    } else {
      setStatus("idle");
    }
  }, [timeLogs, todayStr]);

  const handleOneClickLog = async () => {
    if (status === "scanning" || status === "submitting" || todayLoggedHours > 0) return;

    setStatus("scanning");
    try {
      // 1. Lấy thông tin các project trong workspace
      const projectsRes = await WorkspaceService.getWorkspaceProjects(workspaceId);
      const projects = projectsRes.data || projectsRes || [];

      // 2. Lấy thông tin các member để xác định workspaceMemberId của user hiện tại
      const membersRes = await WorkspaceService.getWorkspaceMembers(workspaceId);
      const members = membersRes.items || membersRes.data?.items || membersRes.data || membersRes || [];
      const currentMember = members.find(
        (m) => String(m.resource?.resourceId) === String(currentUser?.profile?.resourceId)
      );

      if (!currentMember) {
        toast.error("Không tìm thấy thông tin thành viên của bạn trong không gian này.");
        setStatus("idle");
        return;
      }

      const memberId = currentMember.workspaceMemberId || currentMember.id;

      // 3. Quét các đơn OT được duyệt của user trong ngày hôm nay
      let otRequests = [];
      try {
        const otRes = await WorkspaceService.getOTRequests(workspaceId);
        const otList = otRes.items || otRes.data?.items || otRes.data || otRes || [];
        otRequests = otList.filter(
          (req) =>
            req.workspaceMemberId === memberId &&
            req.requestedDate === todayStr &&
            req.status === "Approved"
        );
      } catch (err) {
        console.warn("Server không hỗ trợ API GET ot-requests. Sử dụng dữ liệu mô phỏng local.");
      }

      // 4. Quét các Task đang chạy được giao cho user
      const activeTasks = [];
      for (const proj of projects) {
        try {
          const tasksRes = await ProjectService.getProjectTasks(proj.projectId, { assignedToMe: true });
          const tasks = tasksRes.items || tasksRes.data?.items || tasksRes.data || tasksRes || [];
          
          // Lọc task: startDate <= hôm nay <= endDate, status khác Done (hoặc vừa Done trong ngày)
          const todayTasks = tasks.filter((task) => {
            const isWithinDate = task.startDate <= todayStr && todayStr <= task.endDate;
            const isNotDone = task.status !== "Done" || task.updatedAt?.startsWith(todayStr);
            return isWithinDate && isNotDone;
          });
          
          activeTasks.push(...todayTasks);
        } catch (err) {
          console.error(`Lỗi khi quét task của project ${proj.projectId}:`, err);
        }
      }

      if (activeTasks.length === 0) {
        toast.warning(t("timesheets.noTasksRunning"));
        setStatus("idle");
        return;
      }

      // 5. Logic phân bổ giờ công
      if (activeTasks.length === 1) {
        // Kịch bản A: Chỉ 1 task
        setStatus("submitting");
        const singleTask = activeTasks[0];
        
        // Tìm đơn OT được duyệt cho project này
        const matchOT = otRequests.find(
          (req) => req.projectId === singleTask.projectId || req.taskId === singleTask.taskId
        );
        const otHours = matchOT ? parseFloat(matchOT.expectedHours || 0) : 0;

        const payload = {
          taskId: singleTask.taskId,
          workDate: todayStr,
          normalHours: parseFloat(standardHours),
          otHours: otHours,
        };

        await TimesheetService.createTimesheet(payload);
        toast.success(t("timesheets.oneClickSuccess"));
        setStatus("success");
        if (onSuccess) onSuccess();
      } else {
        // Kịch bản B: Nhiều task song song -> hiển thị Modal sliders phân bổ
        setAllocationData({ tasks: activeTasks, otRequests });
        setIsAllocating(true);
      }
    } catch (error) {
      console.error("Lỗi khi chấm công tự động:", error);
      toast.error("Đã xảy ra lỗi khi chấm công tự động.");
      setStatus("idle");
    }
  };

  const handleConfirmAllocation = async (allocationList) => {
    setIsAllocating(false);
    setStatus("submitting");
    try {
      // Gửi POST /timesheets tuần tự (Sequential API Sender)
      for (const item of allocationList) {
        if (item.normalHours > 0 || item.otHours > 0) {
          await TimesheetService.createTimesheet({
            taskId: item.taskId,
            workDate: todayStr,
            normalHours: parseFloat(item.normalHours),
            otHours: parseFloat(item.otHours)
          });
        }
      }

      toast.success(t("timesheets.oneClickSuccess"));
      setStatus("success");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Lỗi khi gửi chấm công phân bổ:", error);
      toast.error(error.response?.data?.message || "Lỗi khi nộp giờ công phân bổ.");
      setStatus("idle");
    }
  };

  return (
    <>
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5 mb-6 glass-card-light">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-content-primary">{t("timesheets.oneClickWidgetTitle")}</h3>
              <p className="text-xs text-content-muted mt-1">
                {todayLoggedHours > 0
                  ? `Đã chấm công ${todayLoggedHours.toFixed(1)} giờ cho hôm nay (${todayStr})`
                  : "Tự động phân bổ giờ làm việc cho các task đang chạy hôm nay chỉ với 1 click."}
              </p>
            </div>
          </div>

          <button
            onClick={handleOneClickLog}
            disabled={status === "scanning" || status === "submitting" || todayLoggedHours > 0}
            className={`px-5 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all flex items-center gap-2 select-none border min-w-[170px] justify-center ${
              todayLoggedHours > 0
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-not-allowed"
                : status === "scanning" || status === "submitting"
                ? "bg-zinc-800 border-zinc-700 text-zinc-400 cursor-wait"
                : "bg-blue-600 border-blue-500 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
            }`}
          >
            {status === "scanning" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("timesheets.scanningTasks")}
              </>
            ) : status === "submitting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("timesheets.submittingLogs")}
              </>
            ) : todayLoggedHours > 0 ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                {t("timesheets.loggedTodayBtn").replace("{hours}", todayLoggedHours.toFixed(1))}
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                {t("timesheets.logTodayBtn")}
              </>
            )}
          </button>
        </div>
      </div>

      {isAllocating && (
        <AllocationModal
          isOpen={isAllocating}
          onClose={() => {
            setIsAllocating(false);
            setStatus("idle");
          }}
          tasks={allocationData.tasks}
          otRequests={allocationData.otRequests}
          standardHours={standardHours}
          onSubmit={handleConfirmAllocation}
        />
      )}
    </>
  );
}
