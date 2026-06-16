import { useState, useEffect, useMemo } from "react";
import { Outlet, useSearchParams, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { Filter, Calendar, ChevronDown, Download, Plus } from "lucide-react";
import { fetchProjects, fetchProjectTasks, fetchWorkspaceDetails } from "../services/mockApi";
import WorkspaceNav from "../components/navigation/WorkspaceNav";

export default function WorkspaceLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useOutletContext(); // Nhận search context từ MainLayout

  const workspaceIdParam = searchParams.get("workspaceId");
  const projectIdParam = searchParams.get("projectId");

  const [workspaceInfo, setWorkspaceInfo] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [tasksList, setTasksList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // 1. Phân giải workspaceId (Lọc bỏ chuỗi "undefined" do lỗi tham số)
  const workspaceId = (workspaceIdParam && workspaceIdParam !== "undefined")
    ? workspaceIdParam 
    : (localStorage.getItem("lastActiveWorkspaceId") || "12");

  useEffect(() => {
    if (!workspaceIdParam || workspaceIdParam === "undefined") {
      setSearchParams({ workspaceId }, { replace: true });
    } else {
      localStorage.setItem("lastActiveWorkspaceId", workspaceIdParam);
    }
  }, [workspaceIdParam, workspaceId, setSearchParams]);

  // 2. Tải thông tin Workspace và danh sách dự án
  useEffect(() => {
    let isSubscribed = true;
    async function loadWorkspaceData() {
      setIsLoading(true);
      setError(null);
      try {
        const wId = parseInt(workspaceId);
        const wDetails = await fetchWorkspaceDetails(wId);
        const pList = await fetchProjects(wId);
        
        if (isSubscribed) {
          setWorkspaceInfo(wDetails);
          setProjectsList(pList);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Error loading workspace projects:", err);
          setError("Không thể tải thông tin workspace.");
          setIsLoading(false);
        }
      }
    }
    loadWorkspaceData();
    return () => { isSubscribed = false; };
  }, [workspaceId]);

  // 3. Phân giải projectId và tải dữ liệu dự án + công việc
  useEffect(() => {
    if (projectsList.length === 0) return;

    let isSubscribed = true;
    async function loadProjectData() {
      try {
        let pId = projectIdParam;
        if (!pId) {
          const firstProj = projectsList[0];
          pId = firstProj.projectId.toString();
          // Sử dụng hàm cập nhật để tránh lặp vô tận khi update URL
          setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set("projectId", pId);
            return next;
          }, { replace: true });
          return;
        }

        const parsedProjectId = parseInt(pId);
        const pDetails = projectsList.find(p => p.projectId === parsedProjectId);
        const tList = await fetchProjectTasks(parsedProjectId);

        if (isSubscribed) {
          setActiveProject(pDetails || null);
          setTasksList(tList);
          setIsLoading(false);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Error loading project details & tasks:", err);
          setError("Không thể tải thông tin dự án.");
          setIsLoading(false);
        }
      }
    }

    loadProjectData();
    return () => { isSubscribed = false; };
  }, [projectsList, projectIdParam, workspaceId, setSearchParams]);

  // 4. Memoize Context để tránh re-render các trang con không cần thiết
  const contextValue = useMemo(() => ({
    workspaceId,
    activeProject,
    tasksList,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    isExpenseModalOpen,
    setIsExpenseModalOpen
  }), [workspaceId, activeProject, tasksList, isLoading, error, searchQuery, setSearchQuery, isExpenseModalOpen]);

  const isFinanceTab = location.pathname.endsWith("/finance") || location.pathname.endsWith("/finance/");

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Header block chung - Luôn luôn hiển thị để tương tác */}
      <div className="px-6 pt-6 pb-0 border-b border-white/10 bg-white/[0.01] shrink-0">
        <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
              <span>WORKSPACES</span>
              <span>›</span>
              <span className="uppercase">{workspaceInfo ? workspaceInfo.name : "..."}</span>
              <span>›</span>
              <span className="text-blue-400 uppercase">{activeProject ? activeProject.projectName : "..."}</span>
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              {/* Dự án Selector */}
              <div className="relative">
                <button 
                  onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white rounded-md text-sm font-semibold transition-all cursor-pointer shadow-md"
                >
                  <span className="max-w-[200px] truncate">{activeProject ? activeProject.projectName : "Chọn dự án..."}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {isProjectDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsProjectDropdownOpen(false)}></div>
                    <div className="absolute left-0 mt-1 w-64 bg-neutral-900 border border-white/10 rounded-md shadow-2xl py-1 z-20 max-h-60 overflow-y-auto custom-scrollbar">
                      {projectsList.map((p) => (
                        <button
                          key={p.projectId}
                          onClick={() => {
                            setSearchParams({ workspaceId, projectId: p.projectId.toString() }, { replace: true });
                            setIsProjectDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                            p.projectId === activeProject?.projectId 
                              ? "bg-blue-600/20 text-blue-400 font-medium" 
                              : "text-slate-355 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          {p.projectName}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {activeProject && (
                <div className="flex items-center gap-2">
                  {/* Hiển thị Methodology chỉ ở trang ngoài Finance */}
                  {!isFinanceTab && activeProject.methodology && (
                    <span className="bg-white/5 border border-white/5 text-slate-400 text-xs px-2.5 py-1 rounded-full font-mono">
                      {activeProject.methodology}
                    </span>
                  )}
                  <span className="bg-white/5 border border-white/5 text-slate-400 text-xs px-2.5 py-1 rounded-full font-mono flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" /> {activeProject.startDate} / {activeProject.endDate}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Slots tùy biến dựa theo Pathname */}
          <div className="flex items-center gap-3">
            {isFinanceTab ? (
              <>
                <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-md bg-white/5 hover:bg-white/10 text-sm text-slate-300 transition-all cursor-pointer">
                  <Download className="w-4 h-4" /> Export Report
                </button>
                <button 
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-500 transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                >
                  <Plus className="w-4 h-4" /> Log Expense
                </button>
              </>
            ) : (
              <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-md bg-white/5 hover:bg-white/10 text-sm text-slate-300 transition-all cursor-pointer">
                <Filter className="w-4 h-4" /> Lọc
              </button>
            )}
          </div>
        </div>
        
        {/* Workspace Sub-navigation tabs */}
        <WorkspaceNav />
      </div>

      {/* Outlet content của các trang con */}
      <div className="flex-grow relative overflow-hidden">
        <Outlet context={contextValue} />
      </div>
    </div>
  );
}
