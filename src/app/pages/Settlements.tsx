import React from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';

const batches = [
  { id: 'STL-9824', merchant: 'Acme Corporation', amount: '₹45,20,000', method: 'NEFT', status: 'Settled', arrived: 'Today 06:30', count: 1284 },
  { id: 'STL-9823', merchant: 'Nova Fintech', amount: '₹1,12,40,000', method: 'RTGS', status: 'Settled', arrived: 'Today 05:45', count: 3891 },
  { id: 'STL-9822', merchant: 'Meridian Travel', amount: '₹8,45,200', method: 'NEFT', status: 'Settling', arrived: 'Expected 18:00', count: 412 },
  { id: 'STL-9821', merchant: 'Luminary Studio', amount: '₹18,500', method: 'NEFT', status: 'Pending', arrived: 'Tomorrow 06:30', count: 48 },
  { id: 'STL-9820', merchant: 'Horizon Labs', amount: '₹22,40,000', method: 'RTGS', status: 'Settled', arrived: 'Yesterday 08:15', count: 672 },
];

export function Settlements() {
  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Settlement</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>Settlements</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
            Batches settled to merchant bank accounts.
          </div>
        </div>
        <Button variant="secondary" icon={<Icons.IconDownload size={14} />}>Export</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Settled today" value="₹64,80,200" sub="142 batches" />
        <StatCard label="Settling now" value="₹8,45,200" sub="expected 18:00" />
        <StatCard label="Pending" value="₹18,500" sub="tomorrow 06:30" />
        <StatCard label="Total, month" value="₹18.4 Cr" sub="across 47 merchants" />
      </div>

      <Card padded={false}>
        <div style={{ padding: '18px 24px', borderBottom: `0.5px solid ${colors.border}` }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>Recent batches</div>
        </div>

        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '0.9fr 1.5fr 1fr 0.8fr 1fr 0.8fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Batch</div>
          <div>Merchant · Count</div>
          <div style={{ textAlign: 'right' }}>Amount</div>
          <div>Rail</div>
          <div>Arrives</div>
          <div>Status</div>
        </div>

        {batches.map((b, i) => (
          <div key={b.id} style={{
            display: 'grid', gridTemplateColumns: '0.9fr 1.5fr 1fr 0.8fr 1fr 0.8fr', gap: '16px',
            padding: '16px 24px',
            borderBottom: i < batches.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            alignItems: 'center', fontSize: '13px',
          }}>
            <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{b.id}</div>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{b.merchant}</div>
              <div style={{ color: colors.text3, fontSize: '11px' }}>{b.count.toLocaleString('en-IN')} transactions</div>
            </div>
            <div style={{ textAlign: 'right', fontWeight: 600, color: colors.ink }}>{b.amount}</div>
            <div style={{ color: colors.text2, fontFamily: typography.family.mono, fontSize: '11px' }}>{b.method}</div>
            <div style={{ color: colors.text2, fontSize: '12px' }}>{b.arrived}</div>
            <div>
              <Pill tone={b.status === 'Settled' ? 'teal' : b.status === 'Settling' ? 'outline' : 'neutral'}>
                {b.status}
              </Pill>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card padded style={{ padding: '18px' }}>
      <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: colors.text2 }}>{sub}</div>
    </Card>
  );
}
