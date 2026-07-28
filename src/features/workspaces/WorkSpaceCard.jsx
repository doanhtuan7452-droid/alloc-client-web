import { FolderGit2, Calendar, Layers } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function WorkspaceCard({ workspace, projects = [], onWorkspaceClick, onProjectClick }) {
  const { t } = useLanguage();
  return (
    <div 
      onClick={() => onWorkspaceClick(workspace.workspaceId)}
      className="border border-white/5 bg-zinc-900/40 rounded-xl p-5 hover:border-zinc-700/60 transition-all duration-300 shadow-xl flex flex-col gap-4 cursor-pointer group"
    >
      {/* Workspace Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-zinc-100 tracking-tight group-hover:text-blue-400 transition-colors">
              {workspace.name}
            </h3>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/60 px-1.5 py-0.5 rounded border border-white/5">
              ID: {workspace.workspaceId}
            </span>
          </div>
          <p className="text-xs text-zinc-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {t("workspaceList.roleLabel")} <span className="text-zinc-300 font-medium">{workspace.membership?.role?.roleName || "Member"}</span>
          </p>
        </div>

        <div className="text-right mr-9">
          <span className="text-xs font-mono text-zinc-400 bg-zinc-800/80 px-2.5 py-1 rounded-full border border-white/5 flex items-center gap-1.5">
            <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
            {projects.length} {t("workspaceList.projectsCount")}
          </span>
        </div>
      </div>

      {/* Projects List Container */}
      <div className="border-t border-white/5 pt-3">
        <h4 className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Layers className="w-3 h-3" /> {t("workspaceList.subProjects")}
        </h4>
        
        {projects.length === 0 ? (
          <p className="text-xs text-zinc-500 italic py-1">{t("workspaceList.noProjects")}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {projects.map((project) => (
              <div
                key={project.projectId}
                onClick={(e) => {
                  e.stopPropagation(); // Giữ nguyên để không kích hoạt click vào card to bên ngoài
                  onProjectClick(workspace.workspaceId, project.projectId);
                }}
                className="group/item flex flex-col justify-between p-3 bg-zinc-950/60 border border-white/5 rounded-lg hover:border-blue-500/40 hover:bg-zinc-900/80 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-zinc-300 group-hover/item:text-blue-400 transition-colors truncate">
                    {project.projectName}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    project.status === "In Progress" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                    project.status === "Completed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                    "bg-zinc-800 text-zinc-400 border border-white/5"
                  }`}>
                    {project.status}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2.5 text-[11px] text-zinc-500 font-mono">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {project.startDate ? project.startDate.split("T")[0] : "N/A"}
                  </span>
                  <span className="text-zinc-400 font-medium">
                    {Number(project.expectedBudget).toLocaleString()} {project.originalCurrencyCode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}