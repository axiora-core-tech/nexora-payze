import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

export function QRCodePage() {
  const { data, loading, error, refetch } = useAsync(() => configService.getQR(), []);
  const [tab, setTab] = useState<string>('dynamic');
  const [amount, setAmount] = useState('1200');
  const [description, setDescription] = useState('Table 14 · Order #8374');
  const [merchant, setMerchant] = useState('Acme Corporation');
  const [generated, setGenerated] = useState(false);

  React.useEffect(() => {
    if (data) {
      setAmount(data.defaults.amount);
      setDescription(data.defaults.description);
      setMerchant(data.defaults.merchant);
    }
  }, [data]);

  if (error) return <ErrorState message={`Couldn't load QR workspace — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading QR workspace" />;

  const { header, tabs, merchants, expiries, formats, defaultVpa, recentScans } = data;

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{header.subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px', background: colors.bg, padding: '4px', borderRadius: radius.pill }}>
          {tabs.map((t: any) => (
            <button key={t.id} onClick={() => { setTab(t.id); setGenerated(false); }} style={{
              padding: '8px 16px', borderRadius: radius.pill, fontSize: '12px', fontWeight: 500,
              background: tab === t.id ? colors.card : 'transparent',
              color: tab === t.id ? colors.ink : colors.text2,
              border: tab === t.id ? `0.5px solid ${colors.border}` : 'none',
              cursor: 'pointer', fontFamily: typography.family.sans,
            }}>{t.label}</button>
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
                  {merchants.map((m: string) => <option key={m}>{m}</option>)}
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
                  {expiries.map((e: string) => <option key={e}>{e}</option>)}
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
                  {merchants.map((m: string) => <option key={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Your UPI VPA" helper="Customers pay any amount to this address">
                <input value={defaultVpa} readOnly style={{ ...inputStyle, fontFamily: typography.family.mono, color: colors.text2 }} />
              </Field>
              <Field label="Printable format">
                <select style={inputStyle}>
                  {formats.map((f: string) => <option key={f}>{f}</option>)}
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
                <div style={{ fontSize: '12px', color: colors.text2, marginTop: '4px' }}>{merchant} · {tab === 'dynamic' ? description : defaultVpa}</div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                <Button variant="secondary" size="sm" icon={<Icons.IconDownload size={12} />} onClick={() => toast.success('Downloaded PNG')}>PNG</Button>
                <Button variant="secondary" size="sm" icon={<Icons.IconCopy size={12} />} onClick={() => { navigator.clipboard.writeText(`upi://pay?pa=${defaultVpa}&am=${amount}`); toast.success('UPI link copied'); }}>Copy link</Button>
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
          <div>Time</div><div>Customer · Reference</div><div>Method</div>
          <div style={{ textAlign: 'right' }}>Amount</div><div>Status</div>
        </div>
        {recentScans.map((r: any, i: number) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '0.9fr 1.5fr 0.8fr 1fr 0.8fr', gap: '16px',
            padding: '14px 24px', alignItems: 'center', fontSize: '13px',
            borderBottom: i < recentScans.length - 1 ? `0.5px solid ${colors.border}` : 'none',
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
        {[[10, 10], [150, 10], [10, 150]].map(([x, y], i) => (
          <g key={i}>
            <rect x={x} y={y} width="40" height="40" fill={colors.ink} />
            <rect x={x + 6} y={y + 6} width="28" height="28" fill="#fff" />
            <rect x={x + 12} y={y + 12} width="16" height="16" fill={colors.ink} />
          </g>
        ))}
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
  width: '100%', padding: '10px 14px', background: colors.bg, border: `0.5px solid ${colors.border}`,
  borderRadius: radius.sm, fontSize: '13px', outline: 'none', color: colors.ink, fontFamily: 'inherit',
};
