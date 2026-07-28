import { useState, useEffect } from "react";
import { X, Clock, AlertCircle } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

export default function AllocationModal({ isOpen, onClose, tasks, otRequests, standardHours, onSubmit }) {
  const { t } = useLanguage();
  const stdHoursNum = parseFloat(standardHours || 8);
  const N = tasks.length;

  // Khởi tạo giờ thường chia đều mặc định
  const [normalHours, setNormalHours] = useState(() => {
    const defaultVal = stdHoursNum / N;
    // Đảm bảo tổng bằng stdHoursNum
    const initial = Array(N).fill(parseFloat(defaultVal.toFixed(1)));
    const sum = initial.reduce((a, b) => a + b, 0);
    if (sum !== stdHoursNum) {
      initial[0] = parseFloat((initial[0] + (stdHoursNum - sum)).toFixed(1));
    }
    return initial;
  });

  // Khởi tạo giờ OT tự động điền từ đơn OT đã duyệt
  const [otHours, setOtHours] = useState(() => {
    return tasks.map((task) => {
      const matchOT = otRequests.find(
        (req) => req.projectId === task.projectId || req.taskId === task.taskId
      );
      return matchOT ? parseFloat(matchOT.expectedHours || 0) : 0;
    });
  });

  // Giới hạn OT tối đa được phép chỉnh cho mỗi task
  const maxOtHours = tasks.map((task) => {
    const matchOT = otRequests.find(
      (req) => req.projectId === task.projectId || req.taskId === task.taskId
    );
    return matchOT ? parseFloat(matchOT.expectedHours || 0) : 0;
  });

  const handleNormalHoursChange = (index, value) => {
    const val = Math.min(stdHoursNum, Math.max(0, parseFloat(value) || 0));
    const newHours = [...normalHours];
    const diff = val - newHours[index];
    newHours[index] = val;

    const otherIndices = tasks.map((_, idx) => idx).filter((idx) => idx !== index);
    if (otherIndices.length === 0) return;

    if (diff > 0) {
      // Giảm các task khác
      let toDecrease = diff;
      let attempts = 0;
      while (toDecrease > 0.01 && attempts < 10) {
        attempts++;
        const positiveOthers = otherIndices.filter((idx) => newHours[idx] > 0);
        if (positiveOthers.length === 0) break;
        const decreasePerTask = toDecrease / positiveOthers.length;
        for (const idx of positiveOthers) {
          const actualDecrease = Math.min(newHours[idx], decreasePerTask);
          newHours[idx] -= actualDecrease;
          toDecrease -= actualDecrease;
        }
      }
    } else if (diff < 0) {
      // Tăng các task khác
      let toIncrease = -diff;
      const increasePerTask = toIncrease / otherIndices.length;
      for (const idx of otherIndices) {
        newHours[idx] += increasePerTask;
      }
    }

    // Làm tròn 1 chữ số thập phân và đảm bảo tổng đúng bằng stdHoursNum
    const rounded = newHours.map((h) => Math.round(h * 10) / 10);
    const sum = rounded.reduce((a, b) => a + b, 0);
    if (sum !== stdHoursNum) {
      // Bù trừ sai số làm tròn vào task khác có giờ > 0
      const adjustIdx = otherIndices.find((idx) => rounded[idx] > 0) ?? otherIndices[0];
      if (adjustIdx !== undefined) {
        rounded[adjustIdx] = parseFloat((rounded[adjustIdx] + (stdHoursNum - sum)).toFixed(1));
      }
    }

    setNormalHours(rounded);
  };

  const handleOtHoursChange = (index, value) => {
    const val = Math.min(maxOtHours[index], Math.max(0, parseFloat(value) || 0));
    const newOt = [...otHours];
    newOt[index] = parseFloat(val.toFixed(1));
    setOtHours(newOt);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allocationList = tasks.map((task, idx) => ({
      taskId: task.taskId,
      normalHours: normalHours[idx],
      otHours: otHours[idx]
    }));
    onSubmit(allocationList);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden text-white">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
            {t("timesheets.allocationModalTitle")}
          </h2>
        </div>

        <p className="text-xs text-content-secondary leading-relaxed mb-6">
          {t("timesheets.allocationModalDesc")
            .replace("{count}", N)
            .replace("{hours}", stdHoursNum.toFixed(1))}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
            {tasks.map((task, idx) => {
              const otLimit = maxOtHours[idx];
              return (
                <div
                  key={task.taskId}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-4"
                >
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                      Task ID: TASK-{task.taskId}
                    </span>
                    <span className="text-xs font-semibold text-zinc-200">
                      {task.taskName}
                    </span>
                  </div>

                  {/* Slider Giờ Thường */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span>{t("timesheets.normalHoursField")}</span>
                      <span className="font-bold text-emerald-400">
                        {normalHours[idx].toFixed(1)}h / {stdHoursNum.toFixed(1)}h
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={stdHoursNum}
                      step="0.1"
                      value={normalHours[idx]}
                      onChange={(e) => handleNormalHoursChange(idx, e.target.value)}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Slider Giờ OT (Chỉ hiển thị nếu task/project được duyệt OT) */}
                  {otLimit > 0 && (
                    <div className="space-y-1.5 border-t border-white/5 pt-3">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                        <span className="flex items-center gap-1">
                          {t("timesheets.otHoursField")}
                          <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 rounded">
                            Approved Limit
                          </span>
                        </span>
                        <span className="font-bold text-amber-400">
                          {otHours[idx].toFixed(1)}h / {otLimit.toFixed(1)}h
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={otLimit}
                        step="0.1"
                        value={otHours[idx]}
                        onChange={(e) => handleOtHoursChange(idx, e.target.value)}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/10 pt-4 flex justify-between items-center text-xs font-mono">
            <div className="text-zinc-400">
              Tổng giờ thường:{" "}
              <span className="font-bold text-emerald-400">
                {normalHours.reduce((a, b) => a + b, 0).toFixed(1)}h
              </span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-white/10 rounded-md bg-white/5 text-slate-300 hover:bg-white/10 transition-colors"
              >
                {t("timesheets.cancelBtn")}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/15 transition-colors"
              >
                {t("timesheets.confirmAllocationBtn")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
