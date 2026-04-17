import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Repeat, CreditCard, ScanLine, Play, Pause, XOctagon, Plus, Calendar, RotateCcw } from "lucide-react";

export function SubscriptionsPage() {
  const [tab, setTab] = useState<"upi" | "nach">("upi");

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 mt-4 relative">
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-purple-100/40 to-blue-100/40 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-50 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[28px] bg-stone-100 flex items-center justify-center text-stone-900 mb-2 border border-stone-200/50 shrink-0 shadow-sm">
            <Repeat size={36} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-900 mb-2">Mandates & Auto-Pay.</h1>
            <p className="text-stone-500 max-w-md text-lg leading-relaxed">
              Manage recurring payments, subscriptions, and Dunning workflows effortlessly.
            </p>
          </div>
        </div>
        <button onClick={() => alert('Opening new mandate form')} className="group flex items-center gap-2 px-6 py-4 rounded-full bg-stone-900 text-white hover:bg-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all font-medium">
          <Plus size={18} />
          New Mandate
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-stone-100/50 p-1.5 rounded-full w-fit border border-stone-200/50">
        {[
          { id: "upi", label: "UPI AutoPay", icon: ScanLine },
          { id: "nach", label: "NACH E-Mandate", icon: CreditCard }
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[32px] shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center"><Play size={18} /></div>
             <span className="text-emerald-500 text-sm font-medium">Active</span>
          </div>
          <p className="text-stone-500 text-sm mb-1">Total Active</p>
          <h3 className="text-3xl font-light text-stone-900">12,450</h3>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-6 bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[32px] shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center"><Pause size={18} /></div>
             <span className="text-orange-500 text-sm font-medium">Paused</span>
          </div>
          <p className="text-stone-500 text-sm mb-1">Suspended Mandates</p>
          <h3 className="text-3xl font-light text-stone-900">423</h3>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-6 bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[32px] shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-4">
             <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center"><XOctagon size={18} /></div>
             <span className="text-rose-500 text-sm font-medium">Failed</span>
          </div>
          <p className="text-stone-500 text-sm mb-1">Dunning Queue</p>
          <h3 className="text-3xl font-light text-stone-900">89</h3>
        </motion.div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[40px] border border-stone-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[500px]">
        <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-6">
          <h3 className="text-xl font-medium text-stone-800">Recent Registrations</h3>
          <div className="flex gap-4">
            <input type="text" placeholder="Search customer or ID..." className="bg-stone-50 border-none rounded-full px-6 py-2.5 text-sm text-stone-700 outline-none w-64 focus:ring-2 focus:ring-stone-200" />
            <button onClick={() => alert('Selecting date range...')} className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-sm transition-colors">
              <Calendar size={16} /> Date Range
            </button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="text-stone-500 text-sm font-medium uppercase tracking-wider">
            <tr>
              <th className="pb-4 font-normal">Customer</th>
              <th className="pb-4 font-normal">{tab === "upi" ? "UPI VPA" : "Account / UMRN"}</th>
              <th className="pb-4 font-normal">Amount / Freq</th>
              <th className="pb-4 font-normal">Next Debit</th>
              <th className="pb-4 font-normal">Status</th>
              <th className="pb-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            <AnimatePresence>
              {[
                { name: "John Doe", id: "johndoe@okicici", amt: "$14.99", freq: "Monthly", next: "May 1, 2026", status: "Active", color: "text-emerald-600 bg-emerald-50" },
                { name: "Acme Corp", id: "acme@ybl", amt: "$450.00", freq: "Yearly", next: "Jun 15, 2026", status: "Pending", color: "text-orange-600 bg-orange-50" },
                { name: "Sarah Smith", id: "sarah12@sbi", amt: "$9.00", freq: "Weekly", next: "Apr 20, 2026", status: "Paused", color: "text-stone-600 bg-stone-100" },
                { name: "Design Studio", id: "design@axl", amt: "$120.00", freq: "Monthly", next: "Overdue", status: "Failed", color: "text-rose-600 bg-rose-50" },
              ].map((row, i) => (
                <motion.tr 
                  key={row.name + tab} 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: i * 0.05 }}
                  className="hover:bg-stone-50/50 transition-colors group cursor-pointer"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 font-medium">
                        {row.name.charAt(0)}
                      </div>
                      <span className="font-medium text-stone-800">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-4 text-stone-500 font-mono text-sm">{row.id}</td>
                  <td className="py-4">
                    <p className="font-medium text-stone-900">{row.amt}</p>
                    <p className="text-xs text-stone-400 uppercase tracking-widest mt-0.5">{row.freq}</p>
                  </td>
                  <td className={`py-4 ${row.next === 'Overdue' ? 'text-rose-500 font-medium' : 'text-stone-600'}`}>{row.next}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase tracking-widest ${row.color}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {row.status === 'Failed' && <button onClick={() => alert('Retrying mandate')} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"><RotateCcw size={16} /></button>}
                      <button onClick={() => alert('Pausing mandate')} className="p-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition-colors"><Pause size={16} /></button>
                      <button onClick={() => alert('Cancelling mandate')} className="p-2 bg-stone-100 hover:bg-rose-100 text-stone-700 hover:text-rose-600 rounded-xl transition-colors"><XOctagon size={16} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
