import React from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';

const links = [
  { id: 'plk_a9f3e2', title: 'Brand identity · Phase 1', merchant: 'Acme Corporation', amount: '₹1,12,000', status: 'Active', uses: '2 of 5', created: '16 Apr' },
  { id: 'plk_b4c7d1', title: 'Subscription · Pro monthly', merchant: 'Nova Fintech', amount: '₹2,499', status: 'Active', uses: '142', created: '03 Apr' },
  { id: 'plk_c8e5f2', title: 'Event ticket · Launch night', merchant: 'Luminary Studio', amount: '€89', status: 'Expired', uses: '48 of 48', created: '28 Mar' },
  { id: 'plk_d1a9b3', title: 'Custom quote · Retainer Q2', merchant: 'Meridian Travel', amount: '₹3,45,200', status: 'Draft', uses: '0', created: '17 Apr' },
];

export function PaymentLinks() {
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
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
            Share a URL, get paid.
          </div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />}>New link</Button>
      </div>

      <Card padded={false}>
        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.8fr 0.4fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Link</div>
          <div>Merchant</div>
          <div>Amount</div>
          <div>Uses</div>
          <div>Status</div>
          <div></div>
        </div>
        {links.map((l, i) => (
          <div key={l.id} style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 0.8fr 0.4fr', gap: '16px',
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
            <div style={{ color: colors.text2 }}>{l.uses}</div>
            <div>
              <Pill tone={l.status === 'Active' ? 'teal' : l.status === 'Expired' ? 'neutral' : 'outline'}>
                {l.status}
              </Pill>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button onClick={() => copyLink(l.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
                <Icons.IconCopy size={14} />
              </button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
