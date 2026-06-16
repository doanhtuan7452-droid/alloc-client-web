import { useNavigate, useSearchParams } from "react-router-dom";
import { MoreVertical, Calendar, Landmark, Layers } from "lucide-react";

export default function ProjectCard({ project, onMenuClick }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    projectId,
    workspaceId: projectWorkspaceId,
    projectName,
    expectedBudget,
    totalRevenue,
    startDate,
    endDate,
    status,
    originalCurrencyCode,
    exchangeRateToUSD,
    methodology,
    createdAt
  } = project;

  const workspaceId = projectWorkspaceId || searchParams.get("workspaceId") || "12";

  const handleCardClick = () => {
    navigate(`/workspaces/board?workspaceId=${workspaceId}&projectId=${projectId}`);
  };

  // Format currency based on standard locales
  const formatCurrency = (amount, currencyCode) => {
    if (currencyCode === "USD") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
    } else if (currencyCode === "VND") {
      return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
    }
    return `${new Intl.NumberFormat("en-US").format(amount)} ${currencyCode}`;
  };

  // Convert to USD equivalent for non-USD budgets to show financial synchronization
  const getUSDEquivalent = (amount, currencyCode, rate) => {
    if (currencyCode === "USD") return null;
    const usdVal = amount * rate;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(usdVal);
  };

  // Calculate timeline progress
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date("2026-06-15"); // Current simulated time from system metadata

  const totalDuration = end - start;
  const elapsed = today - start;
  
  let timeProgress = 0;
  if (totalDuration > 0) {
    timeProgress = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100);
  }

  // Determine completion progress percentage based on project status & timeline
  const completionPercent =
    status === "Completed" ? 100 :
    status === "Planning" ? 0 :
    status === "Cancelled" ? 0 :
    timeProgress;

  // Calculate days remaining or days in planning
  const msInDay = 24 * 60 * 60 * 1000;
  const daysLeft = Math.round((end - today) / msInDay);
  const isOverdue = daysLeft < 0 && status !== "Completed" && status !== "Cancelled";

  // Map status to specific theme configuration
  const statusThemes = {
    "Planning": {
      glow: "bg-gradient-to-r from-amber-400 to-orange-500",
      badge: "bg-amber-400/10 text-amber-400 border-amber-400/20",
      dot: "bg-amber-400"
    },
    "In Progress": {
      glow: "bg-gradient-to-r from-cyan-400 to-blue-500",
      badge: "bg-sky-400/10 text-sky-400 border-sky-400/20",
      dot: "bg-cyan-400"
    },
    "Completed": {
      glow: "bg-gradient-to-r from-emerald-400 to-teal-500",
      badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
      dot: "bg-emerald-400"
    },
    "On Hold": {
      glow: "bg-gradient-to-r from-purple-400 to-pink-500",
      badge: "bg-purple-400/10 text-purple-400 border-purple-400/20",
      dot: "bg-purple-400"
    },
    "Cancelled": {
      glow: "bg-gradient-to-r from-rose-500 to-red-600",
      badge: "bg-rose-400/10 text-rose-400 border-rose-400/20",
      dot: "bg-rose-400"
    }
  };

  const currentTheme = statusThemes[status] || statusThemes["Planning"];

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white/[0.02] backdrop-blur-md border border-white/10 hover:border-blue-500/40 hover:bg-white/[0.04] transition-all duration-300 shadow-xl rounded-xl p-6 flex flex-col relative overflow-hidden group cursor-pointer"
    >
      {/* Top Status Glow Bar */}
      <div className={`absolute top-0 left-0 w-full h-[3px] ${currentTheme.glow}`}></div>
      
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Badge */}
          <span className={`text-[9px] uppercase font-mono tracking-wider font-semibold px-2.5 py-0.5 rounded-full border ${currentTheme.badge} flex items-center gap-1.5`}>
            <span className={`w-1 h-1 rounded-full ${currentTheme.dot}`}></span>
            {status}
          </span>
          {/* Methodology Pill */}
          <span className="bg-white/5 text-content-muted border border-white/5 text-[9px] uppercase font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
            <Layers className="w-2.5 h-2.5 text-slate-500" />
            {methodology}
          </span>
        </div>
        
        {/* Actions Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onMenuClick && onMenuClick(e, project);
          }}
          className="text-content-muted hover:text-white p-1 hover:bg-white/5 rounded transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
      
      {/* Project Identifier */}
      <div className="text-[10px] font-mono text-slate-500 mb-1">
        #PROJ-{projectId}
      </div>
      
      {/* Title */}
      <h2 className="text-xl font-bold mb-4 text-content-primary line-clamp-1 group-hover:text-blue-400 transition-colors">
        {projectName}
      </h2>
      
      {/* Body Information */}
      <div className="space-y-4 text-sm mt-auto">
        {/* Financial Info */}
        <div className="border-t border-white/5 pt-3 space-y-2.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-slate-500" /> Expected Budget
            </span>
            <span className="font-mono text-emerald-450 text-emerald-400 font-medium text-right">
              {formatCurrency(expectedBudget, originalCurrencyCode)}
              {originalCurrencyCode !== "USD" && (
                <span className="text-[9px] text-slate-500 block text-right mt-0.5">
                  (~{getUSDEquivalent(expectedBudget, originalCurrencyCode, exchangeRateToUSD)})
                </span>
              )}
            </span>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-slate-500" /> Total Revenue
            </span>
            <span className="font-mono text-cyan-400 font-medium text-right">
              {formatCurrency(totalRevenue, originalCurrencyCode)}
              {originalCurrencyCode !== "USD" && (
                <span className="text-[9px] text-slate-500 block text-right mt-0.5">
                  (~{getUSDEquivalent(totalRevenue, originalCurrencyCode, exchangeRateToUSD)})
                </span>
              )}
            </span>
          </div>
        </div>
        
        {/* Timeline & Progress */}
        <div className="border-t border-white/5 pt-3 space-y-2.5">
          <div className="flex justify-between text-xs items-center">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" /> Timeline
            </span>
            <span className="font-mono text-slate-300 text-[10px]">
              {startDate} / {endDate}
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-400">Completion Progress</span>
              <span className="font-mono font-medium text-slate-200">
                {completionPercent}%
              </span>
            </div>
            {/* Progress Track */}
            <div className="h-1.5 bg-black/40 border border-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  status === "Completed" ? "bg-emerald-500" :
                  status === "Cancelled" ? "bg-rose-500" : "bg-gradient-to-r from-blue-500 to-cyan-400"
                }`}
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>
          </div>
          
          {/* Days Left / Countdown */}
          {status !== "Completed" && status !== "Cancelled" && (
            <div className="text-[9px] font-mono flex justify-between">
              <span className="text-slate-500">Time Status</span>
              {isOverdue ? (
                <span className="text-rose-400 font-bold uppercase">Overdue by {Math.abs(daysLeft)} days</span>
              ) : (
                <span className="text-sky-400/80">{daysLeft} days remaining</span>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Date Created Footer label */}
      <div className="text-[9px] font-mono text-slate-600 mt-4 text-right">
        Created on {new Date(createdAt).toLocaleDateString()}
      </div>
    </div>
  );
}
