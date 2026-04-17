import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';

const subs = [
  { id: 'sub_482a', customer: 'Rohan Shankar', plan: 'Acme Pro · Quarterly', amount: '₹4,500', method: 'UPI Autopay', nextCharge: '17 Jul', status: 'Active' },
  { id: 'sub_481b', customer: 'Priya Venkataraman', plan: 'Nova Scale', amount: '₹9,999', method: 'NACH', nextCharge: '01 May', status: 'Active' },
  { id: 'sub_480c', customer: 'Studio Lumière', plan: 'Luminary Growth', amount: '€299', method: 'SEPA DD', nextCharge: '01 May', status: 'Active' },
  { id: 'sub_479d', customer: 'Test Customer', plan: 'Acme Starter', amount: '₹499', method: 'UPI Autopay', nextCharge: '22 Apr', status: 'Paused' },
];

export function Subscriptions() {
  const [tab, setTab] = useState<'all' | 'upi' | 'nach' | 'international'>('all');

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Recurring</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>Subscriptions</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
            Mandates and recurring billing.
          </div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />}>New subscription</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Active mandates" value="1,842" sub="across 47 merchants" />
        <StatCard label="MRR" value="₹48.2 L" sub="+12.4% MoM" />
        <StatCard label="Churn" value="2.8%" sub="industry avg: 5.2%" />
        <StatCard label="Success rate" value="96.4%" sub="renewal collections" />
      </div>

      <Card padded={false}>
        <div style={{ padding: '16px 24px', borderBottom: `0.5px solid ${colors.border}` }}>
          <div style={{ display: 'flex', gap: '6px', background: colors.bg, padding: '4px', borderRadius: radius.pill, width: 'fit-content' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'upi', label: 'UPI Autopay' },
              { id: 'nach', label: 'NACH' },
              { id: 'international', label: 'International' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                style={{
                  padding: '6px 14px', borderRadius: radius.pill,
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

        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 0.8fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Subscriber</div>
          <div>Plan</div>
          <div>Amount</div>
          <div>Method</div>
          <div>Next charge</div>
          <div>Status</div>
        </div>
        {subs.map((s, i) => (
          <div key={s.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 1fr 1fr 0.8fr', gap: '16px',
            padding: '16px 24px',
            borderBottom: i < subs.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            alignItems: 'center', fontSize: '13px',
          }}>
            <div style={{ color: colors.ink, fontWeight: 500 }}>{s.customer}</div>
            <div style={{ color: colors.text2, fontSize: '12px' }}>{s.plan}</div>
            <div style={{ color: colors.ink, fontWeight: 600 }}>{s.amount}</div>
            <div style={{ color: colors.text2, fontSize: '12px' }}>{s.method}</div>
            <div style={{ color: colors.text2 }}>{s.nextCharge}</div>
            <div>
              <Pill tone={s.status === 'Active' ? 'teal' : 'neutral'}>{s.status}</Pill>
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
