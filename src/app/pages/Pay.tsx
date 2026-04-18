import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const iconMap: Record<string, any> = {
  IconQR: Icons.IconQR, IconSettlements: Icons.IconSettlements, IconGlobe: Icons.IconGlobe,
  IconLink: Icons.IconLink, IconRoute: Icons.IconRoute, IconRecurring: Icons.IconRecurring,
  IconShield: Icons.IconShield,
};

type State = 'pick' | 'details' | 'processing' | 'success';

export function Pay() {
  const { data, loading, error, refetch } = useAsync(() => configService.getPay(), []);
  const [methodId, setMethodId] = useState<string | null>(null);
  const [state, setState] = useState<State>('pick');

  if (error) return <ErrorState message={`Couldn't load checkout — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading checkout" />;

  const { header, checkout, methods, banks, wallets } = data;

  const handlePay = () => {
    setState('processing');
    setTimeout(() => setState('success'), 1800);
  };

  if (state === 'success') {
    return (
      <div style={{ animation: 'payze-fadein 0.4s ease-out', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', textAlign: 'center' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: colors.tealTint, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px' }}>
          <Icons.IconCheck size={36} color={colors.teal} strokeWidth={2} />
        </div>
        <Kicker color={colors.teal} style={{ marginBottom: '10px' }}>Payment complete</Kicker>
        <div style={{ fontSize: '36px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', marginBottom: '8px' }}>
          ₹{checkout.amount.toLocaleString('en-IN')} sent.
        </div>
        <div style={{ fontSize: '14px', color: colors.text2, marginBottom: '32px' }}>
          Receipt sent to your email · Reference {checkout.reference}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="primary" onClick={() => { setMethodId(null); setState('pick'); }}>Pay another</Button>
          <Button variant="ghost" icon={<Icons.IconDownload size={14} />}>Download receipt</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out', maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{header.kicker}</Kicker>
        <div style={{ ...typography.pageTitle, color: colors.ink }}>{header.title}</div>
        <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{header.subtitle}</div>
      </div>

      <Card padded={false}>
        <div style={{ padding: '32px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Paying {checkout.recipient}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '24px', color: colors.text2 }}>₹</span>
              <span style={{ fontSize: '56px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {checkout.amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: colors.text2, marginTop: '8px', fontFamily: typography.family.mono }}>{checkout.reference}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: colors.text3 }}>
            <Icons.IconShield size={14} color={colors.text3} />
            <span>Secured by Payze</span>
          </div>
        </div>

        {state === 'pick' && (
          <div style={{ padding: '28px' }}>
            <Kicker style={{ marginBottom: '16px' }}>Choose how you'll pay</Kicker>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {methods.map((m: any) => {
                const Icon = iconMap[m.icon] || Icons.IconSettlements;
                return (
                  <button key={m.id} onClick={() => { setMethodId(m.id); setState('details'); }} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '18px', background: colors.card,
                    border: `0.5px solid ${colors.border}`, borderRadius: radius.md,
                    cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = colors.teal; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: radius.md, background: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={24} color={colors.ink} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, marginBottom: '2px' }}>{m.label}</div>
                      <div style={{ fontSize: '11px', color: colors.text3 }}>{m.sub}</div>
                    </div>
                    <Icons.IconArrowRight size={16} color={colors.text2} />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {state === 'details' && methodId && (
          <div style={{ padding: '28px' }}>
            <button onClick={() => { setState('pick'); setMethodId(null); }} style={{ background: 'none', border: 'none', padding: 0, color: colors.text2, fontSize: '12px', cursor: 'pointer', marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ← Change method
            </button>

            {methodId === 'upi' && (
              <div>
                <Kicker style={{ marginBottom: '16px' }}>Enter your UPI ID</Kicker>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input style={{ ...inputStyle, fontFamily: typography.family.mono, flex: 1 }} placeholder="yourname@oksbi" />
                  <Button variant="secondary" onClick={() => toast.success('VPA verified')}>Verify</Button>
                </div>
                <div style={{ padding: '16px', background: colors.bg, borderRadius: radius.md, textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '8px' }}>Or scan on any UPI app</div>
                  <div style={{ display: 'inline-flex', padding: '8px', background: colors.card, borderRadius: radius.sm, border: `0.5px solid ${colors.border}` }}>
                    <Icons.IconQR size={64} color={colors.ink} />
                  </div>
                </div>
              </div>
            )}

            {(methodId === 'card' || methodId === 'emi') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Field label="Card number"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="0000 0000 0000 0000" /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Expiry"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="MM / YY" /></Field>
                  <Field label="CVV"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="•••" type="password" /></Field>
                </div>
                <Field label="Cardholder name"><input style={inputStyle} placeholder="As printed on card" /></Field>
                {methodId === 'emi' && (
                  <Field label="EMI tenure">
                    <select style={inputStyle}><option>3 months</option><option>6 months</option><option>9 months</option><option>12 months</option></select>
                  </Field>
                )}
                <label style={{ fontSize: '12px', color: colors.text2, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <input type="checkbox" /> Save card for future payments
                </label>
              </div>
            )}

            {methodId === 'netbanking' && (
              <div>
                <Kicker style={{ marginBottom: '16px' }}>Select your bank</Kicker>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {banks.map((bank: string) => (
                    <button key={bank} style={{ padding: '18px 10px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, fontSize: '12px', fontWeight: 500, color: colors.ink, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {methodId === 'wallet' && (
              <div>
                <Kicker style={{ marginBottom: '16px' }}>Choose your wallet</Kicker>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {wallets.map((w: string) => (
                    <button key={w} style={{ padding: '20px 12px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, fontSize: '12px', fontWeight: 500, color: colors.ink, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {methodId === 'sepa' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Field label="Account holder"><input style={inputStyle} placeholder="Full name" /></Field>
                <Field label="IBAN"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="DE89 3704 0044 0532 0130 00" /></Field>
                <div style={{ fontSize: '11px', color: colors.text3, padding: '10px 14px', background: colors.bg, borderRadius: radius.sm }}>
                  You'll be charged in INR at rate 90.4 €→INR. Net: €{(checkout.amount / 90.4).toFixed(2)}
                </div>
              </div>
            )}

            <Button variant="primary" fullWidth onClick={handlePay} size="lg" style={{ marginTop: '24px' }}>
              Pay ₹{checkout.amount.toLocaleString('en-IN')}
            </Button>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '16px', fontSize: '11px', color: colors.text3 }}>
              <Icons.IconShield size={12} color={colors.text3} />
              <span>256-bit TLS · PCI-DSS Level 1 compliant</span>
            </div>
          </div>
        )}

        {state === 'processing' && (
          <div style={{ padding: '60px 28px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', margin: '0 auto 20px auto', borderRadius: '50%', border: `2px solid ${colors.border}`, borderTopColor: colors.teal, animation: 'payze-spin 0.8s linear infinite' }} />
            <div style={{ fontSize: '14px', fontWeight: 500, color: colors.ink, marginBottom: '4px' }}>Authorising payment</div>
            <div style={{ fontSize: '12px', color: colors.text2 }}>Do not close or refresh this page</div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Field({ label, children }: any) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: colors.text2, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: colors.bg, border: `0.5px solid ${colors.border}`,
  borderRadius: radius.sm, fontSize: '13px', outline: 'none', color: colors.ink, fontFamily: 'inherit',
};
