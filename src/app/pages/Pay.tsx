import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';

type Method = 'upi' | 'card' | 'netbanking' | 'wallet' | 'sepa';
type State = 'pick' | 'details' | 'processing' | 'success';

export function Pay() {
  const [method, setMethod] = useState<Method | null>(null);
  const [state, setState] = useState<State>('pick');
  const [amount] = useState(1200);
  const recipient = 'Acme Corporation';
  const reference = 'Invoice INV-0228';

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
          ₹{amount.toLocaleString('en-IN')} sent.
        </div>
        <div style={{ fontSize: '14px', color: colors.text2, marginBottom: '32px' }}>
          Receipt sent to your email · Reference {reference}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="primary" onClick={() => { setMethod(null); setState('pick'); }}>Pay another</Button>
          <Button variant="ghost" icon={<Icons.IconDownload size={14} />}>Download receipt</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out', maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '28px' }}>
        <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Checkout</Kicker>
        <div style={{ ...typography.pageTitle, color: colors.ink }}>Pay</div>
        <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
          Branded checkout for your merchants. This is what customers see.
        </div>
      </div>

      <Card padded={false}>
        <div style={{ padding: '32px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Paying {recipient}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span style={{ fontSize: '24px', color: colors.text2 }}>₹</span>
              <span style={{ fontSize: '56px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: colors.text2, marginTop: '8px', fontFamily: typography.family.mono }}>{reference}</div>
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
              <MethodCard icon={<Icons.IconQR size={24} color={colors.ink} />} label="UPI" sub="GPay, PhonePe, Paytm" onClick={() => { setMethod('upi'); setState('details'); }} />
              <MethodCard icon={<Icons.IconSettlements size={24} color={colors.ink} />} label="Credit or debit card" sub="Visa, Mastercard, Amex, RuPay" onClick={() => { setMethod('card'); setState('details'); }} />
              <MethodCard icon={<Icons.IconGlobe size={24} color={colors.ink} />} label="Net banking" sub="All major Indian banks" onClick={() => { setMethod('netbanking'); setState('details'); }} />
              <MethodCard icon={<Icons.IconLink size={24} color={colors.ink} />} label="Wallet" sub="Amazon Pay, Mobikwik, Freecharge" onClick={() => { setMethod('wallet'); setState('details'); }} />
              <MethodCard icon={<Icons.IconRoute size={24} color={colors.ink} />} label="SEPA / international" sub="For EU & global customers" onClick={() => { setMethod('sepa'); setState('details'); }} />
              <MethodCard icon={<Icons.IconRecurring size={24} color={colors.ink} />} label="Pay in EMI" sub="3, 6, 9, 12 months" onClick={() => { setMethod('card'); setState('details'); }} />
            </div>
          </div>
        )}

        {state === 'details' && method && (
          <div style={{ padding: '28px' }}>
            <button onClick={() => { setState('pick'); setMethod(null); }} style={{ background: 'none', border: 'none', padding: 0, color: colors.text2, fontSize: '12px', cursor: 'pointer', marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ← Change method
            </button>

            {method === 'upi' && (
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

            {method === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Field label="Card number"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="0000 0000 0000 0000" /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Expiry"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="MM / YY" /></Field>
                  <Field label="CVV"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="•••" type="password" /></Field>
                </div>
                <Field label="Cardholder name"><input style={inputStyle} placeholder="As printed on card" /></Field>
                <label style={{ fontSize: '12px', color: colors.text2, display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <input type="checkbox" /> Save card for future payments
                </label>
              </div>
            )}

            {method === 'netbanking' && (
              <div>
                <Kicker style={{ marginBottom: '16px' }}>Select your bank</Kicker>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'Yes Bank', 'IndusInd', 'Other'].map(bank => (
                    <button key={bank} style={{ padding: '18px 10px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, fontSize: '12px', fontWeight: 500, color: colors.ink, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {method === 'wallet' && (
              <div>
                <Kicker style={{ marginBottom: '16px' }}>Choose your wallet</Kicker>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {['Amazon Pay', 'Mobikwik', 'Freecharge', 'JioMoney', 'Ola Money', 'Airtel Money'].map(w => (
                    <button key={w} style={{ padding: '20px 12px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, fontSize: '12px', fontWeight: 500, color: colors.ink, cursor: 'pointer', fontFamily: 'inherit' }}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {method === 'sepa' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Field label="Account holder"><input style={inputStyle} placeholder="Full name" /></Field>
                <Field label="IBAN"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="DE89 3704 0044 0532 0130 00" /></Field>
                <div style={{ fontSize: '11px', color: colors.text3, padding: '10px 14px', background: colors.bg, borderRadius: radius.sm }}>
                  You'll be charged in INR at rate 90.4 €→INR. Net: €{(amount / 90.4).toFixed(2)}
                </div>
              </div>
            )}

            <Button variant="primary" fullWidth onClick={handlePay} size="lg" style={{ marginTop: '24px' }}>
              {state === 'processing' ? 'Processing…' : `Pay ₹${amount.toLocaleString('en-IN')}`}
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

function MethodCard({ icon, label, sub, onClick }: any) {
  return (
    <button onClick={onClick} style={{
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
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '11px', color: colors.text3 }}>{sub}</div>
      </div>
      <Icons.IconArrowRight size={16} color={colors.text2} />
    </button>
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
  width: '100%', padding: '10px 14px',
  background: colors.bg, border: `0.5px solid ${colors.border}`,
  borderRadius: radius.sm, fontSize: '13px',
  outline: 'none', color: colors.ink,
  fontFamily: 'inherit',
};
