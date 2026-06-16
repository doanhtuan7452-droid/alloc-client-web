import { NavLink, useSearchParams } from 'react-router-dom';

export default function WorkspaceNav() {
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
        Board
      </NavLink>
      <NavLink to={`/workspaces/gantt${queryStr}`} className={getTabClass}>
        Gantt
      </NavLink>
      <NavLink to={`/workspaces/calendar${queryStr}`} className={getTabClass}>
        Calendar
      </NavLink>
      <NavLink to={`/workspaces/list${queryStr}`} className={getTabClass}>
        List
      </NavLink>
      <NavLink to={`/workspaces/finance${queryStr}`} className={getTabClass}>
        Finance
      </NavLink>
    </div>
  );
}
