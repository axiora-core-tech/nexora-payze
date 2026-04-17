import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';

export function QRCodePage() {
  const [tab, setTab] = useState<'dynamic' | 'static'>('dynamic');
  const [amount, setAmount] = useState('1200');
  const [description, setDescription] = useState('Table 14 · Order #8374');
  const [merchant, setMerchant] = useState('Acme Corporation');
  const [generated, setGenerated] = useState(false);

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Collect offline</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>QR codes</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
            Dynamic for single payments, static for standing QRs at counters.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', background: colors.bg, padding: '4px', borderRadius: radius.pill }}>
          {[
            { id: 'dynamic', label: 'Dynamic QR' },
            { id: 'static', label: 'Static standee' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id as any); setGenerated(false); }}
              style={{
                padding: '8px 16px', borderRadius: radius.pill,
                fontSize: '12px', fontWeight: 500,
                background: tab === t.id ? colors.card : 'transparent',
                color: tab === t.id ? colors.ink : colors.text2,
                border: tab === t.id ? `0.5px solid ${colors.border}` : 'none',
                cursor: 'pointer', fontFamily: typography.family.sans,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)', gap: '20px', marginBottom: '20px' }}>
        <Card padded style={{ padding: '28px' }}>
          <Kicker style={{ marginBottom: '20px' }}>{tab === 'dynamic' ? 'Generate a one-time QR' : 'Print a standing QR'}</Kicker>

          {tab === 'dynamic' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Field label="Merchant">
                <select value={merchant} onChange={e => setMerchant(e.target.value)} style={inputStyle}>
                  <option>Acme Corporation</option>
                  <option>Cred Club</option>
                  <option>Zomato Foods</option>
                  <option>BookMyShow</option>
                </select>
              </Field>
              <Field label="Amount (INR)">
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: colors.text2, fontSize: '16px' }}>₹</span>
                  <input value={amount} onChange={e => setAmount(e.target.value)} style={{ ...inputStyle, paddingLeft: '32px', fontSize: '18px', fontWeight: 600 }} />
                </div>
              </Field>
              <Field label="Reference / description">
                <input value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} placeholder="Appears on customer's UPI app" />
              </Field>
              <Field label="Expires after">
                <select style={inputStyle}>
                  <option>15 minutes</option>
                  <option>1 hour</option>
                  <option>End of day</option>
                  <option>No expiry</option>
                </select>
              </Field>
              <Button variant="primary" onClick={() => { setGenerated(true); toast.success('QR generated'); }} fullWidth icon={<Icons.IconQR size={14} />}>
                Generate QR
              </Button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Field label="Merchant">
                <select value={merchant} onChange={e => setMerchant(e.target.value)} style={inputStyle}>
                  <option>Acme Corporation</option>
                  <option>Cred Club</option>
                  <option>Zomato Foods</option>
                </select>
              </Field>
              <Field label="Your UPI VPA" helper="Customers pay any amount to this address">
                <input value="acme.corp@payze" readOnly style={{ ...inputStyle, fontFamily: typography.family.mono, color: colors.text2 }} />
              </Field>
              <Field label="Printable format">
                <select style={inputStyle}>
                  <option>A4 poster</option>
                  <option>Countertop standee (6x4")</option>
                  <option>Wall decal (12x12")</option>
                  <option>Sticker sheet (2x2" × 6)</option>
                </select>
              </Field>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('PDF generated')} fullWidth>Download PDF</Button>
                <Button variant="ghost" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('SVG downloaded')} fullWidth>Download SVG</Button>
              </div>
            </div>
          )}
        </Card>

        <Card padded style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '480px' }}>
          {tab === 'dynamic' && !generated ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '140px', height: '140px', border: `1px dashed ${colors.borderHover}`, borderRadius: radius.lg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', opacity: 0.5 }}>
                <Icons.IconQR size={48} color={colors.text3} />
              </div>
              <div style={{ fontSize: '14px', color: colors.text2, fontWeight: 500, marginBottom: '4px' }}>Fill in the details to generate</div>
              <div style={{ fontSize: '12px', color: colors.text3 }}>The QR will show here</div>
            </div>
          ) : (
            <>
              <FakeQR />
              <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  {tab === 'dynamic' ? 'To collect' : 'Scan to pay anything'}
                </div>
                {tab === 'dynamic' && (
                  <div style={{ fontSize: '32px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em' }}>
                    ₹{parseInt(amount).toLocaleString('en-IN')}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: colors.text2, marginTop: '4px' }}>{merchant} · {tab === 'dynamic' ? description : 'acme.corp@payze'}</div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                <Button variant="secondary" size="sm" icon={<Icons.IconDownload size={12} />} onClick={() => toast.success('Downloaded PNG')}>PNG</Button>
                <Button variant="secondary" size="sm" icon={<Icons.IconCopy size={12} />} onClick={() => { navigator.clipboard.writeText(`upi://pay?pa=acme.corp@payze&am=${amount}`); toast.success('UPI link copied'); }}>Copy link</Button>
                {tab === 'dynamic' && (
                  <Button variant="ghost" size="sm">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.teal, animation: 'payze-pulse-dot 2s ease-in-out infinite' }} />
                      Awaiting scan
                    </span>
                  </Button>
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      <Card padded={false}>
        <div style={{ padding: '18px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>Recent scans</div>
          <div style={{ fontSize: '12px', color: colors.text2 }}>Last 24 hours</div>
        </div>
        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '0.9fr 1.5fr 0.8fr 1fr 0.8fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Time</div>
          <div>Customer · Reference</div>
          <div>Method</div>
          <div style={{ textAlign: 'right' }}>Amount</div>
          <div>Status</div>
        </div>
        {[
          { time: '14:42', customer: 'GPay · 8912•••21', ref: 'Table 14 · Order #8374', method: 'UPI', amount: '₹1,200', status: 'Paid' },
          { time: '14:38', customer: 'PhonePe · 7823•••09', ref: 'Table 11 · Order #8371', method: 'UPI', amount: '₹840', status: 'Paid' },
          { time: '14:21', customer: 'Paytm · 9122•••42', ref: 'Table 6 · Order #8365', method: 'UPI', amount: '₹2,450', status: 'Paid' },
          { time: '14:07', customer: 'BHIM · 9822•••11', ref: 'Counter · walk-in', method: 'UPI', amount: '₹350', status: 'Paid' },
          { time: '13:58', customer: 'GPay · 6411•••78', ref: 'Table 9 · Order #8360', method: 'UPI', amount: '₹1,820', status: 'Paid' },
        ].map((r, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '0.9fr 1.5fr 0.8fr 1fr 0.8fr', gap: '16px',
            padding: '14px 24px', alignItems: 'center', fontSize: '13px',
            borderBottom: i < 4 ? `0.5px solid ${colors.border}` : 'none',
          }}>
            <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{r.time}</div>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{r.customer}</div>
              <div style={{ color: colors.text3, fontSize: '11px' }}>{r.ref}</div>
            </div>
            <div style={{ color: colors.text2, fontSize: '12px' }}>{r.method}</div>
            <div style={{ textAlign: 'right', fontWeight: 600, color: colors.ink }}>{r.amount}</div>
            <div><Pill tone="teal">{r.status}</Pill></div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function FakeQR() {
  return (
    <div style={{ background: colors.card, padding: '16px', borderRadius: radius.lg, border: `0.5px solid ${colors.border}`, boxShadow: colors.shadow }}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="#fff" />
        {/* Finder patterns (corner squares) */}
        {[[10, 10], [150, 10], [10, 150]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x} y={y} width="40" height="40" fill={colors.ink} />
            <rect x={x + 6} y={y + 6} width="28" height="28" fill="#fff" />
            <rect x={x + 12} y={y + 12} width="16" height="16" fill={colors.ink} />
          </g>
        ))}
        {/* Random data modules */}
        {Array.from({ length: 180 }).map((_, i) => {
          const col = i % 15;
          const row = Math.floor(i / 15);
          const x = 60 + col * 6;
          const y = 60 + row * 6;
          if (y > 140) return null;
          const fill = Math.random() > 0.5 ? colors.ink : '#fff';
          const isAccent = Math.random() > 0.92;
          return <rect key={i} x={x} y={y} width="5" height="5" fill={isAccent ? colors.teal : fill} />;
        })}
        {/* Center logo */}
        <rect x="80" y="80" width="40" height="40" rx="8" fill="#fff" stroke={colors.ink} strokeWidth="1" />
        <text x="100" y="106" fontFamily="Inter" fontSize="16" fontWeight="700" fill={colors.ink} textAnchor="middle">P</text>
      </svg>
    </div>
  );
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: colors.text2, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</label>
      {children}
      {helper && <div style={{ fontSize: '11px', color: colors.text3, marginTop: '4px' }}>{helper}</div>}
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
