import { Download, Search, AlertTriangle, Calendar } from "lucide-react";

export default function Team() {
  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team Overview</h1>
          <p className="text-slate-400 text-sm">
            Manage member roles, skills, and organizational risks.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-[#1f2937] rounded-md bg-[#131b2c] hover:bg-[#1f2937] text-sm text-slate-300">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Core Team */}
        <div className="col-span-2 bg-[#131b2c] border border-[#1f2937] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h3 className="font-bold">Core Team</h3>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search members..."
                className="bg-[#0b0f19] border border-[#1f2937] rounded-md pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-blue-500 w-48 text-slate-300"
              />
            </div>
          </div>

          <div className="space-y-4">
            {/* Member */}
            <div className="flex items-center justify-between p-3 hover:bg-[#1a2333]/50 rounded-lg transition-colors border border-transparent hover:border-[#1f2937]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600">
                  <img
                    src="https://i.pravatar.cc/150?u=1"
                    alt="EV"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-slate-200">
                    Dr. Elias Vance
                  </h4>
                  <p className="text-xs text-slate-500">Lead Researcher</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="bg-blue-900/20 text-blue-400 border border-blue-800/30 text-[10px] px-2 py-1 rounded font-mono">
                  Quantum Dynamics
                </span>
                <span className="bg-purple-900/20 text-purple-400 border border-purple-800/30 text-[10px] px-2 py-1 rounded font-mono">
                  Data Synth
                </span>
              </div>
            </div>

            {/* Member */}
            <div className="flex items-center justify-between p-3 hover:bg-[#1a2333]/50 rounded-lg transition-colors border border-transparent hover:border-[#1f2937]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden border-2 border-slate-600">
                  <img
                    src="https://i.pravatar.cc/150?u=2"
                    alt="AV"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium text-slate-200">Dr. Alyx Vance</h4>
                  <p className="text-xs text-slate-500">Data Scientist</p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="bg-emerald-900/20 text-emerald-400 border border-emerald-800/30 text-[10px] px-2 py-1 rounded font-mono">
                  ML Models
                </span>
                <span className="bg-[#1f2937] text-slate-300 border border-slate-700 text-[10px] px-2 py-1 rounded font-mono">
                  Python
                </span>
              </div>
            </div>

            {/* Member */}
            <div className="flex items-center justify-between p-3 hover:bg-[#1a2333]/50 rounded-lg transition-colors border border-transparent hover:border-[#1f2937]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#1f2937] flex items-center justify-center text-slate-400 text-sm border-2 border-slate-700">
                  IK
                </div>
                <div>
                  <h4 className="font-medium text-slate-200">Isaac Kleiner</h4>
                  <p className="text-xs text-slate-500">
                    Theoretical Physicist
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <span className="bg-[#1f2937] text-slate-400 border border-slate-700 text-[10px] px-2 py-1 rounded font-mono">
                  Anomalous Materials
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Inbox */}
        <div className="bg-[#131b2c] border border-[#1f2937] rounded-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold">Leave Inbox</h3>
            </div>
            <span className="bg-orange-900/20 text-orange-400 border border-orange-800/30 text-[10px] uppercase font-mono px-2 py-0.5 rounded">
              2 Pending
            </span>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {/* Request 1 */}
            <div className="bg-[#0b0f19] border border-[#1f2937] p-3 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium text-slate-200">
                  Barney Calhoun
                </h4>
                <span className="text-[10px] font-mono text-emerald-400">
                  Sick Leave
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mb-3">
                Oct 12 - Oct 14
              </p>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 text-xs border border-[#1f2937] rounded bg-[#131b2c] text-slate-400 hover:text-white hover:bg-[#1a2333]">
                  Deny
                </button>
                <button className="flex-1 py-1.5 text-xs bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded hover:bg-blue-600/30">
                  Approve
                </button>
              </div>
            </div>

            {/* Request 2 */}
            <div className="bg-[#0b0f19] border border-[#1f2937] p-3 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium text-slate-200">
                  Wallace Breen
                </h4>
                <span className="text-[10px] font-mono text-slate-400 bg-[#1f2937] px-1.5 rounded">
                  PTO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mb-3">
                Nov 01 - Nov 15
              </p>
              <div className="flex gap-2">
                <button className="flex-1 py-1.5 text-xs border border-[#1f2937] rounded bg-[#131b2c] text-slate-400 hover:text-white hover:bg-[#1a2333]">
                  Deny
                </button>
                <button className="flex-1 py-1.5 text-xs bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded hover:bg-blue-600/30">
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Heatmap */}
      <div className="bg-[#131b2c] border border-[#1f2937] rounded-xl p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-white">Risk Heatmap</h3>
          </div>
          <div className="flex gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>{" "}
              Critical
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>{" "}
              Moderate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Low
            </span>
          </div>
        </div>

        <div className="relative">
          {/* Y axis */}
          <div className="absolute -left-6 top-0 bottom-8 w-6 flex items-center justify-center">
            <span className="text-[10px] text-slate-500 font-mono -rotate-90 tracking-widest whitespace-nowrap">
              PROBABILITY
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* High Prob */}
            <div className="bg-[#1f2937]/50 rounded-lg p-6 flex flex-col items-center justify-center border border-transparent hover:border-[#1f2937] transition-colors h-32">
              <span className="text-4xl font-bold font-mono text-purple-300">
                2
              </span>
              <span className="text-xs text-slate-400 font-mono mt-2">
                Med Risk
              </span>
            </div>
            <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-purple-900/30 transition-colors h-32">
              <span className="text-4xl font-bold font-mono text-purple-400">
                5
              </span>
              <span className="text-xs text-purple-300/70 font-mono mt-2">
                High Risk
              </span>
            </div>
            <div className="bg-rose-900/20 border border-rose-800/30 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-rose-900/30 transition-colors h-32 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
              <span className="text-4xl font-bold font-mono text-rose-400">
                1
              </span>
              <span className="text-xs text-rose-300/70 font-mono mt-2">
                Critical
              </span>
            </div>

            {/* Med Prob */}
            <div className="bg-emerald-900/10 border border-emerald-800/20 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-emerald-900/20 transition-colors h-32">
              <span className="text-4xl font-bold font-mono text-emerald-400">
                4
              </span>
              <span className="text-xs text-emerald-300/70 font-mono mt-2">
                Low Risk
              </span>
            </div>
            <div className="bg-[#1f2937]/50 rounded-lg p-6 flex flex-col items-center justify-center border border-transparent hover:border-[#1f2937] transition-colors h-32">
              <span className="text-4xl font-bold font-mono text-purple-300">
                3
              </span>
              <span className="text-xs text-slate-400 font-mono mt-2">
                Med Risk
              </span>
            </div>
            <div className="bg-[#1f2937]/50 rounded-lg p-6 flex flex-col items-center justify-center border border-transparent hover:border-[#1f2937] transition-colors h-32">
              <span className="text-4xl font-bold font-mono text-slate-300">
                2
              </span>
              <span className="text-xs text-slate-400 font-mono mt-2">
                High Risk
              </span>
            </div>

            {/* Low Prob */}
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-lg p-6 flex flex-col items-center justify-center opacity-50 h-32">
              <span className="text-4xl font-bold font-mono text-slate-600">
                0
              </span>
            </div>
            <div className="bg-emerald-900/10 border border-emerald-800/20 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-emerald-900/20 transition-colors h-32">
              <span className="text-4xl font-bold font-mono text-emerald-400">
                1
              </span>
              <span className="text-xs text-emerald-300/70 font-mono mt-2">
                Low Risk
              </span>
            </div>
            <div className="bg-[#0b0f19] border border-[#1f2937] rounded-lg p-6 flex flex-col items-center justify-center opacity-50 h-32">
              <span className="text-4xl font-bold font-mono text-slate-600">
                0
              </span>
            </div>
          </div>

          {/* X axis */}
          <div className="grid grid-cols-3 gap-4 text-center mt-2">
            <span className="text-[10px] text-slate-500 font-mono tracking-widest">
              LOW IMPACT
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest">
              MED IMPACT
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-widest">
              HIGH IMPACT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
