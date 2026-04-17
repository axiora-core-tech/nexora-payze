import React from 'react';
import { Link } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import * as Icons from '../../design/icons';

export function Home() {
  return (
    <div style={{ background: colors.bg, color: colors.ink, minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(30,30,30,0.04) 1px, transparent 1px)', backgroundSize: '26px 26px', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '0 40px' }}>

        {/* Nav */}
        <nav style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.PayzeMark size={22} />
            <span style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em' }}>Payze</span>
          </Link>
          <div style={{ display: 'flex', gap: '32px', fontSize: '14px', color: colors.text2 }}>
            <a href="#product">Product</a>
            <a href="#how">How it works</a>
            <a href="#developers">Developers</a>
            <a href="#pricing">Pricing</a>
            <a href="#customers">Customers</a>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/app" style={{ fontSize: '14px', color: colors.text2 }}>Sign in</Link>
            <Link to="/book-demo" style={{ padding: '10px 18px', background: colors.teal, color: '#fff', borderRadius: radius.pill, fontSize: '13px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Get started <Icons.IconArrowUpRight size={13} color="#fff" />
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding: '80px 0 56px 0', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: colors.card, border: `0.5px solid ${colors.border}`, padding: '6px 14px 6px 8px', borderRadius: radius.pill, marginBottom: '36px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: colors.teal, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.IconCheck size={10} color="#fff" strokeWidth={3} />
            </span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: colors.ink }}>
              RBI-licensed · PCI-DSS Level 1 · Made in Bengaluru
            </span>
          </div>

          <div style={{ fontSize: '64px', fontWeight: 600, lineHeight: 1.02, letterSpacing: '-0.03em', maxWidth: '880px', margin: '0 auto 8px auto' }}>
            Payments infrastructure
          </div>
          <div style={{ fontSize: '88px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.035em', maxWidth: '960px', margin: '0 auto 36px auto' }}>
            for <span style={{ color: colors.teal, fontStyle: 'italic', fontWeight: 500 }}>every payment.</span>
          </div>

          <div style={{ fontSize: '17px', lineHeight: 1.55, color: colors.text2, maxWidth: '620px', margin: '0 auto 40px auto' }}>
            UPI, cards, NetBanking, wallets, SEPA, ACH — 135 currencies, one integration. When a card fails at HDFC, we route to ICICI, then RuPay, then UPI. Customers don't notice. You don't lose the sale.
          </div>

          <div style={{ display: 'inline-flex', gap: '10px' }}>
            <Link to="/book-demo" style={{ padding: '14px 24px', background: colors.ink, color: '#fff', borderRadius: radius.pill, fontSize: '14px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              Get started <Icons.IconArrowUpRight size={14} color="#fff" />
            </Link>
            <a href="#developers" style={{ padding: '14px 22px', border: `0.5px solid ${colors.borderStrong}`, color: colors.ink, borderRadius: radius.pill, fontSize: '14px', fontWeight: 500 }}>
              Talk to sales
            </a>
          </div>
        </section>

        {/* Trust strip */}
        <div style={{ padding: '32px 0 56px 0' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', color: colors.text3, textTransform: 'uppercase', textAlign: 'center', marginBottom: '22px' }}>Trusted by 47+ teams, including</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '52px', opacity: 0.7, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '22px', fontWeight: 600, fontStyle: 'italic', color: colors.text2 }}>zomato</span>
            <span style={{ fontSize: '19px', fontWeight: 700, color: colors.text2 }}>Razorpay</span>
            <span style={{ fontSize: '17px', fontWeight: 500, letterSpacing: '0.25em', color: colors.text2 }}>NYKAA</span>
            <span style={{ fontSize: '21px', fontWeight: 700, color: colors.text2 }}>CRED</span>
            <span style={{ fontSize: '17px', fontWeight: 500, letterSpacing: '0.08em', color: colors.text2 }}>BOOKMYSHOW</span>
            <span style={{ fontSize: '18px', fontWeight: 500, color: colors.text2 }}>urban co.</span>
          </div>
        </div>

        {/* How it works — animated infrastructure */}
        <section id="how" style={{ padding: '80px 0 60px 0', borderTop: `0.5px solid ${colors.border}` }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', color: colors.teal, textTransform: 'uppercase', marginBottom: '18px' }}>How it works</div>
            <div style={{ fontSize: '48px', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.025em', maxWidth: '720px', margin: '0 auto' }}>
              When a payment fails, Payze <span style={{ color: colors.teal }}>finds a way through.</span>
            </div>
          </div>

          <InfrastructureDiagram />
        </section>

        {/* Features grid */}
        <section id="product" style={{ padding: '80px 0 72px 0', borderTop: `0.5px solid ${colors.border}` }}>
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', color: colors.teal, textTransform: 'uppercase', marginBottom: '18px' }}>What you get</div>
            <div style={{ fontSize: '42px', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '680px' }}>
              Everything your payments stack needs,<br />nothing your team has to wire up.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <FeatureCard Icon={Icons.IconRoute} title="Intelligent routing" desc="Card declined at HDFC? We'll try ICICI, then RuPay, then UPI. The model learns per-bank, per-BIN, per-hour." />
            <FeatureCard Icon={Icons.IconRecurring} title="UPI Autopay & NACH" desc="Native support for every Indian recurring rail. Mandate onboarding that actually completes — 94% success vs industry 72%." />
            <FeatureCard Icon={Icons.IconShield} title="Fraud that stays quiet" desc="ML trained on 180M+ Indian transactions. False-positive rate 4× lower than rule-based systems. Dispute win rate 2.3× industry average." />
            <FeatureCard Icon={Icons.IconGlobe} title="Collect from anywhere" desc="135 currencies, every major local method — UPI, cards, SEPA, ACH, Pix, Alipay, FPX. Unified in INR in your dashboard." />
            <FeatureCard Icon={Icons.IconDeveloper} title="One-day integration" desc="Node, Python, PHP, Go, Ruby SDKs. Webhooks with retry & signing. Test in test mode, flip a toggle, you're live." />
            <FeatureCard Icon={Icons.IconChart} title="Reports that explain themselves" desc="Every anomaly described in plain English. Reconciliation reports auto-emailed. GST-ready exports." />
          </div>
        </section>

        {/* Numbers */}
        <section style={{ padding: '80px 0', borderTop: `0.5px solid ${colors.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', color: colors.teal, textTransform: 'uppercase', marginBottom: '28px' }}>By the numbers</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxWidth: '880px', margin: '0 auto' }}>
            <NumberTile value="12.4" unit="%" label="Average fallback recovery" />
            <NumberTile value="180" unit="ms" label="Median global latency" />
            <NumberTile value="135" unit="" label="Currencies supported" />
            <NumberTile value="99.99" unit="%" label="Uptime, measured" />
          </div>
        </section>

        {/* Testimonial */}
        <section style={{ padding: '80px 0', borderTop: `0.5px solid ${colors.border}` }}>
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div style={{ fontSize: '32px', fontWeight: 500, lineHeight: 1.3, letterSpacing: '-0.015em', marginBottom: '32px', color: colors.ink }}>
              <span style={{ color: colors.teal, marginRight: '8px' }}>"</span>
              We were losing 14% of checkouts to card declines we couldn't explain. Four weeks in on Payze, that number is 3.8%. Routing works, the integration was a day, and reconciliation reports now arrive on their own.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: colors.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>VK</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: colors.ink }}>Vikram Kothari</div>
                <div style={{ fontSize: '13px', color: colors.text2 }}>Head of Payments, Zomato Foods</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Final CTA (dark) */}
      <section style={{ padding: '80px 40px', background: colors.ink, color: '#F6F6F2', textAlign: 'center', borderTop: `0.5px solid ${colors.border}` }}>
        <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', color: '#8A9E9C', textTransform: 'uppercase', marginBottom: '22px' }}>Get started</div>
        <div style={{ fontSize: '60px', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: '760px', margin: '0 auto 24px auto' }}>
          Stop losing revenue<br />to payments that fail.
        </div>
        <div style={{ fontSize: '16px', lineHeight: 1.55, color: '#B4B4B0', maxWidth: '480px', margin: '0 auto 40px auto' }}>
          Talk to our team. We'll run a free audit on your current stack.
        </div>
        <div style={{ display: 'inline-flex', gap: '10px' }}>
          <Link to="/book-demo" style={{ padding: '14px 24px', background: colors.teal, color: '#fff', borderRadius: radius.pill, fontSize: '14px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Get started <Icons.IconArrowUpRight size={14} color="#fff" />
          </Link>
          <Link to="/book-demo" style={{ padding: '14px 22px', border: `0.5px solid rgba(246,246,242,0.25)`, color: '#F6F6F2', borderRadius: radius.pill, fontSize: '14px', fontWeight: 500 }}>
            Book a demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: colors.text3, maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.PayzeMark size={16} />
          <span style={{ color: colors.ink, fontWeight: 500 }}>Payze</span>
          <span>© 2026 · Made in Bengaluru</span>
        </div>
        <div style={{ display: 'flex', gap: '28px' }}>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Security</a>
          <a href="#">RBI disclosures</a>
          <a href="#">Status</a>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ Icon, title, desc }: { Icon: React.FC<any>; title: string; desc: string }) {
  return (
    <div style={{ background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.xl, padding: '28px', boxShadow: colors.shadow }}>
      <div style={{ width: '44px', height: '44px', borderRadius: radius.md, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
        <Icon size={20} color={colors.ink} />
      </div>
      <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, marginBottom: '8px', letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ fontSize: '14px', lineHeight: 1.55, color: colors.text2 }}>{desc}</div>
    </div>
  );
}

function NumberTile({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div style={{ padding: '32px 16px' }}>
      <div style={{ fontSize: '60px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.035em', color: colors.ink, marginBottom: '10px' }}>
        {value}<span style={{ color: colors.teal, fontSize: '34px', fontWeight: 500 }}>{unit}</span>
      </div>
      <div style={{ fontSize: '13px', color: colors.text2 }}>{label}</div>
    </div>
  );
}

function InfrastructureDiagram() {
  return (
    <svg viewBox="0 0 960 620" style={{ width: '100%', maxWidth: '1080px', margin: '0 auto', display: 'block' }} role="img" aria-label="Payze payment infrastructure">
      <g opacity="0.1">
        <line x1="80" y1="120" x2="900" y2="340" stroke="#1A1A1A" strokeWidth="0.4" strokeDasharray="2,5" />
        <line x1="80" y1="230" x2="900" y2="450" stroke="#1A1A1A" strokeWidth="0.4" strokeDasharray="2,5" />
        <line x1="80" y1="340" x2="900" y2="560" stroke="#1A1A1A" strokeWidth="0.4" strokeDasharray="2,5" />
        <line x1="160" y1="60" x2="160" y2="500" stroke="#1A1A1A" strokeWidth="0.4" strokeDasharray="2,5" />
        <line x1="360" y1="100" x2="360" y2="540" stroke="#1A1A1A" strokeWidth="0.4" strokeDasharray="2,5" />
        <line x1="560" y1="140" x2="560" y2="580" stroke="#1A1A1A" strokeWidth="0.4" strokeDasharray="2,5" />
        <line x1="760" y1="180" x2="760" y2="620" stroke="#1A1A1A" strokeWidth="0.4" strokeDasharray="2,5" />
      </g>

      <g stroke="#B4B4B0" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.85">
        <path d="M 240 240 Q 330 240, 400 210" />
        <path d="M 520 190 Q 630 190, 720 230" />
        <path d="M 240 290 Q 340 380, 420 450" />
        <path d="M 720 280 Q 720 410, 680 480" />
      </g>

      <g stroke={colors.teal} strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M 520 240 Q 480 330, 480 400 Q 480 460, 540 490" />
        <path d="M 540 490 Q 600 510, 680 490" />
      </g>

      <Block x={100} y={160} label="UPI" emblem="UPI" />
      <Block x={400} y={120} label="Cards" emblem="VISA" />
      <Block x={700} y={160} label="SEPA" emblem="SEPA" emblemSize={12} />
      <Block x={300} y={410} label="Wallets" emblem="GPay" emblemSize={12} />
      <Block x={580} y={440} label="Payze" emblem="P" highlight />

      <g>
        <rect x="438" y="280" width="82" height="26" rx="4" fill={colors.teal} />
        <text x="479" y="297" fontFamily="Inter" fontSize="11" fontWeight="600" fill="#fff" textAnchor="middle" letterSpacing="1.2">RETRY</text>
      </g>

      <g>
        <rect x="618" y="216" width="72" height="26" rx="4" fill={colors.ink} />
        <text x="654" y="233" fontFamily="Inter" fontSize="11" fontWeight="600" fill={colors.bg} textAnchor="middle" letterSpacing="1.2">SEPA</text>
      </g>

      <g>
        <rect x="586" y="480" width="112" height="26" rx="4" fill={colors.ink} />
        <text x="642" y="497" fontFamily="Inter" fontSize="11" fontWeight="600" fill={colors.bg} textAnchor="middle" letterSpacing="1.2">ROUTED</text>
      </g>

      <g>
        <circle r="6" fill={colors.teal}>
          <animateMotion path="M 520 240 Q 480 330, 480 400 Q 480 460, 540 490 Q 600 510, 680 490" dur="3.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.92;1" dur="3.6s" repeatCount="indefinite" />
        </circle>
        <circle r="13" fill={colors.teal} opacity="0.18">
          <animateMotion path="M 520 240 Q 480 330, 480 400 Q 480 460, 540 490 Q 600 510, 680 490" dur="3.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.18;0.18;0" keyTimes="0;0.08;0.92;1" dur="3.6s" repeatCount="indefinite" />
        </circle>
        <circle r="22" fill={colors.teal} opacity="0.08">
          <animateMotion path="M 520 240 Q 480 330, 480 400 Q 480 460, 540 490 Q 600 510, 680 490" dur="3.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.08;0.08;0" keyTimes="0;0.08;0.92;1" dur="3.6s" repeatCount="indefinite" />
        </circle>
      </g>

      <g transform="translate(760, 570)">
        <rect x="0" y="0" width="150" height="38" rx="19" fill={colors.card} stroke={colors.teal} strokeWidth="1" />
        <circle cx="20" cy="19" r="6" fill={colors.teal}>
          <animate attributeName="opacity" values="0.35;1;0.35" dur="1.8s" repeatCount="indefinite" />
        </circle>
        <text x="36" y="24" fontFamily="Inter" fontSize="14" fontWeight="600" fill={colors.teal}>Live routing</text>
      </g>
    </svg>
  );
}

function Block({ x, y, label, emblem, emblemSize = 15, highlight = false }: any) {
  const faceTop = highlight ? '#E4F1F0' : '#ECECE8';
  const faceLeft = highlight ? '#BFD8D5' : '#D4D4D0';
  const faceRight = highlight ? '#9CC4C0' : '#BCBCB8';
  const strokeColor = highlight ? colors.teal : colors.ink;
  const stroke = highlight ? 1.4 : 1.2;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <path d="M 0 60 L 100 10 L 200 60 L 100 110 Z" fill={faceTop} stroke={strokeColor} strokeWidth={stroke} />
      <path d="M 0 60 L 0 100 L 100 150 L 100 110 Z" fill={faceLeft} stroke={strokeColor} strokeWidth={stroke} />
      <path d="M 100 110 L 100 150 L 200 100 L 200 60 Z" fill={faceRight} stroke={strokeColor} strokeWidth={stroke} />
      <path d="M 24 52 L 100 14 L 176 52 L 100 90 Z" fill="#FCFCF8" stroke={strokeColor} strokeWidth={stroke * 0.7} />
      <g transform="translate(72, 28)">
        <ellipse cx="28" cy="20" rx="26" ry="14" fill={highlight ? colors.teal : colors.ink}>
          {highlight && <animate attributeName="fill" values={`${colors.teal};#2B9A93;${colors.teal}`} dur="2.4s" repeatCount="indefinite" />}
        </ellipse>
        <text x="28" y="26" fontFamily="Inter" fontSize={emblemSize} fontWeight="700" fill="#fff" textAnchor="middle">{emblem}</text>
      </g>
      <text x="100" y="182" fontFamily="Inter" fontSize="13" fontWeight={highlight ? 600 : 500} fill={highlight ? colors.teal : colors.text2} textAnchor="middle">{label}</text>
    </g>
  );
}
