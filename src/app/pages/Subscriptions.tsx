import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';

const subs = [
  { id: 'sub_482a', customer: 'Rohan Shankar', plan: 'Zomato Gold · Quarterly', amount: '₹4,500', method: 'UPI Autopay', type: 'upi', nextCharge: '17 Jul', status: 'Active', collected: 12 },
  { id: 'sub_481b', customer: 'Priya Venkataraman', plan: 'Cred Scale', amount: '₹9,999', method: 'NACH', type: 'nach', nextCharge: '01 May', status: 'Active', collected: 8 },
  { id: 'sub_480c', customer: 'Amélie Dubois', plan: 'Nykaa Growth', amount: '€299', method: 'SEPA DD', type: 'international', nextCharge: '01 May', status: 'Active', collected: 4 },
  { id: 'sub_479d', customer: 'Amit Sharma', plan: 'Razorpay Starter', amount: '₹499', method: 'UPI Autopay', type: 'upi', nextCharge: '22 Apr', status: 'Paused', collected: 2 },
  { id: 'sub_478e', customer: 'Emma Dawson', plan: 'MakeMyTrip Premium', amount: '$49', method: 'Card', type: 'international', nextCharge: '28 Apr', status: 'Active', collected: 18 },
  { id: 'sub_477f', customer: 'Rajiv Mehta', plan: 'BookMyShow Pro', amount: '₹199', method: 'UPI Autopay', type: 'upi', nextCharge: '15 May', status: 'Active', collected: 24 },
  { id: 'sub_476g', customer: 'Studio Lumière', plan: 'Design Pro', amount: '₹19,999', method: 'NACH', type: 'nach', nextCharge: '01 May', status: 'Cancelled', collected: 3 },
];

export function Subscriptions() {
  const [tab, setTab] = useState<'all' | 'upi' | 'nach' | 'international'>('all');
  const [status, setStatus] = useState<'all' | 'active' | 'paused' | 'cancelled'>('all');
  const [range, setRange] = useState('30d');
  const [actionsFor, setActionsFor] = useState<string | null>(null);

  const filtered = subs.filter(s => {
    if (tab !== 'all' && s.type !== tab) return false;
    if (status !== 'all' && s.status.toLowerCase() !== status) return false;
    return true;
  });

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Recurring</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>Subscriptions</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>Mandates and recurring billing.</div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => toast.success('New subscription builder opened')}>New subscription</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Active mandates" value="1,842" sub="across 47 merchants" />
        <StatCard label="MRR" value="₹48.2 L" sub="+12.4% MoM" />
        <StatCard label="Churn" value="2.8%" sub="industry avg: 5.2%" />
        <StatCard label="Success rate" value="96.4%" sub="renewal collections" />
      </div>

      <Card padded={false}>
        <div style={{ padding: '16px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'upi', label: 'UPI Autopay' },
              { id: 'nach', label: 'NACH' },
              { id: 'international', label: 'International' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)} style={{
                padding: '6px 12px', borderRadius: radius.pill, fontSize: '11px', fontWeight: 500,
                background: tab === t.id ? colors.card : 'transparent',
                color: tab === t.id ? colors.ink : colors.text2,
                border: tab === t.id ? `0.5px solid ${colors.border}` : 'none',
                cursor: 'pointer', fontFamily: typography.family.sans,
              }}>{t.label}</button>
            ))}
          </div>
          <select value={status} onChange={e => setStatus(e.target.value as any)} style={selectStyle}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={range} onChange={e => setRange(e.target.value)} style={selectStyle}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="ytd">Year to date</option>
            <option value="custom">Custom range…</option>
          </select>
          <Button variant="ghost" size="sm" icon={<Icons.IconDownload size={12} />} style={{ marginLeft: 'auto' }} onClick={() => toast.success('CSV downloaded')}>Export</Button>
        </div>

        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '1fr 1.4fr 0.9fr 0.9fr 0.9fr 0.8fr 0.4fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Subscriber</div>
          <div>Plan</div>
          <div>Amount</div>
          <div>Method</div>
          <div>Next charge</div>
          <div>Status</div>
          <div></div>
        </div>

        {filtered.map((s, i) => (
          <div key={s.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 1.4fr 0.9fr 0.9fr 0.9fr 0.8fr 0.4fr', gap: '16px',
            padding: '16px 24px',
            borderBottom: i < filtered.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            alignItems: 'center', fontSize: '13px',
          }}>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{s.customer}</div>
              <div style={{ fontSize: '11px', color: colors.text3 }}>{s.collected} successful collections</div>
            </div>
            <div style={{ color: colors.text2, fontSize: '12px' }}>{s.plan}</div>
            <div style={{ color: colors.ink, fontWeight: 600 }}>{s.amount}</div>
            <div style={{ color: colors.text2, fontSize: '12px' }}>{s.method}</div>
            <div style={{ color: colors.text2 }}>{s.nextCharge}</div>
            <div>
              <Pill tone={s.status === 'Active' ? 'teal' : s.status === 'Paused' ? 'outline' : 'neutral'}>{s.status}</Pill>
            </div>
            <div style={{ textAlign: 'right', position: 'relative' }}>
              <button onClick={() => setActionsFor(actionsFor === s.id ? null : s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text3, padding: '4px' }}>
                <Icons.IconSettings size={14} />
              </button>
              {actionsFor === s.id && (
                <>
                  <div onClick={() => setActionsFor(null)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, boxShadow: colors.shadowMd, minWidth: '160px', zIndex: 50, padding: '6px' }}>
                    {[
                      { label: 'View details', icon: Icons.IconEye },
                      { label: s.status === 'Paused' ? 'Resume' : 'Pause', icon: Icons.IconClock },
                      { label: 'Charge now', icon: Icons.IconSend },
                      { label: 'Update mandate', icon: Icons.IconSettings },
                      { label: 'Cancel', icon: Icons.IconTrash, danger: true },
                    ].map(a => (
                      <button key={a.label} onClick={() => { toast.success(`${a.label}: ${s.id}`); setActionsFor(null); }} style={{
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

const selectStyle: React.CSSProperties = {
  padding: '6px 10px', background: colors.card,
  border: `0.5px solid ${colors.border}`, borderRadius: radius.pill,
  fontSize: '12px', color: colors.ink, cursor: 'pointer',
  fontFamily: 'inherit', outline: 'none',
};
