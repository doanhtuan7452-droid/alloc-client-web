import { Search, Filter, MoreVertical, Plus } from "lucide-react";

export default function ActiveProjects() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
            <span>WORKSPACES</span>
            <span>›</span>
            <span className="text-blue-400">WORKSPACE A</span>
          </div>
          <h1 className="text-3xl font-bold">Active Projects</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="bg-[#131b2c] border border-[#1f2937] rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
          <button className="p-2 border border-[#1f2937] rounded-md bg-[#131b2c] hover:bg-[#1f2937] text-slate-300">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Project Card 1 */}
        <div className="bg-[#131b2c] border border-[#1f2937] rounded-xl p-6 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
          <div className="flex justify-between items-start mb-4">
            <span className="bg-[#1f2937] text-slate-300 text-xs px-2 py-1 rounded flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>{" "}
              RESEARCH PHASE
            </span>
            <button className="text-slate-400 hover:text-white">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-bold mb-2">Neural Net Optimization</h2>
          <p className="text-sm text-slate-400 mb-6 flex-1">
            Investigating gradient descent algorithms in deep learning models...
          </p>
          <div className="space-y-4 text-sm mt-auto">
            <div className="flex justify-between">
              <span className="text-slate-400">Expected Budget</span>
              <span className="font-mono text-emerald-400 font-medium">
                $145,000
              </span>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-400">Completion</span>
                <span className="font-mono text-cyan-400">45%</span>
              </div>
              <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 w-[45%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Card 2 */}
        <div className="bg-[#131b2c] border border-[#1f2937] rounded-xl p-6 flex flex-col relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <span className="bg-[#1f2937] text-slate-300 text-xs px-2 py-1 rounded flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>{" "}
              WRITING PHASE
            </span>
            <button className="text-slate-400 hover:text-white">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-xl font-bold mb-2">Genomics Study</h2>
          <p className="text-sm text-slate-400 mb-6 flex-1">
            Analyzing CRISPR-Cas9 off-target effects in mammalian cell lines
            usin...
          </p>
          <div className="space-y-4 text-sm mt-auto">
            <div className="flex justify-between">
              <span className="text-slate-400">Expected Budget</span>
              <span className="font-mono text-emerald-400 font-medium">
                $320,000
              </span>
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-400">Completion</span>
                <span className="font-mono text-purple-400">82%</span>
              </div>
              <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 w-[82%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Project Card */}
        <div className="border border-dashed border-[#1f2937] hover:border-slate-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[300px]">
          <div className="w-12 h-12 rounded-full bg-[#1f2937] flex items-center justify-center mb-4">
            <Plus className="w-6 h-6 text-slate-400" />
          </div>
          <span className="text-slate-300 font-medium">Create New Project</span>
        </div>
      </div>
    </div>
  );
}
