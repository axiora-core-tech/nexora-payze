import React from 'react';
import { useParams, Link } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { Button, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

export function PublicMerchant() {
  const params = useParams<{ handle: string }>();
  const { data, loading, error, refetch } = useAsync(() => configService.getPublicPages(), []);

  if (error) return <ErrorState message={`Couldn't load page — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading page" />;

  const handle = params.handle || data.defaultHandle;
  const merchant = data.merchants?.[handle];

  if (!merchant) {
    return (
      <div style={{ background: colors.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px', maxWidth: '420px' }}>
          <Icons.PayzeMark size={32} color={colors.ink} />
          <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, marginTop: '12px', marginBottom: '6px' }}>
            This page doesn't exist
          </div>
          <div style={{ fontSize: '13px', color: colors.text2, lineHeight: 1.6, marginBottom: '20px' }}>
            We couldn't find a merchant with the handle <span style={{ fontFamily: typography.family.mono, color: colors.ink }}>@{handle}</span>.
          </div>
          <Link to="/" style={{ fontSize: '12px', color: colors.ink, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Back to Payze <Icons.IconArrowUpRight size={11} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: colors.bg,
      minHeight: '100vh',
      animation: 'payze-fadein 0.4s ease-out',
    }}>
      {/* Dot-grid background */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: `radial-gradient(circle, rgba(30,30,30,0.04) 1px, transparent 1px)`,
        backgroundSize: '26px 26px', zIndex: 0,
      }} />

      {/* Top nav */}
      <header style={{
        position: 'relative', zIndex: 10,
        padding: '20px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `0.5px solid ${colors.border}`,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <Icons.PayzeMark size={18} color={colors.ink} />
          <span style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.01em' }}>Payze</span>
        </Link>
        <div style={{ fontSize: '11px', color: colors.text3, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Icons.IconShield size={11} color={colors.text3} />
          Secure payment page · powered by Payze
        </div>
      </header>

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '960px', margin: '0 auto', padding: '48px 32px 80px 32px' }}>
        {/* Hero */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: radius.lg,
              background: merchant.brandColor,
              color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em',
              boxShadow: '0 8px 20px -8px rgba(0,0,0,0.2)',
            }}>
              {merchant.name.charAt(0)}
            </div>
            {merchant.verified && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 10px',
                background: colors.card, border: `0.5px solid ${colors.teal}`,
                borderRadius: radius.pill,
                fontSize: '11px', color: colors.teal, fontWeight: 500,
              }}>
                <Icons.IconCheck size={10} color={colors.teal} strokeWidth={2.5} />
                Verified merchant
              </div>
            )}
          </div>

          <h1 style={{
            fontSize: '44px', fontWeight: 600, color: colors.ink,
            letterSpacing: '-0.025em', lineHeight: 1.1,
            margin: '0 0 12px 0',
          }}>{merchant.name}</h1>
          <div style={{ fontSize: '17px', color: colors.text2, lineHeight: 1.5, maxWidth: '640px', marginBottom: '28px' }}>
            {merchant.tagline}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <Button variant="primary" icon={<Icons.IconMail size={14} />} onClick={() => toast.success(`Contact form opened for ${merchant.name}`)}>
              {merchant.ctaPrimary}
            </Button>
            <Button variant="secondary" icon={<Icons.IconPay size={14} />} onClick={() => toast.success('Payment checkout opened')}>
              {merchant.ctaSecondary}
            </Button>
          </div>

          <div style={{ fontSize: '14px', color: colors.text2, lineHeight: 1.7, maxWidth: '640px' }}>
            {merchant.about}
          </div>
        </div>

        {/* Metrics strip */}
        <div style={{
          display: 'grid', gridTemplateColumns: `repeat(${merchant.metrics.length}, 1fr)`,
          gap: '0',
          background: colors.card, border: `0.5px solid ${colors.border}`,
          borderRadius: radius.lg,
          marginBottom: '48px',
          overflow: 'hidden',
        }}>
          {merchant.metrics.map((m: any, i: number) => (
            <div key={m.label} style={{
              padding: '22px 24px',
              borderRight: i < merchant.metrics.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            }}>
              <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>{m.label}</div>
              <div style={{ fontSize: '26px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', fontFamily: typography.family.mono }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Accepted methods */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '10px' }}>Payment methods accepted</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            {merchant.methods.map((m: string) => (
              <span key={m} style={{
                fontSize: '11px', fontWeight: 500,
                padding: '5px 12px',
                background: colors.card, border: `0.5px solid ${colors.border}`,
                borderRadius: radius.pill, color: colors.ink,
                fontFamily: typography.family.mono,
              }}>{m}</span>
            ))}
          </div>
          <div style={{ fontSize: '11px', color: colors.text3 }}>
            Currencies: {merchant.currencies.join(' · ')}
          </div>
        </div>

        {/* Offerings */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '16px', margin: 0 }}>Offerings</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px', marginTop: '16px' }}>
            {merchant.offerings.map((o: any) => (
              <div key={o.title} style={{
                padding: '22px 24px',
                background: colors.card, border: `0.5px solid ${colors.border}`,
                borderRadius: radius.md,
                display: 'flex', flexDirection: 'column',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = colors.teal; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = colors.border; }}
              >
                <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, marginBottom: '6px', letterSpacing: '-0.01em' }}>{o.title}</div>
                <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.6, flex: 1, marginBottom: '14px' }}>{o.description}</div>
                <div style={{
                  fontSize: '13px', fontWeight: 600, color: merchant.brandColor,
                  fontFamily: typography.family.mono,
                  paddingTop: '12px', borderTop: `0.5px solid ${colors.border}`,
                }}>{o.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        {merchant.testimonials.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '16px', margin: 0 }}>What clients say</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {merchant.testimonials.map((t: any, i: number) => (
                <div key={i} style={{
                  padding: '22px 24px',
                  background: colors.card, border: `0.5px solid ${colors.border}`,
                  borderRadius: radius.md,
                }}>
                  <div style={{ fontSize: '15px', color: colors.ink, lineHeight: 1.6, fontStyle: 'italic', marginBottom: '14px', letterSpacing: '-0.005em' }}>
                    "{t.quote}"
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text2 }}>
                    <span style={{ fontWeight: 600, color: colors.ink }}>{t.name}</span>
                    {t.role && <span> · {t.role}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Socials */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '48px', paddingTop: '24px', borderTop: `0.5px solid ${colors.border}` }}>
          <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Follow</div>
          {merchant.socials.map((s: any) => (
            <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{
              fontSize: '12px', color: colors.ink, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '4px',
            }}>
              {s.label} <Icons.IconArrowUpRight size={11} />
            </a>
          ))}
        </div>

        {/* Footer CTAs (duplicate primary for below-fold) */}
        <div style={{
          padding: '28px 32px',
          background: colors.card, border: `0.5px solid ${colors.border}`,
          borderRadius: radius.lg,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, marginBottom: '4px' }}>Ready to work with {merchant.name}?</div>
            <div style={{ fontSize: '12px', color: colors.text2 }}>Payments are secure and instant, handled by Payze.</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" onClick={() => toast.success(`Contact form opened for ${merchant.name}`)}>{merchant.ctaPrimary}</Button>
            <Button variant="secondary" onClick={() => toast.success('Payment checkout opened')}>{merchant.ctaSecondary}</Button>
          </div>
        </div>

        <div style={{ marginTop: '40px', fontSize: '10px', color: colors.text3, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
          <Icons.PayzeMark size={10} color={colors.text3} />
          <span>payze.app/@{merchant.handle} · <Link to="/" style={{ color: colors.text2 }}>Claim your own Payze page</Link></span>
        </div>
      </main>
    </div>
  );
}
