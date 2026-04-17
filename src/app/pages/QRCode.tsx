import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { QrCode, Smartphone, Printer, Download, Clock, Link, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { qrService } from "../../services";
import { useAsync } from "../../hooks/useAsync";
import { PageLoader, ErrorState } from "../components/Loaders";

export function QRCodePage() {
  const [tab, setTab] = useState<"dynamic" | "static">("dynamic");
  const [amount, setAmount] = useState("120.00");
  const [desc, setDesc] = useState("Cafe Order #892");
  const [generated, setGenerated] = useState(false);
  const { data, loading, error, refetch } = useAsync(() => qrService.getAll(), []);

  if (error) return <ErrorState message="Couldn't load QR data" onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading QR workspace" />;

  const defaultVpa = data.default_vpa;
  const recentPayments = data.recent_qr_payments;
  void defaultVpa; void recentPayments;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 mt-4 relative">
      <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-bl from-teal-100/40 to-emerald-100/40 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-50 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[28px] bg-stone-100 flex items-center justify-center text-stone-900 mb-2 border border-stone-200/50 shrink-0 shadow-sm">
            <QrCode size={36} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-900 mb-2">Accept Offline.</h1>
            <p className="text-stone-500 max-w-md text-lg leading-relaxed">
              Generate Dynamic or Static QR codes for rapid, zero-contact collections.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-stone-100/50 p-1.5 rounded-full w-fit border border-stone-200/50 mb-8">
        {[
          { id: "dynamic", label: "Dynamic QR", icon: Smartphone },
          { id: "static", label: "Static Standee", icon: Printer }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id as any); setGenerated(false); }}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Editor Form */}
        <div className="col-span-1 lg:col-span-5 space-y-6">
          <div className="bg-white/60 backdrop-blur-xl border border-stone-100 p-8 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
            {tab === "dynamic" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-stone-500 mb-2 block uppercase tracking-wider">Amount</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400 font-medium text-xl">$</span>
                    <input 
                      type="text" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-stone-50 border-none rounded-3xl pl-12 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-800 text-xl font-medium transition-shadow" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-500 mb-2 block uppercase tracking-wider">Description (Optional)</label>
                  <input 
                    type="text" 
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full bg-stone-50 border-none rounded-3xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-800 font-medium placeholder:text-stone-400 transition-shadow" 
                  />
                </div>
                <button 
                  onClick={() => setGenerated(true)}
                  className="w-full py-4 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1"
                >
                  Generate QR
                </button>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center py-8">
                 <p className="text-stone-600 font-medium mb-4">Your Permanent VPA</p>
                 <div className="p-4 bg-stone-50 rounded-2xl font-mono text-stone-500 tracking-wider">
                   acme.corp@fintech
                 </div>
                 <div className="flex gap-4 justify-center mt-8">
                   <button onClick={() => toast.success('Downloading SVG...', { description: 'Your file will be ready shortly.' })} className="flex items-center gap-2 px-6 py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors">
                     <Download size={16} /> SVG
                   </button>
                   <button onClick={() => toast.success('Downloading PDF...', { description: 'Your file will be ready shortly.' })} className="flex items-center gap-2 px-6 py-3 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors">
                     <Printer size={16} /> PDF
                   </button>
                 </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Display Area */}
        <div className="col-span-1 lg:col-span-7 flex flex-col items-center justify-center bg-stone-50/50 border border-stone-100/50 rounded-[48px] p-12 min-h-[500px]">
          <AnimatePresence mode="wait">
            {!generated && tab === "dynamic" ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="text-center text-stone-400 space-y-4"
              >
                <div className="w-32 h-32 border-2 border-dashed border-stone-300 rounded-3xl mx-auto flex items-center justify-center opacity-50">
                  <QrCode size={48} />
                </div>
                <p>Fill details to generate dynamic QR.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="qr"
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="bg-white p-6 rounded-[40px] shadow-[0_20px_60px_rgb(0,0,0,0.06)] border border-stone-100">
                  {/* Faux QR Code Pattern */}
                  <div className="w-64 h-64 grid grid-cols-6 grid-rows-6 gap-1 p-2 bg-white">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0 }} animate={{ opacity: Math.random() > 0.3 ? 1 : 0 }} transition={{ delay: i * 0.01 }}
                        className={`rounded-tl-xl rounded-br-md ${i % 7 === 0 || i % 5 === 0 ? 'bg-teal-500' : 'bg-stone-900'}`} 
                      />
                    ))}
                  </div>
                </div>
                
                {tab === "dynamic" && (
                  <div className="mt-12 w-full max-w-sm bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-stone-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                      <div className="flex items-center gap-2 text-stone-500 text-sm font-medium"><Clock size={16} /> Awaiting Scan</div>
                      <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Live</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-stone-400 mb-1">To Collect</p>
                        <p className="text-2xl font-light tracking-tight text-stone-900">${amount}</p>
                      </div>
                      <button onClick={() => toast.success('Link copied to clipboard')} className="p-3 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors text-stone-600">
                        <Link size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Logs */}
      {tab === "dynamic" && (
        <section className="pt-12">
          <h3 className="text-2xl font-light text-stone-800 mb-8">Recent Scans</h3>
          <div className="bg-white/60 backdrop-blur-xl rounded-[40px] border border-stone-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-stone-50 text-stone-500 text-sm font-medium uppercase tracking-wider">
                <tr><th className="p-6">Date</th><th className="p-6">Method</th><th className="p-6">Amount</th><th className="p-6">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {[
                  { date: "Today, 2:45 PM", method: "Apple Pay", amt: "$15.00", status: "Paid" },
                  { date: "Today, 1:20 PM", method: "UPI", amt: "$45.50", status: "Paid" },
                  { date: "Yesterday", method: "Visa", amt: "$120.00", status: "Paid" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-6 text-stone-600 font-medium">{row.date}</td>
                    <td className="p-6 text-stone-500">{row.method}</td>
                    <td className="p-6 text-stone-900 font-medium">{row.amt}</td>
                    <td className="p-6">
                      <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit text-sm font-medium">
                        <CheckCircle2 size={14} /> {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
