import { NavLink, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

export default function WorkspaceNav() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");
  const projectId = searchParams.get("projectId");
  
  let queryStr = "";
  const params = [];
  if (workspaceId) params.push(`workspaceId=${workspaceId}`);
  if (projectId) params.push(`projectId=${projectId}`);
  if (params.length > 0) {
    queryStr = `?${params.join("&")}`;
  }

  // Common styling for active / inactive state
  const getTabClass = ({ isActive }) => {
    return isActive
      ? "text-blue-400 border-b-2 border-blue-500 pb-2.5 px-1 font-semibold transition-all"
      : "text-content-muted hover:text-white pb-2.5 px-1 transition-all";
  };

  return (
    <div className="flex items-center gap-6 text-sm font-medium mt-3 -mb-[1px] border-b border-transparent shrink-0">
      <NavLink to={`/workspaces/board${queryStr}`} className={getTabClass}>
        {t("workspaceNav.board")}
      </NavLink>
      <NavLink to={`/workspaces/gantt${queryStr}`} className={getTabClass}>
        {t("workspaceNav.gantt")}
      </NavLink>
      <NavLink to={`/workspaces/calendar${queryStr}`} className={getTabClass}>
        {t("workspaceNav.calendar")}
      </NavLink>
      <NavLink to={`/workspaces/list${queryStr}`} className={getTabClass}>
        {t("workspaceNav.list")}
      </NavLink>
      <NavLink to={`/workspaces/finance${queryStr}`} className={getTabClass}>
        {t("workspaceNav.finance")}
      </NavLink>
      <NavLink to={`/workspaces/risks${queryStr}`} className={getTabClass}>
        {t("workspaceNav.risks")}
      </NavLink>
    </div>
  );
}
