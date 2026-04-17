import React from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';

const invoices = [
  { id: 'INV-0228', merchant: 'Meridian Travel', customer: 'Studio Lumière', amount: '₹18,200', due: '17 Apr', status: 'Paid' },
  { id: 'INV-0227', merchant: 'Acme Corporation', customer: 'Techcorp Mumbai', amount: '₹1,12,000', due: '20 Apr', status: 'Sent' },
  { id: 'INV-0226', merchant: 'Luminary Studio', customer: 'Brand X', amount: '$4,800', due: '15 Apr', status: 'Overdue' },
  { id: 'INV-0225', merchant: 'Nova Fintech', customer: 'Startup Pro', amount: '₹54,000', due: '22 Apr', status: 'Draft' },
  { id: 'INV-0224', merchant: 'Axiora Global', customer: 'ENT Partners', amount: '₹8,45,200', due: '10 Apr', status: 'Paid' },
];

export function Invoices() {
  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Invoicing</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>Invoices</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
            Documents issued, sent, and collected.
          </div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />}>New invoice</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Outstanding" value="₹12.40 L" sub="8 invoices" />
        <StatCard label="Paid this month" value="₹4.82 Cr" sub="142 invoices" />
        <StatCard label="Overdue" value="₹85,400" sub="2 invoices" />
        <StatCard label="Avg days to pay" value="8.4 days" sub="down from 11.2" />
      </div>

      <Card padded={false}>
        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '0.9fr 1.5fr 1fr 1fr 0.8fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Number</div>
          <div>Merchant · Customer</div>
          <div>Amount</div>
          <div>Due</div>
          <div>Status</div>
        </div>
        {invoices.map((inv, i) => (
          <div key={inv.id} style={{
            display: 'grid', gridTemplateColumns: '0.9fr 1.5fr 1fr 1fr 0.8fr', gap: '16px',
            padding: '16px 24px',
            borderBottom: i < invoices.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            alignItems: 'center', fontSize: '13px',
          }}>
            <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{inv.id}</div>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{inv.merchant}</div>
              <div style={{ color: colors.text3, fontSize: '11px' }}>{inv.customer}</div>
            </div>
            <div style={{ color: colors.ink, fontWeight: 600 }}>{inv.amount}</div>
            <div style={{ color: colors.text2 }}>{inv.due}</div>
            <div>
              <Pill tone={inv.status === 'Paid' ? 'teal' : inv.status === 'Overdue' ? 'outline' : 'neutral'}>
                {inv.status}
              </Pill>
            </div>
          </div>
        ))}
      </Card>
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
