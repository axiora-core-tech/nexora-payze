import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, Key, Webhook, Copy, CheckCircle2, FileJson } from "lucide-react";

export function DeveloperPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isTestMode, setIsTestMode] = useState(false);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-16 mt-8">
      
      {/* Abstract Background Orbs */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-gradient-to-tr from-stone-200/40 to-stone-300/40 rounded-full blur-[120px] -z-10 mix-blend-multiply opacity-50 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-[28px] bg-stone-900 flex items-center justify-center text-white shrink-0 shadow-lg">
          <Terminal size={36} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-900">Integrate beautifully.</h1>
            
            {/* Live/Test Toggle */}
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur-xl px-4 py-2.5 rounded-full border border-stone-200/80 shadow-sm transition-all hover:bg-white text-base">
              <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${!isTestMode ? 'text-stone-900' : 'text-stone-400'}`}>Live</span>
              <button 
                onClick={() => setIsTestMode(!isTestMode)}
                className={`w-12 h-6 rounded-full relative transition-colors ${isTestMode ? 'bg-orange-500' : 'bg-stone-900'}`}
              >
                <motion.div layout animate={{ x: isTestMode ? 24 : 0 }} className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-sm"/>
              </button>
              <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${isTestMode ? 'text-orange-600' : 'text-stone-400'}`}>Test</span>
            </div>
          </div>
          <p className="text-stone-500 max-w-xl text-lg leading-relaxed">
            The Payze API is organized around REST, designed to have predictable, resource-oriented URLs, and uses HTTP response codes to indicate API errors.
          </p>
        </div>
      </div>

      {/* Authentication & Keys */}
      <section className="bg-white/70 backdrop-blur-xl border border-stone-100 p-8 md:p-12 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-8">
        <div className="flex items-center gap-4 border-b border-stone-100 pb-6">
          <div className="p-3 bg-stone-50 rounded-2xl"><Key size={20} className="text-stone-700" /></div>
          <div>
            <h2 className="text-xl font-medium text-stone-800">API Credentials</h2>
            <p className="text-sm text-stone-500">Your secret keys for authenticating requests.</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {[
            { id: "pk_test", name: "Publishable key", value: "pk_test_a1b2c3d4e5f6g7h8i9j0", env: "Test" },
            { id: "sk_test", name: "Secret key", value: "sk_test_1029384756abcdefghij", env: "Test" },
          ].map((key) => (
            <div key={key.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-stone-50/50 border border-stone-100 rounded-3xl group transition-all hover:bg-stone-50">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-medium text-stone-800">{key.name}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-stone-200/50 text-stone-500 px-2 py-0.5 rounded-full">{key.env}</span>
                </div>
                <div className="font-mono text-sm text-stone-500 truncate">{key.value}</div>
              </div>
              <button 
                onClick={() => handleCopy(key.value)}
                className="self-start md:self-auto p-3 bg-white border border-stone-200 rounded-2xl text-stone-600 hover:text-stone-900 shadow-sm transition-all flex items-center gap-2 text-sm font-medium hover:shadow-md"
              >
                {copiedKey === key.value ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle2 size={16} className="text-emerald-500" /></motion.div>
                ) : (
                  <><Copy size={16} /> Copy</>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Code Snippet & Webhooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-stone-900 border border-stone-800 p-8 rounded-[40px] shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-4 pb-6">
            <div className="p-3 bg-stone-800 rounded-2xl"><FileJson size={20} className="text-stone-300" /></div>
            <div>
              <h2 className="text-xl font-medium text-white">Create a Payment</h2>
              <p className="text-sm text-stone-400">Initialize a checkout session.</p>
            </div>
          </div>
          <div className="bg-[#1C1C1A] p-6 rounded-3xl font-mono text-sm text-stone-300 overflow-x-auto border border-stone-800/50">
<pre><code>{`const session = await fintech.checkout.create({
  payment_method_types: ['card', 'upi'],
  line_items: [{
    price: 'price_1MotwRLkdIwHu7',
    quantity: 1,
  }],
  mode: 'payment',
  success_url: 'https://demo.com/success',
  cancel_url: 'https://demo.com/cancel',
});`}</code></pre>
          </div>
        </section>

        <section className="bg-white/70 backdrop-blur-xl border border-stone-100 p-8 rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-6 flex flex-col justify-center text-center items-center">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-2 border border-emerald-100">
            <Webhook size={32} />
          </div>
          <h2 className="text-2xl font-medium text-stone-800">Webhooks</h2>
          <p className="text-stone-500 text-sm max-w-[80%] leading-relaxed">
            Listen for events on your account so your integration can automatically trigger reactions.
          </p>
          <button onClick={() => alert('Add Endpoint modal would open here')} className="mt-4 px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded-full transition-colors flex items-center gap-2">
            <Webhook size={16} /> Add Endpoint
          </button>
        </section>
      </div>
    </div>
  );
}
