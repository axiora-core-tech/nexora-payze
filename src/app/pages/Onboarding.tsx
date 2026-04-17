import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, FileCheck, Landmark, CheckCircle2, ChevronRight, ChevronLeft, UploadCloud, CreditCard, Building, ShieldCheck, Mail, Phone, MapPin, Search } from "lucide-react";

const STEPS = [
  "Business Details",
  "KYC Documents",
  "Bank Account",
  "Payment Methods",
  "White-Label",
  "Activation"
];

export function OnboardingPage() {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 relative pb-20">
      <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-100/40 to-cyan-100/40 rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-50 pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6 border border-blue-100/50">
            <Users size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-900 mb-4">Merchant Onboarding.</h1>
          <p className="text-stone-500 max-w-md text-lg leading-relaxed">
            Complete your profile to unlock payment aggregation and activate your account.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl px-6 py-4 rounded-full border border-stone-200/50 shadow-sm">
           <span className="text-sm font-medium text-stone-500 uppercase tracking-wider">Draft Saved</span>
           <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-200 -translate-y-1/2 rounded-full" />
        <div 
          className="absolute top-1/2 left-0 h-1 bg-stone-900 -translate-y-1/2 rounded-full transition-all duration-500"
          style={{ width: `${((step - 1) / 5) * 100}%` }}
        />
        <div className="relative flex justify-between w-full">
          {STEPS.map((s, i) => {
            const num = i + 1;
            const isPast = num < step;
            const isActive = num === step;
            return (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isPast ? 'bg-stone-900 text-white' : isActive ? 'bg-stone-900 text-white ring-4 ring-stone-200' : 'bg-stone-200 text-stone-500'
                }`}>
                  {isPast ? <CheckCircle2 size={16} /> : num}
                </div>
                <span className={`text-xs font-medium uppercase tracking-wider absolute top-12 whitespace-nowrap ${isActive ? 'text-stone-900' : 'text-stone-400'}`}>{s}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-stone-100 rounded-[40px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] min-h-[500px] flex flex-col">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div key="1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8 max-w-3xl">
                 <h3 className="text-2xl font-light text-stone-800">Business Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                       <label className="text-sm font-medium text-stone-500 mb-2 block">Legal Business Name</label>
                       <input type="text" className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-stone-200" placeholder="Acme Corporation Ltd." />
                    </div>
                    <div>
                       <label className="text-sm font-medium text-stone-500 mb-2 block">Business Type</label>
                       <select className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-stone-200 text-stone-700">
                          <option>D2C / E-Commerce</option>
                          <option>SaaS / Subscription</option>
                          <option>Marketplace</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-sm font-medium text-stone-500 mb-2 block">Monthly Volume</label>
                       <select className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-stone-200 text-stone-700">
                          <option>Under $10,000</option>
                          <option>$10k - $50k</option>
                          <option>$50k+</option>
                       </select>
                    </div>
                    <div>
                       <label className="text-sm font-medium text-stone-500 mb-2 block">PAN Number</label>
                       <div className="relative">
                         <input type="text" className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-stone-200 uppercase font-mono" placeholder="ABCDE1234F" />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Verified</span>
                       </div>
                    </div>
                    <div>
                       <label className="text-sm font-medium text-stone-500 mb-2 block">GSTIN</label>
                       <input type="text" className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-stone-200 uppercase font-mono" placeholder="22AAAAA0000A1Z5" />
                    </div>
                 </div>
              </motion.div>
            ) : step === 2 ? (
              <motion.div key="2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                 <div className="flex justify-between items-center">
                   <h3 className="text-2xl font-light text-stone-800">KYB Documents</h3>
                   <span className="text-stone-500 text-sm">2 of 4 required uploaded</span>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { name: "PAN Card", req: true, status: "verified" },
                      { name: "Certificate of Incorporation", req: true, status: "pending" },
                      { name: "GST Certificate", req: true, status: "uploading" },
                      { name: "Cancelled Cheque", req: true, status: "missing" },
                      { name: "Board Resolution", req: false, status: "missing" },
                    ].map((doc, i) => (
                      <div key={i} className="border border-stone-100 rounded-3xl p-6 hover:border-stone-200 transition-colors bg-stone-50/30 group">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                             <h4 className="font-medium text-stone-800">{doc.name}</h4>
                             <span className="text-xs text-stone-400 uppercase tracking-wider">{doc.req ? 'Required' : 'Optional'}</span>
                           </div>
                           {doc.status === 'verified' && <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><FileCheck size={16} /></div>}
                           {doc.status === 'uploading' && <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-stone-800 animate-spin" />}
                           {doc.status === 'missing' && <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center"><UploadCloud size={16} /></div>}
                           {doc.status === 'pending' && <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center"><Search size={16} /></div>}
                        </div>
                        {doc.status === 'missing' && (
                           <div className="border-2 border-dashed border-stone-200 rounded-2xl p-4 text-center cursor-pointer hover:bg-stone-100/50 transition-colors">
                             <p className="text-sm text-stone-500 font-medium">Click or drag to upload</p>
                             <p className="text-xs text-stone-400 mt-1">PDF, JPG up to 5MB</p>
                           </div>
                        )}
                        {doc.status === 'verified' && <p className="text-sm font-medium text-emerald-600">Verified securely</p>}
                      </div>
                    ))}
                 </div>
              </motion.div>
            ) : step === 3 ? (
              <motion.div key="3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8 max-w-2xl">
                 <h3 className="text-2xl font-light text-stone-800">Bank Account Setup</h3>
                 <p className="text-stone-500">Add the primary settlement account for daily payouts.</p>
                 
                 <div className="space-y-6">
                    <div>
                       <label className="text-sm font-medium text-stone-500 mb-2 block">Account Number</label>
                       <input type="password" placeholder="••••••••" className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-stone-200 font-mono tracking-widest" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                         <label className="text-sm font-medium text-stone-500 mb-2 block">Confirm Account</label>
                         <input type="text" className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-stone-200 font-mono" />
                      </div>
                      <div>
                         <label className="text-sm font-medium text-stone-500 mb-2 block">IFSC Code</label>
                         <input type="text" className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-stone-200 font-mono uppercase" placeholder="HDFC0000123" />
                      </div>
                    </div>
                    
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 mt-8 flex items-center justify-between">
                       <div>
                         <h4 className="font-medium text-indigo-900 mb-1">Penny Drop Verification</h4>
                         <p className="text-sm text-indigo-700/70">We will deposit ₹1 to instantly verify the account name.</p>
                       </div>
                       <button onClick={() => alert('Penny drop verification initiated')} className="px-6 py-3 bg-indigo-600 text-white rounded-full font-medium shadow-sm hover:bg-indigo-700 transition-colors">
                         Verify Instantly
                       </button>
                    </div>
                 </div>
              </motion.div>
            ) : step === 4 ? (
              <motion.div key="4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                 <div className="flex justify-between items-center">
                   <h3 className="text-2xl font-light text-stone-800">Payment Methods</h3>
                   <span className="px-4 py-2 bg-stone-100 rounded-full text-xs font-medium text-stone-600 uppercase tracking-wider">Recommended enabled</span>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { name: "Credit & Debit Cards", desc: "Visa, Mastercard, RuPay", enabled: true, fee: "1.8%" },
                      { name: "UPI Intent & Collect", desc: "GPay, PhonePe, Paytm", enabled: true, fee: "0%" },
                      { name: "Net Banking", desc: "50+ Supported Banks", enabled: true, fee: "1.5%" },
                      { name: "Wallets", desc: "Amazon Pay, MobiKwik", enabled: false, fee: "2.0%" },
                      { name: "Card EMI", desc: "EMI on Credit Cards", enabled: false, fee: "2.5%" },
                      { name: "International Cards", desc: "Global acceptance", enabled: false, fee: "3.5%" },
                    ].map((pm, i) => (
                      <div key={i} className={`border rounded-3xl p-6 transition-colors ${pm.enabled ? 'border-emerald-500/30 bg-emerald-50/10' : 'border-stone-100 bg-white/50'}`}>
                         <div className="flex justify-between items-start mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600">
                               <CreditCard size={18} />
                            </div>
                            <div className={`w-12 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors ${pm.enabled ? 'bg-emerald-500' : 'bg-stone-200'}`}>
                               <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${pm.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                         </div>
                         <h4 className="font-medium text-stone-800 mb-1">{pm.name}</h4>
                         <p className="text-xs text-stone-500 mb-4">{pm.desc}</p>
                         <p className="text-sm font-medium text-stone-900 border-t border-stone-100 pt-4">MDR: {pm.fee}</p>
                      </div>
                    ))}
                 </div>
              </motion.div>
            ) : step === 5 ? (
              <motion.div key="5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                 <h3 className="text-2xl font-light text-stone-800">White-Label Branding</h3>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-6 max-w-md">
                     <div>
                       <label className="text-sm font-medium text-stone-500 mb-2 block">Brand Primary Color</label>
                       <div className="flex gap-4">
                          <input type="color" defaultValue="#000000" className="w-12 h-12 rounded-xl cursor-pointer border-none bg-stone-50 p-1" />
                          <input type="text" defaultValue="#000000" className="flex-1 bg-stone-50 border-none rounded-2xl px-6 py-3 focus:ring-2 focus:ring-stone-200 font-mono" />
                       </div>
                     </div>
                     <div>
                       <label className="text-sm font-medium text-stone-500 mb-2 block">Brand Logo</label>
                       <div className="border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center cursor-pointer hover:bg-stone-50 transition-colors flex flex-col items-center gap-2">
                         <UploadCloud className="text-stone-400" />
                         <span className="text-sm font-medium text-stone-600">Upload SVG or PNG</span>
                       </div>
                     </div>
                     <div>
                       <label className="text-sm font-medium text-stone-500 mb-2 block">Custom Domain (Optional)</label>
                       <div className="flex">
                         <input type="text" placeholder="pay.yourbrand.com" className="w-full bg-stone-50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-stone-200" />
                       </div>
                     </div>
                   </div>

                   {/* Live Preview */}
                   <div className="bg-stone-50 border border-stone-100 rounded-[32px] p-8 flex flex-col items-center justify-center">
                      <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-6">Live Preview</p>
                      <div className="w-full max-w-sm bg-white rounded-3xl shadow-[0_20px_40px_rgb(0,0,0,0.08)] overflow-hidden border border-stone-100">
                         <div className="h-1.5 w-full bg-stone-900" /> {/* Brand color preview */}
                         <div className="p-6 text-center border-b border-stone-50">
                           <div className="w-12 h-12 bg-stone-100 rounded-full mx-auto mb-3" />
                           <p className="font-medium text-stone-800">Acme Corp</p>
                           <p className="text-2xl font-light mt-4">$120.00</p>
                         </div>
                         <div className="p-6 space-y-3">
                           <div className="h-12 w-full bg-stone-50 rounded-xl" />
                           <div className="h-12 w-full bg-stone-50 rounded-xl" />
                           <div className="h-12 w-full bg-stone-900 rounded-xl mt-4" /> {/* Brand color button */}
                         </div>
                      </div>
                   </div>
                 </div>
              </motion.div>
            ) : step === 6 ? (
              <motion.div key="6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                 <div className="text-center max-w-2xl mx-auto space-y-6 pt-12">
                    <div className="w-24 h-24 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-8 shadow-sm ring-8 ring-emerald-50/50">
                      <ShieldCheck size={48} />
                    </div>
                    <h3 className="text-4xl font-light text-stone-900 tracking-tight">Ready for Activation</h3>
                    <p className="text-stone-500 text-lg leading-relaxed">
                      Your documents are verified, and your payment environment is configured. By activating, you agree to the Payment Aggregator Master Agreement.
                    </p>
                    
                    <div className="bg-stone-50 rounded-3xl p-6 text-left text-sm mt-8 border border-stone-100">
                      <div className="flex justify-between py-3 border-b border-stone-200/60">
                         <span className="text-stone-500">Business Model</span>
                         <span className="font-medium text-stone-900">Payment Aggregator</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-stone-200/60">
                         <span className="text-stone-500">Settlement</span>
                         <span className="font-medium text-stone-900">T+1 to •••• 1234</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-stone-200/60">
                         <span className="text-stone-500">Methods Enabled</span>
                         <span className="font-medium text-stone-900">Cards, UPI, Net Banking</span>
                      </div>
                    </div>
                    
                    <div className="pt-8">
                       <button onClick={() => setStep(1)} className="px-8 py-4 bg-stone-900 text-white rounded-full font-medium text-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all">
                         Activate Live Mode
                       </button>
                    </div>
                 </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {step < 6 && (
          <div className="flex justify-between items-center mt-12 pt-6 border-t border-stone-100">
            <button 
              onClick={prevStep}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-stone-600 hover:bg-stone-100'}`}
            >
              <ChevronLeft size={18} /> Back
            </button>
            <button 
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-stone-900 text-white font-medium hover:bg-stone-800 transition-colors shadow-sm"
            >
              Continue <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
