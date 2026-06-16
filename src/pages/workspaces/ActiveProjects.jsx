import { useState, useEffect } from "react";
import { useSearchParams, useOutletContext } from "react-router-dom";
import { Plus, Users, LayoutGrid, CheckCircle2, ClipboardList, PlayCircle } from "lucide-react";
import { fetchWorkspaceDetails, fetchProjects, fetchWorkspaces } from "../../services/mockApi";
import ProjectCard from "../../features/workspaces/ProjectCard";
import ProjectSkeleton from "../../features/workspaces/ProjectSkeleton";
import CreateProjectModal from "../../features/workspaces/CreateProjectModal";

export default function ActiveProjects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const workspaceIdParam = searchParams.get("workspaceId");

  const [workspaceInfo, setWorkspaceInfo] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useOutletContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setSearchQuery("");
  }, [setSearchQuery]);

  // Fallback and Initial Load logic
  useEffect(() => {
    async function resolveActiveWorkspace() {
      try {
        if (!workspaceIdParam) {
          const storedId = localStorage.getItem("lastActiveWorkspaceId");
          if (storedId) {
            setSearchParams({ workspaceId: storedId }, { replace: true });
            return;
          }

          // Fetch workspaces list to get the first one
          const workspacesList = await fetchWorkspaces();
          if (workspacesList.length > 0) {
            const firstId = workspacesList[0].workspaceId.toString();
            localStorage.setItem("lastActiveWorkspaceId", firstId);
            setSearchParams({ workspaceId: firstId }, { replace: true });
          } else {
            setError("No workspaces found. Please create one.");
            setIsLoading(false);
          }
        } else {
          // Keep localStorage updated with active parameter
          localStorage.setItem("lastActiveWorkspaceId", workspaceIdParam);
        }
      } catch (err) {
        console.error("Error resolving active workspace:", err);
        setError("Không thể tải danh sách workspace.");
        setIsLoading(false);
      }
    }

    resolveActiveWorkspace();
  }, [workspaceIdParam, setSearchParams]);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load Workspace details and Project list once workspaceId is set
  useEffect(() => {
    if (!workspaceIdParam) return;
    
    let isSubscribed = true;
    
    async function loadWorkspaceData() {
      setIsLoading(true);
      setError(null);
      try {
        const parsedId = parseInt(workspaceIdParam);
        const details = await fetchWorkspaceDetails(parsedId);
        const list = await fetchProjects(parsedId);
        
        if (isSubscribed) {
          setWorkspaceInfo(details);
          setProjectsList(list);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Error loading workspace projects:", err);
          if (err.message === "WorkspaceNotFound") {
            setError("Không tìm thấy Workspace. Vui lòng chọn workspace khác từ danh mục.");
          } else {
            setError("Không thể tải danh sách dự án. Vui lòng tải lại trang.");
          }
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    loadWorkspaceData();
    
    return () => {
      isSubscribed = false;
    };
  }, [workspaceIdParam, refreshTrigger]);

  // Filter projects by search query
  const filteredProjects = projectsList.filter((project) =>
    project.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-content-secondary gap-4 mt-20">
        <h2 className="text-2xl font-bold text-rose-400">Đã xảy ra lỗi</h2>
        <p className="text-sm text-content-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
      {/* Header block spanning full-width of Outlet */}
      <div className="px-6 py-5 border-b border-white/10 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-content-muted mb-2">
              <span>WORKSPACES</span>
              <span>›</span>
              <span className="text-slate-400 uppercase">
                {workspaceInfo ? workspaceInfo.name : "..."}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-content-primary">
              {workspaceInfo ? `${workspaceInfo.name} Projects` : "Projects"}
            </h1>
          </div>

          {/* Action controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">

            <button 
              onClick={() => setIsModalOpen(true)}
              disabled={!workspaceIdParam || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-slate-350 hover:bg-white/10 hover:text-white rounded-md text-sm font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" /> New Project
            </button>
          </div>
        </div>
      </div>

      {/* Content block with centered contents */}
      <div className="px-6 py-6 space-y-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats Summary Bar */}
          {workspaceInfo && !isLoading && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-surface/40 border border-white/5 rounded-lg p-3 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5" /> Total Projects
                </span>
                <span className="text-xl font-bold mt-1 text-content-primary">
                  {workspaceInfo.projectSummary.totalProjects}
                </span>
              </div>

              <div className="bg-surface/40 border border-white/5 rounded-lg p-3 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                  <PlayCircle className="w-3.5 h-3.5 text-sky-400" /> In Progress
                </span>
                <span className="text-xl font-bold mt-1 text-sky-400">
                  {workspaceInfo.projectSummary.inProgressProjects}
                </span>
              </div>

              <div className="bg-surface/40 border border-white/5 rounded-lg p-3 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Completed
                </span>
                <span className="text-xl font-bold mt-1 text-emerald-400">
                  {workspaceInfo.projectSummary.completedProjects}
                </span>
              </div>

              <div className="bg-surface/40 border border-white/5 rounded-lg p-3 flex flex-col justify-center">
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList className="w-3.5 h-3.5 text-amber-400" /> Planning
                </span>
                <span className="text-xl font-bold mt-1 text-amber-400">
                  {workspaceInfo.projectSummary.planningProjects}
                </span>
              </div>

              <div className="bg-surface/40 border border-white/5 rounded-lg p-3 flex flex-col justify-center col-span-2 md:col-span-1">
                <span className="text-[10px] font-mono text-content-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" /> Team Members
                </span>
                <span className="text-xl font-bold mt-1 text-purple-400">
                  {workspaceInfo.memberSummary.activeMembers} <span className="text-xs text-content-muted font-normal">/ {workspaceInfo.memberSummary.totalMembers}</span>
                </span>
              </div>
            </div>
          )}

          {/* Projects Cards Container */}
          {isLoading ? (
            <ProjectSkeleton />
          ) : filteredProjects.length === 0 ? (
            <div className="border border-dashed border-border-default rounded-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-surface/50 border border-white/5 flex items-center justify-center mb-4 text-content-muted">
                <ClipboardList className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-content-primary mb-1">No Projects Found</h3>
              <p className="text-sm text-content-muted mb-6 max-w-sm">
                {searchQuery 
                  ? "Không tìm thấy dự án khớp với từ khóa tìm kiếm của bạn." 
                  : "Workspace này chưa có dự án nào được thiết lập. Hãy bắt đầu tạo dự án đầu tiên."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-slate-350 hover:bg-white/10 hover:text-white rounded-md text-sm font-medium transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create First Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project.projectId} 
                  project={project} 
                  onMenuClick={(e, p) => console.log("Menu clicked for:", p)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Creation Modal Component */}
      {workspaceIdParam && (
        <CreateProjectModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          workspaceId={workspaceIdParam}
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}
    </div>
  );
}
