import { useState } from "react";
import { X, Loader } from "lucide-react";
import ProjectService from "../../services/ProjectService";

export default function CreateProjectModal({
  isOpen,
  onClose,
  workspaceId,
  onProjectCreated,
}) {
  const [formData, setFormData] = useState(() => {
    const today = new Date();
    const future = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    return {
      projectName: "",
      projectDescription: "",
      expectedBudget: "0",
      startDate: today.toISOString().split("T")[0],
      endDate: future.toISOString().split("T")[0],
      methodology: "Agile",
      budgetTypeKey: "Fixed",
      originalCurrencyCode: "USD",
      exchangeRateToUSD: "1",
      totalRevenue: "0",
      status: "Planning",
    };
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-set exchange rate for common currencies
      if (name === "originalCurrencyCode") {
        if (value === "USD") updated.exchangeRateToUSD = "1.0";
        else if (value === "VND") updated.exchangeRateToUSD = "0.00004";
        else if (value === "EUR") updated.exchangeRateToUSD = "1.08";
      }

      return updated;
    });

    // Clear validation error on type
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.projectName.trim()) {
      newErrors.projectName = "Tên dự án không được để trống.";
    } else if (formData.projectName.length > 255) {
      newErrors.projectName = "Tên dự án không được vượt quá 255 ký tự.";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu là bắt buộc.";
    }
    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc là bắt buộc.";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate =
          "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.";
      }
    }

    if (formData.expectedBudget && parseFloat(formData.expectedBudget) < 0) {
      newErrors.expectedBudget = "Ngân sách không được nhỏ hơn 0.";
    }
    if (formData.totalRevenue && parseFloat(formData.totalRevenue) < 0) {
      newErrors.totalRevenue = "Doanh thu không được nhỏ hơn 0.";
    }
    if (
      formData.exchangeRateToUSD &&
      parseFloat(formData.exchangeRateToUSD) <= 0
    ) {
      newErrors.exchangeRateToUSD = "Tỷ giá phải lớn hơn 0.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (!validate()) return;

    if (!workspaceId) {
      setGeneralError("Thiếu workspaceId để tạo dự án.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        projectName: formData.projectName,
        startDate: formData.startDate,
        endDate: formData.endDate,
        methodology: formData.methodology,
        expectedBudget: Number(formData.expectedBudget || 0),
        totalRevenue: Number(formData.totalRevenue || 0),
        originalCurrencyCode: formData.originalCurrencyCode,
        exchangeRateToUSD: Number(formData.exchangeRateToUSD || 1),
        status: formData.status,
        baselineData: formData.projectDescription || null,
      };

      await ProjectService.createProject(workspaceId, payload);
      setIsSubmitting(false);
      onProjectCreated?.();
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      if (err.message === "ProjectNameExists") {
        setErrors((prev) => ({
          ...prev,
          projectName: "Tên dự án đã tồn tại trong Workspace này.",
        }));
      } else {
        setGeneralError("Lỗi hệ thống khi tạo dự án. Vui lòng thử lại.");
        console.error("Error creating project:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="w-full max-w-2xl bg-neutral-950/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-white/5">
          <h3 className="text-lg font-bold text-content-primary">
            Create New Project
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-content-muted hover:text-white p-1 hover:bg-white/5 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar"
        >
          {generalError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-md">
              {generalError}
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-content-muted uppercase tracking-wider block">
              Project Name *
            </label>
            <input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleInputChange}
              placeholder="e.g. Mobile Application Backend"
              className={`w-full bg-white/[0.02] border rounded-md px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-white/20 hover:bg-white/[0.04] transition-all duration-200 ${
                errors.projectName ? "border-rose-500" : "border-white/10"
              }`}
            />
            {errors.projectName && (
              <p className="text-[11px] text-rose-400 font-medium">
                {errors.projectName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Methodology */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-content-muted uppercase tracking-wider block">
                Methodology
              </label>
              <select
                name="methodology"
                value={formData.methodology}
                onChange={handleInputChange}
                className="w-full bg-neutral-900 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white/20 hover:bg-white/[0.04] transition-all duration-200 text-content-primary cursor-pointer"
              >
                <option value="Agile" className="bg-neutral-900 text-white">Agile</option>
                <option value="Scrum" className="bg-neutral-900 text-white">Scrum</option>
                <option value="Kanban" className="bg-neutral-900 text-white">Kanban</option>
                <option value="Waterfall" className="bg-neutral-900 text-white">Waterfall</option>
                <option value="Hybrid" className="bg-neutral-900 text-white">Hybrid</option>
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-content-muted uppercase tracking-wider block">
                Initial Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-neutral-900 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white/20 hover:bg-white/[0.04] transition-all duration-200 text-content-primary cursor-pointer"
              >
                <option value="Planning" className="bg-neutral-900 text-white">Planning</option>
                <option value="In Progress" className="bg-neutral-900 text-white">In Progress</option>
                <option value="Completed" className="bg-neutral-900 text-white">Completed</option>
                <option value="On Hold" className="bg-neutral-900 text-white">On Hold</option>
                <option value="Cancelled" className="bg-neutral-900 text-white">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Currency */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-content-muted uppercase tracking-wider block">
                Currency
              </label>
              <select
                name="originalCurrencyCode"
                value={formData.originalCurrencyCode}
                onChange={handleInputChange}
                className="w-full bg-neutral-900 border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-white/20 hover:bg-white/[0.04] transition-all duration-200 text-content-primary cursor-pointer"
              >
                <option value="USD" className="bg-neutral-900 text-white">USD ($)</option>
                <option value="VND" className="bg-neutral-900 text-white">VND (₫)</option>
                <option value="EUR" className="bg-neutral-900 text-white">EUR (€)</option>
              </select>
            </div>

            {/* Expected Budget */}
            <div className="space-y-1.5 col-span-2">
              <label className="text-xs font-mono text-content-muted uppercase tracking-wider block">
                Expected Budget
              </label>
              <input
                type="number"
                name="expectedBudget"
                value={formData.expectedBudget}
                onChange={handleInputChange}
                placeholder="e.g. 50000"
                className={`w-full bg-white/[0.02] border rounded-md px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-white/20 hover:bg-white/[0.04] transition-all duration-200 ${
                  errors.expectedBudget ? "border-rose-500" : "border-white/10"
                }`}
              />
              {errors.expectedBudget && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.expectedBudget}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Total Revenue */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-content-muted uppercase tracking-wider block">
                Total Revenue
              </label>
              <input
                type="number"
                name="totalRevenue"
                value={formData.totalRevenue}
                onChange={handleInputChange}
                placeholder="e.g. 70000"
                className={`w-full bg-white/[0.02] border rounded-md px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-white/20 hover:bg-white/[0.04] transition-all duration-200 ${
                  errors.totalRevenue ? "border-rose-500" : "border-white/10"
                }`}
              />
              {errors.totalRevenue && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.totalRevenue}
                </p>
              )}
            </div>

            {/* Exchange Rate to USD */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-content-muted uppercase tracking-wider block">
                Exchange Rate to USD
              </label>
              <input
                type="number"
                step="any"
                name="exchangeRateToUSD"
                value={formData.exchangeRateToUSD}
                onChange={handleInputChange}
                className={`w-full bg-white/[0.02] border rounded-md px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-white/20 hover:bg-white/[0.04] transition-all duration-200 ${
                  errors.exchangeRateToUSD
                    ? "border-rose-500"
                    : "border-white/10"
                }`}
              />
              {errors.exchangeRateToUSD && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.exchangeRateToUSD}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-content-muted uppercase tracking-wider block">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className={`w-full bg-white/[0.02] border rounded-md px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-white/20 hover:bg-white/[0.04] transition-all duration-200 ${
                  errors.startDate ? "border-rose-500" : "border-white/10"
                }`}
              />
              {errors.startDate && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.startDate}
                </p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-content-muted uppercase tracking-wider block">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className={`w-full bg-white/[0.02] border rounded-md px-3 py-2 text-sm text-content-primary focus:outline-none focus:border-white/20 hover:bg-white/[0.04] transition-all duration-200 ${
                  errors.endDate ? "border-rose-500" : "border-white/10"
                }`}
              />
              {errors.endDate && (
                <p className="text-[11px] text-rose-400 font-medium">
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="border-t border-white/10 pt-5 flex justify-end gap-3 bg-transparent">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-white/10 rounded-md bg-white/5 text-slate-350 hover:bg-white/10 hover:text-white text-sm font-medium transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-md bg-slate-200 hover:bg-white text-neutral-950 text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting && <Loader className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}