import { Filter, MoreHorizontal, Plus } from "lucide-react";

export default function Board() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
            <span>WORKSPACES</span>
            <span>›</span>
            <span>THESIS PROJECT ALPHA</span>
          </div>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Data Synthesis & Review</h1>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 border border-[#0b0f19] flex items-center justify-center text-xs">
                AK
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-600 border border-[#0b0f19] flex items-center justify-center text-xs">
                EV
              </div>
              <div className="w-8 h-8 rounded-full bg-[#1f2937] border border-[#0b0f19] flex items-center justify-center text-xs">
                +3
              </div>
            </div>
          </div>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border border-[#1f2937] rounded-md bg-[#131b2c] hover:bg-[#1f2937] text-sm text-slate-300">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* To Do List */}
        <div className="bg-[#131b2c] rounded-xl border border-[#1f2937] flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-[#1f2937] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">To Do</h3>
              <span className="bg-[#1f2937] text-slate-300 text-xs px-2 py-0.5 rounded">
                4
              </span>
            </div>
            <button className="text-slate-400 hover:text-white">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Task Card */}
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-800/30 text-[10px] uppercase font-mono px-2 py-0.5 rounded">
                  REVIEW
                </span>
                <span className="bg-orange-900/30 text-orange-400 border border-orange-800/30 text-[10px] uppercase font-mono px-2 py-0.5 rounded">
                  HIGH PRI
                </span>
              </div>
              <h4 className="font-medium mb-2 leading-tight">
                Synthesize qualitative interview transcripts (Cohort B)
              </h4>
              <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                Extract key themes regarding user adaptation to the new
                interface...
              </p>
              <div className="flex items-center text-xs text-slate-500 gap-4 mt-auto">
                <span className="flex items-center gap-1">Oct 24</span>
                <span className="flex items-center gap-1">2</span>
              </div>
            </div>

            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-900/30 text-blue-400 border border-blue-800/30 text-[10px] uppercase font-mono px-2 py-0.5 rounded">
                  DRAFTING
                </span>
              </div>
              <h4 className="font-medium mb-2 leading-tight">
                Outline Chapter 4: Methodology constraints
              </h4>
              <div className="flex items-center text-xs text-slate-500 gap-4 mt-auto mt-4">
                <span className="flex items-center gap-1">Oct 25</span>
              </div>
            </div>
          </div>
        </div>

        {/* In Progress List */}
        <div className="bg-[#131b2c] rounded-xl border border-[#1f2937] flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-[#1f2937] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              <h3 className="font-bold text-lg">In Progress</h3>
              <span className="bg-[#1f2937] text-slate-300 text-xs px-2 py-0.5 rounded">
                2
              </span>
            </div>
            <button className="text-slate-400 hover:text-white">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Task Card Active */}
            <div className="bg-[#0b0f19] border border-cyan-500/30 rounded-lg p-4 shadow-[0_0_15px_rgba(34,211,238,0.05)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-cyan-400"></div>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-purple-900/30 text-purple-400 border border-purple-800/30 text-[10px] uppercase font-mono px-2 py-0.5 rounded">
                  ANALYSIS
                </span>
              </div>
              <h4 className="font-medium mb-4 leading-tight">
                Run regression models on Q3 sensor data batch
              </h4>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="text-slate-400 font-mono">
                    Model Training
                  </span>
                  <span className="text-cyan-400 font-mono">65%</span>
                </div>
                <div className="h-1 bg-[#1f2937] rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 w-[65%]"></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
                <span className="flex items-center gap-1 text-slate-300">
                  Today
                </span>
                <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white">
                  AK
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review List */}
        <div className="bg-[#131b2c] rounded-xl border border-[#1f2937] flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-[#1f2937] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">Review</h3>
              <span className="bg-[#1f2937] text-slate-300 text-xs px-2 py-0.5 rounded">
                1
              </span>
            </div>
          </div>

          <div className="p-4 space-y-4 overflow-y-auto">
            {/* Task Card */}
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-lg p-4 opacity-75">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#1f2937] text-slate-300 border border-slate-700 text-[10px] uppercase font-mono px-2 py-0.5 rounded">
                  PROOFING
                </span>
              </div>
              <h4 className="font-medium mb-4 leading-tight">
                Peer review: Literature Review draft v2
              </h4>
              <div className="flex items-center text-xs text-emerald-400 gap-1 mt-auto">
                <span>Needs Feedback</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
