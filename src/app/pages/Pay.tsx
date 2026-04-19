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

type State = 'pick' | 'details' | 'processing' | 'threeds' | 'success';

export function Pay() {
  const { data, loading, error, refetch } = useAsync(() => configService.getPay(), []);
  const [methodId, setMethodId] = useState<string | null>(null);
  const [state, setState] = useState<State>('pick');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [selectedBnpl, setSelectedBnpl] = useState<string | null>(null);
  const [selectedEmiTenure, setSelectedEmiTenure] = useState<number | null>(null);
  const [expressLaneDismissed, setExpressLaneDismissed] = useState(false);

  if (error) return <ErrorState message={`Couldn't load checkout — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading checkout" />;

  const { header, checkout, methods, banks, wallets, savedCards, tokenization, threeDS, bnplProviders, emiOptions, magicCheckout, otpLess } = data;

  const handlePay = () => {
    setState('processing');
    // 3DS step (if cards): advance after 1.4s, success after another 1.4s
    if (methodId === 'card' && checkout.amount >= 2000 && threeDS && !threeDS.frictionless) {
      setTimeout(() => setState('threeds'), 1400);
      setTimeout(() => setState('success'), 2800);
    } else {
      setTimeout(() => setState('success'), 1800);
    }
  };

  const handleMagicOneClick = () => {
    setState('processing');
    // Magic Checkout is OTP-less for trusted devices · straight to success
    setTimeout(() => setState('success'), 1100);
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

            {/* ── Magic Checkout · express lane for recognized customer ── */}
            {magicCheckout?.enabled && magicCheckout.oneClickEligible && !expressLaneDismissed && (
              <div style={{ marginBottom: '24px', padding: '20px 22px', background: 'linear-gradient(135deg, rgba(28,111,107,0.07), rgba(28,111,107,0.02))', border: '0.5px solid rgba(28,111,107,0.3)', borderRadius: radius.lg, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.teal, animation: 'payze-pulse-dot 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: '10px', fontWeight: 700, color: colors.teal, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: typography.family.mono }}>Magic Checkout · Express lane</span>
                  <span style={{ marginLeft: 'auto', fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>+{magicCheckout.conversionLift} conversion</span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, marginBottom: '4px', letterSpacing: '-0.01em' }}>Welcome back, {magicCheckout.identifiedAs.split(' ')[0]}</div>
                <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '12px' }}>
                  Recognized by {magicCheckout.recognizedBy} · <span style={{ fontFamily: typography.family.mono }}>{magicCheckout.phoneOnFile}</span> · Last paid {magicCheckout.lastPaidAt}
                </div>
                <div style={{ padding: '10px 12px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, marginBottom: '14px', fontSize: '11px', color: colors.text2, lineHeight: 1.55 }}>
                  <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>Saved address</div>
                  <div style={{ color: colors.ink }}>{magicCheckout.savedAddress.line1}</div>
                  <div>{magicCheckout.savedAddress.line2}</div>
                </div>
                {magicCheckout.otpLess?.trustedDevice && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(28,111,107,0.05)', border: '0.5px solid rgba(28,111,107,0.2)', borderRadius: radius.sm, marginBottom: '14px' }}>
                    <Icons.IconShield size={12} color={colors.teal} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: colors.teal, marginBottom: '2px' }}>OTP-less · trusted device</div>
                      <div style={{ fontSize: '10px', color: colors.text2, lineHeight: 1.4 }}>{magicCheckout.otpLess.reason}</div>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="primary" fullWidth size="lg" onClick={handleMagicOneClick}>
                    Pay ₹{checkout.amount.toLocaleString('en-IN')} in 1 tap
                  </Button>
                </div>
                <button onClick={() => setExpressLaneDismissed(true)} style={{ background: 'none', border: 'none', color: colors.text3, fontSize: '11px', cursor: 'pointer', padding: '8px 0 0 0', fontFamily: 'inherit', display: 'block', margin: '0 auto' }}>
                  Not me · use a different method
                </button>
              </div>
            )}

            <Kicker style={{ marginBottom: '16px' }}>{expressLaneDismissed || !magicCheckout?.oneClickEligible ? 'Choose how you\'ll pay' : 'Or choose another method'}</Kicker>
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
                {savedCards && savedCards.length > 0 && methodId === 'card' && (
                  <div style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Kicker style={{ margin: 0 }}>Saved cards</Kicker>
                      <span style={{ fontSize: '9px', color: colors.teal, letterSpacing: '0.08em', fontWeight: 600, padding: '2px 8px', background: 'rgba(28,111,107,0.08)', border: '0.5px solid rgba(28,111,107,0.25)', borderRadius: radius.pill }}>RBI TOKENIZED</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {savedCards.map((c: any) => {
                        const isSelected = selectedToken === c.id;
                        return (
                          <button key={c.id} onClick={() => setSelectedToken(isSelected ? null : c.id)} style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '12px 14px', background: isSelected ? 'rgba(28,111,107,0.06)' : colors.bg,
                            border: `0.5px solid ${isSelected ? 'rgba(28,111,107,0.4)' : colors.border}`,
                            borderRadius: radius.md, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                            transition: 'all 0.15s ease',
                          }}>
                            <div style={{ width: '36px', height: '24px', borderRadius: '3px', background: c.network === 'Visa' ? '#1A1F71' : c.network === 'Mastercard' ? '#1A1A1A' : colors.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, letterSpacing: '0.04em' }}>{c.network.toUpperCase().slice(0, 4)}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink, fontFamily: typography.family.mono }}>•••• •••• •••• {c.last4}</div>
                              <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>{c.issuer} · expires {c.expiryMasked}{c.isDefault ? ' · default' : ''}{c.cvvLessEligible ? ' · CVV-less eligible' : ''}</div>
                            </div>
                            {isSelected && <Icons.IconCheck size={14} color={colors.teal} strokeWidth={2} />}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: '10px', color: colors.text3, marginTop: '8px', lineHeight: 1.5 }}>
                      Saved as <span style={{ fontWeight: 500 }}>network tokens</span> per RBI mandate (7 Oct 2022). Raw card numbers are never stored on Payze servers.
                    </div>
                    <div style={{ fontSize: '11px', color: colors.text2, textAlign: 'center', margin: '14px 0 6px 0', position: 'relative' }}>
                      <span style={{ background: colors.card, padding: '0 10px', position: 'relative', zIndex: 1 }}>or pay with a new card</span>
                      <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '0.5px', background: colors.border, zIndex: 0 }} />
                    </div>
                  </div>
                )}
                <Field label="Card number"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="0000 0000 0000 0000" disabled={!!selectedToken} /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Expiry"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="MM / YY" disabled={!!selectedToken} /></Field>
                  <Field label="CVV"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="•••" type="password" /></Field>
                </div>
                <Field label="Cardholder name"><input style={inputStyle} placeholder="As printed on card" disabled={!!selectedToken} /></Field>
                {methodId === 'emi' && (
                  <Field label="EMI tenure">
                    <select style={inputStyle}><option>3 months</option><option>6 months</option><option>9 months</option><option>12 months</option></select>
                  </Field>
                )}
                {!selectedToken && (
                  <label style={{ fontSize: '12px', color: colors.text2, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <input type="checkbox" /> Save card as RBI-compliant network token for future payments
                  </label>
                )}
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

            {methodId === 'bnpl' && bnplProviders && (
              <div>
                <Kicker style={{ marginBottom: '14px' }}>Pick your Pay-later provider</Kicker>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
                  {bnplProviders.map((p: any) => {
                    const isSelected = selectedBnpl === p.id;
                    return (
                      <button key={p.id} onClick={() => setSelectedBnpl(isSelected ? null : p.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '14px 16px',
                        background: isSelected ? 'rgba(28,111,107,0.05)' : colors.bg,
                        border: `0.5px solid ${isSelected ? 'rgba(28,111,107,0.4)' : colors.border}`,
                        borderRadius: radius.md, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                        transition: 'all 0.15s',
                      }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: radius.sm, background: p.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>{p.name.slice(0, 2)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: colors.ink, marginBottom: '2px' }}>{p.name}</div>
                          <div style={{ fontSize: '10px', color: colors.text3 }}>{p.limitHint} · {p.interestFree}</div>
                        </div>
                        {isSelected && <Icons.IconCheck size={14} color={colors.teal} strokeWidth={2} />}
                      </button>
                    );
                  })}
                </div>
                <div style={{ padding: '10px 12px', background: colors.bg, borderRadius: radius.sm, fontSize: '11px', color: colors.text2, lineHeight: 1.55 }}>
                  You'll be redirected to {selectedBnpl ? bnplProviders.find((p: any) => p.id === selectedBnpl)?.name : 'the provider'} to authenticate with your registered mobile. Repayment is managed in their app.
                </div>
              </div>
            )}

            {methodId === 'emi' && emiOptions && (
              <div>
                <Kicker style={{ marginBottom: '6px' }}>{emiOptions.kicker}</Kicker>
                <div style={{ fontSize: '11px', color: colors.text2, marginBottom: '14px' }}>Pick a tenure · card eligibility checked after card number</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {emiOptions.tenures.map((t: any) => {
                    const isSelected = selectedEmiTenure === t.months;
                    return (
                      <button key={t.months} onClick={() => setSelectedEmiTenure(isSelected ? null : t.months)} style={{
                        display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 28px',
                        gap: '14px', padding: '12px 14px',
                        background: isSelected ? 'rgba(28,111,107,0.05)' : colors.bg,
                        border: `0.5px solid ${isSelected ? 'rgba(28,111,107,0.4)' : colors.border}`,
                        borderRadius: radius.md, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', alignItems: 'center',
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: colors.ink, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {t.months} months
                            {t.noCost && <span style={{ fontSize: '9px', padding: '2px 7px', background: 'rgba(28,111,107,0.08)', color: colors.teal, borderRadius: radius.pill, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>No-cost</span>}
                          </div>
                          <div style={{ fontSize: '10px', color: colors.text3 }}>{t.label}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: colors.text3 }}>Monthly</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>₹{t.monthlyAmount.toLocaleString('en-IN')}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: colors.text3 }}>Total interest</div>
                          <div style={{ fontSize: '12px', color: t.noCost ? colors.teal : colors.ink, fontFamily: typography.family.mono, fontWeight: t.noCost ? 600 : 500 }}>{t.noCost ? '₹0' : `₹${t.totalInterest}`}</div>
                        </div>
                        {isSelected && <Icons.IconCheck size={14} color={colors.teal} strokeWidth={2} />}
                      </button>
                    );
                  })}
                </div>
                <div style={{ padding: '10px 12px', background: colors.bg, borderRadius: radius.sm, fontSize: '11px', color: colors.text2, lineHeight: 1.55, marginBottom: '14px' }}>
                  {emiOptions.noCostExplainer}
                </div>
                <Field label="Card number"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="0000 0000 0000 0000" /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
                  <Field label="Expiry"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="MM / YY" /></Field>
                  <Field label="CVV"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="•••" type="password" /></Field>
                </div>
              </div>
            )}

            <Button variant="primary" fullWidth onClick={handlePay} size="lg" style={{ marginTop: '24px' }}>
              Pay ₹{checkout.amount.toLocaleString('en-IN')}
              {methodId === 'emi' && selectedEmiTenure && ` · ${selectedEmiTenure} months`}
              {methodId === 'bnpl' && selectedBnpl && ` · via ${bnplProviders.find((p: any) => p.id === selectedBnpl)?.name}`}
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
            <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '20px' }}>Do not close or refresh this page</div>
            {methodId === 'card' && checkout.amount >= 2000 && threeDS && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '11px', color: colors.text2 }}>
                <Icons.IconShield size={11} color={colors.teal} />
                <span><span style={{ fontWeight: 600, color: colors.ink }}>3DS {threeDS.version}</span> · {threeDS.frictionless ? 'Frictionless' : 'Step-up challenge in progress'}</span>
              </div>
            )}
          </div>
        )}

        {state === 'threeds' && (
          <div style={{ padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(28,111,107,0.06)', border: '0.5px solid rgba(28,111,107,0.25)', borderRadius: radius.pill, fontSize: '10px', color: colors.teal, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
              <Icons.IconShield size={11} color={colors.teal} />
              3DS 2.2 · Step-up authentication
            </div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink, marginBottom: '8px', letterSpacing: '-0.015em' }}>Verifying with your bank</div>
            <div style={{ fontSize: '13px', color: colors.text2, marginBottom: '24px', maxWidth: '380px', margin: '0 auto 24px auto', lineHeight: 1.5 }}>
              {threeDS.afaThreshold} · RBI Additional Factor of Authentication required for cards over ₹2,000.
            </div>
            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start', padding: '16px 20px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: colors.teal, animation: 'payze-pulse-dot 1.4s ease-in-out infinite' }} />
                <span style={{ fontSize: '11px', color: colors.text2 }}>Sent OTP to registered mobile <span style={{ fontFamily: typography.family.mono, color: colors.ink, fontWeight: 500 }}>+91 ••••• ••210</span></span>
              </div>
              <div style={{ fontSize: '10px', color: colors.text3, marginLeft: '17px' }}>Auto-fills if your device supports SMS auto-read</div>
            </div>
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
