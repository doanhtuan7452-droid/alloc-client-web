import Skeleton from "./Skeleton";
import { Sparkles } from "lucide-react";

export default function AiThinkingSkeleton() {
  return (
    <div className="flex gap-3 max-w-xl mr-auto animate-fadeIn">
      {/* Bot Icon with pulse */}
      <div className="w-7 h-7 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 animate-pulse">
        <Sparkles className="w-4 h-4" />
      </div>
      
      {/* Chat bubble skeleton with staggered text lines */}
      <div className="p-4 rounded-2xl bg-purple-950/10 border border-purple-900/20 text-xs text-purple-300 flex-1 space-y-2.5 min-w-[200px] md:min-w-[300px]">
        <div className="flex items-center gap-2 mb-1">
          <Skeleton variant="rect" className="h-3.5 w-24 bg-purple-400/20" />
        </div>
        <Skeleton variant="text" className="h-3 w-full bg-purple-400/10" />
        <Skeleton variant="text" className="h-3 w-[85%] bg-purple-400/10" />
        <Skeleton variant="text" className="h-3 w-[60%] bg-purple-400/10" />
      </div>
    </div>
  );
}
