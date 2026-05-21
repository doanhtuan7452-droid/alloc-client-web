import { Filter, MoreHorizontal, Plus } from "lucide-react";
import SearchInput from "../components/ui/SearchInput";
import TaskCard from "../components/ui/TaskCard";
import BoardColumn from "../components/layout/BoardColumn";

export default function Board() {
  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-2">
            <span>WORKSPACES</span>
            <span>›</span>
            <span>Alloc</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">Data Synthesis & Review</h1>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-neutral-800 border border-black flex items-center justify-center text-xs text-white">
                AK
              </div>
              <div className="w-8 h-8 rounded-full bg-neutral-700 border border-black flex items-center justify-center text-xs text-white">
                EV
              </div>
              <div className="w-8 h-8 rounded-full bg-neutral-900 border border-black flex items-center justify-center text-xs text-white">
                +3
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <SearchInput placeholder="Search tasks..." className="w-64" />
          <button className="flex items-center gap-2 px-4 py-2 border border-neutral-800 rounded-md bg-[#0a0a0a] hover:bg-neutral-800 text-sm text-neutral-300 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start flex-1 overflow-hidden">
        {/* To Do List */}
        <BoardColumn title="To Do" count={4} ActionIcon={Plus}>
          <TaskCard 
            tags={[
              { label: "REVIEW", bgClass: "bg-emerald-900/30", textClass: "text-emerald-400", borderClass: "border-emerald-800/30" },
              { label: "HIGH PRI", bgClass: "bg-orange-900/30", textClass: "text-orange-400", borderClass: "border-orange-800/30" }
            ]}
            title="Synthesize qualitative interview transcripts (Cohort B)"
            description="Extract key themes regarding user adaptation to the new interface..."
            date="Oct 24"
            comments="2"
          />
          <TaskCard 
            tags={[
              { label: "DRAFTING", bgClass: "bg-blue-900/30", textClass: "text-blue-400", borderClass: "border-blue-800/30" }
            ]}
            title="Outline Chapter 4: Methodology constraints"
            date="Oct 25"
          />
        </BoardColumn>

        {/* In Progress List */}
        <BoardColumn title="In Progress" count={2} dotColor="bg-cyan-400" ActionIcon={MoreHorizontal}>
          <TaskCard 
            isActive={true}
            tags={[
              { label: "ANALYSIS", bgClass: "bg-purple-900/30", textClass: "text-purple-400", borderClass: "border-purple-800/30" }
            ]}
            title="Run regression models on Q3 sensor data batch"
            progress={{ label: "Model Training", percent: 65, color: "text-cyan-400", bgClass: "bg-cyan-400" }}
            date="Today"
            assignee={{ initials: "AK" }}
          />
        </BoardColumn>

        {/* Review List */}
        <BoardColumn title="Review" count={1}>
          <TaskCard 
            opacity={75}
            tags={[
              { label: "PROOFING", bgClass: "bg-neutral-800", textClass: "text-neutral-300", borderClass: "border-neutral-700" }
            ]}
            title="Peer review: Literature Review draft v2"
            statusText="Needs Feedback"
            statusColor="text-emerald-400"
          />
        </BoardColumn>
      </div>
    </div>
  );
}
