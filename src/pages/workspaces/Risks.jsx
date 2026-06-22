import { useState, useEffect } from "react";
import { AlertTriangle, Plus, Sparkles, ShieldCheck, CheckCircle2, RefreshCw, Activity, DollarSign, User } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { fetchProjectRisks, createProjectRisk, askAI, fetchRiskMitigations, fetchRiskLifecycle } from "../../services/mockApi";

export default function Risks() {
  const { activeProject } = useOutletContext();
  
  const [risks, setRisks] = useState([]);
  const [mitigationsMap, setMitigationsMap] = useState({});
  const [lifecycleMap, setLifecycleMap] = useState({});
  
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load Risks from API
  useEffect(() => {
    if (!activeProject?.projectId) return;
    setIsLoading(true);
    fetchProjectRisks(activeProject.projectId)
      .then(res => {
        setRisks(res.items);
        return res.items;
      })
      .then(items => {
        // Fetch mitigations and lifecycle for all loaded risks
        items.forEach(r => {
          fetchRiskMitigations(r.riskId).then(m => {
            setMitigationsMap(prev => ({...prev, [r.riskId]: m}));
          });
          fetchRiskLifecycle(r.riskId).then(l => {
            setLifecycleMap(prev => ({...prev, [r.riskId]: l}));
          });
        });
      })
      .finally(() => setIsLoading(false));
  }, [activeProject]);

  const handleAskAI = async () => {
    if (!activeProject) return;
    setIsAiLoading(true);
    try {
      const result = await askAI({ 
        projectId: activeProject.projectId, 
        analysisType: "Risk Warning", 
        prompt: "Analyze current project risks" 
      });
      setAiAnalysis(result.content || result.suggestionContent);
    } catch (e) {
      console.error(e);
      setAiAnalysis("AI Analysis failed to load.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleCreateRisk = async (e) => {
    e.preventDefault();
    if (!activeProject) return;
    const formData = new FormData(e.target);
    const newRiskData = {
      riskName: formData.get("riskName"),
      description: formData.get("description"),
      category: formData.get("category"),
      probability: parseInt(formData.get("probability")),
      impact: parseInt(formData.get("impact")),
      estimatedFinancialImpact: parseFloat(formData.get("estimatedFinancialImpact") || 0),
      ownerId: 99,
      taskId: formData.get("taskId") ? parseInt(formData.get("taskId")) : null
    };

    try {
      const created = await createProjectRisk(activeProject.projectId, newRiskData);
      setRisks([created, ...risks]);
      setIsModalOpen(false);
      alert("Thêm rủi ro mới thành công!");
    } catch (e) {
      alert("Lỗi: " + e.message);
    }
  };

  const toggleRiskStatus = (id) => {
    // Local state toggle update (for demo purposes)
    setRisks(prev => prev.map(r => {
      if (r.riskId === id) {
        const newStatus = r.status === "Closed" || r.status === "Resolved" ? "Identified" : "Resolved";
        return { ...r, status: newStatus };
      }
      return r;
    }));
  };

  // Helper for 5x5 matrix
  const getMatrixCellCount = (prob, imp) => {
    return risks.filter(r => r.probability === prob && r.impact === imp).length;
  };

  const getCellColorClass = (prob, imp) => {
    const score = prob * imp;
    if (score >= 15) return "bg-rose-900/20 border-rose-800/30 text-rose-400"; // Critical
    if (score >= 8) return "bg-purple-900/20 border-purple-800/30 text-purple-400"; // High
    if (score >= 4) return "bg-emerald-900/10 border-emerald-800/20 text-emerald-400"; // Medium
    return "bg-inset border-white/5 text-content-muted opacity-40"; // Low
  };

  return (
    <div className="flex-1 overflow-y-auto h-full p-4 md:p-6 custom-scrollbar">
      <div className="max-w-6xl mx-auto pb-10">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-8 h-8 text-rose-400 animate-pulse" /> Project Risks
            </h1>
            <p className="text-content-muted text-sm">
              Nhận diện, đánh giá ma trận xác suất và quản lý phương án giảm thiểu rủi ro.
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleAskAI}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-md hover:bg-purple-600/30 transition-colors"
            >
              <Sparkles className="w-4 h-4" /> {isAiLoading ? "AI đang phân tích..." : "Hỏi AI Phân Tích"}
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
            <p className="text-xs text-purple-200/80 leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          
          <div className="xl:col-span-2 bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl p-6 flex flex-col">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-content-primary">
              <ShieldCheck className="w-5 h-5 text-content-muted" /> Risk Log Register
            </h3>
            
            {isLoading ? (
               <div className="text-center py-10 text-slate-400 text-sm">Loading risks...</div>
            ) : risks.length === 0 ? (
               <div className="text-center py-10 text-slate-500 text-sm">Hiện tại chưa có rủi ro nào được khai báo.</div>
            ) : (
              <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar pr-2">
                {risks.map((risk) => {
                  const mitigations = mitigationsMap[risk.riskId] || [];
                  const lifecycle = lifecycleMap[risk.riskId] || [];
                  const isResolved = risk.status === "Closed" || risk.status === "Resolved";
                  
                  return (
                    <div 
                      key={risk.riskId} 
                      className={`p-4 rounded-lg border transition-all ${
                        isResolved 
                          ? "bg-zinc-900/30 border-zinc-800/50 opacity-60" 
                          : "bg-surface/40 border-white/5 hover:border-border-default"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className={`text-sm font-semibold flex items-center gap-2 ${isResolved ? "line-through text-zinc-500" : "text-content-primary"}`}>
                            {risk.riskName}
                          </h4>
                          <p className="text-xs text-content-muted mt-1">{risk.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-400 font-mono">
                            <span className="flex items-center gap-1"><Activity className="w-3 h-3"/> Category: {risk.category}</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-rose-400"/> {risk.estimatedFinancialImpact} USD</span>
                            {risk.status && <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{risk.status}</span>}
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
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${risk.riskScore >= 15 ? 'bg-rose-500/20 text-rose-400' : 'bg-purple-500/20 text-purple-400'}`}>
                            Score: {risk.riskScore}
                          </span>
                        </div>
                      </div>

                      {mitigations.length > 0 && (
                        <div className="mt-3 bg-inset/50 p-2.5 rounded text-xs font-mono border border-white/5">
                          <span className="text-content-muted text-[11px] block mb-1 font-bold">💡 Mitigations:</span>
                          <div className="space-y-1">
                            {mitigations.map(m => (
                              <div key={m.mitigationId} className="flex flex-col gap-1">
                                <span className="text-content-secondary">- {m.actionPlan} (Cost: ${m.mitigationCost})</span>
                                <span className="text-[9px] text-emerald-400">Status: {m.status} | By Member: {m.assignedMemberId}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex justify-end">
                        <button 
                          onClick={() => toggleRiskStatus(risk.riskId)}
                          className={`flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded border transition-colors cursor-pointer ${
                            isResolved
                              ? "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                              : "bg-emerald-600/20 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600/30"
                          }`}
                        >
                          {isResolved ? <RefreshCw className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          {isResolved ? "Re-open Risk" : "Mark as Resolved"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ma trận 5x5 Thay thế */}
          <div className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-xl p-6 h-fit">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-content-primary flex items-center gap-2">Ma Trận Xác Suất (5x5)</h3>
            </div>

            <div className="relative">
              <div className="absolute -left-8 top-0 bottom-8 w-6 flex items-center justify-center">
                <span className="text-[10px] text-content-muted font-mono -rotate-90 tracking-widest whitespace-nowrap">PROBABILITY</span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 mb-2 pl-4">
                {[5,4,3,2,1].map(prob => (
                  <div key={`row-${prob}`} className="contents">
                    {[1,2,3,4,5].map(imp => {
                      const count = getMatrixCellCount(prob, imp);
                      const bgClass = getCellColorClass(prob, imp);
                      return (
                        <div key={`${prob}-${imp}`} className={`rounded aspect-square flex flex-col items-center justify-center border transition-colors relative group ${bgClass}`}>
                          {count > 0 ? (
                            <span className="text-sm font-bold font-mono z-10">{count}</span>
                          ) : (
                            <span className="text-xs font-mono opacity-20">0</span>
                          )}
                          <div className="absolute hidden group-hover:block bottom-full mb-1 z-20 bg-neutral-900 border border-white/10 text-white text-[9px] font-mono py-1 px-2 rounded whitespace-nowrap">
                            P:{prob} × I:{imp} = {prob * imp}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-5 gap-1 text-center mt-2 pl-4">
                <span className="text-[9px] text-content-muted font-mono tracking-tighter">1(VL)</span>
                <span className="text-[9px] text-content-muted font-mono tracking-tighter">2(L)</span>
                <span className="text-[9px] text-content-muted font-mono tracking-tighter">3(M)</span>
                <span className="text-[9px] text-content-muted font-mono tracking-tighter">4(H)</span>
                <span className="text-[9px] text-content-muted font-mono tracking-tighter">5(VH)</span>
              </div>
              <div className="text-center mt-1 text-[10px] text-content-muted font-mono tracking-widest pl-4">
                IMPACT
              </div>
            </div>
            
            <div className="mt-8 flex flex-col gap-2 scale-90 origin-left">
               <div className="flex gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Critical (15-25)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> High (8-12)</span>
               </div>
               <div className="flex gap-3 text-[10px] font-mono">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Medium (4-6)</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500 border border-white/20"></span> Low (1-3)</span>
               </div>
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
                <label className="block text-xs font-mono text-zinc-400 mb-1">Tên rủi ro (Risk Name)</label>
                <input 
                  type="text" name="riskName" placeholder="VD: Trễ tiến độ kiểm thử..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white" 
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Category</label>
                <select name="category" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500">
                  <option value="Schedule">Schedule</option>
                  <option value="Technical">Technical</option>
                  <option value="Resource">Resource</option>
                  <option value="Budget">Budget</option>
                  <option value="External">External</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1">Mô tả (Description)</label>
                <textarea 
                  name="description" placeholder="..." rows="2"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Probability (1-5)</label>
                  <select name="probability" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500" defaultValue="3">
                    <option value="1">1 - Rất thấp</option>
                    <option value="2">2 - Thấp</option>
                    <option value="3">3 - Trung bình</option>
                    <option value="4">4 - Cao</option>
                    <option value="5">5 - Rất cao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">Impact (1-5)</label>
                  <select name="impact" className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500" defaultValue="3">
                    <option value="1">1 - Rất thấp</option>
                    <option value="2">2 - Thấp</option>
                    <option value="3">3 - Trung bình</option>
                    <option value="4">4 - Cao</option>
                    <option value="5">5 - Rất cao</option>
                  </select>
                </div>
              </div>

              <div>
                 <label className="block text-xs font-mono text-zinc-400 mb-1">Estimated Financial Impact (USD)</label>
                 <input 
                   type="number" name="estimatedFinancialImpact" min="0" step="100" defaultValue="0"
                   className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 text-white" 
                 />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 cursor-pointer text-xs border border-zinc-700 rounded bg-transparent hover:bg-zinc-800 text-zinc-400">Hủy</button>
                <button type="submit" className="flex-1 py-2 cursor-pointer text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium rounded shadow-[0_0_10px_rgba(225,29,72,0.3)]">Khai Báo</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}