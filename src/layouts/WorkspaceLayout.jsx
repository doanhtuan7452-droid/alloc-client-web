import { useState, useEffect, useMemo } from "react";
import { Outlet, useSearchParams, useNavigate, useOutletContext } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import ProjectService from "../services/ProjectService";
import WorkspaceService from "../services/WorkspaceService";
import { useUser } from "../contexts/UserContext";
import { useLanguage } from "../contexts/LanguageContext";
import WorkspaceLayoutSkeleton from "../components/skeletons/WorkspaceLayoutSkeleton";

export default function WorkspaceLayout() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { switchWorkspace, currentUser } = useUser();
  
  const parentContext = useOutletContext() || [];
  const searchQuery = parentContext[0] || "";
  const setSearchQuery = parentContext[1] || null;

  const workspaceIdParam = searchParams.get("workspaceId");

  const [workspaceInfo, setWorkspaceInfo] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  const workspaceId = workspaceIdParam && workspaceIdParam !== "undefined" ? workspaceIdParam : "";

  useEffect(() => {
    if (workspaceId && currentUser) {
        switchWorkspace(Number(workspaceId));
    }
  }, [workspaceId, currentUser]);

  useEffect(() => {
    if (!workspaceId) {
      setError(t("workspaceList.errNoWorkspaceId"));
      setIsLoading(false);
      return;
    }

    let isSubscribed = true;
    async function loadWorkspaceData() {
      setIsLoading(true);
      setError(null);
      try {
        const wId = parseInt(workspaceId);
        const [wDetails, pList] = await Promise.all([
          WorkspaceService.getWorkspaceById(wId),
          ProjectService.getProjects(wId)
        ]);
        
        const projectData = pList.items || pList;
        
        if (isSubscribed) {
          setWorkspaceInfo(wDetails);
          setProjectsList(projectData);
        }
      } catch (err) {
        if (isSubscribed) {
          console.error("Error loading workspace projects:", err);
          setError(t("workspaceList.errNoAccess"));
        }
      } finally {
        if (isSubscribed) setIsLoading(false);
      }
    }

    loadWorkspaceData();
    return () => { isSubscribed = false; };
  }, [workspaceId, refreshTrigger]);

  const contextValue = useMemo(() => ({
    workspaceId,
    workspaceInfo,
    projectsList,
    setRefreshTrigger,
    isLoading, 
    error,
    searchQuery,
    setSearchQuery,
    isExpenseModalOpen,
    setIsExpenseModalOpen
  }), [workspaceId, workspaceInfo, projectsList, isLoading, error, searchQuery, setSearchQuery, isExpenseModalOpen]);

  if (!workspaceId || error) {
    return (
      <div className="fixed inset-0 bg-[#0C0C0E] flex flex-col items-center justify-center gap-4 text-center p-6">
        <div className="p-3 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <LayoutGrid className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">{t("workspaceList.invalidAccess")}</h2>
          <p className="text-sm text-slate-400 max-w-sm">
            {error || t("workspaceList.selectWorkspaceMsg")}
          </p>
        </div>
        <button 
          onClick={() => navigate("/workspaces")}
          className="mt-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-md text-xs font-semibold transition-all cursor-pointer"
        >
          {t("workspaceList.backToWorkspaceList")}
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <WorkspaceLayoutSkeleton />;
  }

  // Giữ nguyên CSS gốc lớp ngoài cùng để không lệch giao diện hay đen màn hình
  return (
    <div className="absolute inset-0 flex flex-col">
      <Outlet context={contextValue} />
    </div>
  );
}