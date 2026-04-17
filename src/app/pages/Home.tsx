import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform, AnimatePresence } from "motion/react";
import {
  Zap, ShieldCheck, Sparkles, ArrowRight, Brain, TrendingUp,
  Lock, Globe2, LineChart, Repeat, Play, Clock, Video, Check,
  Building2, CreditCard, Smartphone, ScanLine
} from "lucide-react";

// Animated Payze mark (matches favicon)
function PayzeMark({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="home-mark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00D4AA">
            <animate attributeName="stop-color" values="#00D4AA;#00A3FF;#7F77DD;#00D4AA" dur="4s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#00A3FF">
            <animate attributeName="stop-color" values="#00A3FF;#7F77DD;#00D4AA;#00A3FF" dur="4s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="114" fill="url(#home-mark)" />
      <rect x="134" y="136" width="62" height="298" rx="31" fill="#ffffff" />
      <path d="M165 136 L290 136 C348 136 388 172 388 228 C388 284 348 320 290 320 L165 320"
        stroke="#ffffff" strokeWidth="62" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="248" y="380" width="130" height="18" rx="9" fill="#ffffff" opacity="0.55" />
      <rect x="248" y="414" width="90" height="18" rx="9" fill="#ffffff" opacity="0.35" />
      <rect x="248" y="448" width="56" height="18" rx="9" fill="#ffffff" opacity="0.2" />
    </svg>
  );
}

// Count-up animation for numbers
function CountUp({ end, suffix = "", prefix = "", duration = 2 }: { end: number; suffix?: string; prefix?: string; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = (ts - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(end * eased));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return <span>{prefix}{value.toLocaleString()}{suffix}</span>;
}

// Floating method pill for hero
function MethodPill({ label, delay, className = "" }: { label: string; delay: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`absolute px-4 py-2 rounded-full bg-white/80 backdrop-blur-xl border border-stone-200/60 shadow-lg text-sm font-medium text-stone-800 whitespace-nowrap ${className}`}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3 + delay, repeat: Infinity, ease: "easeInOut" }}
      >
        {label}
      </motion.div>
    </motion.div>
  );
}

