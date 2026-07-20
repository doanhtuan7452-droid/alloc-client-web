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
import FinanceSkeleton from "../../components/skeletons/FinanceSkeleton";
import ProjectService from "../../services/ProjectService";

export default function Finance() {
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

  // Danh mục chi phí mặc định
  const expenseCategories = [
    "Personnel & Research",
    "Infrastructure",
    "Marketing & Sales",
    "Operation & Admin",
    "Other Expenses"
  ];

  // Tiền tệ Formatter
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: projectDetail?.originalCurrencyCode || "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Hàm định dạng ngày tháng hiển thị
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Hàm fetch toàn bộ dữ liệu tài chính và chi tiết project
  const fetchFinancialData = async () => {
    // ĐỔI TỪ activeProject?.id THÀNH activeProject?.projectId
    if (!activeProject?.projectId) return;
    setIsLoadingData(true);
    try {
      const projectId = activeProject.projectId; // Sửa tại đây
      
      // Chạy song song 4 API...
      const [projectRes, summary, expensesRes, revenuesRes] = await Promise.all([
        ProjectService.getProjectById(projectId),
        ProjectService.getFinancialSummary(projectId),
        ProjectService.getExpenses(projectId, { pageNumber: 1, pageSize: 50 }),
        ProjectService.getRevenues(projectId, { pageNumber: 1, pageSize: 50 })
      ]);

      // Lưu chi tiết project (Khớp với cấu trúc object chứa expectedBudget, originalCurrencyCode...)
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
    // ĐỔI TỪ activeProject?.id THÀNH activeProject?.projectId
    if (!activeProject?.projectId) return; 

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setModalError("Số tiền phải lớn hơn 0.");
      return;
    }

    setIsSubmitting(true);
    setModalError("");

    try {
      const projectId = activeProject.projectId;
      
      if (transactionType === "expense") {
        await ProjectService.createExpense(projectId, {
          amount: parsedAmount,
          category: category,
          description: description
        });
      } else {
        await ProjectService.createRevenue(projectId, {
          amount: parsedAmount,
          description: description
        });
      }

      setIsExpenseModalOpen(false);
      setAmount("");
      setDescription("");
      fetchFinancialData(); // Cập nhật lại số liệu hiển thị tức thì
    } catch (err) {
      console.error("Lỗi khi thêm giao dịch:", err);
      setModalError(err.response?.data?.message || "Không thể ghi nhận giao dịch. Vui lòng thử lại.");
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
        <h2 className="text-xl font-bold text-white">Không tìm thấy thông tin dự án</h2>
        <p className="text-sm text-slate-500 text-center max-w-sm">
          Vui lòng lựa chọn một dự án hợp lệ trong danh sách để xem báo cáo tài chính.
        </p>
      </div>
    );
  }

  // Khai báo các biến ánh xạ chính xác từ API getProjectById
  const budget = projectDetail.expectedBudget || 0; 
  const totalSpent = financialSummary.totalSpent || 0;
  const totalRevenue = financialSummary.totalRevenue || 0;
  const utilization = budget > 0 ? Math.round((totalSpent / budget) * 100) : 0;
  const remainingBudget = budget - totalSpent;

  // Tính toán phân bổ chi phí hạng mục từ dữ liệu thực tế
  const categoryAllocations = expenseCategories.map(cat => {
    const total = expensesList
      .filter(exp => exp.category === cat)
      .reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
    return { name: cat, value: total };
  });

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      <div className="px-6 pt-4 pb-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
        
        {/* Thanh tiêu đề nhỏ hiển thị thông tin metadata dự án bổ sung từ API */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400">
          <div>
            <span className="font-semibold text-slate-300">Dự án: </span>
            <span className="text-white font-medium text-sm">{projectDetail.projectName}</span>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Thời gian: {formatDate(projectDetail.startDate)} - {formatDate(projectDetail.endDate)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-slate-500" />
              <span>Tiến độ: <strong className="text-white">{projectDetail.progress}%</strong></span>
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
            <div className="flex justify-between items-start mb-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ngân sách dự kiến (Expected)</p>
              <Wallet className="w-4 h-4 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold font-mono text-white mb-2">{formatCurrency(budget)}</h2>
            <p className="text-[11px] text-slate-500 font-mono">Hạn mức chi tiêu dự kiến được duyệt</p>
          </div>

          <div className="glass-card-light rounded-xl p-6">
            <div className="flex justify-between items-start mb-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Doanh thu tích lũy</p>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold font-mono text-emerald-400 mb-2">{formatCurrency(totalRevenue)}</h2>
            <p className="text-[11px] text-slate-500 font-mono">Tổng doanh thu thu về từ các giai đoạn</p>
          </div>

          <div className="glass-card-light rounded-xl p-6">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Thực tế đã chi</p>
              <span className={`text-[10px] font-mono font-semibold px-2.5 py-0.5 rounded border ${
                utilization > 90 ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
              }`}>
                {utilization}% Tiêu thụ
              </span>
            </div>
            <h2 className="text-2xl font-bold font-mono text-white mb-4">{formatCurrency(totalSpent)}</h2>
            <div className="flex items-center gap-2">
              <div className="h-1.5 bg-white/5 border border-white/5 rounded-full overflow-hidden flex-1">
                <div className={`h-full rounded-full ${utilization > 90 ? "bg-rose-500" : "bg-slate-300"}`} style={{ width: `${Math.min(utilization, 100)}%` }}></div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{formatCurrency(remainingBudget)} còn lại</span>
            </div>
          </div>
        </div>

        {/* Biểu đồ phân bổ chi phí thực tế theo Hạng mục */}
        <div className="glass-card-light rounded-xl p-6">
          <h3 className="font-bold text-base text-white mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-400" /> Tỷ lệ sử dụng theo hạng mục chi phí
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {categoryAllocations.map((cat, idx) => {
              const catPerc = totalSpent > 0 ? Math.round((cat.value / totalSpent) * 100) : 0;
              return (
                <div key={idx} className="p-4 rounded-lg bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                  <span className="text-xs text-slate-400 truncate block mb-1" title={cat.name}>{cat.name}</span>
                  <div>
                    <span className="text-lg font-mono font-bold text-white block">{formatCurrency(cat.value)}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{catPerc}% tổng quỹ chi</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Khối Bảng Chi tiết bảng biểu Thu - Chi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Bảng Danh sách Chi phí */}
          <div className="glass-card-light rounded-xl overflow-hidden min-h-[300px] flex flex-col justify-between">
            <div>
              <div className="p-4 border-b border-white/5 flex justify-between items-center">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-rose-400" /> Danh sách Chi phí (Expenses)
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-slate-400 font-mono uppercase bg-white/[0.01] border-b border-white/5">
                    <tr>
                      <th className="px-4 py-2.5">Danh mục</th>
                      <th className="px-4 py-2.5">Mô tả chi tiết</th>
                      <th className="px-4 py-2.5 text-right">Số tiền chi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {expensesList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-8 text-xs text-slate-500">Chưa ghi nhận khoản chi phí nào.</td>
                      </tr>
                    ) : (
                      expensesList.map((exp, index) => (
                        <tr key={exp.id || index} className="hover:bg-white/[0.01]">
                          <td className="px-4 py-3 text-xs font-medium text-slate-400">{exp.category}</td>
                          <td className="px-4 py-3 truncate max-w-[150px]" title={exp.description}>{exp.description || "—"}</td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-rose-400 font-semibold">-{formatCurrency(exp.amount)}</td>
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
                  <TrendingUp className="w-4 h-4 text-emerald-400" /> Danh sách Doanh thu (Revenues)
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-slate-400 font-mono uppercase bg-white/[0.01] border-b border-white/5">
                    <tr>
                      <th className="px-4 py-2.5">Mô tả nguồn thu</th>
                      <th className="px-4 py-2.5 text-right">Số tiền thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300">
                    {revenuesList.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="text-center py-8 text-xs text-slate-500">Chưa ghi nhận nguồn doanh thu nào.</td>
                      </tr>
                    ) : (
                      revenuesList.map((rev, index) => (
                        <tr key={rev.id || index} className="hover:bg-white/[0.01]">
                          <td className="px-4 py-3 truncate max-w-[200px]" title={rev.description}>{rev.description || "Khoản thu dự án"}</td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-emerald-400 font-semibold">+{formatCurrency(rev.amount)}</td>
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !isSubmitting && setIsExpenseModalOpen(false)}></div>

          <div className="glass-card-light rounded-xl max-w-md w-full overflow-hidden shadow-2xl relative z-10 border border-white/15 bg-neutral-900/95">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="font-bold text-slate-200 text-sm">Ghi nhận giao dịch tài chính mới</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-white text-lg">&times;</button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Loại giao dịch</label>
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
                    Ghi nhận Chi phí
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
                    Ghi nhận Doanh thu
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Số tiền ({projectDetail?.originalCurrencyCode || "VND"})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 5000000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="glass-input-light w-full px-3 py-2 text-sm text-white font-mono"
                />
              </div>

              {transactionType === "expense" && (
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Hạng mục chi phí</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="glass-input-light w-full px-3 py-2 text-sm bg-neutral-950 border border-white/10 text-white"
                  >
                    {expenseCategories.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Mô tả nội dung</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Nhập chi tiết nội dung giao dịch..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="glass-input-light w-full px-3 py-2 text-sm resize-none text-white"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="px-4 py-2 border border-white/10 text-slate-300 rounded text-xs font-semibold">
                  Hủy
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded text-xs font-semibold disabled:opacity-50">
                  {isSubmitting ? "Đang xử lý..." : "Xác nhận tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}