import React, { createContext, useContext, useState, useEffect } from "react";
import WorkspaceService from "../services/WorkspaceService";
import AIService from "../services/AIService";
import { useUser } from "./UserContext";

const TaskAIContext = createContext(null);

export const TaskAIProvider = ({ children }) => {
  const { currentUser } = useUser();
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [aiCacheMap, setAiCacheMap] = useState({}); // { [taskId]: resultsArray }
  const [isLoadingAI, setIsLoadingAI] = useState({}); // { [taskId]: boolean }
  const [aiError, setAiError] = useState({}); // { [taskId]: string }

  // Tự động xóa cache khi đăng xuất (currentUser thay đổi về null)
  useEffect(() => {
    if (!currentUser) {
      setAiCacheMap({});
      setIsLoadingAI({});
      setAiError({});
      setWorkspaceMembers([]);
    }
  }, [currentUser]);

  // Load danh sách thành viên của Workspace
  const fetchWorkspaceMembers = async (workspaceId) => {
    if (!workspaceId || workspaceMembers.length > 0) return;
    setIsLoadingMembers(true);
    try {
      const res = await WorkspaceService.getWorkspaceMembers(workspaceId);
      const members = res?.items || res?.data?.items || res?.data || res || [];
      setWorkspaceMembers(members);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách thành viên Workspace trong Context:", err);
      setWorkspaceMembers([]);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Gọi API lấy gợi ý từ AI
  const fetchAISuggestions = async (projectId, taskId, workspaceMemberIds) => {
    if (!projectId || !taskId) return;
    
    setIsLoadingAI((prev) => ({ ...prev, [taskId]: true }));
    setAiError((prev) => ({ ...prev, [taskId]: "" }));

    try {
      const res = await AIService.askAIAllocation({
        projectId,
        taskId,
        workspaceMemberIds
      });

      const results = res?.results || res?.data?.results || [];
      
      // Lưu kết quả vào Cache Map
      setAiCacheMap((prev) => ({
        ...prev,
        [taskId]: results
      }));

      return results;
    } catch (err) {
      console.error("Lỗi khi lấy gợi ý AI:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Không thể kết nối tới dịch vụ AI.";
      setAiError((prev) => ({ ...prev, [taskId]: errMsg }));
      throw err;
    } finally {
      setIsLoadingAI((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  // Reset cache và lỗi của một Task cụ thể
  const resetCacheForTask = (taskId) => {
    setAiCacheMap((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    setAiError((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
  };

  return (
    <TaskAIContext.Provider
      value={{
        workspaceMembers,
        isLoadingMembers,
        fetchWorkspaceMembers,
        aiCacheMap,
        isLoadingAI,
        aiError,
        fetchAISuggestions,
        setAiCacheMap,
        resetCacheForTask
      }}
    >
      {children}
    </TaskAIContext.Provider>
  );
};

export const useTaskAI = () => {
  const context = useContext(TaskAIContext);
  if (!context) {
    throw new Error("useTaskAI phải được sử dụng trong TaskAIProvider");
  }
  return context;
};
