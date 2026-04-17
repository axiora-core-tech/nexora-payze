import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, FileText, Plus, Hash, User, DollarSign, Calendar, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { invoiceService } from "../../services";
import { useAsync } from "../../hooks/useAsync";
import { PageLoader, ErrorState } from "../components/Loaders";

export function InvoicePage() {
  const [items, setItems] = useState<Array<{ id: number; desc: string; amount: number }>>([]);
  const [client, setClient] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const { data, loading, error, refetch } = useAsync(() => invoiceService.getDefaults(), []);

  // Hydrate form with service defaults once loaded
  useEffect(() => {
    if (data) {
      setItems(data.default_items);
      setClient(data.default_client);
    }
  }, [data]);

  if (error) return <ErrorState message="Couldn't load invoice defaults" onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading invoice" />;

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-12 mt-4 relative">
      
      {/* Background Ambience */}
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-rose-100/30 to-orange-100/30 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-50 pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[28px] bg-stone-100 flex items-center justify-center text-stone-900 border border-stone-200/50 shrink-0 shadow-sm">
            <FileText size={36} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-900 mb-2">Craft an Invoice.</h1>
            <p className="text-stone-500 max-w-md text-lg leading-relaxed">
              Generate and send beautiful, frictionless payment requests in seconds.
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setPreviewMode(!previewMode)}
            className="group flex items-center gap-2 px-6 py-4 rounded-full bg-white text-stone-700 border border-stone-100 hover:border-stone-200 shadow-sm transition-all shadow-[0_4px_20px_rgb(0,0,0,0.02)] font-medium"
          >
            {previewMode ? <FileText size={18} /> : <Eye size={18} />}
            {previewMode ? "Edit Mode" : "Preview"}
          </button>
          <button onClick={() => toast.success('Invoice sent', { description: 'The customer will receive it shortly.' })} className="group flex items-center gap-2 px-6 py-4 rounded-full bg-stone-900 text-white hover:bg-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all font-medium">
            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            Send & Request
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Editor Form */}
        <div className={`col-span-1 lg:col-span-5 space-y-8 transition-opacity duration-300 ${previewMode ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
          <div className="bg-white/60 backdrop-blur-xl border border-stone-100 p-8 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-8">
            <div className="space-y-4">
              <label className="text-sm font-medium text-stone-500 uppercase tracking-wider flex items-center gap-2">
                <User size={14} /> Bill To
              </label>
              <input 
                type="text" 
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full text-2xl font-light bg-transparent border-b border-stone-200 focus:border-stone-900 outline-none py-2 text-stone-900 transition-colors"
                placeholder="Client Name or Email"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-stone-500 uppercase tracking-wider flex items-center gap-2">
                  <Hash size={14} /> Line Items
                </label>
                <button 
                  onClick={() => setItems([...items, { id: Date.now(), desc: "", amount: 0 }])}
                  className="p-2 bg-stone-50 text-stone-600 rounded-full hover:bg-stone-100 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item, idx) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-4 group"
                    >
                      <input 
                        type="text" 
                        value={item.desc}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[idx].desc = e.target.value;
                          setItems(newItems);
                        }}
                        className="flex-1 bg-stone-50 border-none rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-800 font-medium placeholder:text-stone-400"
                        placeholder="Description"
                      />
                      <div className="relative w-32">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-medium">$</span>
                        <input 
                          type="number" 
                          value={item.amount || ''}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[idx].amount = parseFloat(e.target.value) || 0;
                            setItems(newItems);
                          }}
                          className="w-full bg-stone-50 border-none rounded-2xl pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-800 font-medium placeholder:text-stone-400"
                          placeholder="0.00"
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Document */}
        <div className={`col-span-1 lg:col-span-7 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${previewMode ? 'lg:-translate-x-[20%]' : ''}`}>
          <motion.div 
            layout
            className="w-full aspect-[1/1.4] bg-white rounded-none md:rounded-[48px] shadow-[0_20px_80px_rgb(0,0,0,0.06)] border border-stone-100/50 p-12 md:p-16 flex flex-col relative overflow-hidden"
          >
            {/* Minimal aesthetic watermark */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <svg width="200" height="200" viewBox="0 0 200 200">
                 <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth="4" />
                 <path d="M40 100 Q100 0 160 100 Q100 200 40 100" fill="currentColor" />
              </svg>
            </div>

            <div className="flex justify-between items-start mb-24">
              <div>
                <h2 className="text-3xl font-light tracking-tight text-stone-900 mb-2">Invoice</h2>
                <p className="text-stone-400 text-sm font-mono tracking-widest">INV-2026-041</p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-medium text-stone-800">FinTech Revolution</h3>
                <p className="text-stone-500 text-sm">100 Innovation Drive<br/>San Francisco, CA 94105</p>
              </div>
            </div>

            <div className="mb-20">
              <p className="text-sm font-medium text-stone-400 uppercase tracking-widest mb-4">Billed To</p>
              <h4 className="text-3xl font-light text-stone-900">{client || 'Client Name'}</h4>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-12 gap-4 pb-4 border-b border-stone-100 text-sm font-medium text-stone-400 uppercase tracking-wider mb-6">
                <div className="col-span-9">Description</div>
                <div className="col-span-3 text-right">Amount</div>
              </div>
              
              <div className="space-y-6">
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 text-stone-800 text-lg">
                    <div className="col-span-9 font-medium">{item.desc || 'Untitled Item'}</div>
                    <div className="col-span-3 text-right font-light">${(item.amount || 0).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-12 border-t border-stone-100 flex justify-between items-end">
              <div>
                <p className="text-stone-400 text-sm mb-1">Due Date</p>
                <p className="text-stone-800 font-medium text-lg">May 1, 2026</p>
              </div>
              <div className="text-right">
                <p className="text-stone-400 text-sm mb-2 uppercase tracking-widest font-medium">Total Amount</p>
                <p className="text-5xl font-light tracking-tight text-stone-900">${total.toFixed(2)}</p>
              </div>
            </div>
            
            {/* Pay Button embedded in Invoice - Next Gen feel */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="px-8 py-3 bg-stone-900 text-white rounded-full flex items-center gap-2 shadow-xl hover:scale-105 transition-transform cursor-pointer">
                 <DollarSign size={16} /> Pay Invoice
               </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
