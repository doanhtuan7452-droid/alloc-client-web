import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MoreVertical, Calendar, Landmark, Layers, Edit2, Trash2, X, Loader2, ChevronDown } from "lucide-react";
import ProjectService from "../../services/ProjectService";
import { useNotification } from "../../contexts/NotificationContext";
import { useLanguage } from "../../contexts/LanguageContext";

// 🌟 Thêm prop isOwner nhận từ file cha truyền xuống
export default function ProjectCard({ project, onMenuClick, isOwner }) {
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const { toast, confirm } = useNotification();
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
    progress = project.progressPercentage 
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

  // Xử lý cập nhật dự án
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setFormError(t("activeProjects.errEmptyProjectName"));
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      // Giữ nguyên dạng YYYY-MM-DD phù hợp với DateOnly của Backend
      const formattedStartDate = editStartDate.trim() === "" ? null : editStartDate;
      const formattedEndDate = editEndDate.trim() === "" ? null : editEndDate;

      const payload = {
        projectName: editName.trim(),
        status: editStatus,
        methodology: editMethodology,
        expectedBudget: editBudget === "" ? 0 : Number(editBudget), 
        totalRevenue: totalRevenue,    // 🌟 THÊM TRƯỜNG NÀY: Gửi lại giá trị doanh thu hiện tại để thỏa mãn validation của backend
        startDate: formattedStartDate, 
        endDate: formattedEndDate,     
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
      // Hiển thị chi tiết lỗi từ validation của backend nếu có
      setFormError(err?.response?.data?.errors 
        ? JSON.stringify(err.response.data.errors) 
        : (err?.response?.data?.message || t("activeProjects.errUpdateProject")));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🌟 Hàm xử lý Xóa dự án
  const handleDeleteProject = async (e) => {
    e.stopPropagation(); // Ngăn hành vi click thẻ card mở trang board
    
    const isConfirmed = await confirm(
      t("activeProjects.confirmDeleteProject").replace("{name}", projectName),
      t("activeProjects.deleteProjectTitle")
    );
    if (!isConfirmed) {
      return;
    }

    try {
      await ProjectService.deleteProject(projectId);
      setIsDropdownOpen(false);
      
      if (onMenuClick) {
        onMenuClick(); // Gọi callback để component cha cập nhật lại danh sách dữ liệu
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("Error deleting project:", err);
      toast.error(err?.response?.data?.message || t("activeProjects.errDeleteProject"));
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
    return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US");
  };

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
          {/* 🌟 KIỂM TRA ROLE OWNER: Chỉ hiển thị khối này nếu isOwner = true */}
          {isOwner && (
            <div className="relative" ref={dropdownRef}>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); 
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="text-content-muted hover:text-white p-1 hover:bg-white/5 rounded transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-neutral-900 border border-white/10 rounded-md shadow-2xl py-1 z-30 animate-fade-in-down">
                  {/* Nút Sửa */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); 
                      setIsDropdownOpen(false);
                      setIsEditModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Edit2 size={12} className="text-blue-400" /> {t("activeProjects.editProject")}
                  </button>
                  
                  {/* 🌟 Nút Xóa mới thêm */}
                  <button
                    type="button"
                    onClick={handleDeleteProject}
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} className="text-rose-400" /> {t("activeProjects.deleteProject")}
                  </button>
                </div>
              )}
            </div>
          )}
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
                <Landmark className="w-3.5 h-3.5 text-slate-500" /> {t("activeProjects.expectedBudget")}
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
                <Landmark className="w-3.5 h-3.5 text-slate-500" /> {t("activeProjects.totalRevenue")}
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
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> {t("activeProjects.timeline")}
              </span>
              <span className="font-mono text-slate-300 text-[10px]">
                {formatDateDisplay(startDate)} / {formatDateDisplay(endDate)}
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-400">{t("activeProjects.completionProgress")}</span>
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
                <span className="text-slate-500">{t("activeProjects.timeStatus")}</span>
                {isOverdue ? (
                  <span className="text-rose-400 font-bold uppercase">{t("activeProjects.overdueDays").replace("{days}", Math.abs(daysLeft))}</span>
                ) : (
                  <span className="text-sky-400/80">{t("activeProjects.daysRemaining").replace("{days}", daysLeft)}</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-[9px] font-mono text-slate-600 mt-4 text-right">
          {t("activeProjects.createdOn").replace("{date}", new Date(createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US"))}
        </div>
      </div>

      {/* EDIT PROJECT MODAL COMPONENT */}
      {isEditModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" 
          onClick={(e) => {
            e.stopPropagation(); 
            setIsEditModalOpen(false);
          }}
        >
          <div 
            className="w-full max-w-lg bg-[#121214]/90 border border-white/10 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
            onClick={(e) => e.stopPropagation()} 
          >
            {/* Header Form */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.01]">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Edit2 size={14} className="text-blue-400" /> {t("activeProjects.editProjectDetails")}
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
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("activeProjects.projectId")}</label>
                <input
                  type="text"
                  value={`#PROJ-${projectId}`}
                  disabled
                  className="w-full px-3 py-2 text-sm font-mono bg-white/[0.02] border border-white/5 rounded-md text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Tên dự án */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("activeProjects.projectName")}</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/10 rounded-md text-white focus:outline-none focus:border-blue-500/80 transition-all"
                  disabled={isSubmitting}
                  placeholder={t("activeProjects.projectName") + "..."}
                />
              </div>

              {/* Dropdowns row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("activeProjects.status")}</label>
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
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("activeProjects.methodology")}</label>
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
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("activeProjects.expectedBudgetCurrency").replace("{currency}", originalCurrencyCode)}</label>
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
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("activeProjects.startDate")}</label>
                  <input
                     type="date"
                     value={editStartDate}
                     onChange={(e) => setEditStartDate(e.target.value)}
                     className="w-full px-3 py-2 text-sm font-mono bg-white/[0.04] border border-white/10 rounded-md text-slate-300 focus:outline-none focus:border-blue-500/80 transition-colors"
                     disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">{t("activeProjects.endDate")}</label>
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
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 hover:text-blue-300 rounded-md text-xs font-mono uppercase tracking-wider font-semibold transition-all shadow-[0_0_15px_rgba(59,130,246,0.1)] cursor-pointer disabled:opacity-40"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> {t("activeProjects.saving")}
                    </>
                  ) : (
                    t("activeProjects.saveChanges")
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