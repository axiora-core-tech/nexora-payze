import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, TrendingUp, TrendingDown, Users, Globe, Smartphone, Monitor, ShieldAlert, AlertTriangle, Zap, Search, Download, BarChart3, Filter } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const realTimeData = [
  { time: "10:00", tpm: 120, success: 98 },
  { time: "10:05", tpm: 145, success: 99 },
  { time: "10:10", tpm: 210, success: 97 },
  { time: "10:15", tpm: 180, success: 98 },
  { time: "10:20", tpm: 230, success: 96 },
  { time: "10:25", tpm: 310, success: 94 },
  { time: "10:30", tpm: 280, success: 98 },
];

const funnelData = [
  { step: "Checkout Init", value: 10000, drop: 0 },
  { step: "Method Selected", value: 8500, drop: 15 },
  { step: "Details Entered", value: 7800, drop: 8 },
  { step: "Auth Sent", value: 7500, drop: 4 },
  { step: "Captured", value: 7200, drop: 4 },
];

const failureData = [
  { name: "Insufficient Funds", value: 45, color: "#f43f5e" },
  { name: "Do Not Honour", value: 25, color: "#f97316" },
  { name: "3DS Timeout", value: 15, color: "#eab308" },
  { name: "Invalid Card", value: 10, color: "#a8a29e" },
  { name: "Fraud Block", value: 5, color: "#64748b" },
];

