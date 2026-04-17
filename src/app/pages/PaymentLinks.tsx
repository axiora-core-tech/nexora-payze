import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';

type Link = {
  id: string;
  title: string;
  merchant: string;
  amount: string;
  status: 'Active' | 'Expired' | 'Draft';
  uses: string;
  created: string;
  collected: string;
};

const links: Link[] = [
  { id: 'plk_a9f3e2', title: 'Brand identity · Phase 1', merchant: 'Nykaa Beauty', amount: '₹1,12,000', status: 'Active', uses: '2 of 5', collected: '₹2,24,000', created: '16 Apr' },
  { id: 'plk_b4c7d1', title: 'Pro subscription monthly', merchant: 'Cred Club', amount: '₹2,499', status: 'Active', uses: '142', collected: '₹3,54,858', created: '03 Apr' },
  { id: 'plk_c8e5f2', title: 'Launch night ticket', merchant: 'BookMyShow', amount: '€89', status: 'Expired', uses: '48 of 48', collected: '€4,272', created: '28 Mar' },
  { id: 'plk_d1a9b3', title: 'Retainer Q2', merchant: 'Razorpay Technologies', amount: '₹3,45,200', status: 'Draft', uses: '0', collected: '—', created: '17 Apr' },
];

export function PaymentLinks() {
  const [qrFor, setQrFor] = useState<Link | null>(null);
  const [actionsFor, setActionsFor] = useState<string | null>(null);

  const copyLink = (id: string) => {
    navigator.clipboard.writeText(`https://payze.link/${id}`);
    toast.success('Link copied');
  };

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Collect</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>Payment links</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>Share a URL, get paid.</div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => toast.success('Link builder opened')}>New link</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Active links" value="284" sub="across 47 merchants" />
        <StatCard label="Collected, month" value="₹82.4 L" sub="+18% MoM" />
        <StatCard label="Total uses" value="18,241" sub="conversion 64.2%" />
        <StatCard label="Avg ticket" value="₹452" sub="median ₹299" />
      </div>

      <Card padded={false}>
        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.8fr 1fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Link</div>
          <div>Merchant</div>
          <div>Amount</div>
          <div>Uses</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Actions</div>
        </div>
        {links.map((l, i) => (
          <div key={l.id} style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.8fr 1fr', gap: '16px',
            padding: '16px 24px',
            borderBottom: i < links.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            alignItems: 'center', fontSize: '13px',
          }}>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{l.title}</div>
              <div style={{ fontFamily: typography.family.mono, fontSize: '10px', color: colors.text3 }}>payze.link/{l.id}</div>
            </div>
            <div style={{ color: colors.text2, fontSize: '12px' }}>{l.merchant}</div>
            <div style={{ color: colors.ink, fontWeight: 600 }}>{l.amount}</div>
            <div>
              <div style={{ color: colors.text2 }}>{l.uses}</div>
              <div style={{ fontSize: '11px', color: colors.text3 }}>{l.collected}</div>
            </div>
            <div><Pill tone={l.status === 'Active' ? 'teal' : l.status === 'Expired' ? 'neutral' : 'outline'}>{l.status}</Pill></div>
            <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', position: 'relative' }}>
              <button title="Show QR" onClick={() => setQrFor(l)} style={iconBtnStyle}><Icons.IconQR size={14} /></button>
              <button title="Copy link" onClick={() => copyLink(l.id)} style={iconBtnStyle}><Icons.IconCopy size={14} /></button>
              <button title="Open" onClick={() => window.open(`https://payze.link/${l.id}`, '_blank')} style={iconBtnStyle}><Icons.IconExternal size={14} /></button>
              <button title="Actions" onClick={() => setActionsFor(actionsFor === l.id ? null : l.id)} style={iconBtnStyle}><Icons.IconSettings size={14} /></button>
              {actionsFor === l.id && (
                <>
                  <div onClick={() => setActionsFor(null)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, boxShadow: colors.shadowMd, minWidth: '180px', zIndex: 50, padding: '6px' }}>
                    {[
                      { label: 'Analytics', icon: Icons.IconChart },
                      { label: 'Edit', icon: Icons.IconSettings },
                      { label: 'Duplicate', icon: Icons.IconPlus },
                      { label: l.status === 'Active' ? 'Deactivate' : 'Activate', icon: Icons.IconCheck },
                      { label: 'Delete', icon: Icons.IconTrash },
                    ].map(a => (
                      <button key={a.label} onClick={() => { toast.success(`${a.label}: ${l.id}`); setActionsFor(null); }} style={{
                        display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px',
                        background: 'transparent', border: 'none', borderRadius: radius.sm,
                        fontSize: '12px', color: colors.ink, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                      }}>
                        <a.icon size={12} color={colors.text2} />
                        {a.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </Card>

      {qrFor && <QRModal link={qrFor} onClose={() => setQrFor(null)} />}
    </div>
  );
}

function QRModal({ link, onClose }: { link: Link; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '420px', maxWidth: '92vw', background: colors.card,
        border: `0.5px solid ${colors.border}`, borderRadius: radius.lg,
        padding: '32px', textAlign: 'center', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-20px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        <Kicker color={colors.teal} style={{ marginBottom: '8px' }}>Share this link</Kicker>
        <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, marginBottom: '4px' }}>{link.title}</div>
        <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', marginBottom: '24px' }}>{link.amount}</div>

        <div style={{ display: 'inline-flex', padding: '20px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.lg, marginBottom: '20px' }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <rect width="200" height="200" fill="#fff" />
            {[[10, 10], [150, 10], [10, 150]].map(([x, y], i) => (
              <g key={i}>
                <rect x={x} y={y} width="40" height="40" fill={colors.ink} />
                <rect x={x + 6} y={y + 6} width="28" height="28" fill="#fff" />
                <rect x={x + 12} y={y + 12} width="16" height="16" fill={colors.ink} />
              </g>
            ))}
            {Array.from({ length: 160 }).map((_, i) => {
              const col = i % 14;
              const row = Math.floor(i / 14);
              const x = 62 + col * 6;
              const y = 62 + row * 6;
              if (y > 138) return null;
              const isAccent = Math.random() > 0.92;
              return <rect key={i} x={x} y={y} width="5" height="5" fill={isAccent ? colors.teal : (Math.random() > 0.5 ? colors.ink : '#fff')} />;
            })}
            <rect x="80" y="80" width="40" height="40" rx="8" fill="#fff" stroke={colors.ink} strokeWidth="1" />
            <text x="100" y="106" fontFamily="Inter" fontSize="16" fontWeight="700" fill={colors.ink} textAnchor="middle">P</text>
          </svg>
        </div>

        <div style={{ padding: '10px 14px', background: colors.bg, borderRadius: radius.sm, fontFamily: typography.family.mono, fontSize: '12px', color: colors.text2, marginBottom: '16px' }}>
          payze.link/{link.id}
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <Button variant="primary" icon={<Icons.IconCopy size={14} />} onClick={() => { navigator.clipboard.writeText(`https://payze.link/${link.id}`); toast.success('Link copied'); }}>Copy link</Button>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('QR downloaded as PNG')}>Download QR</Button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: any) {
  return (
    <Card padded style={{ padding: '18px' }}>
      <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: colors.text2 }}>{sub}</div>
    </Card>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: '28px', height: '28px', borderRadius: radius.sm,
  background: 'transparent', border: `0.5px solid transparent`,
  color: colors.text2, cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 0, fontFamily: 'inherit',
};
