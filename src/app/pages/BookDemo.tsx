import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Calendar, Clock, Video, Check, ArrowRight, Mail, Building2, User, Phone, Users } from "lucide-react";
import { toast } from "sonner";
import { bookingService } from "../../services";
import { useAsync } from "../../hooks/useAsync";
import { Spinner, ErrorState } from "../components/Loaders";

function PayzeMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="book-mark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4AA" />
          <stop offset="100%" stopColor="#00A3FF" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="114" fill="url(#book-mark)" />
      <rect x="134" y="136" width="62" height="298" rx="31" fill="#ffffff" />
      <path d="M165 136 L290 136 C348 136 388 172 388 228 C388 284 348 320 290 320 L165 320"
        stroke="#ffffff" strokeWidth="62" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

type Step = 'pick-slot' | 'details' | 'confirmed';

export function BookDemoPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('pick-slot');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', company: '', phone: '', role: '', teamSize: '' });
  const [booking, setBooking] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: availability, loading, error, refetch } = useAsync(() => bookingService.getAvailability(), []);

  if (error) return <ErrorState message="Couldn't load availability" onRetry={refetch} />;

  const formatDateLabel = (iso: string) => {
    const d = new Date(iso);
    return {
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      full: d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
    };
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.company || !selectedDate || !selectedTime) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const result = await bookingService.create({
        ...form,
        date: selectedDate,
        time: selectedTime,
        timezone: tz,
      });
      setBooking(result);
      setStep('confirmed');
      toast.success('Demo confirmed! Check your inbox.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Background orbs */}
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-gradient-to-br from-[#00D4AA]/15 to-[#00A3FF]/15 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-gradient-to-tr from-[#7F77DD]/15 to-[#00A3FF]/15 rounded-full blur-[100px] -z-10" />

      {/* Top bar */}
      <nav className="px-6 md:px-12 py-5 flex items-center justify-between border-b border-stone-200/50 bg-[#FAFAF8]/70 backdrop-blur-xl sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3">
          <PayzeMark size={32} />
          <span className="font-bold text-xl tracking-tight"
            style={{ background: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 50%, #7F77DD 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Payze
          </span>
        </Link>
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors">
          <ArrowLeft size={16} /> Back to home
        </button>
      </nav>

      {/* Progress indicator */}
      {step !== 'confirmed' && (
        <div className="px-6 md:px-12 py-6 max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            {['pick-slot', 'details'].map((s, i) => {
              const isActive = step === s;
              const isDone = step === 'details' && s === 'pick-slot';
              return (
                <div key={s} className="flex items-center gap-4 flex-1">
                  <div className={`flex items-center gap-3 ${isActive || isDone ? 'text-stone-900' : 'text-stone-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                      isDone ? 'bg-[#00D4AA] text-white' :
                      isActive ? 'bg-stone-900 text-white' : 'bg-stone-200 text-stone-500'
                    }`}>
                      {isDone ? <Check size={14} /> : i + 1}
                    </div>
                    <span className="font-medium text-sm">{s === 'pick-slot' ? 'Pick a time' : 'Your details'}</span>
                  </div>
                  {i < 1 && <div className={`flex-1 h-px ${isDone ? 'bg-[#00D4AA]' : 'bg-stone-200'}`} />}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <main className="px-6 md:px-12 py-8 pb-20 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {/* STEP 1 — pick slot */}
          {step === 'pick-slot' && (
            <motion.div
              key="pick-slot"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-10">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-900 mb-3">
                  Book your 30-minute demo.
                </h1>
                <p className="text-stone-500 text-lg max-w-2xl">
                  We'll walk you through Payze on your actual data, show you the revenue leak in your current stack, and answer every question.
                </p>
              </div>

              <div className="grid md:grid-cols-5 gap-6">
                {/* Date picker */}
                <div className="md:col-span-3 bg-white/70 backdrop-blur-xl rounded-[32px] border border-stone-200/50 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={16} className="text-[#00A3FF]" />
                    <h3 className="font-medium text-stone-900">Select a date</h3>
                  </div>
                  {loading || !availability ? (
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="h-16 bg-stone-100 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 md:grid-cols-5 gap-2 max-h-[340px] overflow-y-auto">
                      {availability.map((slot: any) => {
                        const label = formatDateLabel(slot.date);
                        const isSelected = selectedDate === slot.date;
                        return (
                          <button
                            key={slot.date}
                            onClick={() => { setSelectedDate(slot.date); setSelectedTime(null); }}
                            className={`p-3 rounded-xl text-center transition-all ${
                              isSelected
                                ? 'bg-stone-900 text-white shadow-md'
                                : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                            }`}
                          >
                            <div className="text-[10px] uppercase tracking-wider opacity-70">{label.weekday}</div>
                            <div className="text-lg font-medium">{label.day}</div>
                            <div className="text-[10px] opacity-70">{label.month}</div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Time slots */}
                <div className="md:col-span-2 bg-white/70 backdrop-blur-xl rounded-[32px] border border-stone-200/50 p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} className="text-[#00A3FF]" />
                    <h3 className="font-medium text-stone-900">
                      {selectedDate ? formatDateLabel(selectedDate).full : 'Pick a date first'}
                    </h3>
                  </div>

                  {!selectedDate ? (
                    <div className="flex flex-col items-center justify-center py-20 text-stone-400 text-sm">
                      <Calendar size={32} className="mb-3 opacity-40" />
                      Select a date to see available times
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {availability?.find((s: any) => s.date === selectedDate)?.times.map((t: string) => (
                        <button
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={`w-full px-4 py-3 rounded-xl font-medium text-sm text-left transition-all flex items-center justify-between ${
                            selectedTime === t
                              ? 'bg-stone-900 text-white shadow-md'
                              : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200/50'
                          }`}
                        >
                          <span>{t}</span>
                          <span className="text-xs opacity-60">30 min</span>
                        </button>
                      ))}
                      <p className="text-xs text-stone-400 mt-4">
                        Times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setStep('details')}
                  disabled={!selectedDate || !selectedTime}
                  className="flex items-center gap-2 px-7 py-4 rounded-full text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  style={{ background: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 100%)" }}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2 — details form */}
          {step === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="mb-10">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-900 mb-3">
                  Tell us about yourself.
                </h1>
                <p className="text-stone-500">
                  We'll send the Zoom link to your inbox and add the meeting to your calendar.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white/70 backdrop-blur-xl rounded-[32px] border border-stone-200/50 p-8 shadow-sm">
                  <div className="grid md:grid-cols-2 gap-5">
                    <Field icon={User} label="Full name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Sarah Connor" />
                    <Field icon={Mail} label="Work email *" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="sarah@acme.com" type="email" />
                    <Field icon={Building2} label="Company *" value={form.company} onChange={(v) => setForm({ ...form, company: v })} placeholder="Acme Corporation" />
                    <Field icon={Phone} label="Phone (optional)" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+1 (555) 000-0000" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5 mt-5">
                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                        <User size={13} /> Your role
                      </label>
                      <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00A3FF]/30"
                      >
                        <option value="">Select...</option>
                        <option>Founder / CEO</option>
                        <option>CTO / Head of Engineering</option>
                        <option>Product Manager</option>
                        <option>Finance / Operations</option>
                        <option>Developer</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                        <Users size={13} /> Team size
                      </label>
                      <select
                        value={form.teamSize}
                        onChange={(e) => setForm({ ...form, teamSize: e.target.value })}
                        className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00A3FF]/30"
                      >
                        <option value="">Select...</option>
                        <option>1–10</option>
                        <option>11–50</option>
                        <option>51–200</option>
                        <option>201–1,000</option>
                        <option>1,000+</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <button
                      onClick={() => setStep('pick-slot')}
                      className="flex items-center gap-2 text-stone-500 hover:text-stone-900 text-sm font-medium"
                    >
                      <ArrowLeft size={14} /> Change time
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || !form.name || !form.email || !form.company}
                      className="flex items-center gap-2 px-7 py-4 rounded-full text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      style={{ background: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 100%)" }}
                    >
                      {submitting ? <><Spinner size={18} /> Booking...</> : <>Confirm & send Zoom link <ArrowRight size={16} /></>}
                    </button>
                  </div>
                </div>

                {/* Summary sidebar */}
                <aside className="bg-white/70 backdrop-blur-xl rounded-[32px] border border-stone-200/50 p-6 shadow-sm h-fit">
                  <div className="flex items-center gap-2 mb-4 text-[#00A3FF]">
                    <Video size={16} />
                    <h3 className="font-medium text-stone-900">Your demo</h3>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-stone-400 mb-1">Date</div>
                      <div className="text-stone-900 font-medium">{selectedDate ? formatDateLabel(selectedDate).full : '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-stone-400 mb-1">Time</div>
                      <div className="text-stone-900 font-medium">{selectedTime ?? '—'} <span className="text-stone-400 font-normal">(30 min)</span></div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider text-stone-400 mb-1">Format</div>
                      <div className="text-stone-900 font-medium flex items-center gap-2"><Video size={14} /> Zoom (auto-scheduled)</div>
                    </div>
                    <div className="pt-4 border-t border-stone-200/50">
                      <div className="text-xs uppercase tracking-wider text-stone-400 mb-2">You'll receive</div>
                      <div className="space-y-1.5 text-stone-700">
                        <div className="flex items-center gap-2"><Check size={12} className="text-[#00D4AA]" /> Zoom link by email</div>
                        <div className="flex items-center gap-2"><Check size={12} className="text-[#00D4AA]" /> Calendar invite (.ics)</div>
                        <div className="flex items-center gap-2"><Check size={12} className="text-[#00D4AA]" /> Prep docs + demo agenda</div>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — confirmation + email preview */}
          {step === 'confirmed' && booking && (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto text-center pt-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 rounded-full mx-auto mb-8 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 100%)" }}
              >
                <Check size={44} className="text-white" strokeWidth={3} />
              </motion.div>

              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-900 mb-4">
                You're booked in, {booking.name.split(' ')[0]}.
              </h1>
              <p className="text-stone-500 text-lg mb-10 max-w-xl mx-auto">
                We've sent everything to <span className="text-stone-900 font-medium">{booking.email}</span> — including the Zoom link, calendar invite, and a short prep guide.
              </p>

              {/* Email preview card */}
              <div className="text-left bg-white rounded-[32px] border border-stone-200/50 shadow-2xl overflow-hidden max-w-2xl mx-auto mb-10">
                <div className="px-6 py-4 bg-stone-50 border-b border-stone-200/50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #00D4AA, #00A3FF)" }}>
                    <PayzeMark size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-stone-900">hello@payze.com</div>
                    <div className="text-xs text-stone-500">to {booking.email}</div>
                  </div>
                  <div className="text-xs text-stone-400">Just now</div>
                </div>
                <div className="p-6">
                  <h3 className="font-medium text-stone-900 mb-3">
                    Your Payze demo is confirmed — {formatDateLabel(booking.date).full} at {booking.time}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-4">
                    Hi {booking.name.split(' ')[0]},
                  </p>
                  <p className="text-sm text-stone-600 leading-relaxed mb-4">
                    Looking forward to our conversation. Here's everything you need:
                  </p>
                  <div className="bg-stone-50 rounded-2xl p-5 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Video size={20} className="text-[#00A3FF]" />
                      <div className="flex-1">
                        <div className="font-medium text-stone-900 text-sm">Join Zoom Meeting</div>
                        <div className="text-xs text-stone-500">Meeting ID: {booking.zoomMeetingId}</div>
                      </div>
                    </div>
                    <a href={booking.zoomJoinUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-medium"
                      style={{ background: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 100%)" }}>
                      <Video size={14} /> Join meeting
                    </a>
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    We'll come prepared with insights specific to {booking.company} — bring questions, bring your team, bring your hardest payments problem.
                  </p>
                  <p className="text-sm text-stone-600 mt-4">— The Payze team</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4">
                <a href={booking.zoomJoinUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-7 py-4 rounded-full text-white font-medium"
                  style={{ background: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 100%)" }}>
                  <Video size={16} /> Test the Zoom link
                </a>
                <Link to="/" className="flex items-center gap-2 px-7 py-4 rounded-full bg-white border border-stone-200 text-stone-800 font-medium">
                  Back to home
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, placeholder, type = 'text' }: any) {
  return (
    <div>
      <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
        <Icon size={13} /> {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-stone-50 border border-stone-200/50 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#00A3FF]/30 transition-all"
      />
    </div>
  );
}
