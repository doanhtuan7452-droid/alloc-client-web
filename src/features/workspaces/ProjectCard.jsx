import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MoreVertical, Calendar, Landmark, Layers, Edit2, X, Loader2, ChevronDown } from "lucide-react";
import ProjectService from "../../services/ProjectService";

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
    createdAt,
    progressPercentage: progress
  } = project;

  const workspaceId = projectWorkspaceId || searchParams.get("workspaceId") || "12";

  // State phục vụ Menu tác vụ & Modal chỉnh sửa
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Form states phục vụ PUT API
  const [editName, setEditName] = useState(projectName);
  const [editStatus, setEditStatus] = useState(status);
  const [editMethodology, setEditMethodology] = useState(methodology || "Agile");
  const [editBudget, setEditBudget] = useState(expectedBudget);
  const [editStartDate, setEditStartDate] = useState(startDate ? startDate.split("T")[0] : "");
  const [editEndDate, setEditEndDate] = useState(endDate ? endDate.split("T")[0] : "");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCardClick = () => {
    navigate(`/workspaces/board?workspaceId=${workspaceId}&projectId=${projectId}`);
  };

  // Xử lý gửi dữ liệu cập nhật dự án (PUT /projects/{id})
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setFormError("Vui lòng nhập tên dự án");
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const payload = {
        projectName: editName.trim(),
        status: editStatus,
        methodology: editMethodology,
        expectedBudget: Number(editBudget),
        startDate: editStartDate,
        endDate: editEndDate,
        originalCurrencyCode,
        exchangeRateToUSD
      };

      await ProjectService.updateProject(projectId, payload);
      setIsEditModalOpen(false);
      
      if (onMenuClick) {
        onMenuClick(); 
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("Error updating project:", err);
      setFormError(err?.response?.data?.message || "Có lỗi xảy ra khi cập nhật thông tin dự án.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format hiển thị tiền tệ
  const formatCurrency = (amount, currencyCode) => {
    if (currencyCode === "USD") {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
    } else if (currencyCode === "VND") {
      return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
    }
    return `${new Intl.NumberFormat("en-US").format(amount)} ${currencyCode}`;
  };

  // Quy đổi sang USD tương đương
  const getUSDEquivalent = (amount, currencyCode, rate) => {
    if (currencyCode === "USD") return null;
    const usdVal = amount * rate;
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(usdVal);
  };

  // Format ngày hiển thị ngắn gọn (DD/MM/YYYY)
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "...";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("vi-VN");
  };

  // 🌟 ĐỔI THÀNH THỜI GIAN THỰC (Thay vì fix cứng 2026-06-15)
  const today = new Date();
  const end = new Date(endDate);
  const msInDay = 24 * 60 * 60 * 1000;
  const daysLeft = Math.round((end - today) / msInDay);
  const isOverdue = daysLeft < 0 && status !== "Completed" && status !== "Cancelled";

  const completionPercent = Math.round(progress || 0);

  const statusThemes = {
    "Planning": { glow: "bg-gradient-to-r from-amber-400 to-orange-500", badge: "bg-amber-400/10 text-amber-400 border-amber-400/20", dot: "bg-amber-400" },
    "In Progress": { glow: "bg-gradient-to-r from-cyan-400 to-blue-500", badge: "bg-sky-400/10 text-sky-400 border-sky-400/20", dot: "bg-cyan-400" },
    "Completed": { glow: "bg-gradient-to-r from-emerald-400 to-teal-500", badge: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20", dot: "bg-emerald-400" },
    "On Hold": { glow: "bg-gradient-to-r from-purple-400 to-pink-500", badge: "bg-purple-400/10 text-purple-400 border-purple-400/20", dot: "bg-purple-400" },
    "Cancelled": { glow: "bg-gradient-to-r from-rose-500 to-red-600", badge: "bg-rose-400/10 text-rose-400 border-rose-400/20", dot: "bg-rose-400" }
  };

  const currentTheme = statusThemes[status] || statusThemes["Planning"];

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-white/[0.02] backdrop-blur-md border border-white/10 hover:border-blue-500/40 hover:bg-white/[0.04] transition-all duration-300 shadow-xl rounded-xl p-6 flex flex-col relative overflow-hidden group cursor-pointer"
      >
        {/* Top Status Glow Bar */}
        <div className={`absolute top-0 left-0 w-full h-[3px] ${currentTheme.glow}`}></div>
        
        {/* Card Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[9px] uppercase font-mono tracking-wider font-semibold px-2.5 py-0.5 rounded-full border ${currentTheme.badge} flex items-center gap-1.5`}>
              <span className={`w-1 h-1 rounded-full ${currentTheme.dot}`}></span>
              {status}
            </span>
            <span className="bg-white/5 text-content-muted border border-white/5 text-[9px] uppercase font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
              <Layers className="w-2.5 h-2.5 text-slate-500" />
              {methodology}
            </span>
          </div>
          
          {/* Actions Button */}
          <div className="relative" ref={dropdownRef}>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation(); // 🌟 Ngăn không nhảy vào trang Board khi nhấn menu ba chấm
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className="text-content-muted hover:text-white p-1 hover:bg-white/5 rounded transition-colors cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-neutral-900 border border-white/10 rounded-md shadow-2xl py-1 z-30 animate-fade-in">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // 🌟 Ngăn kích hoạt nhảy trang khi click nút sửa
                    setIsDropdownOpen(false);
                    setIsEditModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Edit2 size={12} className="text-blue-400" /> Chỉnh sửa dự án
                </button>
              </div>
            )}
          </div>
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
              <span className="font-mono text-emerald-400 font-medium text-right">
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
                {formatDateDisplay(startDate)} / {formatDateDisplay(endDate)}
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400">Completion Progress</span>
                <span className="font-mono font-medium text-slate-200">
                  {completionPercent}%
                </span>
              </div>
              <div className="h-1.5 bg-black/40 border border-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    status === "Completed" ? "bg-emerald-500" :
                    status === "Cancelled" ? "bg-rose-500" : "bg-gradient-to-r from-blue-500 to-cyan-400"
                  }`}
                  style={{ width: `${completionPercent}%` }}
                ></div>
              </div>
            </div>
            
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
        
        <div className="text-[9px] font-mono text-slate-600 mt-4 text-right">
          Created on {new Date(createdAt).toLocaleDateString("vi-VN")}
        </div>
      </div>

      {/* EDIT PROJECT MODAL COMPONENT (Glassmorphic) */}
      {isEditModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" 
          onClick={(e) => {
            e.stopPropagation(); // 🌟 Tránh lan truyền sự kiện ra ngoài card
            setIsEditModalOpen(false);
          }}
        >
          <div 
            className="w-full max-w-lg bg-[#121214]/90 border border-white/10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
            onClick={(e) => e.stopPropagation()} // 🌟 Tránh click bên trong form làm đóng modal
          >
            {/* Header Form */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.01]">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Edit2 size={14} className="text-blue-400" /> Edit Project details
              </h3>
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-white/5 text-slate-400 hover:text-white rounded-md transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Form Box */}
            <form onSubmit={handleUpdateProject} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 text-xs font-mono bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-md">
                  {formError}
                </div>
              )}

              {/* ID dự án (Read-only) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Project ID</label>
                <input
                  type="text"
                  value={`#PROJ-${projectId}`}
                  disabled
                  className="w-full px-3 py-2 text-sm font-mono bg-white/[0.02] border border-white/5 rounded-md text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Tên dự án */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Project Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/10 rounded-md text-white focus:outline-none focus:border-blue-500/80 transition-all"
                  disabled={isSubmitting}
                  placeholder="Nhập tên dự án..."
                />
              </div>

              {/* Dropdowns row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Status</label>
                  <div className="relative">
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-neutral-900 border border-white/10 rounded-md text-slate-200 focus:outline-none focus:border-blue-500/80 appearance-none transition-colors cursor-pointer"
                      disabled={isSubmitting}
                    >
                      <option value="Planning">Planning</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Methodology</label>
                  <div className="relative">
                    <select
                      value={editMethodology}
                      onChange={(e) => setEditMethodology(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-neutral-900 border border-white/10 rounded-md text-slate-200 focus:outline-none focus:border-blue-500/80 appearance-none transition-colors cursor-pointer"
                      disabled={isSubmitting}
                    >
                      <option value="Agile">Agile</option>
                      <option value="Scrum">Scrum</option>
                      <option value="Waterfall">Waterfall</option>
                      <option value="Kanban">Kanban</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Ngân sách */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Expected Budget ({originalCurrencyCode})</label>
                <input
                  type="number"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono bg-white/[0.04] border border-white/10 rounded-md text-white focus:outline-none focus:border-blue-500/80 transition-colors"
                  disabled={isSubmitting}
                />
              </div>

              {/* Lịch trình Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Start Date</label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono bg-white/[0.04] border border-white/10 rounded-md text-slate-300 focus:outline-none focus:border-blue-500/80 transition-colors"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">End Date</label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono bg-white/[0.04] border border-white/10 rounded-md text-slate-300 focus:outline-none focus:border-blue-500/80 transition-colors"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 rounded-md text-xs font-mono uppercase tracking-wider font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)] cursor-pointer disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}