export function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.92]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.3]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-900 overflow-x-hidden">

      {/* ───────── NAVIGATION ───────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-5 backdrop-blur-2xl bg-[#FAFAF8]/70 border-b border-stone-200/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <PayzeMark size={32} />
            <span className="font-bold tracking-tight text-xl"
              style={{
                background: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 50%, #7F77DD 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "payzeGrad 4s ease infinite",
              }}>
              Payze
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#benefits" className="hover:text-stone-900 transition-colors">Benefits</a>
            <a href="#ai" className="hover:text-stone-900 transition-colors">Intelligence</a>
            <a href="#numbers" className="hover:text-stone-900 transition-colors">Numbers</a>
            <a href="#tech" className="hover:text-stone-900 transition-colors">Technology</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/app" className="hidden md:inline-flex text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
              Sign in
            </Link>
            <Link to="/book-demo"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white transition-all hover:shadow-lg"
              style={{ background: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 100%)" }}>
              Book a demo <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <style>{`@keyframes payzeGrad { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }`}</style>
      </nav>

      {/* ───────── HERO ───────── */}
      <motion.section
        style={{ scale: heroScale, opacity: heroOpacity }}
        className="relative min-h-screen pt-32 pb-20 px-6 md:px-12 flex items-center overflow-hidden"
      >
        {/* Background orbs */}
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] bg-gradient-to-br from-[#00D4AA]/20 to-[#00A3FF]/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-[10%] right-[5%] w-[450px] h-[450px] bg-gradient-to-tr from-[#7F77DD]/20 to-[#00A3FF]/15 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-xl border border-stone-200/50 mb-8 shadow-sm"
            >
              <Sparkles size={14} className="text-[#00A3FF]" />
              <span className="text-xs font-medium tracking-wider uppercase text-stone-700">AI-native payments, built for 2026</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95] mb-8"
            >
              We recover
              <br />
              payments <span style={{
                background: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 50%, #7F77DD 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>competitors lose.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="text-lg md:text-xl text-stone-500 leading-relaxed max-w-xl mb-10"
            >
              Payze is the only payments platform with a self-learning AI that detects failures the moment they begin, reroutes transactions mid-flight, and turns lost checkouts into revenue. <span className="text-stone-700 font-medium">Merchants using Payze recover an average of 12.4% more revenue</span> — without changing a line of code.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link to="/book-demo"
                className="group flex items-center gap-3 px-7 py-4 rounded-full text-white font-medium shadow-xl hover:shadow-2xl transition-all"
                style={{ background: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 100%)" }}>
                <Video size={18} />
                Book a 30-min demo
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/app" className="group flex items-center gap-2 px-7 py-4 rounded-full bg-white border border-stone-200 text-stone-800 font-medium hover:bg-stone-50 transition-all">
                <Play size={16} className="text-[#00A3FF]" />
                Watch a 2-min tour
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12 flex items-center gap-6 text-sm text-stone-500"
            >
              <div className="flex items-center gap-2"><Check size={14} className="text-[#00D4AA]" /> No credit card</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-[#00D4AA]" /> Setup in 8 minutes</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-[#00D4AA]" /> 99.99% uptime SLA</div>
            </motion.div>
          </div>

          {/* Hero visual — floating payment methods + central orb */}
          <div className="md:col-span-5 relative h-[500px] flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="relative w-[380px] h-[380px]"
            >
              {/* Central gradient orb */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full shadow-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 50%, #7F77DD 100%)" }}
              >
                <div className="text-center text-white">
                  <div className="text-6xl font-light tracking-tight mb-2">
                    <CountUp end={12} duration={2} />.<CountUp end={4} duration={2} />%
                  </div>
                  <div className="text-sm font-medium uppercase tracking-widest opacity-90">Recovery rate</div>
                </div>
              </motion.div>

              {/* Floating pills */}
              <MethodPill label="✓ UPI • ₹4,500" delay={0.5} className="top-0 left-[-40px]" />
              <MethodPill label="✓ Visa • $89.00" delay={0.8} className="top-[40px] right-[-20px]" />
              <MethodPill label="→ Retry succeeded" delay={1.1} className="bottom-[60px] left-[-60px]" />
              <MethodPill label="✓ Apple Pay • £49" delay={1.4} className="bottom-[20px] right-[10px]" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ───────── LOGO STRIP ───────── */}
      <section className="px-6 md:px-12 py-10 border-y border-stone-200/50 bg-white/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-stone-400 mb-8">
            Trusted by 2,400+ fast-growing companies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-70">
            {['ACME Corp', 'Nova Fintech', 'Meridian', 'Luminary', 'Axiora', 'Prism', 'Vanta', 'Horizon'].map(name => (
              <span key={name} className="text-2xl font-light tracking-tight text-stone-500">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── BENEFITS ───────── */}
      <section id="benefits" className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#00A3FF]">Customer benefits</span>
            <h2 className="text-4xl md:text-6xl font-light tracking-tight mt-4 mb-6">
              Every advantage a modern merchant needs, in one seamless platform.
            </h2>
            <p className="text-lg text-stone-500 leading-relaxed">
              We obsess over the moments where money moves — and where it stops moving. Here's what you get when you stop worrying about payments.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: "Recover lost revenue automatically",
                desc: "Our AI retries failed transactions at the exact moment each customer is most likely to succeed — learned from millions of signals. Average customer sees 12.4% more completed payments.",
                tint: "from-[#00D4AA]/20 to-[#00A3FF]/10",
                accent: "text-[#0F6E56]",
              },
              {
                icon: Zap,
                title: "Launch in minutes, not months",
                desc: "One SDK. One dashboard. Every payment method your customers want — UPI, cards, wallets, BNPL, EMI, Apple Pay, QR. No separate integrations to maintain.",
                tint: "from-[#00A3FF]/20 to-[#7F77DD]/10",
                accent: "text-[#185FA5]",
              },
              {
                icon: ShieldCheck,
                title: "Bank-grade security without the friction",
                desc: "PCI DSS Level 1. 3DS2 intelligent routing. ML-based fraud scoring that blocks bad actors without blocking your customers. Dispute win rate 2.3× the industry average.",
                tint: "from-[#7F77DD]/20 to-[#00D4AA]/10",
                accent: "text-[#3C3489]",
              },
              {
                icon: LineChart,
                title: "See insights no one else gives you",
                desc: "Live payment health score. Peer benchmarking against your industry. AI-generated anomaly explanations in plain English. We tell you what to fix and what it's worth.",
                tint: "from-[#00D4AA]/15 to-[#00A3FF]/15",
                accent: "text-[#0F6E56]",
              },
              {
                icon: Repeat,
                title: "Recurring revenue that just works",
                desc: "UPI AutoPay, NACH e-mandates, international recurring — one API for every subscription model. Dunning on autopilot, churn prediction built-in.",
                tint: "from-[#00A3FF]/15 to-[#7F77DD]/15",
                accent: "text-[#185FA5]",
              },
              {
                icon: Globe2,
                title: "Global-ready from day one",
                desc: "135+ currencies. Local methods in every major market. GST-compliant invoicing for India, tax logic that adapts per geography. Expand without re-architecting.",
                tint: "from-[#7F77DD]/15 to-[#00D4AA]/15",
                accent: "text-[#3C3489]",
              },
            ].map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                whileHover={{ y: -6 }}
                className="group relative p-8 bg-white/60 backdrop-blur-xl rounded-[32px] border border-stone-200/50 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_16px_40px_rgb(0,0,0,0.06)] transition-all overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${b.tint} opacity-0 group-hover:opacity-100 transition-opacity -z-10`} />
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.tint} flex items-center justify-center mb-6 ${b.accent}`}>
                  <b.icon size={26} />
                </div>
                <h3 className="text-xl font-medium text-stone-900 mb-3 leading-tight">{b.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── AI INTELLIGENCE ───────── */}
      <section id="ai" className="relative px-6 md:px-12 py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800 -z-10" />
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-[#00D4AA]/20 to-transparent rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-[#7F77DD]/20 to-transparent rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#00D4AA]">AI-driven</span>
            <h2 className="text-4xl md:text-6xl font-light tracking-tight mt-4 mb-6 text-white">
              Intelligence that acts, not just reports.
            </h2>
            <p className="text-lg text-stone-300 leading-relaxed">
              Most analytics tools show you what happened. Payze's AI detects what's breaking, acts on it in real time, and asks you afterwards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Anomaly card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px]"
            >
              <div className="flex items-center gap-3 mb-4 text-[#00D4AA]">
                <Brain size={20} />
                <span className="text-xs font-semibold uppercase tracking-widest">Live anomaly detection</span>
              </div>
              <p className="text-white text-lg leading-relaxed mb-6">
                "HDFC Visa failures jumped from 4% to 13% at 10:40 AM. I've already enabled fallback routing — last 20 transactions succeeded. Keep it on past today?"
              </p>
              <div className="flex gap-3">
                <button className="px-5 py-2 rounded-full bg-[#00D4AA] text-stone-900 text-sm font-medium">Yes, keep on</button>
                <button className="px-5 py-2 rounded-full border border-white/20 text-white text-sm font-medium">Revert</button>
              </div>
              <div className="mt-6 pt-6 border-t border-white/10 flex justify-between text-xs text-stone-400">
                <span>Detected 37 seconds ago</span>
                <span>Recovered revenue: $4,280</span>
              </div>
            </motion.div>

            {/* Capabilities */}
            <div className="space-y-6">
              {[
                { icon: Brain, title: "Intelligent retry engine", desc: "Learns per-customer, per-bank, per-time-of-day which retry windows maximize authorization rates." },
                { icon: ShieldCheck, title: "Fraud detection that gets smarter", desc: "ML model trained on 180M+ transactions. Adapts to new attack patterns within hours, not months." },
                { icon: LineChart, title: "Explained, not just charted", desc: "Every chart answers 'why?' in one click. Root cause analysis built in. Actionable, always." },
                { icon: Sparkles, title: "Conversational insights", desc: "Ask Payze anything. 'Why did conversion drop Tuesday?' — get a clear answer in plain English." },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-5 p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
                >
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-[#00D4AA] to-[#00A3FF] flex items-center justify-center text-white">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">{item.title}</h3>
                    <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── NUMBERS ───────── */}
      <section id="numbers" className="px-6 md:px-12 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#00A3FF]">Numbers that matter</span>
            <h2 className="text-4xl md:text-6xl font-light tracking-tight mt-4">
              Performance measured in outcomes.
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { n: 12, suffix: '.4%', label: 'Avg revenue recovered', sub: 'via intelligent retries', color: '#00D4AA' },
              { n: 99, suffix: '.99%', label: 'Uptime SLA', sub: 'across all regions', color: '#00A3FF' },
              { n: 142, prefix: '$', suffix: 'M', label: 'Processed daily', sub: 'and growing weekly', color: '#7F77DD' },
              { n: 8, suffix: 'min', label: 'Average setup time', sub: 'to first live payment', color: '#00D4AA' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 bg-white/60 backdrop-blur-xl rounded-[32px] border border-stone-200/50"
              >
                <div className="text-5xl md:text-6xl font-light tracking-tight mb-4" style={{ color: stat.color }}>
                  <CountUp end={stat.n} prefix={stat.prefix} suffix={stat.suffix} />
                </div>
                <div className="text-stone-900 font-medium mb-1">{stat.label}</div>
                <div className="text-stone-500 text-sm">{stat.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Secondary metrics row */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { label: 'Payment methods supported', value: '40+', icon: CreditCard },
              { label: 'Currencies', value: '135+', icon: Globe2 },
              { label: 'Countries live today', value: '62', icon: Building2 },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-5 p-6 bg-white/40 backdrop-blur-xl rounded-2xl border border-stone-200/40">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D4AA]/15 to-[#00A3FF]/15 flex items-center justify-center text-[#00A3FF]">
                  <m.icon size={20} />
                </div>
                <div>
                  <div className="text-2xl font-light text-stone-900">{m.value}</div>
                  <div className="text-xs text-stone-500 uppercase tracking-wider">{m.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── TECHNOLOGY ───────── */}
      <section id="tech" className="px-6 md:px-12 py-24 md:py-32 bg-gradient-to-b from-transparent to-stone-100/40">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#7F77DD]">Tech-driven</span>
            <h2 className="text-4xl md:text-6xl font-light tracking-tight mt-4 mb-6">
              Infrastructure built to outlast the next decade.
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {[
              { title: 'Multi-region by default', desc: 'Writes replicated to 3 continents. Zero-downtime failover tested weekly.', icon: Globe2 },
              { title: 'Event-driven core', desc: 'Every transaction is an event. Replayable. Auditable. Perfectly consistent.', icon: Zap },
              { title: 'P99 latency < 180ms', desc: 'Faster than the blink of an eye, worldwide.', icon: Clock },
              { title: 'Zero-trust security', desc: 'Every request signed and verified. Every secret rotated nightly.', icon: Lock },
            ].map((t, i) => (
              <motion.div
                key={t.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-6 bg-white/70 backdrop-blur-xl rounded-[24px] border border-stone-200/50"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center mb-4">
                  <t.icon size={18} />
                </div>
                <h3 className="text-stone-900 font-medium mb-2">{t.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{t.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Payment methods visual */}
          <div className="mt-16 p-8 md:p-12 bg-white/60 backdrop-blur-xl rounded-[40px] border border-stone-200/50">
            <h3 className="text-2xl font-light text-stone-900 mb-2">Every payment method, one integration.</h3>
            <p className="text-stone-500 mb-8">Your customers pick how they pay. You just get paid.</p>
            <div className="flex flex-wrap gap-3">
              {[
                'Visa', 'Mastercard', 'Amex', 'RuPay', 'UPI', 'UPI AutoPay', 'Apple Pay', 'Google Pay', 'Samsung Pay',
                'Paytm', 'PhonePe', 'Amazon Pay', 'LazyPay', 'Simpl', 'ZestMoney', 'NACH', 'SEPA', 'ACH',
                'EMI (Card)', 'Cardless EMI', 'Net Banking', 'QR (Static)', 'QR (Dynamic)', 'WhatsApp Pay',
              ].map((m) => (
                <span key={m} className="px-4 py-2 rounded-full bg-stone-100 text-stone-700 text-sm font-medium border border-stone-200/50">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── TESTIMONIAL ───────── */}
      <section className="px-6 md:px-12 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-[120px] leading-none font-serif text-stone-200">"</div>
          <blockquote className="text-2xl md:text-4xl font-light tracking-tight text-stone-800 leading-snug -mt-12 mb-10">
            Before Payze, we lost 14% of checkouts to failed payments we couldn't explain. Three months in, we've recovered <span style={{ background: "linear-gradient(135deg, #00D4AA, #00A3FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>$2.1M</span> in revenue that was already walking out the door.
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: "linear-gradient(135deg, #00D4AA, #00A3FF)" }}>SC</div>
            <div className="text-left">
              <div className="font-medium text-stone-900">Sarah Connor</div>
              <div className="text-sm text-stone-500">VP Engineering, Acme Corporation</div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="px-6 md:px-12 py-24">
        <div className="max-w-5xl mx-auto relative overflow-hidden rounded-[48px] p-12 md:p-20 text-center"
          style={{ background: "linear-gradient(135deg, #00D4AA 0%, #00A3FF 50%, #7F77DD 100%)" }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 80%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="relative">
            <h2 className="text-4xl md:text-6xl font-light tracking-tight text-white mb-6">
              Ready to recover revenue<br />you didn't know you were losing?
            </h2>
            <p className="text-white/90 text-lg mb-10 max-w-xl mx-auto">
              Book 30 minutes with our team. We'll show you the revenue leak in your current stack — live, on your data.
            </p>
            <Link to="/book-demo"
              className="inline-flex items-center gap-3 px-8 py-5 rounded-full bg-white text-stone-900 font-medium shadow-2xl hover:scale-105 transition-transform"
            >
              <Video size={20} />
              Book your demo now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── FOOTER ───────── */}
      <footer className="px-6 md:px-12 py-12 border-t border-stone-200/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <PayzeMark size={28} />
            <span className="font-semibold text-stone-900">Payze</span>
            <span className="text-stone-400 text-sm">© 2026 · Pay with Ease</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-stone-500">
            <a href="#" className="hover:text-stone-900">Privacy</a>
            <a href="#" className="hover:text-stone-900">Terms</a>
            <a href="#" className="hover:text-stone-900">Security</a>
            <a href="#" className="hover:text-stone-900">Status</a>
            <Link to="/app" className="hover:text-stone-900">Customer sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
