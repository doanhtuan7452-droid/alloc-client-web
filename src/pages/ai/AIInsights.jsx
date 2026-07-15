import { useState, useEffect } from "react";
import {
  Sparkles,
  BrainCircuit,
  History,
  Send,
  MessageSquare,
} from "lucide-react";
import AIService from "../../services/AIService";
import ProjectService from "../../services/ProjectService";

export default function AIInsights() {
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const [insightsHistory, setInsightsHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [isAsking, setIsAsking] = useState(false);
  const [analysisType, setAnalysisType] = useState("Risk Warning");
  const [promptInput, setPromptInput] = useState("");

  const workspaceId = Number(
    localStorage.getItem("lastActiveWorkspaceId") || 12,
  );

  useEffect(() => {
    ProjectService.getProjects(workspaceId).then((list) => {
      setProjectsList(list);
      if (list.length > 0) {
        setSelectedProjectId(list[0].projectId);
      }
    });
  }, [workspaceId]);

  useEffect(() => {
    if (selectedProjectId) {
      setTimeout(() => setIsLoadingHistory(true), 0);
      ProjectService.getProjectAIInsights(selectedProjectId)
        .then((res) => setInsightsHistory(res.items || []))
        .catch((error) => console.error(error))
        .finally(() => setIsLoadingHistory(false));
    }
  }, [selectedProjectId]);

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!selectedProjectId || !promptInput.trim()) return;

    setIsAsking(true);
    try {
      await AIService.askAI({
        projectId: selectedProjectId,
        analysisType,
        prompt: promptInput,
      });
      setPromptInput("");
      // Reload history immediately after ask
      await ProjectService.getProjectAIInsights(selectedProjectId).then(
        (res) => {
          setInsightsHistory(res.items || []);
        },
      );
    } catch (e) {
      alert("Lỗi khi kết nối AI: " + e.message);
    } finally {
      setIsAsking(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Risk Warning":
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case "Resource Optimization":
        return <BrainCircuit className="w-4 h-4 text-emerald-400" />;
      case "Budget Forecast":
        return <History className="w-4 h-4 text-amber-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
    }
  };

  const getCardStyle = (type) => {
    switch (type) {
      case "Risk Warning":
        return "border-purple-800/30 bg-purple-950/10";
      case "Resource Optimization":
        return "border-emerald-800/30 bg-emerald-950/10";
      case "Budget Forecast":
        return "border-amber-800/30 bg-amber-950/10";
      default:
        return "border-blue-800/30 bg-blue-950/10";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto h-full p-4 md:p-6 custom-scrollbar flex flex-col items-center">
      <div className="w-full max-w-4xl pb-10 flex flex-col flex-grow">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-purple-600/20 rounded-2xl mb-4 border border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Alloc AI Insights</h1>
          <p className="text-content-muted text-sm max-w-xl mx-auto">
            Hệ thống AI phân tích dữ liệu chuyên sâu để nhận diện rủi ro, dự
            phòng ngân sách và tối ưu hóa nguồn lực dự án.
          </p>
        </div>

        {/* Cấu hình phân tích */}
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-5 mb-6 z-10 shrink-0">
          <form onSubmit={handleAskAI} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Chọn dự án phân tích
                </label>
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                  value={selectedProjectId || ""}
                  onChange={(e) =>
                    setSelectedProjectId(parseInt(e.target.value))
                  }
                >
                  {projectsList.map((p) => (
                    <option key={p.projectId} value={p.projectId}>
                      {p.projectName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-zinc-400 mb-1.5">
                  Loại phân tích
                </label>
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-medium"
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                >
                  <option value="Risk Warning">
                    Cảnh báo Trễ tiến độ / Rủi ro
                  </option>
                  <option value="Resource Optimization">
                    Tối ưu Nguồn lực / Phân bổ
                  </option>
                  <option value="Budget Forecast">Dự báo Ngân sách</option>
                </select>
              </div>
            </div>

            <div className="relative mt-2">
              <textarea
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none font-sans"
                placeholder="Ví dụ: Phân tích giúp tôi rủi ro của dự án này dựa trên tình trạng các task hiện tại..."
                rows="2"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={isAsking || !promptInput.trim()}
                className="absolute right-2 bottom-2 p-2 bg-purple-600 rounded-md text-white hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:bg-zinc-700 disabled:cursor-not-allowed group cursor-pointer"
              >
                {isAsking ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Lịch sử AI */}
        <div className="flex-grow flex flex-col">
          <div className="flex items-center gap-2 mb-4 px-2">
            <History className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-bold text-zinc-300">
              Lịch sử phân tích
            </h3>
          </div>

          <div className="space-y-4 pb-4">
            {isLoadingHistory ? (
              <div className="text-center py-10 text-zinc-500 text-sm">
                Đang tải lịch sử...
              </div>
            ) : insightsHistory.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-xl p-10 text-center flex flex-col items-center justify-center text-zinc-500 h-40">
                <BrainCircuit className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm">Chưa có phân tích nào cho dự án này.</p>
              </div>
            ) : (
              insightsHistory.map((item) => (
                <div
                  key={item.logId}
                  className={`p-5 rounded-xl border ${getCardStyle(item.suggestionType)} transition-all animate-fadeIn`}
                >
                  <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2 font-mono text-sm font-bold">
                      {getTypeIcon(item.suggestionType)}
                      <span className="text-white bg-clip-text whitespace-nowrap">
                        {item.suggestionType}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 bg-black/20 px-2 py-0.5 rounded">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {item.suggestionContent}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
