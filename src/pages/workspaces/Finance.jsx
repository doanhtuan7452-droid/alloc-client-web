import { Download, Plus, ReceiptText, CheckCircle2, Clock, XCircle, MoreVertical, Wallet, PieChart, Calendar } from 'lucide-react';

export default function Finance() {
  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-800/30 text-xs px-2 py-1 rounded font-mono">ACTIVE BUDGET</span>
            <span className="text-content-muted text-sm flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> FY 2024 (Jan 1 - Dec 31)</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Budget & Expenses</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button className="flex items-center gap-2 px-4 py-2 border border-border-default rounded-md bg-surface hover:bg-element text-content-secondary transition-colors">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-500 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Plus className="w-4 h-4" /> Log Expense
          </button>
        </div>
      </div>

      {/* Metrics summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-surface border border-border-default rounded-xl p-6 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-900/20 flex items-center justify-center border border-blue-800/30">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-sm text-content-muted mb-1">Total Budget</p>
          <h2 className="text-3xl font-bold font-mono mb-2 text-white">,500,000</h2>
          <p className="text-xs text-slate-500 font-mono">Approved for Project Alpha</p>
        </div>

        <div className="bg-surface border border-border-default rounded-xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-900/20 flex items-center justify-center border border-purple-800/30">
               <PieChart className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-content-muted mb-1">Allocated Funds</p>
          <h2 className="text-3xl font-bold font-mono mb-4 text-white">,250,000</h2>
          <div className="flex items-center gap-2">
            <div className="h-1.5 bg-element rounded-full overflow-hidden flex-1">
              <div className="h-full bg-purple-400 w-[83%] rounded-full"></div>
            </div>
            <span className="text-xs text-content-muted font-mono">83%</span>
          </div>
        </div>

        <div className="bg-surface border border-border-default rounded-xl p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-lg bg-orange-900/20 flex items-center justify-center border border-orange-800/30">
              <ReceiptText className="w-5 h-5 text-orange-400" />
            </div>
          </div>
           <p className="text-sm text-content-muted mb-1">Total Spent</p>
          <h2 className="text-3xl font-bold font-mono mb-4 text-white">,000</h2>
           <div className="flex items-center gap-2">
            <div className="h-1.5 bg-element rounded-full overflow-hidden flex-1">
              <div className="h-full bg-orange-400 w-[33%] rounded-full"></div>
            </div>
            <span className="text-xs text-content-muted font-mono">33% util limits</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Category Allocations */}
        <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
           <div className="p-6 border-b border-border-default flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Budget Allocations</h3>
              <p className="text-xs text-content-muted">Distribution across categories vs actual spent.</p>
            </div>
           </div>
           <div className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 font-mono bg-inset/50 border-b border-border-default">
                  <tr>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Allocated</th>
                    <th className="px-6 py-4 font-medium">Spent</th>
                    <th className="px-6 py-4 font-medium">Remaining</th>
                    <th className="px-6 py-4 font-medium w-48">Utilization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  <tr className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4"><span className="text-content-primary font-medium">Personnel & Research</span></td>
                    <td className="px-6 py-4 font-mono text-content-secondary">,000</td>
                    <td className="px-6 py-4 font-mono text-content-secondary">,000</td>
                    <td className="px-6 py-4 font-mono text-emerald-400">,000</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-element rounded-full overflow-hidden">
                           <div className="h-full bg-blue-400 w-[30%]"></div>
                        </div>
                        <span className="text-xs font-mono text-content-muted w-8">30%</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4"><span className="text-content-primary font-medium">Infrastructure (Cloud/Compute)</span></td>
                    <td className="px-6 py-4 font-mono text-content-secondary">,000</td>
                    <td className="px-6 py-4 font-mono text-content-secondary">,000</td>
                    <td className="px-6 py-4 font-mono text-emerald-400">,000</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-element rounded-full overflow-hidden">
                           <div className="h-full bg-orange-400 w-[50%]"></div>
                        </div>
                        <span className="text-xs font-mono text-content-muted w-8">50%</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-hover/50 transition-colors">
                    <td className="px-6 py-4"><span className="text-content-primary font-medium">Travel & Symposiums</span></td>
                    <td className="px-6 py-4 font-mono text-content-secondary">,000</td>
                    <td className="px-6 py-4 font-mono text-content-secondary">,000</td>
                    <td className="px-6 py-4 font-mono text-emerald-400">,000</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-element rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-400 w-[20%]"></div>
                        </div>
                        <span className="text-xs font-mono text-content-muted w-8">20%</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
           </div>
        </div>

        {/* Expenses Records */}
        <div className="bg-surface border border-border-default rounded-xl overflow-hidden">
           <div className="p-6 border-b border-border-default flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Expense Records</h3>
              <p className="text-xs text-content-muted">Detailed transaction log matching budget expenditures.</p>
            </div>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left whitespace-nowrap">
               <thead className="text-xs text-slate-500 font-mono bg-inset/50 border-b border-border-default">
                 <tr>
                   <th className="px-6 py-4 font-medium">Exp ID</th>
                   <th className="px-6 py-4 font-medium">Date</th>
                   <th className="px-6 py-4 font-medium">Description</th>
                   <th className="px-6 py-4 font-medium">Category</th>
                   <th className="px-6 py-4 font-medium">Submitted By</th>
                   <th className="px-6 py-4 font-medium text-right">Amount</th>
                   <th className="px-6 py-4 font-medium text-center">Status</th>
                   <th className="px-6 py-4 font-medium text-center">Receipt</th>
                   <th className="px-4 py-4"></th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border-default">
                 <tr className="hover:bg-surface-hover/50 transition-colors group">
                   <td className="px-6 py-4 font-mono text-xs text-content-muted">EXP-1042</td>
                   <td className="px-6 py-4 font-mono text-xs text-content-secondary">2024-10-24</td>
                   <td className="px-6 py-4"><span className="text-content-primary">AWS Q4 Compute</span></td>
                   <td className="px-6 py-4"><span className="bg-element text-content-secondary border border-border-default text-[10px] px-2 py-0.5 rounded font-mono">Infrastructure</span></td>
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                       <img src="https://i.pravatar.cc/150?u=1" className="w-6 h-6 rounded-full border border-slate-600" alt="avatar" />
                       <span className="text-xs text-content-secondary">E. Vance</span>
                     </div>
                   </td>
                   <td className="px-6 py-4 font-mono text-right text-white">-,450.00</td>
                   <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded border border-emerald-400/20 text-[10px] font-mono"><CheckCircle2 className="w-3 h-3"/> Approved</span>
                   </td>
                   <td className="px-6 py-4 text-center">
                      <button className="text-content-muted hover:text-blue-400"><ReceiptText className="w-4 h-4 mx-auto" /></button>
                   </td>
                   <td className="px-4 py-4 text-right">
                     <button className="text-slate-500 hover:text-content-secondary opacity-0 group-hover:opacity-100"><MoreVertical className="w-4 h-4"/></button>
                   </td>
                 </tr>
                 
                 <tr className="hover:bg-surface-hover/50 transition-colors group">
                   <td className="px-6 py-4 font-mono text-xs text-content-muted">EXP-1043</td>
                   <td className="px-6 py-4 font-mono text-xs text-content-secondary">2024-10-25</td>
                   <td className="px-6 py-4"><span className="text-content-primary">London AI Symposium Flights</span></td>
                   <td className="px-6 py-4"><span className="bg-element text-content-secondary border border-border-default text-[10px] px-2 py-0.5 rounded font-mono">Travel</span></td>
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                       <img src="https://i.pravatar.cc/150?u=2" className="w-6 h-6 rounded-full border border-slate-600" alt="avatar" />
                       <span className="text-xs text-content-secondary">A. Vance</span>
                     </div>
                   </td>
                   <td className="px-6 py-4 font-mono text-right text-white">-,100.00</td>
                   <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20 text-[10px] font-mono"><Clock className="w-3 h-3"/> Pending</span>
                   </td>
                   <td className="px-6 py-4 text-center">
                      <button className="text-content-muted hover:text-blue-400"><ReceiptText className="w-4 h-4 mx-auto" /></button>
                   </td>
                    <td className="px-4 py-4 text-right">
                     <button className="text-slate-500 hover:text-content-secondary opacity-0 group-hover:opacity-100"><MoreVertical className="w-4 h-4"/></button>
                   </td>
                 </tr>

                  <tr className="hover:bg-surface-hover/50 transition-colors group">
                   <td className="px-6 py-4 font-mono text-xs text-content-muted">EXP-1044</td>
                   <td className="px-6 py-4 font-mono text-xs text-content-secondary">2024-10-20</td>
                   <td className="px-6 py-4"><span className="text-content-primary">Unapproved GPU Instance Purchase</span></td>
                   <td className="px-6 py-4"><span className="bg-element text-content-secondary border border-border-default text-[10px] px-2 py-0.5 rounded font-mono">Infrastructure</span></td>
                   <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                       <div className="w-6 h-6 bg-element text-[10px] font-bold text-content-muted flex items-center justify-center rounded-full border border-slate-600">IK</div>
                       <span className="text-xs text-content-secondary">I. Kleiner</span>
                     </div>
                   </td>
                   <td className="px-6 py-4 font-mono text-right text-white">-,500.00</td>
                   <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-400/10 px-2 py-1 rounded border border-rose-400/20 text-[10px] font-mono"><XCircle className="w-3 h-3"/> Rejected</span>
                   </td>
                   <td className="px-6 py-4 text-center">
                      <span className="text-slate-600">-</span>
                   </td>
                    <td className="px-4 py-4 text-right">
                     <button className="text-slate-500 hover:text-content-secondary opacity-0 group-hover:opacity-100"><MoreVertical className="w-4 h-4"/></button>
                   </td>
                 </tr>
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
}
