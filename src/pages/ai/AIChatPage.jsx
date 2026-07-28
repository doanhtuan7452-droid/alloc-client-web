import { useSearchParams } from "react-router-dom";
import AIChatPanelContainer from "../../features/ai-chat/components/AIChatPanelContainer";

/**
 * Trang chính tương tác AI Copilot Chat
 */
export default function AIChatPage() {
  const [searchParams] = useSearchParams();
  const workspaceIdParam = searchParams.get("workspaceId");
  const projectIdParam = searchParams.get("projectId");
  const initialWorkspaceId = workspaceIdParam ? Number(workspaceIdParam) : null;
  const initialProjectId = projectIdParam ? Number(projectIdParam) : null;

  return (
    <div className="flex-1 h-full w-full overflow-hidden">
      <AIChatPanelContainer
        initialWorkspaceId={initialWorkspaceId}
        initialProjectId={initialProjectId}
      />
    </div>
  );
}
