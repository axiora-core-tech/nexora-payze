import React from 'react';
import { Link } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const iconMap: Record<string, any> = {
  IconRoute: Icons.IconRoute, IconRecurring: Icons.IconRecurring, IconShield: Icons.IconShield,
  IconGlobe: Icons.IconGlobe, IconDeveloper: Icons.IconDeveloper, IconChart: Icons.IconChart,
};

export function Home() {
  const { data, loading, error, refetch } = useAsync(() => configService.getHome(), []);

  if (error) return <ErrorState message={`Couldn't load homepage — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading Payze" />;

  const { nav, hero, trustStrip, how, features, numbers, testimonial, pricing, finalCta, footer } = data;

  return (
    <div style={{ background: colors.bg, color: colors.ink, minHeight: '100vh', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(30,30,30,0.04) 1px, transparent 1px)', backgroundSize: '26px 26px', zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '0 40px' }}>

        <nav style={{ padding: '24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.PayzeMark size={22} />
            <span style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em' }}>Payze</span>
          </Link>
          <div style={{ display: 'flex', gap: '32px', fontSize: '14px', color: colors.text2 }}>
            {nav.map((n: any) => <a key={n.href} href={n.href}>{n.label}</a>)}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/app" style={{ fontSize: '14px', color: colors.text2 }}>Sign in</Link>
            <Link to="/book-demo" style={{ padding: '10px 18px', background: colors.teal, color: '#fff', borderRadius: radius.pill, fontSize: '13px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Get started <Icons.IconArrowUpRight size={13} color="#fff" />
            </Link>
          </div>
        </nav>

        <section style={{ padding: '80px 0 56px 0', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: colors.card, border: `0.5px solid ${colors.border}`, padding: '6px 14px 6px 8px', borderRadius: radius.pill, marginBottom: '36px' }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: colors.teal, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icons.IconCheck size={10} color="#fff" strokeWidth={3} />
            </span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: colors.ink }}>{hero.badge}</span>
          </div>

          <div style={{ fontSize: '64px', fontWeight: 600, lineHeight: 1.02, letterSpacing: '-0.03em', maxWidth: '880px', margin: '0 auto 8px auto' }}>{hero.lineOne}</div>
          <div style={{ fontSize: '88px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.035em', maxWidth: '960px', margin: '0 auto 36px auto' }}>
            {hero.lineTwo} <span style={{ color: colors.teal, fontStyle: 'italic', fontWeight: 500 }}>{hero.accent}</span>
          </div>

          <div style={{ fontSize: '17px', lineHeight: 1.55, color: colors.text2, maxWidth: '620px', margin: '0 auto 40px auto' }}>{hero.subtitle}</div>

          <div style={{ display: 'inline-flex', gap: '10px' }}>
            <Link to={hero.primaryCta.href} style={{ padding: '14px 24px', background: colors.ink, color: '#fff', borderRadius: radius.pill, fontSize: '14px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {hero.primaryCta.label} <Icons.IconArrowUpRight size={14} color="#fff" />
            </Link>
            <a href={hero.secondaryCta.href} style={{ padding: '14px 22px', border: `0.5px solid ${colors.borderStrong}`, color: colors.ink, borderRadius: radius.pill, fontSize: '14px', fontWeight: 500 }}>
              {hero.secondaryCta.label}
            </a>
          </div>
        </section>

        <div style={{ padding: '32px 0 56px 0' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', color: colors.text3, textTransform: 'uppercase', textAlign: 'center', marginBottom: '22px' }}>{trustStrip.label}</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '52px', opacity: 0.7, flexWrap: 'wrap' }}>
            {trustStrip.logos.map((l: any, i: number) => (
              <span key={i} style={{
                fontSize: `${l.style.size}px`, fontWeight: l.style.weight, color: colors.text2,
                fontStyle: l.style.italic ? 'italic' : 'normal',
                letterSpacing: l.style.letterSpacing || 'normal',
              }}>{l.text}</span>
            ))}
          </div>
        </div>

        <section id="how" style={{ padding: '80px 0 60px 0', borderTop: `0.5px solid ${colors.border}` }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', color: colors.teal, textTransform: 'uppercase', marginBottom: '18px' }}>{how.kicker}</div>
            <div style={{ fontSize: '48px', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.025em', maxWidth: '720px', margin: '0 auto' }}>
              {how.title} <span style={{ color: colors.teal }}>{how.titleAccent}</span>
            </div>
          </div>
          <InfrastructureDiagram />
        </section>

        <section id="product" style={{ padding: '80px 0 72px 0', borderTop: `0.5px solid ${colors.border}` }}>
          <div style={{ marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', color: colors.teal, textTransform: 'uppercase', marginBottom: '18px' }}>{features.kicker}</div>
            <div style={{ fontSize: '42px', fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '720px', whiteSpace: 'pre-line' }}>
              {features.title}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {features.items.map((f: any) => {
              const Icon = iconMap[f.icon] || Icons.IconShield;
              return (
                <div key={f.title} style={{ background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.xl, padding: '28px', boxShadow: colors.shadow }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: radius.md, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                    <Icon size={20} color={colors.ink} />
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, marginBottom: '8px', letterSpacing: '-0.01em' }}>{f.title}</div>
                  <div style={{ fontSize: '14px', lineHeight: 1.55, color: colors.text2 }}>{f.desc}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section style={{ padding: '80px 0', borderTop: `0.5px solid ${colors.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', color: colors.teal, textTransform: 'uppercase', marginBottom: '28px' }}>{numbers.kicker}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', maxWidth: '880px', margin: '0 auto' }}>
            {numbers.items.map((n: any) => (
              <div key={n.label} style={{ padding: '32px 16px' }}>
                <div style={{ fontSize: '60px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.035em', color: colors.ink, marginBottom: '10px' }}>
                  {n.value}<span style={{ color: colors.teal, fontSize: '34px', fontWeight: 500 }}>{n.unit}</span>
                </div>
                <div style={{ fontSize: '13px', color: colors.text2 }}>{n.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="customers" style={{ padding: '80px 0', borderTop: `0.5px solid ${colors.border}` }}>
          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            <div style={{ fontSize: '32px', fontWeight: 500, lineHeight: 1.3, letterSpacing: '-0.015em', marginBottom: '32px', color: colors.ink }}>
              <span style={{ color: colors.teal, marginRight: '8px' }}>"</span>
              {testimonial.quote}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: colors.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>{testimonial.initials}</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 500, color: colors.ink }}>{testimonial.name}</div>
                <div style={{ fontSize: '13px', color: colors.text2 }}>{testimonial.role}</div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" style={{ padding: '80px 0', borderTop: `0.5px solid ${colors.border}` }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', color: colors.teal, textTransform: 'uppercase', marginBottom: '18px' }}>{pricing.kicker}</div>
            <div style={{ fontSize: '42px', fontWeight: 600, letterSpacing: '-0.02em' }}>{pricing.title}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {pricing.tiers.map((p: any) => (
              <div key={p.tier} style={{ padding: '28px', background: colors.card, border: p.featured ? `1.5px solid ${colors.teal}` : `0.5px solid ${colors.border}`, borderRadius: radius.xl, boxShadow: p.featured ? '0 8px 24px -8px rgba(28,111,107,0.15)' : colors.shadow }}>
                {p.featured && <div style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.15em', color: colors.teal, textTransform: 'uppercase', marginBottom: '8px' }}>Most popular</div>}
                <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, marginBottom: '8px' }}>{p.tier}</div>
                <div style={{ fontSize: '36px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.025em', marginBottom: '4px' }}>
                  {p.price}{p.price !== 'Custom' && <span style={{ fontSize: '14px', color: colors.text2, fontWeight: 400 }}>/mo</span>}
                </div>
                <div style={{ fontSize: '13px', color: colors.text2, marginBottom: '20px' }}>{p.desc}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {p.features.map((f: string) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: colors.ink }}>
                      <Icons.IconCheck size={14} color={colors.teal} strokeWidth={2} />
                      {f}
                    </div>
                  ))}
                </div>
                <Link to="/book-demo" style={{ display: 'block', padding: '12px 18px', background: p.featured ? colors.teal : colors.card, color: p.featured ? '#fff' : colors.ink, border: p.featured ? 'none' : `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '13px', fontWeight: 500, textAlign: 'center' }}>
                  {p.ctaLabel}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section style={{ padding: '80px 40px', background: colors.ink, color: '#F6F6F2', textAlign: 'center', borderTop: `0.5px solid ${colors.border}` }}>
        <div style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.2em', color: '#8A9E9C', textTransform: 'uppercase', marginBottom: '22px' }}>{finalCta.kicker}</div>
        <div style={{ fontSize: '60px', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: '760px', margin: '0 auto 24px auto', whiteSpace: 'pre-line' }}>
          {finalCta.title}
        </div>
        <div style={{ fontSize: '16px', lineHeight: 1.55, color: '#B4B4B0', maxWidth: '480px', margin: '0 auto 40px auto' }}>{finalCta.desc}</div>
        <div style={{ display: 'inline-flex', gap: '10px' }}>
          <Link to={finalCta.primary.href} style={{ padding: '14px 24px', background: colors.teal, color: '#fff', borderRadius: radius.pill, fontSize: '14px', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {finalCta.primary.label} <Icons.IconArrowUpRight size={14} color="#fff" />
          </Link>
          <a href={finalCta.secondary.href} style={{ padding: '14px 22px', border: `0.5px solid rgba(246,246,242,0.25)`, color: '#F6F6F2', borderRadius: radius.pill, fontSize: '14px', fontWeight: 500 }}>
            {finalCta.secondary.label}
          </a>
        </div>
      </section>

      <footer style={{ padding: '32px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: colors.text3, maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icons.PayzeMark size={16} />
          <span style={{ color: colors.ink, fontWeight: 500 }}>Payze</span>
          <span>{footer.tagline}</span>
        </div>
        <div style={{ display: 'flex', gap: '28px' }}>
          {footer.links.map((l: any) => <a key={l.label} href={l.href}>{l.label}</a>)}
        </div>
      </footer>
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
        <ellipse cx="28" cy="20" rx="26" ry="14" fill={highlight ? colors.teal : colors.ink} />
        <text x="28" y="26" fontFamily="Inter" fontSize={emblemSize} fontWeight="700" fill="#fff" textAnchor="middle">{emblem}</text>
      </g>
      <text x="100" y="182" fontFamily="Inter" fontSize="13" fontWeight={highlight ? 600 : 500} fill={highlight ? colors.teal : colors.text2} textAnchor="middle">{label}</text>
    </g>
  );
}
