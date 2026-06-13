import { Filter, Search } from "lucide-react";

export default function Gantt() {
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-element text-purple-400 text-xs px-2 py-1 rounded font-mono">
              Phase 3
            </span>
            <span className="text-content-muted text-sm flex items-center gap-1">
              Q4 2024
            </span>
          </div>
          <h1 className="text-3xl font-bold">Data Analysis Pipeline</h1>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-border-default rounded-md bg-surface hover:bg-element text-sm text-content-secondary">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-border-default rounded-md bg-surface hover:bg-element text-sm text-content-secondary">
            <Search className="w-4 h-4" /> Zoom: Months
          </button>
        </div>
      </div>

      <div className="bg-surface border border-border-default rounded-xl flex-1 overflow-hidden flex flex-col">
        {/* Gantt Header */}
        <div className="flex border-b border-border-default">
          <div className="w-[350px] p-4 border-r border-border-default flex items-center justify-between bg-header">
            <span className="text-sm font-mono text-content-muted">
              Task Details
            </span>
            <Filter className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex-1 flex text-xs font-mono text-content-muted text-center">
            {/* Oct */}
            <div className="flex-1 border-r border-border-default">
              <div className="py-2 border-b border-border-default">Oct 2024</div>
              <div className="flex bg-inset">
                <div className="flex-1 py-2 border-r border-border-default/50">
                  W1
                </div>
                <div className="flex-1 py-2 border-r border-border-default/50">
                  W2
                </div>
                <div className="flex-1 py-2 border-r border-border-default/50">
                  W3
                </div>
                <div className="flex-1 py-2">W4</div>
              </div>
            </div>
            {/* Nov */}
            <div className="flex-1 border-r border-border-default">
              <div className="py-2 border-b border-border-default">Nov 2024</div>
              <div className="flex bg-inset">
                <div className="flex-1 py-2 border-r border-border-default/50">
                  W1
                </div>
                <div className="flex-1 py-2 border-r border-border-default/50">
                  W2
                </div>
                <div className="flex-1 py-2 border-r border-border-default/50">
                  W3
                </div>
                <div className="flex-1 py-2">W4</div>
              </div>
            </div>
            {/* Dec */}
            <div className="flex-1">
              <div className="py-2 border-b border-border-default text-content-secondary">
                Dec 2024
              </div>
              <div className="flex bg-surface">
                <div className="flex-1 py-2 border-r border-border-default/50">
                  W1
                </div>
                <div className="flex-1 py-2 border-r border-border-default/50 text-white font-bold bg-element/50 relative">
                  W2
                  <div className="absolute left-1/2 top-full h-[500px] w-px bg-cyan-400/50 -translate-x-1/2 z-10 pointer-events-none"></div>
                  <div className="absolute left-1/2 bottom-0 w-2 h-2 rounded-full bg-cyan-400 -translate-x-1/2 translate-y-1/2 z-10"></div>
                </div>
                <div className="flex-1 py-2 border-r border-border-default/50 text-content-secondary">
                  W3
                </div>
                <div className="flex-1 py-2 text-content-secondary">W4</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gantt Body */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Task 1 */}
          <div className="flex border-b border-border-default/50 hover:bg-surface-hover">
            <div className="w-[350px] p-4 border-r border-border-default flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs">
                  A
                </div>
                <span className="text-sm font-medium text-content-primary">
                  Clean Dataset Alpha
                </span>
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">
                AK
              </div>
            </div>
            <div className="flex-1 relative bg-inset/30 border-r border-border-default last:border-0 grid grid-cols-12">
              {/* Grid lines */}
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="border-r border-border-default/30 h-full"
                ></div>
              ))}
              {/* Bar */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[25%] right-[50%] h-8 bg-blue-500/30 border border-blue-500/50 rounded-full flex items-center pl-3">
                <span className="text-xs font-mono text-white">100%</span>
              </div>
            </div>
          </div>

          {/* Task 2 */}
          <div className="flex border-b border-border-default/50 hover:bg-surface-hover">
            <div className="w-[350px] p-4 pl-8 border-r border-border-default flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-slate-500">└</span>
                <span className="text-sm text-content-secondary">
                  Normalize Variables
                </span>
              </div>
              <div className="w-6 h-6 rounded-full bg-element text-content-muted flex items-center justify-center text-[10px]">
                AK
              </div>
            </div>
            <div className="flex-1 relative bg-inset/30 border-r border-border-default last:border-0 grid grid-cols-12">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="border-r border-border-default/30 h-full"
                ></div>
              ))}
              {/* Bar */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[58%] right-[25%] h-8 bg-purple-500/30 border border-purple-500/50 rounded-full flex items-center overflow-hidden">
                <div className="h-full bg-purple-500/40 w-[60%] flex items-center pl-3">
                  <span className="text-xs font-mono text-white">60%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Task 3 */}
          <div className="flex border-b border-border-default/50 hover:bg-surface-hover bg-inset/20">
            <div className="w-[350px] p-4 border-r border-border-default flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">
                  Il
                </div>
                <span className="text-sm font-medium text-white">
                  Run Regression Models
                </span>
              </div>
              <div className="w-6 h-6 rounded-full bg-element text-content-muted flex items-center justify-center text-[10px]">
                MJ
              </div>
            </div>
            <div className="flex-1 relative border-r border-border-default last:border-0 grid grid-cols-12">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className={`border-r border-border-default/30 h-full ${i === 9 ? "bg-cyan-900/10" : ""}`}
                ></div>
              ))}
              {/* Bar */}
              <div className="absolute top-1/2 -translate-y-1/2 left-[83%] right-[-10%] h-8 border border-cyan-400/50 rounded-l-full flex items-center overflow-hidden">
                <div className="h-full bg-cyan-500/20 w-[10%] min-w-[40px] flex items-center pl-3 relative border-r border-cyan-400/50">
                  <span className="text-xs font-mono text-cyan-300">10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Task 4 */}
          <div className="flex border-b border-border-default/50 hover:bg-surface-hover">
            <div className="w-[350px] p-4 pl-8 border-r border-border-default flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-slate-500">└</span>
                <span className="text-sm text-content-secondary">
                  Draft Methodology
                </span>
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px]">
                EV
              </div>
            </div>
            <div className="flex-1 relative bg-inset/30 border-r border-border-default last:border-0 grid grid-cols-12">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="border-r border-border-default/30 h-full"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
