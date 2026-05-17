import { Download, ArrowRight } from "lucide-react";

export default function Finance() {
  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Finance & Budget</h1>
          <p className="text-slate-400 text-sm">
            Real-time telemetry on project runway, burn metrics, and capital
            allocation.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button className="flex items-center gap-2 px-4 py-2 border border-[#1f2937] rounded-md bg-[#131b2c] hover:bg-[#1f2937] text-slate-300">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="px-4 py-2 bg-blue-100/10 text-blue-200 border border-blue-500/30 rounded-md font-medium hover:bg-blue-100/20">
            Fund allocation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Expected Budget */}
        <div className="bg-[#131b2c] border border-[#1f2937] rounded-xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#1f2937] flex items-center justify-center border border-slate-700">
              <span className="text-slate-400 font-mono">C</span>
            </div>
            <span className="bg-blue-900/30 text-blue-400 border border-blue-800/30 text-[10px] uppercase font-mono px-2 py-0.5 rounded">
              FY24 Target
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-1">Expected Budget</p>
          <h2 className="text-3xl font-bold font-mono mb-4 text-white">
            $1,250,000
          </h2>
          <p className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
            <span className="text-emerald-500">↗ +2.4%</span> vs last quarter
          </p>
        </div>

        {/* Actual Expenses */}
        <div className="bg-[#131b2c] border border-[#1f2937] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#1f2937] flex items-center justify-center border border-slate-700">
              <span className="text-slate-400 font-mono">E</span>
            </div>
            <span className="bg-[#1f2937] text-slate-400 border border-slate-700 text-[10px] uppercase font-mono px-2 py-0.5 rounded">
              YTD
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-1">Actual Expenses</p>
          <h2 className="text-3xl font-bold font-mono mb-4 text-white">
            $842,300
          </h2>
          <p className="text-xs text-orange-400 flex items-center gap-1 font-mono">
            <span>↗ +12.1%</span> burn rate accelerating
          </p>
        </div>

        {/* Revenue */}
        <div className="bg-[#131b2c] border border-[#1f2937] rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#1f2937] flex items-center justify-center border border-slate-700 text-emerald-400 font-bold">
              $
            </div>
            <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-800/30 text-[10px] uppercase font-mono px-2 py-0.5 rounded">
              Secured
            </span>
          </div>
          <p className="text-sm text-slate-400 mb-1">Revenue & Grants</p>
          <h2 className="text-3xl font-bold font-mono mb-6 text-white">
            $950,000
          </h2>
          <div className="flex items-center gap-2">
            <div className="h-1 bg-[#1f2937] rounded-full overflow-hidden flex-1">
              <div className="h-full bg-emerald-400 w-[76%] rounded-full"></div>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              76% of Goal
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Chart */}
        <div className="col-span-2 bg-[#131b2c] border border-[#1f2937] rounded-xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold mb-1">Burn Rate Trajectory</h3>
              <p className="text-xs text-slate-400 font-mono">
                Monthly expenditure vs projected runway
              </p>
            </div>
            <div className="flex gap-1 bg-[#0b0f19] p-1 rounded-md border border-[#1f2937]">
              <button className="px-3 py-1 text-xs font-mono text-slate-400 hover:text-white rounded">
                1M
              </button>
              <button className="px-3 py-1 text-xs font-mono bg-[#1f2937] text-white rounded">
                6M
              </button>
              <button className="px-3 py-1 text-xs font-mono text-slate-400 hover:text-white rounded">
                YTD
              </button>
            </div>
          </div>
          {/* Chart placeholder */}
          <div className="h-[200px] border-l border-b border-[#1f2937] relative flex items-end">
            {/* Y axis */}
            <div className="absolute -left-12 top-0 bottom-0 flex flex-col justify-between text-[10px] text-slate-500 font-mono py-2">
              <span>$150k</span>
              <span>$100k</span>
              <span>$50k</span>
              <span>$0</span>
            </div>
            {/* X axis */}
            <div className="absolute left-0 -bottom-6 w-full flex justify-between text-[10px] text-slate-500 font-mono px-4">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span className="text-cyan-400">Jun</span>
            </div>
            {/* Curve */}
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <path
                d="M0,80 Q30,60 50,70 T100,20"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2"
              />
              <path
                d="M0,80 Q30,60 50,70 T100,20 L100,100 L0,100 Z"
                fill="url(#gradient)"
                opacity="0.1"
              />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-[#131b2c] border border-[#1f2937] rounded-xl p-6">
          <h3 className="font-bold mb-8">Allocation Breakdown</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-blue-300">Personnel & Research</span>
                <span className="text-slate-400">65%</span>
              </div>
              <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 w-[65%] rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-purple-300">
                  Infrastructure (Cloud/Compute)
                </span>
                <span className="text-slate-400">22%</span>
              </div>
              <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 w-[22%] rounded-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-emerald-300">Travel & Symposiums</span>
                <span className="text-slate-400">13%</span>
              </div>
              <div className="h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 w-[13%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Entries */}
      <div className="bg-[#131b2c] border border-[#1f2937] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold">Ledger Entries</h3>
          <button className="text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 font-mono border-b border-[#1f2937]">
            <tr>
              <th className="pb-3 font-normal">Date</th>
              <th className="pb-3 font-normal">Description</th>
              <th className="pb-3 font-normal">Classification</th>
              <th className="pb-3 font-normal text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1f2937]">
            <tr className="group hover:bg-[#1a2333]/50">
              <td className="py-4 font-mono text-slate-400">2023-10-24</td>
              <td className="py-4 text-slate-300">
                AWS Cloud Infrastructure - Q4 Compute
              </td>
              <td className="py-4">
                <span className="bg-purple-900/20 text-purple-400 border border-purple-800/30 text-[10px] px-2 py-0.5 rounded font-mono">
                  Infrastructure
                </span>
              </td>
              <td className="py-4 text-right font-mono text-white">
                -$12,450.00
              </td>
            </tr>
            <tr className="group hover:bg-[#1a2333]/50">
              <td className="py-4 font-mono text-slate-400">2023-10-22</td>
              <td className="py-4 text-slate-300">
                NSF Grant Disbursement - Phase 2
              </td>
              <td className="py-4">
                <span className="bg-emerald-900/20 text-emerald-400 border border-emerald-800/30 text-[10px] px-2 py-0.5 rounded font-mono">
                  Grant Funding
                </span>
              </td>
              <td className="py-4 text-right font-mono text-emerald-400">
                +$250,000.00
              </td>
            </tr>
            <tr className="group hover:bg-[#1a2333]/50">
              <td className="py-4 font-mono text-slate-400">2023-10-18</td>
              <td className="py-4 text-slate-300">
                Lab Equipment Procurement (Spectrometer)
              </td>
              <td className="py-4">
                <span className="bg-[#1f2937] text-slate-400 border border-slate-700 text-[10px] px-2 py-0.5 rounded font-mono">
                  Research H/W
                </span>
              </td>
              <td className="py-4 text-right font-mono text-white">
                -$45,200.00
              </td>
            </tr>
            <tr className="group hover:bg-[#1a2333]/50">
              <td className="py-4 font-mono text-slate-400">2023-10-15</td>
              <td className="py-4 text-slate-300">
                Quarterly Research Stipends (Grad Team)
              </td>
              <td className="py-4">
                <span className="bg-blue-900/20 text-blue-400 border border-blue-800/30 text-[10px] px-2 py-0.5 rounded font-mono">
                  Personnel
                </span>
              </td>
              <td className="py-4 text-right font-mono text-white">
                -$82,000.00
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
