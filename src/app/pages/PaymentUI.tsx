import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, ScanLine, Smartphone, Wallet, ArrowLeft, CheckCircle2, Lock } from "lucide-react";

export function PaymentUI() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "success">("idle");

  const amount = "1,450.00";
  const recipient = "Acme Design Co.";

  const methods = [
    { id: "apple", label: "Apple Pay", icon: Smartphone, color: "bg-stone-900", textColor: "text-white" },
    { id: "card", label: "Black Card", icon: CreditCard, color: "bg-white", textColor: "text-stone-900" },
    { id: "upi", label: "UPI & Wallets", icon: ScanLine, color: "bg-[#E6F4F1]", textColor: "text-teal-900" },
    { id: "paypal", label: "PayPal", icon: Wallet, color: "bg-[#E8F0FE]", textColor: "text-blue-900" },
  ];

  const handlePay = () => {
    setPaymentState("processing");
    setTimeout(() => {
      setPaymentState("success");
    }, 2000);
  };

  if (paymentState === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8"
      >
        <div className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <CheckCircle2 size={64} className="text-emerald-500" />
          </motion.div>
        </div>
        <div>
          <h2 className="text-4xl font-light text-stone-800 mb-2">Payment sent beautifully.</h2>
          <p className="text-stone-500">Receipt sent to your email.</p>
        </div>
        <button 
          onClick={() => { setSelectedMethod(null); setPaymentState("idle"); }}
          className="px-8 py-4 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
        >
          Return Home
        </button>
      </motion.div>
    );
  }

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center py-12 w-full max-w-4xl mx-auto">
      
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 150, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-bl from-rose-50 to-indigo-50 blur-[120px] opacity-70" 
        />
        <motion.div 
          animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
          className="absolute -bottom-[10%] -left-[10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-tr from-cyan-50 to-emerald-50 blur-[100px] opacity-70" 
        />
      </div>

      <AnimatePresence mode="wait">
        {!selectedMethod ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full relative z-10 flex flex-col items-center"
          >
            {/* Payment Header */}
            <div className="text-center mb-16 space-y-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <img 
                  src="https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&h=150&fit=crop" 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full mx-auto shadow-lg border border-white mb-6 object-cover"
                />
              </motion.div>
              <h2 className="text-stone-500 font-medium tracking-widest text-sm uppercase">Paying {recipient}</h2>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-stone-400 text-4xl">$</span>
                <span className="text-7xl md:text-9xl font-light tracking-tighter text-stone-900">{amount.split('.')[0]}.</span>
                <span className="text-4xl md:text-6xl font-light text-stone-400">{amount.split('.')[1]}</span>
              </div>
            </div>

            {/* Methods Grid - Radically visual */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-4">
              {methods.map((method, idx) => (
                <motion.button
                  key={method.id}
                  layoutId={`method-${method.id}`}
                  onClick={() => setSelectedMethod(method.id)}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 20 }}
                  className={`relative p-8 rounded-[40px] flex flex-col items-center justify-center gap-4 border border-stone-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] aspect-square ${method.color} ${method.textColor} overflow-hidden group`}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <method.icon size={48} strokeWidth={1.5} className="z-10" />
                  <span className="font-medium text-lg tracking-tight z-10">{method.label}</span>
                </motion.button>
              ))}
            </div>
            
            <p className="mt-16 flex items-center gap-2 text-stone-400 text-sm">
              <Lock size={14} /> Secured by FinTech Revolution
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="checkout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-lg relative z-10"
          >
            <button 
              onClick={() => setSelectedMethod(null)}
              className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors mb-12 font-medium"
            >
              <ArrowLeft size={20} /> Change method
            </button>

            {/* The Morphing Active State */}
            <motion.div
              layoutId={`method-${selectedMethod}`}
              className={`w-full bg-white rounded-[40px] p-8 md:p-12 shadow-[0_20px_60px_rgb(0,0,0,0.08)] border border-stone-100/50 relative overflow-hidden`}
            >
              {/* Context Header */}
              <div className="flex justify-between items-center mb-10 border-b border-stone-100 pb-8">
                <div>
                  <p className="text-stone-500 text-sm mb-1">Total</p>
                  <p className="text-3xl font-light text-stone-900">${amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-stone-500 text-sm mb-1">Method</p>
                  <p className="text-lg font-medium text-stone-800">
                    {methods.find(m => m.id === selectedMethod)?.label}
                  </p>
                </div>
              </div>

              {/* Dynamic Form Content Based on Method */}
              {selectedMethod === "card" && (
                <div className="space-y-6">
                  {/* Virtual Card Representation */}
                  <div className="w-full h-48 bg-stone-900 rounded-2xl p-6 flex flex-col justify-between text-white relative overflow-hidden shadow-xl mb-8">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-stone-800 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="flex justify-between items-center z-10">
                      <CreditCard size={24} className="text-stone-400" />
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded-full bg-rose-500/80 mix-blend-screen" />
                        <div className="w-6 h-6 rounded-full bg-orange-500/80 mix-blend-screen -ml-3" />
                      </div>
                    </div>
                    <div className="space-y-1 z-10">
                      <div className="flex justify-between text-stone-400 text-sm font-medium">
                        <span>Card Number</span>
                        <span>Exp</span>
                      </div>
                      <div className="flex justify-between text-lg tracking-widest font-mono">
                        <span>**** **** **** 4242</span>
                        <span>12/28</span>
                      </div>
                    </div>
                  </div>

                  {/* Clean Form Inputs */}
                  <div className="space-y-4">
                    <input type="text" placeholder="Cardholder Name" className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-800 font-medium placeholder:text-stone-400 transition-shadow" defaultValue="Alex Designer" />
                    <div className="flex gap-4">
                      <input type="text" placeholder="MM/YY" className="w-1/2 bg-stone-50 border-none rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-800 font-medium placeholder:text-stone-400 transition-shadow" defaultValue="12/28" />
                      <input type="password" placeholder="CVV" className="w-1/2 bg-stone-50 border-none rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-800 font-medium placeholder:text-stone-400 transition-shadow" defaultValue="123" />
                    </div>
                  </div>
                </div>
              )}

              {selectedMethod === "apple" && (
                <div className="py-12 flex flex-col items-center text-center space-y-6">
                  <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center relative">
                     <div className="absolute inset-0 border-2 border-stone-200 rounded-full animate-ping opacity-20" />
                     <Smartphone size={40} className="text-stone-900" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-stone-800 mb-2">Double Click to Pay</h3>
                    <p className="text-stone-500 text-sm">Use Face ID or Touch ID on your device.</p>
                  </div>
                </div>
              )}

              {selectedMethod === "upi" && (
                <div className="py-8 flex flex-col items-center text-center space-y-8">
                  <div className="w-48 h-48 bg-stone-50 rounded-3xl p-4 shadow-inner border border-stone-100">
                    {/* Simulated QR Code */}
                    <div className="w-full h-full bg-white rounded-xl border border-stone-200 flex items-center justify-center overflow-hidden relative">
                       <div className="grid grid-cols-4 grid-rows-4 gap-2 w-32 h-32 opacity-20">
                          {Array.from({length: 16}).map((_, i) => (
                            <div key={i} className={`bg-stone-900 rounded-sm ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`} />
                          ))}
                       </div>
                       <ScanLine size={32} className="absolute text-stone-900 bg-white p-1 rounded-md shadow-sm" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-stone-800 mb-2">Scan with any UPI App</h3>
                    <p className="text-stone-500 text-sm">GPay, PhonePe, Paytm, or enter VPA below.</p>
                  </div>
                  <div className="w-full flex">
                    <input type="text" placeholder="yourname@upi" className="w-full bg-stone-50 border-none rounded-l-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-stone-200 text-stone-800 font-medium placeholder:text-stone-400 transition-shadow" />
                    <button onClick={() => alert('VPA Verified!')} className="bg-stone-200 text-stone-700 px-6 rounded-r-2xl font-medium hover:bg-stone-300 transition-colors">Verify</button>
                  </div>
                </div>
              )}

              {selectedMethod === "paypal" && (
                <div className="py-12 flex flex-col items-center text-center space-y-6">
                  <div className="w-24 h-24 bg-[#E8F0FE] rounded-full flex items-center justify-center">
                     <Wallet size={40} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-medium text-stone-800 mb-2">Redirecting to PayPal</h3>
                    <p className="text-stone-500 text-sm">You'll complete the payment securely on PayPal's platform.</p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button 
                onClick={handlePay}
                disabled={paymentState === "processing"}
                className={`w-full mt-10 py-5 rounded-full font-medium text-lg transition-all flex justify-center items-center ${
                  paymentState === "processing" 
                    ? "bg-stone-200 text-stone-500 cursor-not-allowed" 
                    : "bg-stone-900 text-white hover:bg-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.2)] hover:-translate-y-1"
                }`}
              >
                {paymentState === "processing" ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-6 h-6 border-2 border-stone-500 border-t-transparent rounded-full" />
                ) : (
                  `Pay $${amount}`
                )}
              </button>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
