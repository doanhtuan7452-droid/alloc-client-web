import { useState, useEffect } from "react";
import { useSearchParams, useOutletContext, Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useUser } from "../../contexts/UserContext";
import {
  Plus,
  Users,
  LayoutGrid,
  CheckCircle2,
  ClipboardList,
  PlayCircle,
  Settings
} from "lucide-react";
import ProjectCard from "../../features/workspaces/ProjectCard";
import ProjectSkeleton from "../../features/workspaces/ProjectSkeleton";
import CreateProjectModal from "../../features/workspaces/CreateProjectModal";
import ProjectService from "../../services/ProjectService";
import { useLanguage } from "../../contexts/LanguageContext";
import WorkspaceSettingsModal from "../../components/workspaces/WorkspaceSettingsModal";

export default function ActiveProjects() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const workspaceIdParam = searchParams.get("workspaceId");
  
  const { 
    workspaceInfo, 
    projectsList, 
    isLoading, 
    error, 
    searchQuery, 
    setSearchQuery, 
    setRefreshTrigger,
  } = useOutletContext() || {};
  const [progressMap, setProgressMap] = useState({});

  const { currentWorkspaceRole } = useUser() || {};
  const isWorkspaceOwner = currentWorkspaceRole?.roleName?.toLowerCase() === "owner";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleSettingsUpdateSuccess = () => {
    if (setRefreshTrigger) {
      setRefreshTrigger(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!projectsList || projectsList.length === 0) return;

    let isMounted = true;

    const fetchAllProgress = async () => {
      try {
        const progressData = {};
        
        await Promise.all(
          projectsList.map(async (project) => {
            if (!project.projectId) return;
            try {
              const res = await ProjectService.getProjectProgress(project.projectId);
              progressData[project.projectId] = res?.simpleProgress ?? 0;
            } catch (err) {
              console.error(`Lỗi khi lấy tiến độ project ${project.projectId}:`, err);
              progressData[project.projectId] = 0; 
            }
          })
        );

        if (isMounted) {
          setProgressMap(progressData);
        }
      } catch (globalErr) {
        console.error("Lỗi tổng hợp fetch progress:", globalErr);
      }
    };

    fetchAllProgress();

    return () => {
      isMounted = false;
    };
  }, [projectsList]);

  // Đặt lại ô tìm kiếm về rỗng khi chuyển trang
  useEffect(() => {
    if (setSearchQuery && typeof setSearchQuery === "function") {
      setSearchQuery("");
    }
  }, [setSearchQuery]);

  const filteredProjects = projectsList?.filter((project) =>
    project.projectName.toLowerCase().includes((searchQuery || "").toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-content-secondary gap-4 mt-20">
        <h2 className="text-2xl font-bold text-rose-400">{t("common.error")}</h2>
        <p className="text-sm text-content-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
      {/* HEADER BLOCK */}
      <div className="px-6 py-5 border-b border-white/10 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-content-muted mb-2">
              <Link to="/workspaces" className="hover:text-blue-400 transition-colors uppercase">
                {t("sidebar.workspaces")}
              </Link>
              <span>›</span>
              <span className="text-slate-400 uppercase">
                {workspaceInfo ? workspaceInfo.name : "..."}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-content-primary">
              {workspaceInfo ? `${workspaceInfo.name} Workspace` : "Workspace"}
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* NÚT WORKSPACE SETTINGS (Chỉ hiện nếu là Owner) */}
            {isWorkspaceOwner && (
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(true)}
                disabled={!workspaceIdParam || isLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-300 hover:text-white rounded-md text-sm font-medium transition-all cursor-pointer disabled:opacity-40"
              >
                <Settings className="w-4 h-4 text-amber-500" /> {t("timesheets.workspaceSettingsTitle")}
              </button>
            )}

            {/* NÚT QUẢN LÝ NHÂN SỰ MỚI (DÀNH CHO TẤT CẢ MEMBER, DẪN TỚI MODULE HR) */}
            <Link
              to={`/workspaces/hr?workspaceId=${workspaceIdParam}`}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(59,130,246,0.05)] cursor-pointer"
            >
              <Users className="w-4 h-4 text-blue-400" /> {t("hr.title")}
            </Link>
            
            {/* Nút Chat Room giữ nguyên cho tất cả mọi người */}
            <button
              type="button"
              onClick={() => {
                window.location.href = `/conversations?workspaceId=${workspaceIdParam}&isCreating=true`;
              }}
              disabled={!workspaceIdParam || isLoading}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 rounded-md text-sm font-medium transition-all cursor-pointer disabled:opacity-40"
            >
              <MessageSquare className="w-4 h-4" /> {t("activeProjects.chatRoom")}
            </button>

            {/* NÚT NEW PROJECT (Chỉ hiện nếu là Owner) */}
            {isWorkspaceOwner && (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                disabled={!workspaceIdParam || isLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-400 hover:text-emerald-300 rounded-md text-sm font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)] cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-4 h-4" /> {t("activeProjects.newProject")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* STATS SUMMARY BAR */}
      <div className="px-6 py-6 space-y-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {workspaceInfo && !isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-surface/40 border border-white/5 rounded-lg p-3 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5" /> {t("activeProjects.totalProjects")}
                </span>
                <span className="text-xl font-bold mt-1 text-content-primary">
                  {workspaceInfo.projectSummary?.totalProjects || 0}
                </span>
              </div>
              <div className="bg-surface/40 border border-white/5 rounded-lg p-3 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5 text-sky-400" /> {t("activeProjects.inProgress")}
                </span>
                <span className="text-xl font-bold mt-1 text-sky-400">
                  {workspaceInfo.projectSummary?.inProgressProjects || 0}
                </span>
              </div>
              <div className="bg-surface/40 border border-white/5 rounded-lg p-3 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {t("activeProjects.completed")}
                </span>
                <span className="text-xl font-bold mt-1 text-emerald-400">
                  {workspaceInfo.projectSummary?.completedProjects || 0}
                </span>
              </div>
              <div className="bg-surface/40 border border-white/5 rounded-lg p-3 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-amber-400" /> {t("activeProjects.planning")}
                </span>
                <span className="text-xl font-bold mt-1 text-amber-400">
                  {workspaceInfo.projectSummary?.planningProjects || 0}
                </span>
              </div>
            </div>
          )}

          {/* PROJECTS CARDS CONTAINER */}
          {isLoading ? (
            <ProjectSkeleton />
          ) : filteredProjects.length === 0 ? (
            <div className="border border-dashed border-border-default rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface/50 border border-white/5 flex items-center justify-center mb-4 text-content-muted">
                <ClipboardList className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-content-primary mb-1">{t("activeProjects.noProjects")}</h3>
              <p className="text-sm text-content-muted mb-6 max-w-sm">
                {searchQuery ? t("activeProjects.noProjectsSub").split(".")[0] + "." : t("activeProjects.noProjectsSub").split(".")[1] || t("activeProjects.noProjectsSub")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const progress = progressMap[String(project.projectId)] ?? project.progress ?? 0;
                const isWorkspaceOwner = currentWorkspaceRole?.roleName?.toLowerCase() === "owner";

                return (
                  <ProjectCard
                    key={project.projectId}
                    isOwner={isWorkspaceOwner} 
                    project={{ ...project, progress: progress }}
                    onMenuClick={() => typeof setRefreshTrigger === "function" && setRefreshTrigger((prev) => prev + 1)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {workspaceIdParam && (
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          workspaceId={workspaceIdParam}
          onProjectCreated={() => typeof setRefreshTrigger === "function" && setRefreshTrigger((prev) => prev + 1)}
        />
      )}

      {isSettingsModalOpen && (
        <WorkspaceSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          workspaceInfo={workspaceInfo}
          onUpdateSuccess={handleSettingsUpdateSuccess}
        />
      )}
    </div>
  );
}