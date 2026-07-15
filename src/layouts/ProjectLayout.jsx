import { useState, useEffect, useMemo } from "react";
import { Outlet, useSearchParams, useLocation, useOutletContext } from "react-router-dom";
import { Filter, Calendar, ChevronDown, Download, Plus } from "lucide-react";
import ProjectService from "../services/ProjectService";
import WorkspaceNav from "../components/navigation/WorkspaceNav";

export default function ProjectLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  // Nhận dữ liệu dùng chung từ WorkspaceLayout truyền xuống
  const workspaceContext = useOutletContext();
  const { workspaceId, workspaceInfo, projectsList, isExpenseModalOpen, setIsExpenseModalOpen } = workspaceContext;

  const projectIdParam = searchParams.get("projectId");
  const [activeProject, setActiveProject] = useState(null);
  const [tasksList, setTasksList] = useState([]);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const fetchTasks = async () => {
    const pId = searchParams.get("projectId");
    if (!pId || projectsList.length === 0) return;
    try {
      const parsedProjectId = parseInt(pId);
      const pDetails = projectsList.find(p => p.projectId === parsedProjectId);
      if (pDetails) {
        const tList = await ProjectService.getProjectTasks(parsedProjectId);
        const taskData = tList.items || tList;
        setActiveProject(pDetails);
        setTasksList(taskData);
      }
    } catch (err) {
      console.error("Error loading project details & tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectsList, projectIdParam, searchParams]);

  // Cơ chế tự động gán dự án đầu tiên nếu chưa có projectId trên URL
  useEffect(() => {
    if (projectsList.length === 0) return;
    const pId = searchParams.get("projectId");
    if (!pId) {
      const firstProj = projectsList[0];
      if (firstProj) {
        setSearchParams(prev => {
          const next = new URLSearchParams(prev);
          next.set("projectId", firstProj.projectId.toString());
          return next;
        }, { replace: true });
      }
    }
  }, [projectsList, searchParams, setSearchParams]);

  // Tải dữ liệu các task thuộc dự án được chọn
  useEffect(() => {
    const pId = searchParams.get("projectId");
    if (!pId || projectsList.length === 0) {
      setActiveProject(null);
      setTasksList([]);
      return;
    }

    let isSubscribed = true;
    async function loadProjectData() {
      try {
        const parsedProjectId = parseInt(pId);
        const pDetails = projectsList.find(p => p.projectId === parsedProjectId);
        
        if (pDetails) {
          const tList = await ProjectService.getProjectTasks(parsedProjectId);
          const taskData = tList.items || tList;

          if (isSubscribed) {
            setActiveProject(pDetails);
            setTasksList(taskData);
          }
        }
      } catch (err) {
        console.error("Error loading project details & tasks:", err);
      }
    }

    loadProjectData();
    return () => { isSubscribed = false; };
  }, [projectsList, projectIdParam, searchParams]);

  const projectContextValue = useMemo(() => ({
    ...workspaceContext,
    activeProject,
    tasksList,
    fetchTasks
  }), [workspaceContext, activeProject, tasksList]);

  const isFinanceTab = location.pathname.endsWith("/finance") || location.pathname.endsWith("/finance/");

  return (
    <>
      {/* THANH TIÊU ĐỀ VÀ THÔNG TIN DỰ ÁN */}
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
                              : "text-slate-300 hover:bg-white/5 hover:text-white"
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
        
        {/* Render thanh tab điều hướng ngay tại đây */}
        <WorkspaceNav />
      </div>

      {/* KHU VỰC CHỨA NỘI DUNG CỦA BOARD, GANTT, FINANCE... */}
      <div className="flex-grow relative overflow-hidden">
        <Outlet context={projectContextValue} />
      </div>
    </>
  );
}