import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { tenantService } from '../../services';
import { toast } from 'sonner';

const steps = [
  { id: 'business', label: 'Business' },
  { id: 'kyc', label: 'Identity & KYC' },
  { id: 'banking', label: 'Banking' },
  { id: 'webhooks', label: 'Webhooks' },
  { id: 'branding', label: 'Branding' },
  { id: 'review', label: 'Review & activate' },
];

const colorOptions = ['#1C6F6B', '#1A1A1A', '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6', '#14B8A6', '#F97316'];

export function Onboarding() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const step = steps[current];

  // All form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [industry, setIndustry] = useState('SaaS');
  const [businessType, setBusinessType] = useState('Private Limited');
  const [website, setWebsite] = useState('');
  const [pan, setPan] = useState('');
  const [gstin, setGstin] = useState('');
  const [signatory, setSignatory] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [cadence, setCadence] = useState('T+1');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [brandColor, setBrandColor] = useState('#1C6F6B');
  const [plan, setPlan] = useState<'Starter' | 'Growth' | 'Scale'>('Growth');
  const [creating, setCreating] = useState(false);

  const autoSlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const canContinue = () => {
    if (current === 0) return name && slug && website;
    if (current === 1) return pan && signatory;
    if (current === 2) return accountNumber && ifsc;
    if (current === 3) return true; // webhooks optional
    if (current === 4) return true;
    return true;
  };

  const handleActivate = async () => {
    setCreating(true);
    try {
      await tenantService.create({ name, slug, industry, brandColor, plan, status: 'Active', gmv30d: 0 });
      toast.success(`${name} is live · /t/${slug}`);
      setTimeout(() => navigate('/app/tenants'), 800);
    } catch {
      toast.error('Activation failed');
      setCreating(false);
    }
  };

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out', maxWidth: '920px' }}>
      <div style={{ marginBottom: '28px' }}>
        <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Onboarding</Kicker>
        <div style={{ ...typography.pageTitle, color: colors.ink }}>Let's get this merchant live</div>
        <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>Six steps, ~8 minutes. Everything can be edited later.</div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 14px', borderRadius: radius.pill,
            background: i === current ? colors.card : 'transparent',
            border: `0.5px solid ${i === current ? colors.border : 'transparent'}`,
            boxShadow: i === current ? colors.shadow : 'none',
          }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: i < current ? colors.teal : i === current ? colors.ink : 'transparent',
              border: i > current ? `0.5px solid ${colors.borderHover}` : 'none',
              color: i <= current ? '#fff' : colors.text3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 600, fontFamily: typography.family.mono,
            }}>
              {i < current ? <Icons.IconCheck size={10} color="#fff" strokeWidth={2.4} /> : (i + 1).toString().padStart(2, '0')}
            </div>
            <span style={{ fontSize: '11px', fontWeight: 500, color: i === current ? colors.ink : colors.text2 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <Card padded style={{ padding: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Kicker style={{ marginBottom: '6px' }}>Step {current + 1} of {steps.length}</Kicker>
          <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.015em' }}>{step.label}</div>
        </div>

        {current === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Legal business name" required>
              <input value={name} onChange={e => { setName(e.target.value); if (!slug) setSlug(autoSlug(e.target.value)); }} style={inputStyle} placeholder="Razorpay Technologies Pvt. Ltd." />
            </Field>
            <Field label="Workspace slug" helper={`payze.app/t/${slug || 'your-slug'}`} required>
              <input value={slug} onChange={e => setSlug(autoSlug(e.target.value))} style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="razorpay" />
            </Field>
            <Field label="Business type"><select style={inputStyle} value={businessType} onChange={e => setBusinessType(e.target.value)}><option>Private Limited</option><option>LLP</option><option>Proprietorship</option><option>Partnership</option></select></Field>
            <Field label="Industry"><select style={inputStyle} value={industry} onChange={e => setIndustry(e.target.value)}><option>SaaS</option><option>E-commerce</option><option>FinTech</option><option>Travel</option><option>Creative</option><option>Other</option></select></Field>
            <Field label="Website" style={{ gridColumn: '1 / -1' }} required><input value={website} onChange={e => setWebsite(e.target.value)} style={inputStyle} placeholder="https://" /></Field>
            <Field label="Plan" style={{ gridColumn: '1 / -1' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                {['Starter', 'Growth', 'Scale'].map(p => (
                  <button key={p} onClick={() => setPlan(p as any)} style={{
                    padding: '16px', background: plan === p ? colors.bg : colors.card,
                    border: `${plan === p ? '1.5px' : '0.5px'} solid ${plan === p ? colors.teal : colors.border}`,
                    borderRadius: radius.md, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, marginBottom: '4px' }}>{p}</div>
                    <div style={{ fontSize: '11px', color: colors.text2 }}>{p === 'Starter' ? '₹499/mo' : p === 'Growth' ? '₹2,499/mo' : '₹9,999/mo'}</div>
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {current === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="PAN number" required><input value={pan} onChange={e => setPan(e.target.value.toUpperCase())} style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="AAAAA0000A" maxLength={10} /></Field>
            <Field label="GSTIN"><input value={gstin} onChange={e => setGstin(e.target.value.toUpperCase())} style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="29AAAAA0000A1Z5" maxLength={15} /></Field>
            <Field label="Authorised signatory" style={{ gridColumn: '1 / -1' }} required><input value={signatory} onChange={e => setSignatory(e.target.value)} style={inputStyle} placeholder="Full name as per PAN" /></Field>
            <div style={{ gridColumn: '1 / -1', padding: '24px', background: colors.bg, border: `0.5px dashed ${colors.borderHover}`, borderRadius: radius.md, textAlign: 'center' }}>
              <Icons.IconDownload size={24} color={colors.text2} style={{ marginBottom: '10px' }} />
              <div style={{ fontSize: '13px', color: colors.ink, fontWeight: 500, marginBottom: '4px' }}>Drop KYC documents</div>
              <div style={{ fontSize: '11px', color: colors.text3 }}>PAN, Aadhaar, GST certificate · PDF or image · 5 MB max each</div>
              <Button variant="secondary" size="sm" style={{ marginTop: '12px' }} onClick={() => toast.success('3 documents uploaded')}>Choose files</Button>
            </div>
          </div>
        )}

        {current === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Account holder" style={{ gridColumn: '1 / -1' }}><input style={inputStyle} placeholder="As registered with your bank" /></Field>
            <Field label="Account number" required><input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="••••••••••" /></Field>
            <Field label="IFSC code" required><input value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="HDFC0000001" maxLength={11} /></Field>
            <Field label="Settlement cadence" style={{ gridColumn: '1 / -1' }}>
              <select style={inputStyle} value={cadence} onChange={e => setCadence(e.target.value)}><option>T+1 (next business day)</option><option>T+2</option><option>Weekly</option><option>Monthly</option></select>
            </Field>
            <div style={{ gridColumn: '1 / -1', padding: '16px', background: colors.bg, borderRadius: radius.md, fontSize: '12px', color: colors.text2, lineHeight: 1.6 }}>
              We'll send a penny-drop verification to confirm this account. ₹1 will be deposited and refunded within 24 hours.
            </div>
          </div>
        )}

        {current === 3 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            <Field label="Webhook endpoint URL" helper="We'll POST events here (payments, settlements, disputes)">
              <input value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="https://yourapp.com/webhooks/payze" />
            </Field>
            <div style={{ padding: '16px', background: colors.bg, borderRadius: radius.md }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink, marginBottom: '10px' }}>Events to subscribe to</div>
              {['payment.succeeded', 'payment.failed', 'payment.routed', 'settlement.completed', 'dispute.created', 'subscription.charged'].map(evt => (
                <label key={evt} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', fontSize: '12px', color: colors.ink, fontFamily: typography.family.mono }}>
                  <input type="checkbox" defaultChecked={evt !== 'subscription.charged'} />
                  {evt}
                </label>
              ))}
            </div>
            <Button variant="secondary" size="sm" icon={<Icons.IconSend size={12} />} onClick={() => toast.success('Test event sent — check your endpoint')} disabled={!webhookUrl}>
              Send test event
            </Button>
          </div>
        )}

        {current === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Field label="Brand color" helper="Used on checkout pages and customer-facing receipts">
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {colorOptions.map(c => (
                  <button key={c} onClick={() => setBrandColor(c)} style={{
                    width: '40px', height: '40px', borderRadius: radius.md,
                    background: c, border: brandColor === c ? `2px solid ${colors.ink}` : `0.5px solid ${colors.border}`,
                    cursor: 'pointer', position: 'relative',
                  }}>
                    {brandColor === c && <Icons.IconCheck size={18} color="#fff" strokeWidth={2.5} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Checkout title">
              <input style={inputStyle} placeholder={`Pay ${name || 'Your Business'}`} />
            </Field>
            <div style={{ padding: '20px', background: colors.bg, borderRadius: radius.md }}>
              <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 500 }}>Preview</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: colors.card, borderRadius: radius.md, border: `0.5px solid ${colors.border}` }}>
                <div style={{ width: '40px', height: '40px', borderRadius: radius.md, background: brandColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 600 }}>
                  {(name || 'P').charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>Pay {name || 'Your Business'}</div>
                  <div style={{ fontSize: '11px', color: colors.text3, fontFamily: typography.family.mono }}>payze.app/t/{slug || 'your-slug'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {current === 5 && (
          <div>
            <div style={{ padding: '20px', background: colors.bg, borderRadius: radius.md, marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink, marginBottom: '16px' }}>Review submission</div>
              <ReviewRow label="Legal name" value={name || '—'} />
              <ReviewRow label="Workspace" value={`/t/${slug || 'your-slug'}`} mono />
              <ReviewRow label="PAN" value={pan || '—'} mono />
              <ReviewRow label="Signatory" value={signatory || '—'} />
              <ReviewRow label="Bank account" value={accountNumber ? `${ifsc} · ••••${accountNumber.slice(-4)}` : '—'} mono />
              <ReviewRow label="Settlement" value={cadence} />
              <ReviewRow label="Webhook" value={webhookUrl || '(not configured)'} mono />
              <ReviewRow label="Plan" value={plan} isLast />
            </div>
            <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.6 }}>
              By activating, this merchant agrees to Payze's <a href="#" style={{ color: colors.ink, textDecoration: 'underline' }}>terms of service</a>, <a href="#" style={{ color: colors.ink, textDecoration: 'underline' }}>privacy policy</a>, and the platform settlement agreement.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '20px', borderTop: `0.5px solid ${colors.border}` }}>
          <Button variant="ghost" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>← Back</Button>
          {current < steps.length - 1 ? (
            <Button variant="primary" onClick={() => setCurrent(current + 1)} iconRight={<Icons.IconArrowRight size={14} />} disabled={!canContinue()}>Continue</Button>
          ) : (
            <Button variant="primary" onClick={handleActivate} disabled={creating}>
              {creating ? 'Activating…' : 'Activate merchant'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, helper, children, style = {}, required }: any) {
  return (
    <div style={style}>
      <label style={{ display: 'flex', gap: '6px', fontSize: '11px', fontWeight: 500, color: colors.text2, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
        {label} {required && <span style={{ color: colors.teal }}>*</span>}
      </label>
      {children}
      {helper && <div style={{ fontSize: '11px', color: colors.text3, marginTop: '4px' }}>{helper}</div>}
    </div>
  );
}

function ReviewRow({ label, value, mono, isLast }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`, fontSize: '12px' }}>
      <span style={{ color: colors.text3 }}>{label}</span>
      <span style={{ color: colors.ink, fontWeight: 500, fontFamily: mono ? typography.family.mono : undefined }}>{value}</span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: colors.bg, border: `0.5px solid ${colors.border}`,
  borderRadius: radius.sm, fontSize: '13px', outline: 'none', color: colors.ink, fontFamily: 'inherit',
};
