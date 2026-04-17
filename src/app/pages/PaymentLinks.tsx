import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link as LinkIcon, Plus, Copy, CheckCircle2, QrCode, MoreHorizontal, FileText, ArrowRight, Share2, Mail, MessageSquare } from "lucide-react";
import { paymentLinksService } from "../../services";
import { useAsync } from "../../hooks/useAsync";
import { Skeleton, ErrorState } from "../components/Loaders";

export function PaymentLinks() {
  const [isCreating, setIsCreating] = useState(false);
  const [copiedLink, setCopiedLink] = useState<number | null>(null);
  const { data, loading, error, refetch } = useAsync(() => paymentLinksService.getAll(), []);

  if (error) return <ErrorState message="Couldn't load payment links" onRetry={refetch} />;
  const links = data?.links ?? [];

  const handleCopy = (id: number) => {
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 mt-4 relative">
      
      {/* Background Ambience */}
      <div className="absolute top-[10%] right-[0%] w-[400px] h-[400px] bg-gradient-to-bl from-teal-100/30 to-blue-100/30 rounded-full blur-[120px] -z-10 mix-blend-multiply opacity-60 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[28px] bg-stone-100 flex items-center justify-center text-stone-900 mb-2 border border-stone-200/50 shrink-0 shadow-sm">
            <LinkIcon size={36} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-900 mb-2">Payment Links.</h1>
            <p className="text-stone-500 max-w-md text-lg leading-relaxed">
              Create frictionless, shareable links to collect payments anywhere.
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="group flex items-center gap-2 px-6 py-4 rounded-full bg-stone-900 text-white hover:bg-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all font-medium whitespace-nowrap"
        >
          {isCreating ? <ArrowRight size={18} className="rotate-180" /> : <Plus size={18} />}
          {isCreating ? "Back to Links" : "Create New Link"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isCreating ? (
          <motion.div 
            key="creator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Form */}
            <div className="bg-white/70 backdrop-blur-xl border border-stone-100 p-8 md:p-12 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-8">
              <div>
                <h2 className="text-2xl font-light text-stone-800 mb-2">Link Details</h2>
                <p className="text-sm text-stone-500">Configure how you want to collect this payment.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-2 block">Title / Purpose</label>
                  <input type="text" placeholder="e.g. Logo Design Deposit" className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-800 font-medium placeholder:text-stone-400 transition-shadow" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-2 block">Amount Type</label>
                    <select className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-800 font-medium transition-shadow appearance-none cursor-pointer">
                      <option>Fixed Amount</option>
                      <option>Customer Enters</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-2 block">Amount (USD)</label>
                    <input type="number" placeholder="0.00" className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-800 font-medium placeholder:text-stone-400 transition-shadow" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-2 block">Usage Limit</label>
                    <select className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-800 font-medium transition-shadow appearance-none cursor-pointer">
                      <option>Single Use</option>
                      <option>Multiple Use</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-2 block">Expiry</label>
                    <input type="date" className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-800 font-medium transition-shadow" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-stone-500 uppercase tracking-widest mb-2 block">Custom Notes for Payer (Optional)</label>
                  <textarea placeholder="Thank you for your business..." rows={3} className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-800 font-medium placeholder:text-stone-400 transition-shadow resize-none" />
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end">
                <button className="px-8 py-4 bg-stone-900 text-white rounded-full font-medium hover:bg-stone-800 transition-colors shadow-lg">
                  Generate Link
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div className="bg-stone-50/50 border border-stone-100 p-8 rounded-[40px] flex flex-col justify-center items-center text-center">
              <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-[0_20px_40px_rgb(0,0,0,0.04)] border border-stone-100 relative overflow-hidden">
                <div className="w-12 h-12 bg-stone-900 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full" />
                </div>
                <p className="text-stone-500 text-sm mb-1">Payment Request from</p>
                <h3 className="text-lg font-medium text-stone-900 mb-8">FinTech Revolution</h3>
                
                <div className="p-4 bg-stone-50 rounded-2xl mb-8">
                  <p className="text-stone-500 text-sm mb-1">Amount Due</p>
                  <p className="text-3xl font-light text-stone-900">$0.00</p>
                </div>

                <div className="space-y-3">
                  <div className="w-full h-12 bg-stone-100 rounded-xl" />
                  <div className="w-full h-12 bg-stone-900 rounded-xl" />
                </div>
              </div>
              <p className="text-stone-400 text-sm mt-8 flex items-center gap-2"><FileText size={16} /> Live Preview</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { label: "Active Links", value: "24" },
                { label: "Total Collected", value: "$42,500.00" },
                { label: "Conversion Rate", value: "86%" }
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-white/60 backdrop-blur-xl border border-stone-100 rounded-3xl shadow-sm">
                  <p className="text-stone-500 text-sm font-medium uppercase tracking-widest mb-2">{stat.label}</p>
                  <p className="text-3xl font-light text-stone-900">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Links Table */}
            <div className="bg-white/80 backdrop-blur-xl border border-stone-100 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-100 text-xs uppercase tracking-widest text-stone-400 font-medium">
                      <th className="px-8 py-6 font-medium">Link Details</th>
                      <th className="px-8 py-6 font-medium">Amount</th>
                      <th className="px-8 py-6 font-medium">Usage</th>
                      <th className="px-8 py-6 font-medium">Collected</th>
                      <th className="px-8 py-6 font-medium text-center">Status</th>
                      <th className="px-8 py-6 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100/50">
                    {loading ? (
                      <>
                        <Skeleton className="w-full h-20" />
                        <Skeleton className="w-full h-20" />
                        <Skeleton className="w-full h-20" />
                      </>
                    ) : links.map((link: any) => (
                      <tr key={link.id} className="group hover:bg-stone-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-medium text-stone-900 text-lg mb-1">{link.title}</p>
                          <p className="text-stone-400 text-sm">Created {link.created}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`font-mono text-base ${link.amount === 'Open' ? 'text-stone-500' : 'text-stone-800'}`}>
                            {link.amount}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-stone-600 font-medium">{link.usage}</td>
                        <td className="px-8 py-6 text-emerald-600 font-medium">{link.collected}</td>
                        <td className="px-8 py-6 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            link.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'
                          }`}>
                            {link.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleCopy(link.id)}
                              className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
                              title="Copy Link"
                            >
                              {copiedLink === link.id ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Copy size={18} />}
                            </button>
                            <button className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors" title="Download QR">
                              <QrCode size={18} />
                            </button>
                            <button className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors">
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
