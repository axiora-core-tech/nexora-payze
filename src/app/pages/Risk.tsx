import { useState } from "react";
import { motion } from "motion/react";
import { ShieldAlert, ShieldCheck, Shield, Plus, Filter, AlertTriangle, CheckCircle2, XCircle, Activity, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const riskData = [
  { score: "0-10", volume: 4000 },
  { score: "11-20", volume: 3000 },
  { score: "21-30", volume: 2000 },
  { score: "31-40", volume: 2780 },
  { score: "41-50", volume: 1890 },
  { score: "51-60", volume: 2390 },
  { score: "61-70", volume: 3490 },
  { score: "71-80", volume: 1200 },
  { score: "81-90", volume: 500 },
  { score: "91-100", volume: 100 },
];

export function RiskPage() {
  const [activeTab, setActiveTab] = useState("rules");

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 mt-4 relative">
      <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-rose-100/40 to-orange-100/40 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-50 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[28px] bg-stone-100 flex items-center justify-center text-stone-900 mb-2 border border-stone-200/50 shrink-0 shadow-sm">
            <ShieldAlert size={36} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-900 mb-2">Fraud & Risk.</h1>
            <p className="text-stone-500 max-w-md text-lg leading-relaxed">
              Configure risk thresholds, review flagged transactions, and monitor platform security.
            </p>
          </div>
        </div>
        <button onClick={() => alert('Opening Create Rule form')} className="group flex items-center gap-2 px-6 py-4 rounded-full bg-stone-900 text-white hover:bg-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all font-medium">
          <Plus size={18} />
          Create Rule
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-stone-100/50 p-1.5 rounded-full w-fit border border-stone-200/50">
        {[
          { id: "rules", label: "Risk Rules", icon: Shield },
          { id: "queue", label: "Review Queue", icon: AlertTriangle },
          { id: "analytics", label: "Analytics", icon: BarChart3 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all ${
              activeTab === tab.id 
                ? "bg-white text-stone-900 shadow-sm border border-stone-200/50" 
                : "text-stone-500 hover:text-stone-700 hover:bg-stone-200/30"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "rules" && (
        <div className="grid grid-cols-1 gap-6">
          {[
            { name: "High Velocity IPs", condition: "Transactions > 5 in 10 mins from same IP", action: "Block", status: true },
            { name: "Unusual Country Match", condition: "Card Issue Country != IP Country", action: "Review", status: true },
            { name: "Large Transaction Volume", condition: "Amount > $10,000", action: "Review", status: false },
            { name: "Known BIN Blocklist", condition: "Card BIN in [High Risk List]", action: "Block", status: true },
          ].map((rule, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white/60 backdrop-blur-xl border border-stone-100 p-6 rounded-[32px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all"
            >
              <div>
                <h3 className="text-lg font-medium text-stone-800 mb-1">{rule.name}</h3>
                <div className="flex items-center gap-3 text-sm text-stone-500">
                  <span className="font-mono bg-stone-100 px-2 py-1 rounded-lg text-stone-600">IF {rule.condition}</span>
                  <span>→</span>
                  <span className={`font-medium ${rule.action === 'Block' ? 'text-rose-500' : 'text-orange-500'}`}>{rule.action}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => alert('Edit rule')} className="text-stone-400 hover:text-stone-800 text-sm font-medium">Edit</button>
                <div className={`w-14 h-8 rounded-full flex items-center p-1 cursor-pointer transition-colors ${rule.status ? 'bg-emerald-500' : 'bg-stone-200'}`}>
                  <motion.div 
                    layout 
                    className="w-6 h-6 bg-white rounded-full shadow-sm"
                    animate={{ x: rule.status ? 24 : 0 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "queue" && (
        <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[40px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex justify-between items-center mb-8 border-b border-stone-100 pb-6">
            <h3 className="text-xl font-medium text-stone-800">Pending Review (12)</h3>
            <button onClick={() => alert('Filter pending review queue')} className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors">
              <Filter size={16} /> Filter
            </button>
          </div>
          
          <div className="space-y-4">
            {[
              { id: "TXN-98234", amount: "$4,500.00", method: "Visa •••• 4242", risk: 85, rule: "Unusual Country Match", time: "10 mins ago" },
              { id: "TXN-98231", amount: "$12,450.00", method: "Wire Transfer", risk: 62, rule: "Large Transaction Volume", time: "1 hour ago" },
            ].map((txn, i) => (
              <div key={i} className="flex flex-col md:flex-row items-center justify-between p-4 rounded-3xl hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100">
                <div className="flex items-center gap-6 flex-1 w-full">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${txn.risk > 80 ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600'}`}>
                    <span className="font-bold">{txn.risk}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-stone-800">{txn.id} <span className="text-stone-400 font-normal ml-2">{txn.time}</span></h4>
                    <p className="text-sm text-stone-500">Triggered: <span className="font-medium text-stone-700">{txn.rule}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-8 flex-1 justify-end w-full mt-4 md:mt-0">
                  <div className="text-right">
                    <p className="font-medium text-stone-900">{txn.amount}</p>
                    <p className="text-sm text-stone-400">{txn.method}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => alert('Reject transaction')} className="p-3 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl transition-colors"><XCircle size={20} /></button>
                    <button onClick={() => alert('Approve transaction')} className="p-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-2xl transition-colors"><CheckCircle2 size={20} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[40px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
             <h3 className="text-xl font-medium text-stone-800 mb-2">Risk Score Distribution</h3>
             <p className="text-stone-500 text-sm mb-8">Volume of transactions across risk bands.</p>
             <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskData}>
                    <XAxis key="xaxis" dataKey="score" axisLine={false} tickLine={false} tick={{ fill: "#a8a29e", fontSize: 12 }} dy={10} />
                    <Tooltip key="tooltip" cursor={{ fill: '#f5f5f4' }} contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }} />
                    <Bar key="bar" dataKey="volume" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
             </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[32px] p-6 flex items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500"><ShieldAlert size={28} /></div>
              <div>
                <p className="text-sm text-stone-500 mb-1">Blocked Value (30d)</p>
                <p className="text-3xl font-light text-stone-900">$1.2M</p>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[32px] p-6 flex items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500"><ShieldCheck size={28} /></div>
              <div>
                <p className="text-sm text-stone-500 mb-1">False Positive Rate</p>
                <p className="text-3xl font-light text-stone-900">0.04%</p>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[32px] p-6 flex items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500"><Activity size={28} /></div>
              <div>
                <p className="text-sm text-stone-500 mb-1">Rules Triggered Today</p>
                <p className="text-3xl font-light text-stone-900">842</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
