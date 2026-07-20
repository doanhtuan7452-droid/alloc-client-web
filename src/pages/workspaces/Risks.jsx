import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Plus,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Activity,
  DollarSign,
  Layers,
  History,
  ShieldAlert,
  X,
  FileText,
  User,
  Calendar,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import AIService from "../../services/AIService";
import ProjectService from "../../services/ProjectService";
import { useUser } from "../../contexts/UserContext";

export default function Risks() {
  const { activeProject } = useOutletContext();
  const { currentUser } = useUser();

  const [risks, setRisks] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projectTasks, setProjectTasks] = useState([]);

  // States bổ sung cho Mitigation & Lifecycle
  const [selectedRiskForMitigation, setSelectedRiskForMitigation] = useState(null);
  const [selectedRiskForLifecycle, setSelectedRiskForLifecycle] = useState(null);
  const [lifecycleLogs, setLifecycleLogs] = useState([]);
  const [isLifecycleLoading, setIsLifecycleLoading] = useState(false);
  const [isMitigationSubmitting, setIsMitigationSubmitting] = useState(false);

  // 1. Tải danh sách rủi ro của dự án
  useEffect(() => {
    if (!activeProject?.projectId) {
      setRisks([]);
      return;
    }

    setIsLoading(true);
    ProjectService.getRisks(activeProject.projectId)
      .then((res) => {
        const items = res.items || res.data || res || [];
        setRisks(items);
      })
      .catch((error) => console.error("Lỗi khi tải danh sách rủi ro:", error))
      .finally(() => setIsLoading(false));
  }, [activeProject?.projectId]);

  // 2. Tải danh sách Task thuộc Project hiện tại
  useEffect(() => {
    if (!activeProject?.projectId) {
      setProjectTasks([]);
      return;
    }

    ProjectService.getProjectTasks(activeProject.projectId)
      .then((res) => {
        const tasks = res.items || res.data || res || [];
        setProjectTasks(tasks);
      })
      .catch((error) => console.error("Lỗi khi tải danh sách công việc:", error));
  }, [activeProject?.projectId]);

  const handleAskAI = async () => {
    if (!activeProject?.projectId) return;
    setIsAiLoading(true);
    try {
      const result = await AIService.askAI({
        projectId: activeProject.projectId,
        analysisType: "Risk Warning",
        prompt: "Analyze current project risks",
      });
      setAiAnalysis(result.content || result.suggestionContent || "");
    } catch (error) {
      console.error(error);
      setAiAnalysis("AI Analysis failed to load.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreateRisk = async (e) => {
    e.preventDefault();
    if (!activeProject?.projectId) return;

    const currentUserId = currentUser?.profile?.resourceId || currentUser?.userId || currentUser?.id;
    if (!currentUserId) {
      alert("Không tìm thấy thông tin người dùng đăng nhập. Vui lòng thử lại.");
      return;
    }

    const formData = new FormData(e.target);
    const selectedTaskId = formData.get("taskId");

    const payload = {
      riskName: formData.get("riskName"),
      description: formData.get("description"),
      category: formData.get("category"),
      probability: Number.parseInt(formData.get("probability"), 10),
      impact: Number.parseInt(formData.get("impact"), 10),
      estimatedFinancialImpact: Number.parseFloat(formData.get("estimatedFinancialImpact") || 0),
      ownerId: Number.parseInt(currentUserId, 10),
      taskId: selectedTaskId ? Number.parseInt(selectedTaskId, 10) : null,
      status: "Identified",
    };

    try {
      const created = await ProjectService.createRisk(activeProject.projectId, payload);
      setRisks((prev) => [created, ...prev]);
      setIsModalOpen(false);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Lỗi: ${errorMsg}`);
    }
  };

  // --- HÀM XỬ LÝ CÁC API MỚI ---

  // Xử lý Lấy lịch sử thay đổi trạng thái rủi ro (Lifecycle)
  const handleOpenLifecycle = async (risk) => {
    setSelectedRiskForLifecycle(risk);
    setIsLifecycleLoading(true);
    try {
      const res = await ProjectService.getRiskLifecycle(risk.riskId);
      const data = res.items || res.data || res || [];
      setLifecycleLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử vòng đời rủi ro:", error);
      setLifecycleLogs([]);
    } finally {
      setIsLifecycleLoading(false);
    }
  };

  // Xử lý Tạo kế hoạch giảm thiểu rủi ro (Mitigation)
  const handleCreateMitigation = async (e) => {
    e.preventDefault();
    if (!selectedRiskForMitigation) return;

    const currentUserId = currentUser?.profile?.resourceId || currentUser?.userId || currentUser?.id || 0;
    const formData = new FormData(e.target);

    const payload = {
      strategyType: formData.get("strategyType"),
      actionPlan: formData.get("actionPlan"),
      mitigationCost: Number.parseFloat(formData.get("mitigationCost") || 0),
      assignedMemberId: Number.parseInt(formData.get("assignedMemberId") || currentUserId, 10),
      targetDate: formData.get("targetDate"),
      status: formData.get("status") || "Planned",
    };

    setIsMitigationSubmitting(true);
    try {
      await ProjectService.createRiskMitigation(selectedRiskForMitigation.riskId, payload);
      alert("Tạo kế hoạch giảm thiểu rủi ro thành công!");
      setSelectedRiskForMitigation(null);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      alert(`Lỗi khi tạo kế hoạch: ${errorMsg}`);
    } finally {
      setIsMitigationSubmitting(false);
    }
  };

  const toggleRiskStatus = (riskId) => {
    setRisks((prev) =>
      prev.map((risk) => {
        if (risk.riskId !== riskId) return risk;
        const nextStatus = risk.status === "Resolved" ? "Identified" : "Resolved";
        return { ...risk, status: nextStatus };
      })
    );
  };

  const summary = useMemo(() => {
    const total = risks.length;
    const high = risks.filter((r) => r.probability * r.impact >= 8).length;
    const critical = risks.filter((r) => r.probability * r.impact >= 15).length;

    const matrixDistribution = {};
    risks.forEach((risk) => {
      if (risk.status === "Resolved" || risk.status === "Closed") return;
      const p = risk.probability || 1;
      const i = risk.impact || 1;
      const key = `${p}-${i}`;
      if (!matrixDistribution[key]) matrixDistribution[key] = [];
      matrixDistribution[key].push(risk);
    });

    return { total, high, critical, matrixDistribution };
  }, [risks]);

  const probabilityLabels = ["Very Low", "Low", "Medium", "High", "Critical"];
  const impactLabels = ["Critical", "High", "Medium", "Low", "Very Low"];

  const getMatrixCellBg = (p, i) => {
    const score = p * i;
    if (score >= 15) return "bg-rose-500/5 border-rose-500/25 hover:bg-rose-500/10";
    if (score >= 8) return "bg-amber-500/5 border-amber-500/25 hover:bg-amber-500/10";
    if (score >= 4) return "bg-zinc-800/20 border-zinc-700/30 hover:bg-zinc-800/40";
    return "bg-zinc-800/10 border-zinc-800/30 hover:bg-zinc-800/20";
  };

  return (
    <div className="flex-1 overflow-y-auto h-full p-4 md:p-6 custom-scrollbar bg-[#141414] text-zinc-200">
      <div className="max-w-7xl mx-auto pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 border-b border-zinc-800/60 pb-5">
          <div>
            <h1 className="text-2xl font-bold mb-1.5 flex items-center gap-2 text-white">
              <AlertTriangle className="w-7 h-7 text-rose-400" /> Quản Lý Rủi Ro Dự Án
            </h1>
            <p className="text-zinc-400 text-sm">
              Nhận diện, đánh giá mức độ ảnh hưởng, lập ma trận rủi ro và xây dựng kế hoạch ứng phó.
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleAskAI}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600/10 border border-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-600/20 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              {isAiLoading ? "AI đang phân tích..." : "Hỏi AI Trợ Lý"}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Khai báo rủi ro
            </button>
          </div>
        </div>

        {/* AI Warning Box */}
        {aiAnalysis && (
          <div className="mb-6 bg-purple-950/15 border border-purple-900/30 rounded-xl p-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4" /> AI Risk Analysis & Warning
            </div>
            <p className="text-sm text-purple-200/80 leading-relaxed whitespace-pre-wrap">
              {aiAnalysis}
            </p>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Cột 1 & 2: Danh sách và Sơ đồ */}
          <div className="lg:col-span-2 space-y-6">
            {/* SƠ ĐỒ MA TRẬN RỦI RO */}
            <div className="bg-[#1c1c1c] border border-zinc-800/60 rounded-xl p-5 md:p-6">
              <div className="mb-4">
                <h3 className="font-bold text-base text-zinc-200 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-400" /> Ma Trận Phân Tán Rủi Ro (Probability vs Impact)
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Các thẻ rủi ro hiển thị động dựa trên điểm số đánh giá
                </p>
              </div>

              <div className="flex flex-col items-center justify-center overflow-x-auto py-2">
                <div className="min-w-[500px] w-full max-w-2xl">
                  <div className="flex">
                    {/* Trục Tung */}
                    <div className="w-12 flex flex-col justify-between items-center pr-2 font-medium text-[11px] text-zinc-500 py-4 select-none">
                      <div className="rotate-270 origin-center whitespace-nowrap tracking-widest uppercase font-bold text-[9px] text-zinc-600 my-auto -ml-16">
                        Mức độ thiệt hại (Impact)
                      </div>
                    </div>

                    <div className="flex-1">
                      {/* Grid 5x5 */}
                      <div className="grid grid-rows-5 gap-1.5 h-72">
                        {impactLabels.map((_, iIdx) => {
                          const currentImpactVal = 5 - iIdx;

                          return (
                            <div key={iIdx} className="grid grid-cols-5 gap-1.5">
                              {probabilityLabels.map((_, pIdx) => {
                                const currentProbVal = pIdx + 1;
                                const cellKey = `${currentProbVal}-${currentImpactVal}`;
                                const cellRisks = summary.matrixDistribution[cellKey] || [];

                                return (
                                  <div
                                    key={pIdx}
                                    className={`relative rounded-md border flex flex-wrap gap-1 items-center justify-center p-1 transition-all duration-200 group ${getMatrixCellBg(
                                      currentProbVal,
                                      currentImpactVal
                                    )}`}
                                    title={`Xác suất: ${currentProbVal} | Thiệt hại: ${currentImpactVal}`}
                                  >
                                    {cellRisks.length > 0 ? (
                                      cellRisks.map((risk) => (
                                        <span
                                          key={risk.riskId}
                                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded shadow-sm max-w-full truncate cursor-default select-none
                                            ${
                                              risk.probability * risk.impact >= 15
                                                ? "bg-rose-600 text-white"
                                                : risk.probability * risk.impact >= 8
                                                ? "bg-amber-600 text-zinc-950"
                                                : "bg-zinc-700 text-zinc-200"
                                            }`}
                                          title={risk.riskName}
                                        >
                                          R-{risk.riskId}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-[10px] text-zinc-700 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                        {currentProbVal}×{currentImpactVal}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>

                      {/* Trục Hoành */}
                      <div className="grid grid-cols-5 gap-1.5 mt-2 text-center text-[10px] font-mono text-zinc-500 select-none">
                        {probabilityLabels.map((label, idx) => (
                          <div key={idx} className="truncate" title={label}>
                            {idx + 1} ({label})
                          </div>
                        ))}
                      </div>
                      <div className="text-center font-bold text-[9px] tracking-widest uppercase text-zinc-600 mt-2 select-none">
                        Khả năng xảy ra (Probability)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DANH SÁCH RISK REGISTER */}
            <div className="bg-[#1c1c1c] border border-zinc-800/60 rounded-xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-5 border-b border-zinc-800/40 pb-3">
                <h3 className="font-bold text-base text-zinc-200 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> Nhật Ký Risk Log Register
                </h3>
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                  <span>Tổng: <b className="text-white">{summary.total}</b></span>
                  <span>Cao+: <b className="text-amber-500">{summary.high}</b></span>
                  <span>Nguy cấp: <b className="text-rose-500">{summary.critical}</b></span>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12 text-zinc-500 text-sm flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                  Đang tải danh sách rủi ro...
                </div>
              ) : risks.length === 0 ? (
                <div className="text-center py-12 text-zinc-600 text-sm">
                  Hiện tại dự án này chưa ghi nhận rủi ro nào.
                </div>
              ) : (
                <div className="space-y-3">
                  {risks.map((risk) => {
                    const isResolved = risk.status === "Resolved" || risk.status === "Closed";
                    const score = risk.riskScore || risk.probability * risk.impact;

                    return (
                      <div
                        key={risk.riskId}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          isResolved
                            ? "bg-zinc-900/20 border-zinc-800/20 opacity-40"
                            : "bg-zinc-900/40 border-zinc-800/40 hover:border-zinc-700/60 hover:bg-zinc-900/60"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                                ID: R-{risk.riskId}
                              </span>
                              <h4
                                className={`text-sm font-semibold ${
                                  isResolved ? "line-through text-zinc-500" : "text-zinc-200"
                                }`}
                              >
                                {risk.riskName}
                              </h4>
                              {risk.taskId && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                                  Task ID: {risk.taskId}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-zinc-400 leading-relaxed">{risk.description}</p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[11px] text-zinc-400 font-mono">
                              <span className="flex items-center gap-1">
                                <Activity className="w-3 h-3 text-zinc-600" /> Nhóm:{" "}
                                <b className="text-zinc-300">{risk.category}</b>
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-rose-500" /> Thiệt hại ước tính:{" "}
                                <b className="text-zinc-300">
                                  {risk.estimatedFinancialImpact?.toLocaleString()} USD
                                </b>
                              </span>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] ${
                                  isResolved
                                    ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/20"
                                    : "bg-blue-950/40 text-blue-400 border border-blue-900/30"
                                }`}
                              >
                                {risk.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 border-t sm:border-t-0 border-zinc-800/50 pt-2 sm:pt-0">
                            <div className="flex gap-1 font-mono text-[9px]">
                              <span className="px-1.5 py-0.5 rounded bg-blue-950/40 text-blue-400 border border-blue-900/20">
                                Xác suất: {risk.probability}/5
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-900/20">
                                Tác động: {risk.impact}/5
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                score >= 15
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                                  : score >= 8
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                                  : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                              }`}
                            >
                              Mức độ nguy hiểm: {score}
                            </span>
                          </div>
                        </div>

                        {/* Nút thao tác Mitigation, Lifecycle & Change Status */}
                        <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-zinc-800/30 pt-2">
                          <button
                            onClick={() => handleOpenLifecycle(risk)}
                            className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-md border border-zinc-700/80 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 transition-colors cursor-pointer"
                          >
                            <History className="w-3.5 h-3.5 text-zinc-400" />
                            Lịch sử thay đổi
                          </button>

                          <button
                            onClick={() => setSelectedRiskForMitigation(risk)}
                            className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-md border border-purple-500/30 bg-purple-600/15 text-purple-300 hover:bg-purple-600/25 transition-colors cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                            + Kế hoạch giảm thiểu
                          </button>

                          <button
                            onClick={() => toggleRiskStatus(risk.riskId)}
                            className={`flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                              isResolved
                                ? "bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700"
                                : "bg-emerald-600/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600/20"
                            }`}
                          >
                            {isResolved ? <RefreshCw className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                            {isResolved ? "Khai báo lại (Re-open)" : "Đánh dấu Giải Quyết"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cột 3: Sidebar Thông tin Tóm tắt */}
          <div className="space-y-6">
            <div className="bg-[#1c1c1c] border border-zinc-800/60 rounded-xl p-5 md:p-6 sticky top-6">
              <h3 className="font-bold text-base text-zinc-200 mb-4 border-b border-zinc-800/40 pb-2">
                Báo Cáo Tổng Quan
              </h3>
              <div className="space-y-4">
                <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/40 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Tổng rủi ro ghi nhận</span>
                  <span className="text-lg font-bold text-white font-mono">{summary.total}</span>
                </div>
                <div className="bg-amber-500/5 p-3 rounded-lg border border-amber-500/15 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Rủi ro mức Cao (Score &ge; 8)</span>
                  <span className="text-lg font-bold text-amber-400 font-mono">{summary.high}</span>
                </div>
                <div className="bg-rose-500/5 p-3 rounded-lg border border-rose-500/15 flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Rủi ro Nguy Cấp (Score &ge; 15)</span>
                  <span className="text-lg font-bold text-rose-400 font-mono">{summary.critical}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/40 text-xs text-zinc-500 space-y-2 leading-relaxed">
                <div className="font-semibold text-zinc-400 mb-1">💡 Hướng dẫn ma trận rủi ro:</div>
                <div>• Điểm số nguy hại = <code className="text-zinc-300">Probability &times; Impact</code>.</div>
                <div>• Thẻ mã rủi ro (<code className="text-zinc-300">R-ID</code>) sẽ tự động hiển thị trong vùng ô tương ứng để nhà quản trị dễ dàng theo dõi.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: KHAI BÁO RỦI RO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-100 animate-scaleUp">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" /> Khai Báo Rủi Ro Dự Án
            </h3>

            <form onSubmit={handleCreateRisk} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Tên rủi ro (Risk Name) *</label>
                <input
                  type="text"
                  name="riskName"
                  placeholder="VD: Thiếu hụt tài nguyên kiểm thử hệ thống..."
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-zinc-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Công việc liên quan (Associated Task)</label>
                <select
                  name="taskId"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  defaultValue=""
                >
                  <option value="">-- Thuộc rủi ro chung của dự án --</option>
                  {projectTasks.map((task) => (
                    <option key={task.taskId || task.id} value={task.taskId || task.id}>
                      [{task.status || "Task"}] {task.title || task.taskName || task.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Phân loại (Category)</label>
                <select
                  name="category"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  defaultValue="Schedule"
                >
                  <option value="Schedule">Schedule (Tiến độ)</option>
                  <option value="Technical">Technical (Kỹ thuật)</option>
                  <option value="Resource">Resource (Nhân sự / Tài nguyên)</option>
                  <option value="Budget">Budget (Ngân sách)</option>
                  <option value="External">External (Yếu tố bên ngoài)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Mô tả chi tiết (Description) *</label>
                <textarea
                  name="description"
                  placeholder="Mô tả hoàn cảnh diễn ra và tác động nguy hại cụ thể..."
                  rows="2"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-zinc-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Khả năng xảy ra (1-5)</label>
                  <select
                    name="probability"
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    defaultValue="3"
                  >
                    <option value="1">1 - Rất thấp</option>
                    <option value="2">2 - Thấp</option>
                    <option value="3">3 - Trung bình</option>
                    <option value="4">4 - Cao</option>
                    <option value="5">5 - Rất cao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Mức độ thiệt hại (1-5)</label>
                  <select
                    name="impact"
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    defaultValue="3"
                  >
                    <option value="1">1 - Rất thấp</option>
                    <option value="2">2 - Thấp</option>
                    <option value="3">3 - Trung bình</option>
                    <option value="4">4 - Cao</option>
                    <option value="5">5 - Rất cao</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Tác động tài chính ước tính (USD)</label>
                <input
                  type="number"
                  name="estimatedFinancialImpact"
                  min="0"
                  step="100"
                  defaultValue="0"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-sm text-zinc-300 hover:text-white cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium hover:bg-blue-500 text-white cursor-pointer transition-colors"
                >
                  Tạo rủi ro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TẠO KẾ HOẠCH GIẢM THIỂU (MITIGATION PLAN) */}
      {selectedRiskForMitigation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl p-6 w-full max-w-md text-zinc-100 animate-scaleUp">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-purple-400">
                <ShieldAlert className="w-5 h-5" /> Kế Hoạch Giảm Thiểu (R-{selectedRiskForMitigation.riskId})
              </h3>
              <button
                onClick={() => setSelectedRiskForMitigation(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
              Đang lập phương án ứng phó cho: <b className="text-zinc-200">{selectedRiskForMitigation.riskName}</b>
            </p>

            <form onSubmit={handleCreateMitigation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Chiến lược ứng phó (Strategy Type)</label>
                <select
                  name="strategyType"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  defaultValue="Mitigation"
                >
                  <option value="Mitigation">Mitigation (Giảm thiểu tác động)</option>
                  <option value="Avoidance">Avoidance (Né tránh rủi ro)</option>
                  <option value="Transfer">Transfer (Chuyển giao rủi ro)</option>
                  <option value="Acceptance">Acceptance (Chấp nhận rủi ro)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Hành động cụ thể (Action Plan) *</label>
                <textarea
                  name="actionPlan"
                  placeholder="Ghi rõ các bước chi tiết để xử lý hoặc phòng ngừa rủi ro này..."
                  rows="3"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 text-white placeholder-zinc-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Chi phí xử lý (USD)</label>
                  <input
                    type="number"
                    name="mitigationCost"
                    min="0"
                    step="100"
                    defaultValue="0"
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Hạn hoàn thành (Target Date)</label>
                  <input
                    type="date"
                    name="targetDate"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Mã thành viên phụ trách (Assigned Member ID)</label>
                <input
                  type="number"
                  name="assignedMemberId"
                  defaultValue={currentUser?.profile?.resourceId || currentUser?.userId || currentUser?.id || 0}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedRiskForMitigation(null)}
                  className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-sm text-zinc-300 hover:text-white cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isMitigationSubmitting}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-sm font-medium hover:bg-purple-500 text-white cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isMitigationSubmitting ? "Đang lưu..." : "Lưu kế hoạch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: XEM LỊCH SỬ THAY ĐỔI VÒNG ĐỜI (RISK LIFECYCLE HISTORY) */}
      {selectedRiskForLifecycle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#1c1c1c] border border-zinc-800 rounded-xl p-6 w-full max-w-lg text-zinc-100 animate-scaleUp">
            <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2 text-blue-400">
                <History className="w-5 h-5" /> Lịch Sử Thay Đổi Trạng Thái (R-{selectedRiskForLifecycle.riskId})
              </h3>
              <button
                onClick={() => setSelectedRiskForLifecycle(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              Nhật ký thay đổi cho rủi ro: <b className="text-zinc-200">{selectedRiskForLifecycle.riskName}</b>
            </p>

            {isLifecycleLoading ? (
              <div className="text-center py-8 text-zinc-500 text-sm flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                Đang tải lịch sử vòng đời...
              </div>
            ) : lifecycleLogs.length === 0 ? (
              <div className="text-center py-8 text-zinc-600 text-sm border border-dashed border-zinc-800 rounded-xl">
                Chưa có nhật ký thay đổi trạng thái nào cho rủi ro này.
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar pr-1">
                {lifecycleLogs.map((log, idx) => (
                  <div
                    key={log.historyId || idx}
                    className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs font-mono space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-zinc-400 border-b border-zinc-800/60 pb-1">
                      <span className="flex items-center gap-1 text-zinc-300 font-bold">
                        <User className="w-3 h-3 text-blue-400" /> Member ID: {log.changedByMemberId}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Calendar className="w-3 h-3" /> {log.changeDate ? new Date(log.changeDate).toLocaleString() : "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-zinc-300">
                      <span>Trạng thái:</span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{log.oldStatus || "N/A"}</span>
                      <span>&rarr;</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/30">
                        {log.newStatus}
                      </span>
                    </div>

                    {(log.oldScore !== undefined || log.newScore !== undefined) && (
                      <div className="text-zinc-400 text-[11px]">
                        Điểm nguy cơ: <b className="text-zinc-300">{log.oldScore}</b> &rarr; <b className="text-amber-400">{log.newScore}</b>
                      </div>
                    )}

                    {log.changeNote && (
                      <div className="text-zinc-400 text-[11px] italic pt-1 flex items-start gap-1">
                        <FileText className="w-3 h-3 text-zinc-500 shrink-0 mt-0.5" />
                        <span>"{log.changeNote}"</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-zinc-800 mt-4">
              <button
                type="button"
                onClick={() => setSelectedRiskForLifecycle(null)}
                className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-sm text-zinc-300 hover:text-white cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}