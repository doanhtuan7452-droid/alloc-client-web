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
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import RiskService from "../../services/RiskService";
import AIService from "../../services/AIService";

export default function Risks() {
  const { activeProject } = useOutletContext();

  const [risks, setRisks] = useState([]);
  const [lifecycleMap, setLifecycleMap] = useState({});
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeProject?.projectId) {
      const resetTimer = setTimeout(() => {
        setRisks([]);
        setLifecycleMap({});
      }, 0);

      return () => clearTimeout(resetTimer);
    }

    let cancelled = false;
    const loadingTimer = setTimeout(() => setIsLoading(true), 0);

    RiskService.getProjectRisks(activeProject.projectId)
      .then((res) => {
        const items = res.items || [];
        if (!cancelled) {
          setRisks(items);
          setLifecycleMap({});
        }
        return items;
      })
      .then((items) =>
        Promise.all(
          items.map(async (risk) => [
            risk.riskId,
            await RiskService.getLifecycle(risk.riskId),
          ]),
        ),
      )
      .then((pairs) => {
        if (!cancelled) {
          const nextMap = {};
          pairs.forEach(([riskId, lifecycle]) => {
            nextMap[riskId] = lifecycle;
          });
          setLifecycleMap(nextMap);
        }
      })
      .catch((error) => console.error(error))
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(loadingTimer);
    };
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

    const formData = new FormData(e.target);
    const payload = {
      riskName: formData.get("riskName"),
      description: formData.get("description"),
      category: formData.get("category"),
      probability: Number.parseInt(formData.get("probability"), 10),
      impact: Number.parseInt(formData.get("impact"), 10),
      estimatedFinancialImpact: Number.parseFloat(
        formData.get("estimatedFinancialImpact") || 0,
      ),
      ownerId: 99,
      taskId: formData.get("taskId")
        ? Number.parseInt(formData.get("taskId"), 10)
        : null,
      status: "Identified",
    };

    try {
      const created = await RiskService.createRisk(
        activeProject.projectId,
        payload,
      );
      setRisks((prev) => [created, ...prev]);
      setIsModalOpen(false);
    } catch (error) {
      alert(`Lỗi: ${error.message}`);
    }
  };

  const toggleRiskStatus = (riskId) => {
    setRisks((prev) =>
      prev.map((risk) => {
        if (risk.riskId !== riskId) {
          return risk;
        }

        const nextStatus =
          risk.status === "Resolved" ? "Identified" : "Resolved";
        return { ...risk, status: nextStatus };
      }),
    );
  };

  const summary = useMemo(() => {
    const total = risks.length;
    const high = risks.filter(
      (risk) => risk.probability * risk.impact >= 8,
    ).length;
    const critical = risks.filter(
      (risk) => risk.probability * risk.impact >= 15,
    ).length;
    return { total, high, critical };
  }, [risks]);

  return (
    <div className="flex-1 overflow-y-auto h-full p-4 md:p-6 custom-scrollbar">
      <div className="max-w-6xl mx-auto pb-10">
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-rose-400" /> Project Risks
            </h1>
            <p className="text-content-muted text-sm">
              Nhận diện, đánh giá và theo dõi rủi ro theo contract backend thật.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAskAI}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-md hover:bg-purple-600/30 transition-colors"
            >
              <Sparkles className="w-4 h-4" />{" "}
              {isAiLoading ? "AI đang phân tích..." : "Hỏi AI Phân Tích"}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              <Plus className="w-4 h-4" /> Khai báo rủi ro
            </button>
          </div>
        </div>

        {aiAnalysis && (
          <div className="mb-6 bg-purple-950/10 border border-purple-800/20 rounded-xl p-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1.5">
              <Sparkles className="w-4 h-4" /> AI Risk Warning
            </div>
            <p className="text-xs text-purple-200/80 leading-relaxed whitespace-pre-wrap">
              {aiAnalysis}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2 text-content-primary">
                <ShieldCheck className="w-5 h-5 text-content-muted" /> Risk Log
                Register
              </h3>
              <div className="flex items-center gap-2 text-xs text-content-muted font-mono">
                <span>Total: {summary.total}</span>
                <span>High+: {summary.high}</span>
                <span>Critical: {summary.critical}</span>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-10 text-slate-400 text-sm">
                Loading risks...
              </div>
            ) : risks.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-sm">
                Hiện tại chưa có rủi ro nào được khai báo.
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2">
                {risks.map((risk) => {
                  const lifecycle = lifecycleMap[risk.riskId] || [];
                  const isResolved =
                    risk.status === "Resolved" || risk.status === "Closed";

                  return (
                    <div
                      key={risk.riskId}
                      className={`p-4 rounded-lg border transition-all ${isResolved ? "bg-zinc-900/30 border-zinc-800/50 opacity-60" : "bg-surface/40 border-white/5 hover:border-border-default"}`}
                    >
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <div>
                          <h4
                            className={`text-sm font-semibold flex items-center gap-2 ${isResolved ? "line-through text-zinc-500" : "text-content-primary"}`}
                          >
                            {risk.riskName}
                          </h4>
                          <p className="text-xs text-content-muted mt-1">
                            {risk.description}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-400 font-mono flex-wrap">
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" /> Category:{" "}
                              {risk.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-rose-400" />{" "}
                              {risk.estimatedFinancialImpact} USD
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                              {risk.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0 ml-4">
                          <div className="flex gap-1 font-mono text-[9px]">
                            <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/30">
                              Prob: {risk.probability}/5
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/30">
                              Impact: {risk.impact}/5
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${risk.riskScore >= 15 ? "bg-rose-500/20 text-rose-400" : "bg-purple-500/20 text-purple-400"}`}
                          >
                            Score: {risk.riskScore}
                          </span>
                        </div>
                      </div>

                      {lifecycle.length > 0 && (
                        <div className="mt-3 bg-inset/50 p-2.5 rounded text-xs font-mono border border-white/5">
                          <span className="text-content-muted text-[11px] block mb-1 font-bold">
                            Lifecycle
                          </span>
                          <div className="space-y-1">
                            {lifecycle.map((entry) => (
                              <div
                                key={entry.historyId}
                                className="text-content-secondary"
                              >
                                - {entry.oldStatus} → {entry.newStatus} (
                                {entry.changeDate})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => toggleRiskStatus(risk.riskId)}
                          className="flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded border transition-colors cursor-pointer bg-emerald-600/20 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600/30"
                        >
                          {isResolved ? (
                            <RefreshCw className="w-3 h-3" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          {isResolved ? "Re-open Risk" : "Mark as Resolved"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl p-6 h-fit">
            <h3 className="font-bold text-content-primary mb-3">Tóm tắt</h3>
            <div className="space-y-2 text-sm text-content-secondary">
              <div>Tổng rủi ro: {summary.total}</div>
              <div>Mức cao trở lên: {summary.high}</div>
              <div>Rủi ro critical: {summary.critical}</div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 w-full max-w-md text-white animate-scaleUp">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" /> Khai Báo Rủi Ro API Chuẩn
            </h3>

            <form onSubmit={handleCreateRisk} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Tên rủi ro (Risk Name)
                </label>
                <input
                  type="text"
                  name="riskName"
                  placeholder="VD: Trễ tiến độ kiểm thử..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  defaultValue="Schedule"
                >
                  <option value="Schedule">Schedule</option>
                  <option value="Technical">Technical</option>
                  <option value="Resource">Resource</option>
                  <option value="Budget">Budget</option>
                  <option value="External">External</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Mô tả (Description)
                </label>
                <textarea
                  name="description"
                  placeholder="..."
                  rows="2"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Probability (1-5)
                  </label>
                  <select
                    name="probability"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
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
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    Impact (1-5)
                  </label>
                  <select
                    name="impact"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
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
                <label className="block text-xs font-mono text-zinc-400 mb-1">
                  Estimated Financial Impact (USD)
                </label>
                <input
                  type="number"
                  name="estimatedFinancialImpact"
                  min="0"
                  step="100"
                  defaultValue="0"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-white/10 bg-white/5 text-sm text-content-secondary hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 text-sm font-medium hover:bg-blue-500"
                >
                  Create Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
