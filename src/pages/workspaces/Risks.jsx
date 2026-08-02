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
import WorkspaceService from "../../services/WorkspaceService";
import { useUser } from "../../contexts/UserContext";
import { useNotification } from "../../contexts/NotificationContext";
import AIMessageFormatter from "../../features/ai-chat/components/AIMessageFormatter";
import { useLanguage } from "../../contexts/LanguageContext";
import { RiskListSkeleton, RiskLifecycleSkeleton } from "../../components/skeletons/RiskSkeletons";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend as ChartLegend
} from "recharts";

const CustomChartTooltip = ({ active, payload, t }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card bg-neutral-950/90 border border-white/10 rounded-lg p-2.5 shadow-xl text-[11px] space-y-1">
        <p className="font-semibold text-zinc-300 border-b border-white/5 pb-1">{payload[0].name}</p>
        <p className="font-mono text-violet-400 font-bold mt-0.5 flex justify-between items-center gap-4">
          <span>{t("risks.totalLabel") || "Total"}:</span>
          <span>{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function Risks() {
  const { t } = useLanguage();
  const { toast } = useNotification();
  const { activeProject, workspaceId } = useOutletContext();
  const { currentUser } = useUser();

  const [risks, setRisks] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projectTasks, setProjectTasks] = useState([]);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);

  // States bổ sung cho Mitigation & Lifecycle
  const [selectedRiskForMitigation, setSelectedRiskForMitigation] = useState(null);
  const [selectedRiskForLifecycle, setSelectedRiskForLifecycle] = useState(null);
  const [lifecycleLogs, setLifecycleLogs] = useState([]);
  const [isLifecycleLoading, setIsLifecycleLoading] = useState(false);
  const [isMitigationSubmitting, setIsMitigationSubmitting] = useState(false);
  const [isCreatingRisk, setIsCreatingRisk] = useState(false);
  const [projectCurrency, setProjectCurrency] = useState("USD");
  const [estFinancialImpactStr, setEstFinancialImpactStr] = useState("0");
  const [mitigationCostStr, setMitigationCostStr] = useState("0");

  const formatNumberString = (value) => {
    if (!value) return "";
    const cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) return "";
    return new Intl.NumberFormat("vi-VN").format(cleanValue);
  };

  useEffect(() => {
    if (!activeProject?.projectId) {
      setProjectCurrency("USD");
      return;
    }
    ProjectService.getProjectById(activeProject.projectId)
      .then((res) => {
        const detail = res.data || res;
        setProjectCurrency(detail?.originalCurrencyCode || "USD");
      })
      .catch((err) => {
        console.error("Lỗi khi tải thông tin dự án:", err);
      });
  }, [activeProject?.projectId]);

  // Tải danh sách thành viên trong Workspace để lấy Member ID tương ứng
  useEffect(() => {
    if (!workspaceId) return;
    WorkspaceService.getWorkspaceMembers(workspaceId)
      .then((res) => {
        const members = res.items || res.data || res || [];
        setWorkspaceMembers(members);
      })
      .catch((err) => console.error("Lỗi khi tải thành viên workspace:", err));
  }, [workspaceId]);

  const currentMemberId = useMemo(() => {
    if (!currentUser?.profile?.resourceId || workspaceMembers.length === 0) return null;
    const me = workspaceMembers.find(
      (m) => String(m.resource?.resourceId) === String(currentUser.profile.resourceId)
    );
    return me?.workspaceMemberId ?? null;
  }, [currentUser, workspaceMembers]);

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
      setAiAnalysis(t("risks.aiAnalysisFailed"));
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleEstFinancialImpactChange = (e) => {
    const rawVal = e.target.value;
    const formatted = formatNumberString(rawVal);
    setEstFinancialImpactStr(formatted || "0");
  };

  const handleMitigationCostChange = (e) => {
    const rawVal = e.target.value;
    const formatted = formatNumberString(rawVal);
    setMitigationCostStr(formatted || "0");
  };

  const handleCreateRisk = async (e) => {
    e.preventDefault();
    if (!activeProject?.projectId || isCreatingRisk) return;

    const formData = new FormData(e.target);
    const selectedOwnerId = formData.get("ownerId");
    
    if (!selectedOwnerId) {
      toast.error(t("risks.errWorkspaceMember"));
      return;
    }

    const selectedTaskId = formData.get("taskId");

    const payload = {
      riskName: formData.get("riskName"),
      description: formData.get("description"),
      category: formData.get("category"),
      probability: Number.parseInt(formData.get("probability"), 10),
      impact: Number.parseInt(formData.get("impact"), 10),
      estimatedFinancialImpact: Number.parseFloat(String(formData.get("estimatedFinancialImpact") || "0").replace(/\./g, "") || 0),
      ownerId: Number.parseInt(selectedOwnerId, 10),
      taskId: selectedTaskId ? Number.parseInt(selectedTaskId, 10) : null,
      status: "Identified",
    };

    setIsCreatingRisk(true);
    try {
      const created = await ProjectService.createRisk(activeProject.projectId, payload);
      setRisks((prev) => [created, ...prev]);
      setIsModalOpen(false);
      toast.success(t("common.success") || "Thành công");
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(t("risks.errCreateRisk").replace("{error}", errorMsg));
    } finally {
      setIsCreatingRisk(false);
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
    if (!selectedRiskForMitigation || isMitigationSubmitting) return;

    const formData = new FormData(e.target);
    const selectedAssignedMemberId = formData.get("assignedMemberId");

    const payload = {
      strategyType: formData.get("strategyType"),
      actionPlan: formData.get("actionPlan"),
      mitigationCost: Number.parseFloat(String(formData.get("mitigationCost") || "0").replace(/\./g, "") || 0),
      assignedMemberId: selectedAssignedMemberId ? Number.parseInt(selectedAssignedMemberId, 10) : null,
      targetDate: formData.get("targetDate"),
      status: formData.get("status") || "Planned",
    };

    setIsMitigationSubmitting(true);
    try {
      await ProjectService.createRiskMitigation(selectedRiskForMitigation.riskId, payload);
      toast.success(t("risks.successMitigation"));
      
      // Tải lại danh sách rủi ro sau khi thêm kế hoạch để cập nhật trạng thái Mitigation Planned
      const res = await ProjectService.getRisks(activeProject.projectId);
      const items = res.items || res.data || res || [];
      setRisks(items);

      setSelectedRiskForMitigation(null);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(t("risks.errCreateMitigation").replace("{error}", errorMsg));
    } finally {
      setIsMitigationSubmitting(false);
    }
  };

  const toggleRiskStatus = async (riskId) => {
    const risk = risks.find((r) => r.riskId === riskId);
    if (!risk) return;

    const isCurrentlyResolved = risk.status === "Resolved" || risk.status === "Closed";
    const nextStatus = isCurrentlyResolved ? "Identified" : "Closed";

    const payload = {
      taskId: risk.taskId,
      riskName: risk.riskName,
      description: risk.description,
      category: risk.category,
      probability: risk.probability,
      impact: risk.impact,
      estimatedFinancialImpact: risk.estimatedFinancialImpact,
      actualFinancialImpact: risk.actualFinancialImpact,
      status: nextStatus,
      ownerId: risk.ownerId
    };

    try {
      const updated = await ProjectService.updateRisk(riskId, payload);
      setRisks((prev) =>
        prev.map((r) => (r.riskId === riskId ? updated : r))
      );
      toast.success(t("common.success") || "Thành công!");
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(t("risks.errCreateRisk").replace("{error}", errorMsg));
    }
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

  const getStatusDisplayName = (status) => {
    switch (status) {
      case "Identified":
        return t("risks.statusIdentified") || "Identified";
      case "Assessed":
        return t("risks.statusAssessed") || "Assessed";
      case "Mitigation Planned":
        return t("risks.statusMitigationPlanned") || "Mitigation Planned";
      case "In Progress":
        return t("risks.statusInProgress") || "In Progress";
      case "Realized":
        return t("risks.statusRealized") || "Realized";
      case "Closed":
        return t("risks.statusClosed") || "Closed";
      default:
        return status;
    }
  };

  const statusColors = {
    Identified: "#3b82f6",
    Assessed: "#fbbf24",
    "Mitigation Planned": "#a78bfa",
    "In Progress": "#f59e0b",
    Realized: "#ef4444",
    Closed: "#10b981"
  };

  const statusData = useMemo(() => {
    const counts = {
      Identified: 0,
      Assessed: 0,
      "Mitigation Planned": 0,
      "In Progress": 0,
      Realized: 0,
      Closed: 0,
    };
    risks.forEach((r) => {
      const s = r.status || "Identified";
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({
        name: getStatusDisplayName(name),
        rawName: name,
        value,
      }))
      .filter((item) => item.value > 0);
  }, [risks, t]);

  const categoryData = useMemo(() => {
    const counts = {
      Schedule: 0,
      Technical: 0,
      Resource: 0,
      Budget: 0,
      External: 0,
    };
    risks.forEach((r) => {
      const c = r.category || "Schedule";
      const normKey = c.charAt(0).toUpperCase() + c.slice(1);
      if (counts[normKey] !== undefined) {
        counts[normKey] = counts[normKey] + 1;
      }
    });

    const categoriesLocale = t("risks.categories") || {};

    return Object.entries(counts).map(([name, value]) => {
      const localeKey = name.toLowerCase();
      const displayName = categoriesLocale[localeKey] || name;
      return {
        name: displayName,
        value,
      };
    });
  }, [risks, t]);

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
              <AlertTriangle className="w-7 h-7 text-rose-400" /> {t("risks.title")}
            </h1>
            <p className="text-zinc-400 text-sm">
              {t("risks.subtitle")}
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={handleAskAI}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600/10 border border-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-600/20 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              {isAiLoading ? t("risks.askingAi") : t("risks.askAiBtn")}
            </button>
            <button
              onClick={() => { setEstFinancialImpactStr("0"); setIsModalOpen(true); }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {t("risks.declareBtn")}
            </button>
          </div>
        </div>

        {/* AI Warning Box */}
        {aiAnalysis && (
          <div className="mb-6 bg-purple-950/15 border border-purple-900/30 rounded-xl p-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4" /> {t("risks.aiAnalysisTitle")}
            </div>
            <div className="text-sm text-purple-200/80 leading-relaxed">
              <AIMessageFormatter content={aiAnalysis} />
            </div>
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
                  <Layers className="w-5 h-5 text-blue-400" /> {t("risks.matrixTitle")}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {t("risks.matrixSubtitle")}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center overflow-x-auto py-2">
                <div className="min-w-[500px] w-full max-w-2xl">
                  <div className="flex">
                    {/* Trục Tung */}
                    <div className="w-12 flex flex-col justify-between items-center pr-2 font-medium text-[11px] text-zinc-500 py-4 select-none">
                      <div className="rotate-270 origin-center whitespace-nowrap tracking-widest uppercase font-bold text-[9px] text-zinc-600 my-auto -ml-16">
                        {t("risks.impactLabel")}
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
                                    title={`${t("risks.probLabel")}: ${currentProbVal} | ${t("risks.impactLabel")}: ${currentImpactVal}`}
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
                        {t("risks.probLabel")}
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
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> {t("risks.registerTitle")}
                </h3>
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                  <span>{t("risks.totalLabel")}: <b className="text-white">{summary.total}</b></span>
                  <span>{t("risks.highLabel")}: <b className="text-amber-500">{summary.high}</b></span>
                  <span>{t("risks.criticalLabel")}: <b className="text-rose-500">{summary.critical}</b></span>
                </div>
              </div>

              {isLoading ? (
                <RiskListSkeleton count={3} />
              ) : risks.length === 0 ? (
                <div className="text-center py-12 text-zinc-600 text-sm">
                  {t("risks.noRisksPlaceholder")}
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
                                {t("risks.riskIdLabel").replace("{id}", risk.riskId)}
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
                                  {t("risks.taskIdLabel").replace("{id}", risk.taskId)}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-zinc-400 leading-relaxed">{risk.description}</p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[11px] text-zinc-400 font-mono">
                              <span className="flex items-center gap-1">
                                <Activity className="w-3 h-3 text-zinc-600" /> {t("risks.categoryLabel")}{" "}
                                <b className="text-zinc-300">{risk.category}</b>
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-rose-500" /> {t("risks.financialImpactLabel")}{" "}
                                <b className="text-zinc-300">
                                  {risk.estimatedFinancialImpact?.toLocaleString("vi-VN")} {projectCurrency}
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
                                {t("risks.probValueLabel").replace("{prob}", risk.probability)}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-amber-950/40 text-amber-400 border border-amber-900/20">
                                {t("risks.impactValueLabel").replace("{imp}", risk.impact)}
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
                              {t("risks.riskSeverityLabel").replace("{score}", score)}
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
                            {t("risks.historyBtn")}
                          </button>

                          <button
                            onClick={() => { setMitigationCostStr("0"); setSelectedRiskForMitigation(risk); }}
                            className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-md border border-purple-500/30 bg-purple-600/15 text-purple-300 hover:bg-purple-600/25 transition-colors cursor-pointer"
                          >
                            <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                            {t("risks.mitigationBtn")}
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
                            {isResolved ? t("risks.reopenBtn") : t("risks.resolveBtn")}
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
            <div className="bg-[#1c1c1c] border border-zinc-800/60 rounded-xl p-5 md:p-6 sticky top-6 space-y-6">
              <div>
                <h3 className="font-bold text-base text-zinc-200 mb-3 border-b border-zinc-800/40 pb-2">
                  {t("risks.overviewTitle")}
                </h3>
                
                {/* Compact Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-zinc-900/50 p-2 rounded-lg border border-zinc-800/40 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-zinc-500 font-mono uppercase">{t("risks.totalLabel") || "Total"}</span>
                    <span className="text-sm font-bold text-white font-mono mt-0.5">{summary.total}</span>
                  </div>
                  <div className="bg-amber-500/5 p-2 rounded-lg border border-amber-500/15 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-zinc-500 font-mono uppercase">{t("risks.highLabel") || "High"}</span>
                    <span className="text-sm font-bold text-amber-400 font-mono mt-0.5">{summary.high}</span>
                  </div>
                  <div className="bg-rose-500/5 p-2 rounded-lg border border-rose-500/15 flex flex-col items-center justify-center">
                    <span className="text-[9px] text-zinc-500 font-mono uppercase">{t("risks.criticalLabel") || "Critical"}</span>
                    <span className="text-sm font-bold text-rose-400 font-mono mt-0.5">{summary.critical}</span>
                  </div>
                </div>
              </div>

              {isLoading ? (
                /* GIAI ĐOẠN 5: SKELETON LOADING */
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-zinc-800 rounded animate-pulse"></div>
                    <div className="h-32 bg-zinc-900/50 rounded-lg animate-pulse border border-zinc-800/40"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-zinc-800 rounded animate-pulse"></div>
                    <div className="h-32 bg-zinc-900/50 rounded-lg animate-pulse border border-zinc-800/40"></div>
                  </div>
                </div>
              ) : (
                /* GIAI ĐOẠN 3: DYNAMIC RECHARTS DIAGRAMS */
                <div className="space-y-6">
                  {/* Chart 1: Status Distribution (PieChart) */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-semibold text-zinc-400 font-mono uppercase tracking-wider">
                      {t("risks.statusChangedLabel") || "Status Distribution"}
                    </h4>
                    {statusData.length === 0 ? (
                      <div className="h-32 flex items-center justify-center border border-zinc-800/40 rounded-lg bg-zinc-900/10 text-xs text-zinc-500">
                        {t("risks.noRisksPlaceholder")}
                      </div>
                    ) : (
                      <div className="h-36 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              innerRadius={25}
                              outerRadius={45}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {statusData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={statusColors[entry.rawName] || "#6b7280"}
                                />
                              ))}
                            </Pie>
                            <ChartTooltip content={<CustomChartTooltip t={t} />} />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Custom status legend */}
                        <div className="flex flex-wrap gap-x-2 gap-y-1 justify-center mt-1 text-[9px] text-zinc-400">
                          {statusData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-1">
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: statusColors[entry.rawName] }}
                              ></span>
                              <span>
                                {entry.name} ({entry.value})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chart 2: Category Distribution (BarChart Horizontal) */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-semibold text-zinc-400 font-mono uppercase tracking-wider">
                      {t("risks.categoryField") || "Category Distribution"}
                    </h4>
                    {risks.length === 0 ? (
                      <div className="h-32 flex items-center justify-center border border-zinc-800/40 rounded-lg bg-zinc-900/10 text-xs text-zinc-500">
                        {t("risks.noRisksPlaceholder")}
                      </div>
                    ) : (
                      <div className="h-36 w-full text-[10px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={categoryData}
                            layout="vertical"
                            margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                          >
                            <XAxis type="number" hide />
                            <YAxis
                              dataKey="name"
                              type="category"
                              axisLine={false}
                              tickLine={false}
                              width={60}
                              tick={{ fill: "#9ca3af", fontSize: 8 }}
                            />
                            <ChartTooltip content={<CustomChartTooltip t={t} />} />
                            <Bar
                              dataKey="value"
                              fill="#8b5cf6"
                              radius={[0, 4, 4, 0]}
                              barSize={8}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-zinc-800/40 text-[10px] text-zinc-500 space-y-1 leading-relaxed">
                <div className="font-semibold text-zinc-400 mb-1">{t("risks.guideTitle")}</div>
                <div>{t("risks.guideFormula")?.replace("{formula}", "Probability × Impact")}</div>
                <div>{t("risks.guideTag")?.replace("{tag}", "R-ID")}</div>
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
              <AlertTriangle className="w-5 h-5" /> {t("risks.declareModalTitle")}
            </h3>

            <form onSubmit={handleCreateRisk} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">{t("risks.riskNameField")}</label>
                <input
                  type="text"
                  name="riskName"
                  placeholder={t("risks.riskNamePlaceholder")}
                  maxLength={255}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-zinc-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">{t("risks.associatedTaskField")}</label>
                <select
                  name="taskId"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  defaultValue=""
                >
                  <option value="">{t("risks.generalRiskOption")}</option>
                  {projectTasks.map((task) => (
                    <option key={task.taskId || task.id} value={task.taskId || task.id}>
                      [{task.status || "Task"}] {task.title || task.taskName || task.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">{t("risks.categoryField")}</label>
                <select
                  name="category"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  defaultValue="Schedule"
                >
                  {Object.entries(t("risks.categories") || {}).map(([key, label]) => (
                    <option key={key} value={key.charAt(0).toUpperCase() + key.slice(1)}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">{t("risks.ownerField") || "Responsible Owner *"}</label>
                <select
                  name="ownerId"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                  defaultValue={currentMemberId || ""}
                  required
                >
                  <option value="">{t("risks.selectOwnerPlaceholder") || "-- Select Owner --"}</option>
                  {workspaceMembers.map((member) => (
                    <option key={member.workspaceMemberId} value={member.workspaceMemberId}>
                      {member.resource?.fullName || `Member ${member.workspaceMemberId}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">{t("risks.descriptionField")}</label>
                <textarea
                  name="description"
                  placeholder={t("risks.descPlaceholder")}
                  rows="2"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white placeholder-zinc-600"
                  required
                />
              </div>
 
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">{t("risks.probabilityField")}</label>
                  <select
                    name="probability"
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    defaultValue="3"
                  >
                    {(t("risks.probabilityOptions") || []).map((opt, idx) => (
                      <option key={idx + 1} value={idx + 1}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">{t("risks.impactField")}</label>
                  <select
                    name="impact"
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    defaultValue="3"
                  >
                    {(t("risks.impactOptions") || []).map((opt, idx) => (
                      <option key={idx + 1} value={idx + 1}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
 
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  {t("risks.financialImpactField").replace("(USD)", `(${projectCurrency})`)}
                </label>
                <input
                  type="text"
                  name="estimatedFinancialImpact"
                  value={estFinancialImpactStr}
                  onChange={handleEstFinancialImpactChange}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800 mt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-sm text-zinc-300 hover:text-white cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                  {t("common.cancel") || "Hủy"}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingRisk}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium hover:bg-blue-500 text-white cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isCreatingRisk ? (t("risks.savingPlan") || "Saving...") : t("risks.createBtn")}
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
                <ShieldAlert className="w-5 h-5" /> {t("risks.mitigationModalTitle").replace("{id}", selectedRiskForMitigation.riskId)}
              </h3>
              <button
                onClick={() => setSelectedRiskForMitigation(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800">
              {t("risks.mitigationTargetRisk").replace("{name}", selectedRiskForMitigation.riskName)}
            </p>

            <form onSubmit={handleCreateMitigation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">{t("risks.strategyTypeField")}</label>
                <select
                  name="strategyType"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  defaultValue="Mitigation"
                >
                  {Object.entries(t("risks.strategyOptions") || {}).map(([key, label]) => (
                    <option key={key} value={key.charAt(0).toUpperCase() + key.slice(1)}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">{t("risks.actionPlanField")}</label>
                <textarea
                  name="actionPlan"
                  placeholder={t("risks.actionPlanPlaceholder")}
                  rows="3"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 text-white placeholder-zinc-600"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    {t("risks.mitigationCostField").replace("(USD)", `(${projectCurrency})`)}
                  </label>
                  <input
                    type="text"
                    name="mitigationCost"
                    value={mitigationCostStr}
                    onChange={handleMitigationCostChange}
                    className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">{t("risks.targetDateField")}</label>
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
                <label className="block text-xs font-mono text-zinc-400 mb-1">{t("risks.assignedMemberField")}</label>
                <select
                  name="assignedMemberId"
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  defaultValue={currentMemberId || ""}
                >
                  <option value="">{t("risks.selectOwnerPlaceholder") || "-- Select Owner --"}</option>
                  {workspaceMembers.map((member) => (
                    <option key={member.workspaceMemberId} value={member.workspaceMemberId}>
                      {member.resource?.fullName || `Member ${member.workspaceMemberId}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800 mt-4">
                <button
                  type="button"
                  onClick={() => setSelectedRiskForMitigation(null)}
                  className="px-4 py-2 rounded-lg border border-zinc-700 bg-zinc-800 text-sm text-zinc-300 hover:text-white cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                  {t("common.cancel") || "Hủy"}
                </button>
                <button
                  type="submit"
                  disabled={isMitigationSubmitting}
                  className="px-4 py-2 rounded-lg bg-purple-600 text-sm font-medium hover:bg-purple-500 text-white cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isMitigationSubmitting ? t("risks.savingPlan") : t("risks.savePlanBtn")}
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
                <History className="w-5 h-5" /> {t("risks.lifecycleModalTitle").replace("{id}", selectedRiskForLifecycle.riskId)}
              </h3>
              <button
                onClick={() => setSelectedRiskForLifecycle(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              {t("risks.lifecycleLogDesc").replace("{name}", selectedRiskForLifecycle.riskName)}
            </p>

            {isLifecycleLoading ? (
              <RiskLifecycleSkeleton count={4} />
            ) : lifecycleLogs.length === 0 ? (
              <div className="text-center py-8 text-zinc-600 text-sm border border-dashed border-zinc-800 rounded-xl">
                {t("risks.noLogs")}
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
                        <User className="w-3 h-3 text-blue-400" /> {t("risks.changedByLabel").replace("{id}", log.changedByMemberId)}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Calendar className="w-3 h-3" /> {log.changeDate ? new Date(log.changeDate).toLocaleString() : "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-zinc-300">
                      <span>{t("risks.statusChangedLabel")}</span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{log.oldStatus || "N/A"}</span>
                      <span>&rarr;</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-900/30">
                        {log.newStatus}
                      </span>
                    </div>

                    {(log.oldScore !== undefined || log.newScore !== undefined) && (
                      <div className="text-zinc-400 text-[11px]">
                        {t("risks.riskScoreChangedLabel")} <b className="text-zinc-300">{log.oldScore}</b> &rarr; <b className="text-amber-400">{log.newScore}</b>
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
                {t("common.close") || "Đóng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}