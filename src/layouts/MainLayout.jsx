import { useState, useEffect } from "react";
import { Outlet, useSearchParams, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import Topbar from "../components/navigation/Topbar";
import AIChatPanelContainer from "../features/ai-chat/components/AIChatPanelContainer";
import { AlertCircle, X, ArrowRight } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import TimesheetService from "../services/TimesheetService";
import ReviewCycleService from "../services/ReviewCycleService";

export default function MainLayout() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);
  const [showReviewBanner, setShowReviewBanner] = useState(false);
  const [activeCycle, setActiveCycle] = useState(null);
  const todayStr = new Date().toLocaleDateString("sv-SE");

  const workspaceIdParam = searchParams.get("workspaceId");
  const projectIdParam = searchParams.get("projectId");
  const isAiChatPage = location.pathname === "/ai-chat";

  useEffect(() => {
    if (location.pathname === "/timesheets") {
      setShowBanner(false);
      return;
    }

    const dismissed = localStorage.getItem(`dismissedBanner_${todayStr}`);
    if (dismissed === "true") {
      setShowBanner(false);
      return;
    }

    const workspaceId = Number(localStorage.getItem("lastActiveWorkspaceId") || 12);
    if (!workspaceId) return;

    TimesheetService.getTimesheets(workspaceId, { fromDate: todayStr, toDate: todayStr })
      .then((res) => {
        const logs = res.items || res.data?.items || res.data || [];
        if (logs.length === 0) {
          setShowBanner(true);
        } else {
          setShowBanner(false);
        }
      })
      .catch((err) => console.error("Lỗi kiểm tra log timesheet ngày hôm nay:", err));
  }, [location.pathname, todayStr]);

  // Kiểm tra chu kỳ đánh giá đang hoạt động
  useEffect(() => {
    if (location.pathname === "/workspaces/hr") {
      setShowReviewBanner(false);
      return;
    }

    const workspaceId = Number(localStorage.getItem("lastActiveWorkspaceId") || 12);
    if (!workspaceId) return;

    ReviewCycleService.getReviewCycles(workspaceId)
      .then((cycles) => {
        const active = (cycles || []).find((c) => c.status === "Active");
        if (active) {
          const cId = active.reviewCycleId || active.id || active.cycleID;
          const dismissed = localStorage.getItem(`dismissedReviewBanner_${cId}`);
          if (dismissed === "true") {
            setShowReviewBanner(false);
          } else {
            setActiveCycle(active);
            setShowReviewBanner(true);
          }
        } else {
          setShowReviewBanner(false);
          setActiveCycle(null);
        }
      })
      .catch((err) => console.error("Lỗi kiểm tra chu kỳ đánh giá hoạt động:", err));
  }, [location.pathname, workspaceIdParam]);

  const handleDismissBanner = () => {
    localStorage.setItem(`dismissedBanner_${todayStr}`, "true");
    setShowBanner(false);
  };

  const handleDismissReviewBanner = () => {
    if (activeCycle) {
      const cId = activeCycle.reviewCycleId || activeCycle.id || activeCycle.cycleID;
      localStorage.setItem(`dismissedReviewBanner_${cId}`, "true");
    }
    setShowReviewBanner(false);
  };

  const toggleAiChat = () => {
    setIsAiChatOpen((prev) => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden">
      <Topbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isAiChatOpen={isAiChatOpen}
        onToggleAiChat={toggleAiChat}
      />

      {showBanner && (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/20 text-amber-400 px-6 py-3 flex items-center justify-between gap-4 text-xs shadow-lg animate-pulse-subtle z-40 relative shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>{t("timesheets.bannerMessage")}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate("/timesheets")}
              className="px-3 py-1 bg-amber-500 text-black hover:bg-amber-400 font-bold rounded flex items-center gap-1 transition-colors cursor-pointer"
            >
              {t("timesheets.bannerAction")}
              <ArrowRight size={12} />
            </button>
            <button
              onClick={handleDismissBanner}
              className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
              title={t("timesheets.bannerDismiss")}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {showReviewBanner && activeCycle && (
        <div className="w-full bg-blue-600/10 border-b border-blue-500/20 text-blue-400 px-6 py-3 flex items-center justify-between gap-4 text-xs shadow-lg animate-pulse-subtle z-40 relative shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-blue-500" />
            <span>
              {t("activeProjects.reviewBannerMessage").replace(
                "{name}",
                activeCycle.name || activeCycle.cycleName
              )}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                const workspaceId = Number(localStorage.getItem("lastActiveWorkspaceId") || 12);
                navigate(`/workspaces/hr?workspaceId=${workspaceId}`);
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-1 transition-colors cursor-pointer"
            >
              {t("activeProjects.reviewBannerAction")}
              <ArrowRight size={12} />
            </button>
            <button
              onClick={handleDismissReviewBanner}
              className="text-slate-400 hover:text-white p-1 transition-colors cursor-pointer"
              title={t("activeProjects.reviewBannerDismiss")}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Giảm padding xuống p-1.5 và gap giữa các khối xuống gap-1.5 */}
      <div className="flex-1 flex overflow-hidden p-1.5 gap-1.5 relative">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggleCollapse={toggleSidebar} />

        {/* Thay đổi rounded-xl thành rounded-md để giữ cảm giác khối vuông cứng cáp */}
        <main className={`flex-1 flex flex-col overflow-hidden relative transition-all duration-300 ${
          isAiChatPage
            ? ""
            : "bg-white/10 backdrop-blur-md border border-white/10 rounded-md shadow-2xl"
        }`}>
          <Outlet context={[searchQuery, setSearchQuery, isAiChatOpen, toggleAiChat, isSidebarCollapsed, toggleSidebar]} />
        </main>

        {/* Sliding Alloc AI Chat Drawer bên PHẢI màn hình (Tự động mở rộng 440px - 520px khi Sidebar thu gọn) */}
        <div
          className={`h-full shrink-0 transition-all duration-300 ease-in-out z-20 ${
            isAiChatOpen
              ? isSidebarCollapsed
                ? "w-full sm:w-[440px] md:w-[480px] lg:w-[520px] opacity-100"
                : "w-full sm:w-[380px] md:w-[420px] lg:w-[460px] opacity-100"
              : "w-0 opacity-0 pointer-events-none"
          }`}
        >
          <AIChatPanelContainer
            initialWorkspaceId={workspaceIdParam ? Number(workspaceIdParam) : null}
            initialProjectId={projectIdParam ? Number(projectIdParam) : null}
            onClose={() => setIsAiChatOpen(false)}
            isDrawer={true}
          />
        </div>
      </div>
    </div>
  );
}