export function AnalyticsPage() {
  const [tab, setTab] = useState<"realtime" | "funnel" | "failures">("realtime");

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 mt-4 relative">
      <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-gradient-to-tr from-fuchsia-100/40 to-indigo-100/40 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-50 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[28px] bg-stone-100 flex items-center justify-center text-stone-900 mb-2 border border-stone-200/50 shrink-0 shadow-sm">
            <BarChart3 size={36} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-900 mb-2">Analytics & Reports.</h1>
            <p className="text-stone-500 max-w-md text-lg leading-relaxed">
              Monitor real-time throughput, analyze conversion funnels, and diagnose failures.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl px-6 py-4 rounded-full border border-stone-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-sm font-medium text-stone-700 tracking-wide uppercase">Live Sync</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-stone-100/50 p-1.5 rounded-full w-fit border border-stone-200/50">
        {[
          { id: "realtime", label: "Real-Time", icon: Activity },
          { id: "funnel", label: "Conversion Funnel", icon: Filter },
          { id: "failures", label: "Failure Diagnostics", icon: AlertTriangle }
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
        {tab === "realtime" && (
          <motion.div key="rt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: "Transactions / Min", value: "284", icon: Zap, trend: "+12%" },
                { label: "Success Rate (5m)", value: "98.2%", icon: ShieldAlert, trend: "+0.4%" },
                { label: "Average Value", value: "$124.50", icon: Activity, trend: "-2.1%" },
                { label: "Current Block Rate", value: "1.4%", icon: AlertTriangle, trend: "-0.2%" },
              ].map((stat, i) => (
                <div key={`stat-${i}`} className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[32px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                  <p className="text-stone-500 text-sm mb-1">{stat.label}</p>
                  <div className="flex items-end gap-3 mb-4">
                    <h3 className="text-3xl font-light text-stone-900">{stat.value}</h3>
                    <span className={`text-sm font-medium mb-1 ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>{stat.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[40px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-medium text-stone-800">Transaction Velocity</h3>
                    <div className="flex gap-2">
                     <button onClick={() => alert('1H view selected')} className="px-4 py-2 bg-stone-100 rounded-full text-xs font-medium text-stone-600 hover:bg-stone-200">1H</button>
                     <button onClick={() => alert('6H view selected')} className="px-4 py-2 bg-white shadow-sm border border-stone-200 rounded-full text-xs font-medium text-stone-900">6H</button>
                     <button onClick={() => alert('24H view selected')} className="px-4 py-2 bg-stone-100 rounded-full text-xs font-medium text-stone-600 hover:bg-stone-200">24H</button>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={realTimeData}>
                      <defs key="defs">
                        <linearGradient id="colorTpm" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis key="xaxis" dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 12}} dy={10} />
                      <YAxis key="yaxis" axisLine={false} tickLine={false} tick={{fill: '#a8a29e', fontSize: 12}} dx={-10} />
                      <Tooltip key="tooltip" contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}} />
                      <Area key="area" type="monotone" dataKey="tpm" stroke="#6366f1" strokeWidth={3} fill="url(#colorTpm)" isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-1 bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[40px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col">
                <h3 className="text-xl font-medium text-stone-800 mb-6">Live Feed</h3>
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {[
                    { id: "tx_1a", amt: "$12.00", status: "Success", method: "UPI", time: "Just now" },
                    { id: "tx_1b", amt: "$450.00", status: "Success", method: "Visa", time: "12s ago" },
                    { id: "tx_1c", amt: "$89.99", status: "Failed", method: "Amex", time: "45s ago" },
                    { id: "tx_1d", amt: "$1,200.00", status: "Pending", method: "Wire", time: "1m ago" },
                    { id: "tx_1e", amt: "$5.50", status: "Success", method: "Apple Pay", time: "1m ago" },
                  ].map((tx, i) => (
                    <div key={`tx-${i}`} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
                       <div>
                         <p className="font-medium text-stone-800 text-sm">{tx.amt} <span className="text-stone-400 font-normal ml-2">{tx.id}</span></p>
                         <p className="text-xs text-stone-500 mt-1">{tx.method} • {tx.time}</p>
                       </div>
                       <span className={`w-2 h-2 rounded-full ${
                         tx.status === 'Success' ? 'bg-emerald-500' :
                         tx.status === 'Failed' ? 'bg-rose-500' : 'bg-orange-500'
                       }`} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {tab === "funnel" && (
          <motion.div key="funnel" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[40px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-12">
                <div>
                  <h3 className="text-2xl font-light text-stone-800">Checkout Funnel</h3>
                  <p className="text-stone-500 text-sm mt-2">End-to-end conversion across all payment methods.</p>
                </div>
                <button onClick={() => alert('Exporting data...')} className="flex items-center gap-2 px-6 py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium text-sm transition-colors">
                  <Download size={16} /> Export Data
                </button>
              </div>

              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                    <XAxis key="xaxis" type="number" hide />
                    <YAxis key="yaxis" dataKey="step" type="category" axisLine={false} tickLine={false} tick={{fill: '#44403c', fontSize: 14, fontWeight: 500}} width={120} />
                    <Tooltip key="tooltip" cursor={{fill: '#f5f5f4'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}} />
                    <Bar key="bar" dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} barSize={40} isAnimationActive={false}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`funnel-cell-${index}`} fill={`rgba(139, 92, 246, ${1 - index * 0.15})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-5 gap-4 mt-8 pt-8 border-t border-stone-100">
                {funnelData.map((step, i) => (
                  <div key={`step-${i}`} className="text-center">
                    <p className="text-sm font-medium text-stone-800 mb-1">{step.value.toLocaleString()}</p>
                    <p className="text-xs text-stone-500 uppercase tracking-wider">{i === 0 ? 'Total' : `-${step.drop}% Drop`}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[40px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                 <h3 className="text-lg font-medium text-stone-800 mb-6">Conversion by Device</h3>
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600"><Smartphone size={20} /></div>
                       <div className="flex-1">
                         <div className="flex justify-between mb-2 text-sm"><span className="font-medium text-stone-800">Mobile Web</span><span className="text-emerald-600">76.4%</span></div>
                         <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full w-[76.4%]" /></div>
                       </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600"><Monitor size={20} /></div>
                       <div className="flex-1">
                         <div className="flex justify-between mb-2 text-sm"><span className="font-medium text-stone-800">Desktop</span><span className="text-emerald-600">82.1%</span></div>
                         <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full w-[82.1%]" /></div>
                       </div>
                    </div>
                 </div>
               </div>
               <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[40px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                 <h3 className="text-lg font-medium text-stone-800 mb-6">Top Abandonment Reasons</h3>
                 <div className="space-y-4">
                   {[
                     { reason: "Timeout / Gateway Error", pct: "35%" },
                     { reason: "Authentication Failure (OTP)", pct: "28%" },
                     { reason: "User Cancelled", pct: "22%" },
                     { reason: "Card Declined", pct: "15%" },
                   ].map((r, i) => (
                     <div key={`reason-${i}`} className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl text-sm">
                       <span className="text-stone-700">{r.reason}</span>
                       <span className="font-medium text-stone-900">{r.pct}</span>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </motion.div>
        )}
        {tab === "failures" && (
          <motion.div key="fail" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[40px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <h3 className="text-xl font-medium text-stone-800 mb-2">Failure Breakdown</h3>
              <p className="text-stone-500 text-sm mb-8">Categorization of declined and failed transactions.</p>
              <div className="h-[300px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie key="pie" data={failureData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" isAnimationActive={false}>
                      {failureData.map((entry, index) => (
                        <Cell key={`fail-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip key="tooltip" contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)'}} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                   <span className="text-3xl font-light text-stone-900">4.2%</span>
                   <span className="text-xs text-stone-400 uppercase tracking-widest mt-1">Total Fail Rate</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-rose-50/50 border border-rose-100 rounded-[32px] p-8">
                 <div className="flex items-center gap-3 text-rose-600 mb-4">
                   <AlertTriangle size={24} />
                   <h3 className="text-lg font-medium">Anomaly Detected</h3>
                 </div>
                 <p className="text-rose-900 text-sm leading-relaxed mb-6">
                   There is an ongoing spike in "Do Not Honour" failures from <strong>HDFC Bank Visa</strong> cards in the last 15 minutes. Recommend enabling secondary gateway routing.
                 </p>
                 <button onClick={() => alert('Fallback routing enabled!')} className="px-6 py-3 bg-rose-600 text-white rounded-full text-sm font-medium hover:bg-rose-700 transition-colors">
                   Enable Fallback Routing
                 </button>
              </div>

              <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                 <h3 className="text-lg font-medium text-stone-800 mb-6">Top Failing Methods</h3>
                 <div className="space-y-4">
                   {[
                     { method: "HDFC Visa Credit", failRate: "12.4%", count: "1,245", trend: "up" },
                     { method: "SBI Debit", failRate: "8.2%", count: "892", trend: "down" },
                     { method: "Amazon Pay", failRate: "4.1%", count: "430", trend: "flat" },
                   ].map((m, i) => (
                     <div key={`fail-meth-${i}`} className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl">
                       <div>
                         <p className="font-medium text-stone-800 text-sm mb-1">{m.method}</p>
                         <p className="text-xs text-stone-500">{m.count} failures</p>
                       </div>
                       <div className="text-right">
                         <span className="font-medium text-rose-500">{m.failRate}</span>
                       </div>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
