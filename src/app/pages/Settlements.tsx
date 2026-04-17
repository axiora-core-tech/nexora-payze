import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Landmark, ArrowRightLeft, Calendar, FileDown, CheckCircle2, AlertCircle, Clock, FileSearch, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { settlementsService } from "../../services";
import { useAsync } from "../../hooks/useAsync";
import { Skeleton, ErrorState } from "../components/Loaders";

export function SettlementsPage() {
  const [tab, setTab] = useState<"batches" | "config">("batches");
  const [reconciling, setReconciling] = useState<string | null>(null);
  const { data, loading, error, refetch } = useAsync(() => settlementsService.getAll(), []);

  if (error) return <ErrorState message="Couldn't load settlements" onRetry={refetch} />;
  const batches = data?.batches ?? [];
  const schedules = data?.schedules ?? [];
  const accounts = data?.payout_accounts ?? [];
  void accounts;
  const summary = data?.summary;
  const reconSummary = data?.reconciliation_summary;


  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 mt-4 relative">
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-emerald-100/40 to-teal-100/40 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-50 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100/50">
            <Landmark size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-900 mb-4">Settlements.</h1>
          <p className="text-stone-500 max-w-md text-lg leading-relaxed">
            Manage daily payouts, configure settlement schedules, and reconcile batches.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-sm font-medium text-stone-500 uppercase tracking-wider">Next Payout</span>
          <div className="text-2xl font-light text-stone-900">
            {loading || !summary ? <Skeleton className="w-32 h-7" /> : summary.next_payout_amount}
          </div>
          <span className="text-xs text-stone-400">Scheduled for {summary?.next_payout_time ?? "—"}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-stone-100/50 p-1.5 rounded-full w-fit border border-stone-200/50">
        {[
          { id: "batches", label: "Settlement Batches", icon: ArrowRightLeft },
          { id: "config", label: "Payout Configuration", icon: Calendar }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all ${
              tab === t.id 
                ? "bg-white text-stone-900 shadow-sm border border-stone-200/50" 
                : "text-stone-500 hover:text-stone-700 hover:bg-stone-200/30"
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === "batches" ? (
          <motion.div key="batches" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[40px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[500px]">
              
              <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-6">
                <h3 className="text-xl font-medium text-stone-800">Recent Batches</h3>
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                    <input type="text" placeholder="Search batch ID or UTR..." className="bg-stone-50 border-none rounded-full pl-10 pr-6 py-2.5 text-sm text-stone-700 outline-none w-64 focus:ring-2 focus:ring-stone-200" />
                  </div>
                  <button onClick={() => toast.info('Filters applied')} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-sm transition-colors">
                    <Filter size={16} /> Filter
                  </button>
                </div>
              </div>

              <table className="w-full text-left">
                <thead className="text-stone-500 text-sm font-medium uppercase tracking-wider">
                  <tr>
                    <th className="pb-4 font-normal">Date & Batch ID</th>
                    <th className="pb-4 font-normal">Transactions</th>
                    <th className="pb-4 font-normal">Gross Amount</th>
                    <th className="pb-4 font-normal">Fees & Tax</th>
                    <th className="pb-4 font-normal">Net Settled</th>
                    <th className="pb-4 font-normal text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  <AnimatePresence>
                    {loading ? (
                      <>
                        {[1, 2, 3, 4].map(i => (
                          <tr key={`sk-${i}`}><td colSpan={6} className="py-4"><Skeleton className="w-full h-12" /></td></tr>
                        ))}
                      </>
                    ) : (
                      batches.map((row: any, i: number) => (
                      <motion.tr 
                        key={row.id} 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="hover:bg-stone-50/50 transition-colors group"
                      >
                        <td className="py-5">
                          <p className="font-medium text-stone-800">{row.date}</p>
                          <p className="text-xs text-stone-500 font-mono mt-1">{row.id}</p>
                        </td>
                        <td className="py-5 text-stone-600 font-medium">{row.txns.toLocaleString()}</td>
                        <td className="py-5 text-stone-600">{row.gross}</td>
                        <td className="py-5 text-rose-500">{row.fees}</td>
                        <td className="py-5 font-medium text-stone-900 text-lg">{row.net}</td>
                        <td className="py-5 text-right">
                           <div className="flex flex-col items-end gap-2">
                             {row.status === 'Settled' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-widest text-emerald-600 bg-emerald-50"><CheckCircle2 size={14} /> Settled</span>}
                             {row.status === 'Pending' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-widest text-orange-600 bg-orange-50"><Clock size={14} /> Processing</span>}
                             {row.status === 'Failed' && <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-widest text-rose-600 bg-rose-50"><AlertCircle size={14} /> Failed</span>}
                             
                             <div className="flex items-center gap-4">
                                <span className="text-xs text-stone-400 font-mono">{row.utr}</span>
                                <button 
                                  onClick={() => setReconciling(row.id)}
                                  className="text-stone-400 hover:text-stone-900 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <FileSearch size={18} />
                                </button>
                             </div>
                           </div>
                        </td>
                      </motion.tr>
                    ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>

            </div>

            {/* Simulated Reconciliation Modal */}
            <AnimatePresence>
              {reconciling && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAFAF8]/90 backdrop-blur-xl p-6"
                >
                   <motion.div 
                     initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                     className="w-full max-w-4xl bg-white border border-stone-200 rounded-[40px] shadow-[0_20px_60px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col max-h-[85vh]"
                   >
                     <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
                        <div>
                          <h2 className="text-2xl font-light text-stone-900 mb-1">Reconciliation Report</h2>
                          <p className="text-stone-500 text-sm font-mono">Batch: {reconciling}</p>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={() => toast.success('Downloading CSV...', { description: 'Your file will be ready shortly.' })} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-stone-200 text-stone-700 font-medium text-sm hover:bg-stone-50 shadow-sm transition-colors">
                            <FileDown size={16} /> Download CSV
                          </button>
                          <button onClick={() => setReconciling(null)} className="px-6 py-2.5 rounded-full bg-stone-900 text-white font-medium text-sm hover:bg-stone-800 transition-colors shadow-sm">
                            Close
                          </button>
                        </div>
                     </div>
                     <div className="p-8 grid grid-cols-3 gap-6 border-b border-stone-100 bg-white">
                        <div className="p-6 rounded-3xl bg-stone-50 border border-stone-100">
                          <p className="text-sm text-stone-500 mb-1">Matched Transactions</p>
                          <p className="text-3xl font-light text-stone-900">{reconSummary?.matched ?? "—"}</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                          <p className="text-sm text-emerald-600/80 mb-1">Total Net Validated</p>
                          <p className="text-3xl font-light">{reconSummary?.net_validated ?? "—"}</p>
                        </div>
                        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 text-rose-900">
                          <p className="text-sm text-rose-600/80 mb-1">Unmatched Variance</p>
                          <p className="text-3xl font-light">{reconSummary?.unmatched_variance ?? "—"}</p>
                        </div>
                     </div>
                     <div className="flex-1 overflow-y-auto p-8">
                       <table className="w-full text-left">
                          <thead className="text-stone-400 text-xs font-medium uppercase tracking-wider sticky top-0 bg-white">
                            <tr>
                              <th className="pb-4">Transaction ID</th>
                              <th className="pb-4">Time</th>
                              <th className="pb-4">Amount</th>
                              <th className="pb-4">MDR Deduction</th>
                              <th className="pb-4">Net Contribution</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-50">
                            {Array.from({length: 15}).map((_, i) => (
                              <tr key={`txn-${i}`} className="text-sm text-stone-600 hover:bg-stone-50">
                                <td className="py-3 font-mono">TXN-9{8234 - i}</td>
                                <td className="py-3 text-stone-400">10:{45 - i} AM</td>
                                <td className="py-3 font-medium text-stone-800">${(Math.random() * 100 + 10).toFixed(2)}</td>
                                <td className="py-3 text-rose-500">-${(Math.random() * 2 + 0.5).toFixed(2)}</td>
                                <td className="py-3 font-medium text-stone-900 text-right">${(Math.random() * 98 + 9).toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                       </table>
                     </div>
                   </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : tab === "config" ? (
          <motion.div key="config" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[40px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
                <h3 className="text-2xl font-light text-stone-800">Settlement Schedule</h3>
                
                <div className="space-y-4">
                  {schedules.map((s: any, i: number) => (
                    <div key={`sched-${i}`} className={`border rounded-3xl p-6 cursor-pointer transition-all ${s.active ? 'border-emerald-500 bg-emerald-50/20 shadow-sm' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
                       <div className="flex justify-between items-start mb-2">
                         <h4 className={`font-medium ${s.active ? 'text-emerald-900' : 'text-stone-800'}`}>{s.title}</h4>
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${s.active ? 'border-emerald-500 bg-emerald-500' : 'border-stone-300'}`}>
                           {s.active && <div className="w-2 h-2 bg-white rounded-full" />}
                         </div>
                       </div>
                       <p className="text-sm text-stone-500 mb-4">{s.desc}</p>
                       <p className="text-xs font-medium uppercase tracking-wider text-stone-400">{s.fee}</p>
                    </div>
                  ))}
                </div>
             </div>

             <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[40px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
                <div className="flex justify-between items-center border-b border-stone-100 pb-6">
                  <h3 className="text-2xl font-light text-stone-800">Payout Accounts</h3>
                  <button onClick={() => toast.info('Add bank account', { description: 'Opening account verification flow.' })} className="text-sm font-medium text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full hover:bg-emerald-100 transition-colors">
                    Add Account
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-medium uppercase tracking-widest px-3 py-1 rounded-bl-xl">Primary</div>
                    <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">HDFC Bank • Current</p>
                    <p className="text-xl font-mono text-stone-800 tracking-widest mb-4">•••• 8923</p>
                    <div className="flex justify-between items-end border-t border-stone-200/60 pt-4">
                      <div>
                        <p className="text-sm font-medium text-stone-900">Acme Corp Ltd</p>
                        <p className="text-xs text-stone-500">IFSC: HDFC0000123</p>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    </div>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-3xl p-6">
                    <p className="text-xs text-stone-500 uppercase tracking-widest mb-1">ICICI Bank • Savings</p>
                    <p className="text-xl font-mono text-stone-800 tracking-widest mb-4">•••• 4412</p>
                    <div className="flex justify-between items-end border-t border-stone-100 pt-4">
                      <div>
                        <p className="text-sm font-medium text-stone-900">John Doe</p>
                        <p className="text-xs text-stone-500">IFSC: ICIC0000456</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => toast.success('Primary account updated')} className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors">Make Primary</button>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

    </div>
  );
}
