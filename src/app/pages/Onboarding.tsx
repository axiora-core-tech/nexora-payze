import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button } from '../../design/primitives';
import * as Icons from '../../design/icons';

const steps = [
  { id: 'business', label: 'Business details' },
  { id: 'kyc', label: 'Identity & KYC' },
  { id: 'banking', label: 'Banking & settlement' },
  { id: 'review', label: 'Review & activate' },
];

export function Onboarding() {
  const [current, setCurrent] = useState(0);
  const step = steps[current];

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out', maxWidth: '880px' }}>
      <div style={{ marginBottom: '28px' }}>
        <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Onboarding</Kicker>
        <div style={{ ...typography.pageTitle, color: colors.ink }}>Let's get you live</div>
        <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
          Four quick steps. We handle the rest.
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 16px', borderRadius: radius.pill,
            background: i === current ? colors.card : 'transparent',
            border: `0.5px solid ${i === current ? colors.border : 'transparent'}`,
            boxShadow: i === current ? colors.shadow : 'none',
          }}>
            <div style={{
              width: '22px', height: '22px', borderRadius: '50%',
              background: i < current ? colors.teal : i === current ? colors.ink : colors.bg,
              border: i > current ? `0.5px solid ${colors.borderHover}` : 'none',
              color: i <= current ? '#fff' : colors.text3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 600, fontFamily: typography.family.mono,
            }}>
              {i < current ? <Icons.IconCheck size={10} color="#fff" strokeWidth={2.4} /> : (i + 1).toString().padStart(2, '0')}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 500, color: i === current ? colors.ink : colors.text2 }}>{s.label}</span>
          </div>
        ))}
      </div>

      <Card padded style={{ padding: '32px' }}>
        <div style={{ marginBottom: '24px' }}>
          <Kicker style={{ marginBottom: '6px' }}>Step {current + 1} of 4</Kicker>
          <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.015em' }}>
            {step.label}
          </div>
        </div>

        {current === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Legal business name"><input style={inputStyle} placeholder="Acme Corporation Pvt. Ltd." /></Field>
            <Field label="Display name"><input style={inputStyle} placeholder="Acme" /></Field>
            <Field label="Business type">
              <select style={inputStyle}><option>Private Limited</option><option>LLP</option><option>Proprietorship</option><option>Partnership</option></select>
            </Field>
            <Field label="Industry">
              <select style={inputStyle}><option>SaaS</option><option>E-commerce</option><option>FinTech</option><option>Travel</option></select>
            </Field>
            <Field label="Website" style={{ gridColumn: '1 / -1' }}>
              <input style={inputStyle} placeholder="https://" />
            </Field>
          </div>
        )}

        {current === 1 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="PAN number"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="AAAAA0000A" /></Field>
            <Field label="GSTIN"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="29AAAAA0000A1Z5" /></Field>
            <Field label="Authorised signatory" style={{ gridColumn: '1 / -1' }}>
              <input style={inputStyle} placeholder="Full name as per PAN" />
            </Field>
            <div style={{ gridColumn: '1 / -1', padding: '20px', background: colors.bg, border: `0.5px dashed ${colors.borderHover}`, borderRadius: radius.md, textAlign: 'center' }}>
              <Icons.IconDownload size={20} color={colors.text2} style={{ marginBottom: '8px' }} />
              <div style={{ fontSize: '13px', color: colors.ink, fontWeight: 500, marginBottom: '2px' }}>Upload identity documents</div>
              <div style={{ fontSize: '11px', color: colors.text3 }}>PAN card, Aadhaar, GST certificate (max 5 MB each)</div>
            </div>
          </div>
        )}

        {current === 2 && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Field label="Account holder" style={{ gridColumn: '1 / -1' }}><input style={inputStyle} placeholder="Acme Corporation Pvt. Ltd." /></Field>
            <Field label="Account number"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="••••••••••" /></Field>
            <Field label="IFSC code"><input style={{ ...inputStyle, fontFamily: typography.family.mono }} placeholder="HDFC0000001" /></Field>
            <Field label="Settlement cadence" style={{ gridColumn: '1 / -1' }}>
              <select style={inputStyle}><option>T+1 (next business day)</option><option>T+2</option><option>Weekly</option><option>Monthly</option></select>
            </Field>
          </div>
        )}

        {current === 3 && (
          <div>
            <div style={{ padding: '20px', background: colors.bg, borderRadius: radius.md, marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink, marginBottom: '12px' }}>Review your submission</div>
              {['Business details', 'Identity & KYC', 'Banking & settlement'].map((s) => (
                <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `0.5px solid ${colors.border}`, fontSize: '12px' }}>
                  <span style={{ color: colors.text2 }}>{s}</span>
                  <span style={{ color: colors.teal, fontWeight: 500 }}>Complete</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.6 }}>
              By activating, you agree to Payze's <a href="#" style={{ color: colors.ink, textDecoration: 'underline' }}>terms of service</a> and <a href="#" style={{ color: colors.ink, textDecoration: 'underline' }}>privacy policy</a>.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '20px', borderTop: `0.5px solid ${colors.border}` }}>
          <Button variant="ghost" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>← Back</Button>
          {current < steps.length - 1 ? (
            <Button variant="primary" onClick={() => setCurrent(current + 1)} iconRight={<Icons.IconArrowRight size={14} />}>Continue</Button>
          ) : (
            <Button variant="primary">Activate merchant</Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children, style = {} }: any) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: colors.text2, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</label>
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
