import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Plus,
  CheckCircle2,
  Clock,
  Wallet,
  TrendingUp,
  ReceiptText,
  AlertCircle,
  Calendar,
  Layers,
  Percent
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useLanguage } from "../../contexts/LanguageContext";
import FinanceSkeleton from "../../components/skeletons/FinanceSkeleton";
import ProjectService from "../../services/ProjectService";

const CATEGORY_COLORS = {
  "Personnel & Research": "#3b82f6", // Blue
  "Infrastructure": "#8b5cf6",        // Purple
  "Marketing & Sales": "#f59e0b",     // Amber
  "Operation & Admin": "#10b981",     // Emerald
  "Other Expenses": "#6b7280"         // Gray
};

export default function Finance() {
  const { t } = useLanguage();

  // Lấy dữ liệu project hiện tại từ OutletContext
  const {
    activeProject,
    isLoading: isProjectLoading,
    error: projectError,
    isExpenseModalOpen,
    setIsExpenseModalOpen,
  } = useOutletContext();

  // State lưu thông tin chi tiết đầy đủ của Dự án từ API getProjectById
  const [projectDetail, setProjectDetail] = useState(null);
  
  // States quản lý dữ liệu tài chính thu/chi từ API
  const [financialSummary, setFinancialSummary] = useState({ totalSpent: 0, totalRevenue: 0 });
  const [expensesList, setExpensesList] = useState([]);
  const [revenuesList, setRevenuesList] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // States dành cho Form Modal tạo mới
  const [transactionType, setTransactionType] = useState("expense"); 
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Personnel & Research");
  const [description, setDescription] = useState("");
  const [modalError, setModalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Danh mục chi phí mặc định của hệ thống (sử dụng chuỗi gốc tiếng Anh cho DB)
  const expenseCategories = [
    "Personnel & Research",
    "Infrastructure",
    "Marketing & Sales",
    "Operation & Admin",
    "Other Expenses"
  ];

  // Ánh xạ chuỗi gốc sang key ngôn ngữ dịch thuật
  const getCategoryTranslationKey = (catName) => {
    switch (catName) {
      case "Personnel & Research":
        return "finance.categories.personnel";
      case "Infrastructure":
        return "finance.categories.infrastructure";
      case "Marketing & Sales":
        return "finance.categories.marketing";
      case "Operation & Admin":
        return "finance.categories.operation";
      case "Other Expenses":
        return "finance.categories.other";
      default:
        return null;
    }
  };

  const getTranslatedCategoryName = (catName) => {
    const key = getCategoryTranslationKey(catName);
    return key ? t(key) : catName;
  };

  // Tiền tệ Formatter
  const formatCurrency = (value) => {
    const formattedNum = new Intl.NumberFormat("vi-VN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
    const currency = projectDetail?.originalCurrencyCode || "VND";
    return `${formattedNum} ${currency}`;
  };

  // Hàm format số tiền nhập vào có phân tách hàng nghìn (ví dụ: "5.000.000")
  const formatInputAmount = (val) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) return "";
    return new Intl.NumberFormat("vi-VN").format(clean);
  };

  // Hàm rút gọn đơn vị tiền tệ trên trục Y biểu đồ (ví dụ: 1.5M, 20B)
  const formatShortCurrency = (value) => {
    if (value >= 1e9) {
      return (value / 1e9).toFixed(1) + "B";
    }
    if (value >= 1e6) {
      return (value / 1e6).toFixed(1) + "M";
    }
    if (value >= 1e3) {
      return (value / 1e3).toFixed(0) + "K";
    }
    return value;
  };

  // Hàm định dạng ngày tháng hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Hàm fetch toàn bộ dữ liệu tài chính và chi tiết project
  const fetchFinancialData = async () => {
    if (!activeProject?.projectId) return;
    setIsLoadingData(true);
    try {
      const projectId = activeProject.projectId;
      
      // Chạy song song các API sử dụng tham số phân trang 'page' thay cho 'pageNumber'
      const [projectRes, summary, expensesRes, revenuesRes] = await Promise.all([
        ProjectService.getProjectById(projectId),
        ProjectService.getFinancialSummary(projectId),
        ProjectService.getExpenses(projectId, { page: 1, pageSize: 50 }),
        ProjectService.getRevenues(projectId, { page: 1, pageSize: 50 })
      ]);

      setProjectDetail(projectRes.data || projectRes);
      setFinancialSummary(summary);
      setExpensesList(expensesRes.data?.items || expensesRes.items || []);
      setRevenuesList(revenuesRes.data?.items || revenuesRes.items || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu tài chính dự án:", err);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Tự động gọi lại API khi đổi Dự án
  useEffect(() => {
    fetchFinancialData();
  }, [activeProject]);

  // Xử lý submit Form thêm khoản thu/chi lên API
  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!activeProject?.projectId) return; 

    // Loại bỏ dấu chấm phân tách trước khi parse
    const cleanAmount = amount.replace(/\./g, "");
    const parsedAmount = parseFloat(cleanAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setModalError(t("finance.errInvalidAmount"));
      return;
    }

    setIsSubmitting(true);
    setModalError("");

    try {
      const projectId = activeProject.projectId;
      const currentDateString = new Date().toISOString().split("T")[0];
      
      if (transactionType === "expense") {
        await ProjectService.createExpense(projectId, {
          amount: parsedAmount,
          category: category,
          description: description,
          expenseDate: currentDateString
        });
      } else {
        await ProjectService.createRevenue(projectId, {
          amount: parsedAmount,
          expectedDate: currentDateString
        });
      }

      setIsExpenseModalOpen(false);
      setAmount("");
      setDescription("");
      fetchFinancialData();
    } catch (err) {
      console.error("Lỗi khi thêm giao dịch:", err);
      setModalError(err.response?.data?.message || t("finance.errCreateFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isProjectLoading || isLoadingData) return <FinanceSkeleton />;

  if (projectError) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 gap-3">
        <p className="text-sm font-medium">{projectError}</p>
        <button onClick={fetchFinancialData} className="px-4 py-2 bg-white/5 border border-white/10 rounded text-xs text-white hover:bg-white/10 cursor-pointer">
          Tải lại dữ liệu
        </button>
      </div>
    );
  }

  if (!activeProject || !projectDetail) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 gap-4">
        <h2 className="text-xl font-bold text-white">{t("finance.noProjectTitle")}</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          {t("finance.noProjectDesc")}
        </p>
      </div>
    );
  }

  const budget = projectDetail.expectedBudget || 0; 
  const totalSpent = financialSummary.totalSpent || 0;
  const totalRevenue = financialSummary.totalRevenue || 0;
  const utilization = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;
  const remainingBudget = budget - totalSpent;

  // Tính toán phân bổ chi phí hạng mục từ dữ liệu thực tế (chỉ lấy các hạng mục có tiền > 0)
  const categoryAllocations = expenseCategories.map(cat => {
    const total = expensesList
      .filter(exp => exp.category === cat)
      .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    return { 
      name: getTranslatedCategoryName(cat), 
      value: total,
      rawName: cat 
    };
  }).filter(item => item.value > 0);

  // Tính toán xu hướng dòng tiền lũy kế theo thời gian
  const getTrendData = () => {
    const datesMap = {};
    
    expensesList.forEach(exp => {
      const date = exp.expenseDate || "";
      if (date) {
        if (!datesMap[date]) datesMap[date] = { date, expense: 0, revenue: 0 };
        datesMap[date].expense += Number(exp.amount || 0);
      }
    });

    revenuesList.forEach(rev => {
      const date = rev.expectedDate || "";
      if (date) {
        if (!datesMap[date]) datesMap[date] = { date, expense: 0, revenue: 0 };
        datesMap[date].revenue += Number(rev.amount || 0);
      }
    });

    const sortedData = Object.values(datesMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    let cumulativeExpense = 0;
    let cumulativeRevenue = 0;
    
    return sortedData.map(item => {
      cumulativeExpense += item.expense;
      cumulativeRevenue += item.revenue;
      return {
        date: formatDate(item.date),
        [t("finance.chartLegendExpense")]: cumulativeExpense,
        [t("finance.chartLegendRevenue")]: cumulativeRevenue
      };
    });
  };

  const trendData = getTrendData();

  // Custom tooltips cho biểu đồ
  const CustomDonutTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card-light bg-neutral-950/90 border border-white/10 rounded-lg p-2.5 shadow-xl text-xs">
          <p className="font-semibold text-slate-200">{payload[0].name}</p>
          <p className="font-mono text-rose-400 mt-0.5 font-bold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomTrendTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card-light bg-neutral-950/90 border border-white/10 rounded-lg p-3 shadow-xl text-xs space-y-1.5">
          <p className="font-semibold text-slate-400 border-b border-white/5 pb-1">{label}</p>
          {payload.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center gap-6">
              <span className="text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.stroke || item.color }}></span>
                {item.name}:
              </span>
              <span className={`font-mono font-semibold ${item.name === t("finance.chartLegendRevenue") ? "text-emerald-400" : "text-rose-400"}`}>
                {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      <div className="px-6 pt-4 pb-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
        
        {/* Thanh tiêu đề hiển thị thông tin metadata dự án */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400">
          <div>
            <span className="font-semibold text-slate-300">{t("finance.projectLabel")} </span>
            <span className="text-white font-medium text-sm">{projectDetail.projectName}</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{t("finance.timeLabel")} {formatDate(projectDetail.startDate)} - {formatDate(projectDetail.endDate)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-slate-500" />
              <span>{t("finance.progressLabel")} <strong className="text-white">{projectDetail.progress}%</strong></span>
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-white/5 text-slate-300 border border-white/10 uppercase font-mono">
                {projectDetail.status || "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Lưới các Thẻ Số liệu Tổng quan Tài chính */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card-light rounded-xl p-6">
            <div className="flex justify-between items-start mb-1 gap-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate" title={t("finance.budgetExpected")}>
                {t("finance.budgetExpected")}
              </p>
              <Wallet className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
            <h2 className="text-2xl font-bold font-mono text-white mb-2 truncate">{formatCurrency(budget)}</h2>
            <p className="text-[11px] text-slate-500 font-mono truncate" title={t("finance.budgetExpectedSub")}>
              {t("finance.budgetExpectedSub")}
            </p>
          </div>

          <div className="glass-card-light rounded-xl p-6">
            <div className="flex justify-between items-start mb-1 gap-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate" title={t("finance.revenueAccumulated")}>
                {t("finance.revenueAccumulated")}
              </p>
              <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <h2 className="text-2xl font-bold font-mono text-emerald-400 mb-2 truncate">{formatCurrency(totalRevenue)}</h2>
            <p className="text-[11px] text-slate-500 font-mono truncate" title={t("finance.revenueAccumulatedSub")}>
              {t("finance.revenueAccumulatedSub")}
            </p>
          </div>

          <div className="glass-card-light rounded-xl p-6">
            <div className="flex justify-between items-start mb-2 gap-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate" title={t("finance.actualSpent")}>
                {t("finance.actualSpent")}
              </p>
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border shrink-0 ${
                utilization > 90 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}>
                {utilization}% {t("finance.budgetUtilization")}
              </span>
            </div>
            <h2 className="text-2xl font-bold font-mono text-white mb-4 truncate">{formatCurrency(totalSpent)}</h2>
            <div className="flex items-center gap-2">
              <div className="h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden flex-1">
                <div className={`h-full rounded-full ${utilization > 90 ? "bg-rose-500" : "bg-slate-300"}`} style={{ width: `${Math.min(utilization, 100)}%` }}></div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono shrink-0 truncate">{formatCurrency(remainingBudget)} {t("finance.budgetRemaining")}</span>
            </div>
          </div>
        </div>

        {/* Khối Biểu đồ Tài chính thông minh */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Biểu đồ 1: Dòng tiền lũy kế theo thời gian */}
          <div className="glass-card-light rounded-xl p-6 flex flex-col justify-between min-h-[350px]">
            <div>
              <h3 className="font-bold text-sm text-white mb-1 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> {t("finance.cashflowTrend")}
              </h3>
              <p className="text-[11px] text-slate-500 mb-4">{t("finance.cashflowTrendSub")}</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {trendData.length === 0 ? (
                <p className="text-xs text-slate-500">{t("finance.trendNoData")}</p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(v) => formatShortCurrency(v)}
                    />
                    <ChartTooltip content={<CustomTrendTooltip />} />
                    <ChartLegend 
                      verticalAlign="top" 
                      align="right" 
                      height={36} 
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '10px', color: '#94a3b8' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={t("finance.chartLegendRevenue")} 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={t("finance.chartLegendExpense")} 
                      stroke="#f43f5e" 
                      fillOpacity={1} 
                      fill="url(#colorSpent)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Biểu đồ 2: Tỷ lệ phân bổ chi phí hạng mục */}
          <div className="glass-card-light rounded-xl p-6 flex flex-col justify-between min-h-[350px]">
            <div>
              <h3 className="font-bold text-sm text-white mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" /> {t("finance.categoryBreakdown")}
              </h3>
              <p className="text-[11px] text-slate-500 mb-4">{t("finance.budgetExpectedSub")}</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              {categoryAllocations.length === 0 ? (
                <p className="text-xs text-slate-500">{t("finance.donutNoData")}</p>
              ) : (
                <div className="w-full flex flex-col sm:flex-row items-center justify-around gap-6">
                  <div className="w-[180px] h-[180px] shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryAllocations}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryAllocations.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.rawName] || "#6b7280"} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<CustomDonutTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 grid grid-cols-1 gap-2.5 max-w-[200px] w-full text-xs">
                    {categoryAllocations.map((cat, idx) => {
                      const perc = totalSpent > 0 ? Math.round((cat.value / totalSpent) * 100) : 0;
                      return (
                        <div key={idx} className="flex items-center justify-between border-b border-white/[0.02] pb-1">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[cat.rawName] }}></span>
                            <span className="text-slate-300 truncate" title={cat.name}>{cat.name}</span>
                          </div>
                          <span className="font-mono text-slate-400 shrink-0 font-semibold">{perc}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Khối Bảng Chi tiết bảng biểu Thu - Chi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Bảng Danh sách Chi phí */}
          <div className="glass-card-light rounded-xl overflow-hidden min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-rose-400" /> {t("finance.expensesList")}
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-slate-400 font-mono uppercase bg-white/[0.01] border-b border-white/5">
                    <tr>
                      <th className="px-4 py-2.5">{t("finance.categoryColumn")}</th>
                      <th className="px-4 py-2.5">{t("finance.descriptionColumn")}</th>
                      <th className="px-4 py-2.5 text-right">{t("finance.amountColumn")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {expensesList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-8 text-xs text-slate-500">{t("finance.noExpenses")}</td>
                      </tr>
                    ) : (
                      expensesList.map((exp, index) => (
                        <tr key={exp.id || index} className="hover:bg-white/[0.01]">
                          <td className="px-4 py-3 text-xs font-medium text-slate-400 truncate max-w-[120px]" title={getTranslatedCategoryName(exp.category)}>
                            {getTranslatedCategoryName(exp.category)}
                          </td>
                          <td className="px-4 py-3 truncate max-w-[180px]" title={exp.description}>{exp.description || "—"}</td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-rose-400 font-semibold shrink-0">-{formatCurrency(exp.amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bảng Danh sách Doanh thu */}
          <div className="glass-card-light rounded-xl overflow-hidden min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> {t("finance.revenuesList")}
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-slate-400 font-mono uppercase bg-white/[0.01] border-b border-white/5">
                    <tr>
                      <th className="px-4 py-2.5">{t("finance.revenueSourceColumn")}</th>
                      <th className="px-4 py-2.5 text-right">{t("finance.revenueAmountColumn")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {revenuesList.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="text-center py-8 text-xs text-slate-500">{t("finance.noRevenues")}</td>
                      </tr>
                    ) : (
                      revenuesList.map((rev, index) => (
                        <tr key={rev.id || index} className="hover:bg-white/[0.01]">
                          <td className="px-4 py-3 truncate max-w-[220px]" title={rev.description || "Khoản thu dự án"}>
                            {rev.description || "Khoản thu dự án"}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400 font-semibold shrink-0">+{formatCurrency(rev.amount)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modal linh hoạt: Ghi nhận giao dịch tài chính */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => !isSubmitting && setIsExpenseModalOpen(false)}></div>

          <div className="glass-card-light rounded-xl max-w-md w-full shadow-2xl relative z-10 border border-white/15 bg-neutral-900/95 overflow-visible">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-slate-200 text-sm">{t("finance.modalTitle")}</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-white text-lg">&times;</button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t("finance.transactionType")}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTransactionType("expense")}
                    className={`py-2 text-xs font-semibold rounded border transition-all ${
                      transactionType === "expense"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        : "bg-transparent border-white/10 text-slate-400"
                    }`}
                  >
                    {t("finance.recordExpense")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransactionType("revenue")}
                    className={`py-2 text-xs font-semibold rounded border transition-all ${
                      transactionType === "revenue"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-transparent border-white/10 text-slate-400"
                    }`}
                  >
                    {t("finance.recordRevenue")}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  {t("finance.amountLabel", { currency: projectDetail?.originalCurrencyCode || "VND" })}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder={t("finance.amountPlaceholder")}
                  value={amount}
                  onChange={(e) => setAmount(formatInputAmount(e.target.value))}
                  className="glass-input-light w-full px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              {transactionType === "expense" && (
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t("finance.categoryLabel")}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#1A1A1C] border border-white/10 rounded-lg text-white cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    {expenseCategories.map((cat, index) => (
                      <option key={index} value={cat}>
                        {getTranslatedCategoryName(cat)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{t("finance.descriptionLabel")}</label>
                <textarea
                  rows="3"
                  required
                  placeholder={t("finance.descriptionPlaceholder")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input-light w-full px-3 py-2 text-sm resize-none text-white"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 border border-white/10 text-slate-300 rounded text-xs font-semibold">
                  {t("finance.cancelBtn")}
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors">
                  {isSubmitting ? t("finance.processingBtn") : t("finance.confirmBtn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}