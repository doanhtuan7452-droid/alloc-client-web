import { useState } from "react";
import { X, Settings, Loader2 } from "lucide-react";
import WorkspaceService from "../../services/WorkspaceService";
import { useNotification } from "../../contexts/NotificationContext";
import { useLanguage } from "../../contexts/LanguageContext";

export default function WorkspaceSettingsModal({ isOpen, onClose, workspaceInfo, onUpdateSuccess }) {
  const { t } = useLanguage();
  const { toast } = useNotification();
  const [standardHours, setStandardHours] = useState(workspaceInfo?.standardHours ?? 8.0);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workspaceInfo) return;

    setIsSaving(true);
    try {
      const workspaceId = workspaceInfo.workspaceId || workspaceInfo.id;
      // Bắt buộc gửi kèm trường name theo yêu cầu của API server C#
      const payload = {
        name: workspaceInfo.name,
        standardHours: parseFloat(standardHours),
      };

      await WorkspaceService.updateWorkspace(workspaceId, payload);
      toast.success(t("timesheets.updateSettingsSuccess"));
      if (onUpdateSuccess) onUpdateSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật cấu hình Workspace:", error);
      toast.error(error.response?.data?.message || t("timesheets.updateSettingsFailed"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#121214] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden text-white">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-500 hover:text-white cursor-pointer transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider font-mono">
            {t("timesheets.workspaceSettingsTitle")}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
              {t("timesheets.standardHoursField")}
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="24"
              required
              value={standardHours}
              onChange={(e) => setStandardHours(e.target.value)}
              className="w-full bg-[#1A1A1C] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="border-t border-white/10 pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-md bg-white/5 text-slate-300 hover:bg-white/10 text-xs font-semibold transition-colors"
            >
              {t("activeProjects.cancelBtn")}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg disabled:opacity-40"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t("activeProjects.saving")}
                </>
              ) : (
                t("activeProjects.saveChanges")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
