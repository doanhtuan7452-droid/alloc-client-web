import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  Download, Plus, ReceiptText, CheckCircle2, Clock, XCircle, 
  MoreVertical, Wallet, PieChart, Coins, TrendingUp, Calendar, AlertCircle 
} from 'lucide-react';
import FinanceSkeleton from "../../components/skeletons/FinanceSkeleton";
import { 
  fetchProjectExpenses, 
  createProjectExpense, 
  fetchProjectRevenues, 
  fetchProjectFinancialSummary 
} from "../../services/mockApi";
import { expenses } from "../../data/mockData";

export default function Finance() {
  const { 
    activeProject, 
    isLoading: isProjectLoading, 
    error: projectError,
    isExpenseModalOpen,
    setIsExpenseModalOpen
  } = useOutletContext();

  // Financial metrics summary
  const [financialSummary, setFinancialSummary] = useState({ totalSpent: 0, totalRevenue: 0 });
  
  // Expenses state
  const [expenseData, setExpenseData] = useState({ items: [], totalPages: 1, totalItems: 0 });
  const [expensePage, setExpensePage] = useState(1);
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");
  const [isExpensesLoading, setIsExpensesLoading] = useState(false);

  // Revenues state
  const [revenueData, setRevenueData] = useState({ items: [], totalPages: 1, totalItems: 0 });
  const [revenuePage, setRevenuePage] = useState(1);
  const [isRevenuesLoading, setIsRevenuesLoading] = useState(false);

  // Modal input states
  const [modalCategory, setModalCategory] = useState("Personnel & Research");
  const [modalAmount, setModalAmount] = useState("");
  const [modalDate, setModalDate] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalError, setModalError] = useState("");
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  // Currency Formatter Helper
  const formatCurrency = (amount, currencyCode = "USD") => {
    const code = currencyCode || "USD";
    const locale = code === "VND" ? "vi-VN" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: code === "VND" ? 0 : 2,
      maximumFractionDigits: code === "VND" ? 0 : 2
    }).format(amount);
  };

  // Load financial summary and reset pages on project change
  useEffect(() => {
    if (!activeProject) return;
    
    // Reset pages & filters
    setExpensePage(1);
    setRevenuePage(1);
    setExpenseSearch("");
    setExpenseCategory("");
    
    // Load summary
    loadFinancialSummary();
  }, [activeProject]);

  // Load summary function
  const loadFinancialSummary = async () => {
    if (!activeProject) return;
    try {
      const summary = await fetchProjectFinancialSummary(activeProject.projectId);
      setFinancialSummary(summary);
    } catch (err) {
      console.error("Error loading financial summary:", err);
    }
  };

  // Load expenses when pagination/filters change
  useEffect(() => {
    if (!activeProject) return;
    
    let isSubscribed = true;
    async function loadExpenses() {
      setIsExpensesLoading(true);
      try {
        const data = await fetchProjectExpenses(
          activeProject.projectId, 
          expensePage, 
          5, 
          expenseSearch, 
          expenseCategory
        );
        if (isSubscribed) {
          setExpenseData(data);
        }
      } catch (err) {
        console.error("Error loading project expenses:", err);
      } finally {
        if (isSubscribed) {
          setIsExpensesLoading(false);
        }
      }
    }

    loadExpenses();
    return () => { isSubscribed = false; };
  }, [activeProject, expensePage, expenseSearch, expenseCategory]);

  // Load revenues when pagination changes
  useEffect(() => {
    if (!activeProject) return;
    
    let isSubscribed = true;
    async function loadRevenues() {
      setIsRevenuesLoading(true);
      try {
        const data = await fetchProjectRevenues(activeProject.projectId, revenuePage, 5);
        if (isSubscribed) {
          setRevenueData(data);
        }
      } catch (err) {
        console.error("Error loading project revenues:", err);
      } finally {
        if (isSubscribed) {
          setIsRevenuesLoading(false);
        }
      }
    }

    loadRevenues();
    return () => { isSubscribed = false; };
  }, [activeProject, revenuePage]);

  // Reset modal fields when modal is opened/closed
  useEffect(() => {
    if (isExpenseModalOpen) {
      setModalCategory("Personnel & Research");
      setModalAmount("");
      // Set default date to today or project start date
      const todayStr = new Date().toISOString().split('T')[0];
      if (activeProject && todayStr >= activeProject.startDate && todayStr <= activeProject.endDate) {
        setModalDate(todayStr);
      } else {
        setModalDate(activeProject ? activeProject.startDate : "");
      }
      setModalDescription("");
      setModalError("");
    }
  }, [isExpenseModalOpen, activeProject]);

  // Submit expense handler
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!activeProject) return;

    // Validate Constraints
    const parsedAmount = parseFloat(modalAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setModalError("Số tiền chi tiêu phải lớn hơn 0.");
      return;
    }

    if (!modalDate) {
      setModalError("Vui lòng chọn ngày chi tiêu.");
      return;
    }

    if (modalDate < activeProject.startDate || modalDate > activeProject.endDate) {
      setModalError(
        `Ngày chi tiêu phải nằm trong khoảng thời hạn dự án (${activeProject.startDate} đến ${activeProject.endDate}).`
      );
      return;
    }

    setIsSubmittingExpense(true);
    setModalError("");

    try {
      await createProjectExpense(activeProject.projectId, {
        category: modalCategory,
        amount: parsedAmount,
        expenseDate: modalDate,
        description: modalDescription
      });

      // Refresh data
      await loadFinancialSummary();
      
      // Reload current expense page
      const updatedExpenses = await fetchProjectExpenses(
        activeProject.projectId, 
        expensePage, 
        5, 
        expenseSearch, 
        expenseCategory
      );
      setExpenseData(updatedExpenses);

      // Close modal
      setIsExpenseModalOpen(false);
    } catch (err) {
      console.error("Error creating expense:", err);
      setModalError("Đã xảy ra lỗi khi lưu chi phí. Vui lòng thử lại.");
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  if (isProjectLoading) {
    return <FinanceSkeleton />;
  }

  if (projectError) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 gap-3">
        <p className="text-sm font-medium">{projectError}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-white/5 border border-white/10 rounded text-xs text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 gap-4">
        <h2 className="text-xl font-bold text-white">Không có dự án nào</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Workspace này chưa có dự án nào được khởi tạo. Vui lòng tạo dự án mới để hiển thị thông tin tài chính.
        </p>
      </div>
    );
  }

  // Calculate numbers safely
  const budget = parseFloat(activeProject.expectedBudget || 0);
  const totalSpent = parseFloat(financialSummary.totalSpent || 0);
  const totalRevenue = parseFloat(financialSummary.totalRevenue || 0);
  
  const remainingBudget = Math.round((budget - totalSpent) * 100) / 100;
  const utilization = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;

  // Categories allocations logic
  const categoriesDef = [
    { name: "Personnel & Research", percent: 0.50 },
    { name: "Infrastructure (Cloud/Compute)", percent: 0.30 },
    { name: "Travel & Symposiums", percent: 0.10 },
    { name: "Software License", percent: 0.10 }
  ];

  // For category summary table, we calculate the spent per category dynamically from all project expenses
  const spentByCategory = {};
  categoriesDef.forEach(cat => spentByCategory[cat.name] = 0);
  spentByCategory["Other"] = 0;
  
  const allProjExpenses = expenses[activeProject.projectId] || [];
  allProjExpenses.forEach(exp => {
    const cat = exp.category;
    if (spentByCategory[cat] !== undefined) {
      spentByCategory[cat] += parseFloat(exp.amount);
    } else {
      spentByCategory["Other"] += parseFloat(exp.amount);
    }
  });

  const categoryAllocations = categoriesDef.map(cat => {
    const allocated = Math.round((budget * cat.percent) * 100) / 100;
    const spent = Math.round((spentByCategory[cat.name] || 0) * 100) / 100;
    const remaining = Math.round((allocated - spent) * 100) / 100;
    const catUtil = allocated > 0 ? Math.round((spent / allocated) * 100) : 0;
    return {
      name: cat.name,
      allocated,
      spent,
      remaining,
      utilization: catUtil
    };
  });

  // Check if "Other" spent exists
  if (spentByCategory["Other"] > 0) {
    categoryAllocations.push({
      name: "Other",
      allocated: 0,
      spent: Math.round(spentByCategory["Other"] * 100) / 100,
      remaining: Math.round(-spentByCategory["Other"] * 100) / 100,
      utilization: 100
    });
  }

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* Scrollable Container */}
      <div className="px-6 pt-4 pb-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">

        {/* Metrics Cards: Harmonious Glassmorphism White/Gray on Dark Background */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Total Budget */}
          <div className="glass-card-light rounded-xl p-6 relative overflow-hidden transition-all duration-300">
            <div className="flex justify-between items-start mb-5">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Wallet className="w-4.5 h-4.5 text-slate-350" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Total Budget</p>
            <h2 className="text-2xl font-bold font-mono text-white mb-2">
              {formatCurrency(budget, activeProject.originalCurrencyCode)}
            </h2>
            <p className="text-[11px] text-slate-500 font-mono">
              Phê duyệt cho {activeProject.projectName}
            </p>
          </div>

          {/* Card 2: Received Revenue */}
          <div className="glass-card-light rounded-xl p-6 transition-all duration-300">
            <div className="flex justify-between items-start mb-5">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <TrendingUp className="w-4.5 h-4.5 text-slate-350" />
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Received Revenue</p>
            <h2 className="text-2xl font-bold font-mono text-white mb-2">
              {formatCurrency(totalRevenue, activeProject.originalCurrencyCode)}
            </h2>
            <p className="text-[11px] text-slate-500 font-mono">
              Tổng doanh thu đã thu thực tế
            </p>
          </div>

          {/* Card 3: Total Spent */}
          <div className="glass-card-light rounded-xl p-6 transition-all duration-300">
            <div className="flex justify-between items-start mb-5">
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <ReceiptText className="w-4.5 h-4.5 text-slate-350" />
              </div>
              <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded border ${
                utilization > 90 
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                  : utilization > 60
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
                {utilization}% Utilized
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Total Spent</p>
            <h2 className="text-2xl font-bold font-mono text-white mb-4">
              {formatCurrency(totalSpent, activeProject.originalCurrencyCode)}
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden flex-1">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    utilization > 90 
                      ? "bg-rose-500" 
                      : utilization > 60
                        ? "bg-amber-500"
                        : "bg-slate-300"
                  }`} 
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {formatCurrency(remainingBudget, activeProject.originalCurrencyCode)} còn lại
              </span>
            </div>
          </div>
        </div>

        {/* Budget Allocations Table Section */}
        <div className="glass-card-light rounded-xl overflow-hidden transition-all duration-300">
          <div className="p-6 border-b border-white/5">
            <h3 className="font-bold text-base text-white">Phân bổ ngân sách dự án (Category Allocations)</h3>
            <p className="text-xs text-slate-400 mt-1">Cơ cấu ngân sách định mức của dự án so với thực chi.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-400 font-mono uppercase tracking-wider bg-white/[0.01] border-b border-white/5">
                <tr>
                  <th className="px-6 py-3.5 font-medium">Danh mục</th>
                  <th className="px-6 py-3.5 font-medium">Ngân sách allocated</th>
                  <th className="px-6 py-3.5 font-medium">Thực chi</th>
                  <th className="px-6 py-3.5 font-medium">Còn lại</th>
                  <th className="px-6 py-3.5 font-medium w-48">Mức sử dụng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {categoryAllocations.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 font-medium text-white">{cat.name}</td>
                    <td className="px-6 py-4 font-mono">{formatCurrency(cat.allocated, activeProject.originalCurrencyCode)}</td>
                    <td className="px-6 py-4 font-mono">{formatCurrency(cat.spent, activeProject.originalCurrencyCode)}</td>
                    <td className="px-6 py-4 font-mono">
                      <span className={cat.remaining < 0 ? "text-rose-400" : "text-emerald-450"}>
                        {formatCurrency(cat.remaining, activeProject.originalCurrencyCode)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${cat.utilization > 100 ? "bg-rose-500" : "bg-slate-400"}`}
                            style={{ width: `${Math.min(cat.utilization, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 w-8">{cat.utilization}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses List & Revenues List Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Column 1: Expenses Table */}
          <div className="glass-card-light rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 min-h-[360px]">
            <div>
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-base text-white">Sổ chi tiêu (Expenses)</h3>
                  <p className="text-xs text-slate-400 mt-1">Danh sách chi tiết chi phí phát sinh.</p>
                </div>
                
                {/* Search & Category Filter */}
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Tìm chi phí..." 
                    value={expenseSearch}
                    onChange={(e) => {
                      setExpenseSearch(e.target.value);
                      setExpensePage(1);
                    }}
                    className="glass-input-light px-3 py-1.5 text-xs w-32 focus:w-40"
                  />
                  <select 
                    value={expenseCategory}
                    onChange={(e) => {
                      setExpenseCategory(e.target.value);
                      setExpensePage(1);
                    }}
                    className="glass-input-light px-2 py-1.5 text-xs bg-neutral-950 cursor-pointer border border-white/10"
                  >
                    <option value="">Tất cả mục</option>
                    {categoriesDef.map((cat, i) => (
                      <option key={i} value={cat.name}>{cat.name}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {isExpensesLoading ? (
                <div className="py-20 flex justify-center items-center text-slate-400 text-xs gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></span>
                  Đang tải...
                </div>
              ) : expenseData.items.length === 0 ? (
                /* Empty state for expenses */
                <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/20 mb-3">
                    <ReceiptText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-350 mb-1">Chưa có chi phí nào</p>
                  <p className="text-xs text-slate-500 max-w-xs mb-4">
                    {expenseSearch || expenseCategory 
                      ? "Không tìm thấy chi phí phù hợp với bộ lọc hiện tại." 
                      : "Dự án này chưa phát sinh chi phí. Hãy ghi nhận chi phí đầu tiên."}
                  </p>
                  {!expenseSearch && !expenseCategory && (
                    <button 
                      onClick={() => setIsExpenseModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded text-xs transition-all cursor-pointer font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ghi chi phí đầu tiên
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] text-slate-400 font-mono uppercase bg-white/[0.01] border-b border-white/5">
                      <tr>
                        <th className="px-6 py-3 font-medium">Mã</th>
                        <th className="px-6 py-3 font-medium">Ngày</th>
                        <th className="px-6 py-3 font-medium">Mô tả</th>
                        <th className="px-6 py-3 font-medium">Danh mục</th>
                        <th className="px-6 py-3 text-right font-medium">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {expenseData.items.map((exp) => (
                        <tr key={exp.expenseId} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-3.5 font-mono text-xs text-slate-500">EXP-{exp.expenseId}</td>
                          <td className="px-6 py-3.5 font-mono text-xs">{exp.expenseDate}</td>
                          <td className="px-6 py-3.5 font-medium text-white max-w-[140px] truncate" title={exp.description}>
                            {exp.description || "Không có mô tả"}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className="bg-white/5 text-slate-350 border border-white/5 text-[9px] px-2 py-0.5 rounded font-mono truncate max-w-[130px] inline-block">
                              {exp.category}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-mono text-right text-white font-semibold">
                            -{formatCurrency(exp.amount, activeProject.originalCurrencyCode)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination for Expenses */}
            {!isExpensesLoading && expenseData.totalPages > 1 && (
              <div className="p-4 border-t border-white/5 flex items-center justify-between mt-auto">
                <span className="text-[11px] text-slate-500 font-mono">
                  Trang {expensePage} / {expenseData.totalPages} ({expenseData.totalItems} chi phí)
                </span>
                <div className="flex gap-2">
                  <button 
                    disabled={expensePage === 1}
                    onClick={() => setExpensePage(p => p - 1)}
                    className="px-2.5 py-1 bg-white/5 border border-white/10 text-white rounded text-xs hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
                  >
                    Trước
                  </button>
                  <button 
                    disabled={expensePage === expenseData.totalPages}
                    onClick={() => setExpensePage(p => p + 1)}
                    className="px-2.5 py-1 bg-white/5 border border-white/10 text-white rounded text-xs hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Revenues Table */}
          <div className="glass-card-light rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-300 min-h-[360px]">
            <div>
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">Doanh thu dự kiến (Revenues)</h3>
                  <p className="text-xs text-slate-400 mt-1">Kế hoạch thu tiền và đợt thanh toán của khách hàng.</p>
                </div>
              </div>

              {isRevenuesLoading ? (
                <div className="py-20 flex justify-center items-center text-slate-400 text-xs gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></span>
                  Đang tải...
                </div>
              ) : revenueData.items.length === 0 ? (
                /* Empty state for revenues */
                <div className="py-16 px-6 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/20 mb-3">
                    <Coins className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-350 mb-1">Chưa có kế hoạch doanh thu</p>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Dự án này chưa được lập kế hoạch ghi nhận doanh thu thực tế.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] text-slate-400 font-mono uppercase bg-white/[0.01] border-b border-white/5">
                      <tr>
                        <th className="px-6 py-3 font-medium">Mã</th>
                        <th className="px-6 py-3 font-medium">Ngày dự kiến</th>
                        <th className="px-6 py-3 font-medium">Loại doanh thu</th>
                        <th className="px-6 py-3 text-center font-medium">Trạng thái</th>
                        <th className="px-6 py-3 text-right font-medium">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {revenueData.items.map((rev) => (
                        <tr key={rev.revenueId} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-6 py-3.5 font-mono text-xs text-slate-500">REV-{rev.revenueId}</td>
                          <td className="px-6 py-3.5 font-mono text-xs">{rev.expectedDate}</td>
                          <td className="px-6 py-3.5 font-medium text-white">{rev.type}</td>
                          <td className="px-6 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded border text-[9px] font-mono ${
                              rev.status === "Received" 
                                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                                : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                            }`}>
                              {rev.status === "Received" ? (
                                <><CheckCircle2 className="w-2.5 h-2.5" /> Received</>
                              ) : (
                                <><Clock className="w-2.5 h-2.5" /> Pending</>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 font-mono text-right text-emerald-450 font-semibold">
                            +{formatCurrency(rev.amount, activeProject.originalCurrencyCode)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination for Revenues */}
            {!isRevenuesLoading && revenueData.totalPages > 1 && (
              <div className="p-4 border-t border-white/5 flex items-center justify-between mt-auto">
                <span className="text-[11px] text-slate-500 font-mono">
                  Trang {revenuePage} / {revenueData.totalPages} ({revenueData.totalItems} doanh thu)
                </span>
                <div className="flex gap-2">
                  <button 
                    disabled={revenuePage === 1}
                    onClick={() => setRevenuePage(p => p - 1)}
                    className="px-2.5 py-1 bg-white/5 border border-white/10 text-white rounded text-xs hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
                  >
                    Trước
                  </button>
                  <button 
                    disabled={revenuePage === revenueData.totalPages}
                    onClick={() => setRevenuePage(p => p + 1)}
                    className="px-2.5 py-1 bg-white/5 border border-white/10 text-white rounded text-xs hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer font-medium"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Log Expense Modal (Declarative State control via layout context) */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => { if (!isSubmittingExpense) setIsExpenseModalOpen(false); }}
          ></div>

          {/* Modal Content */}
          <div className="glass-card-light rounded-xl max-w-md w-full overflow-hidden shadow-2xl relative z-10 animate-fadeIn border border-white/15 bg-neutral-900/90">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <h3 className="font-bold text-slate-200 text-sm">Ghi nhận chi phí dự án</h3>
              <button 
                disabled={isSubmittingExpense}
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg disabled:opacity-50 font-mono"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              
              {modalError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Category Selection */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Danh mục chi tiêu
                </label>
                <select 
                  value={modalCategory}
                  onChange={(e) => setModalCategory(e.target.value)}
                  disabled={isSubmittingExpense}
                  className="glass-input-light w-full px-3 py-2 text-sm bg-neutral-950 cursor-pointer border border-white/10"
                >
                  {categoriesDef.map((cat, i) => (
                    <option key={i} value={cat.name}>{cat.name}</option>
                  ))}
                  <option value="Other">Other (Danh mục khác)</option>
                </select>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Số tiền ({activeProject.originalCurrencyCode || "USD"})
                </label>
                <input 
                  type="number" 
                  required
                  min="0.01" 
                  step="0.01"
                  placeholder="0.00"
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value)}
                  disabled={isSubmittingExpense}
                  className="glass-input-light w-full px-3 py-2 text-sm"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Yêu cầu số tiền nhập phải lớn hơn 0</span>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Ngày chi tiêu
                </label>
                <input 
                  type="date" 
                  required
                  min={activeProject.startDate} 
                  max={activeProject.endDate}
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                  disabled={isSubmittingExpense}
                  className="glass-input-light w-full px-3 py-2 text-sm bg-neutral-950 font-mono cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Chỉ cho phép từ {activeProject.startDate} đến {activeProject.endDate}
                </span>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Mô tả chi tiết
                </label>
                <textarea 
                  rows="3"
                  placeholder="Nhập lý do chi tiêu, nhà cung cấp, thông tin hóa đơn..."
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  disabled={isSubmittingExpense}
                  className="glass-input-light w-full px-3 py-2 text-sm resize-none"
                ></textarea>
              </div>

              {/* Form Actions */}
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsExpenseModalOpen(false)}
                  disabled={isSubmittingExpense}
                  className="px-4 py-2 border border-white/10 text-slate-300 rounded hover:bg-white/5 hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingExpense}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_12px_rgba(59,130,246,0.25)] disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {isSubmittingExpense ? (
                    <>
                      <span className="animate-spin w-3 h-3 border border-white/30 border-t-white rounded-full"></span>
                      Đang ghi...
                    </>
                  ) : (
                    "Lưu chi phí"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
