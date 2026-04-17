import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';

const transactions = [
  { id: 'txn_00482', time: '14:47:12', merchant: 'Acme Corporation', customer: 'Priya Venkataraman', method: 'UPI · GPay', amount: '₹7,800', status: 'routed', note: 'Succeeded after card retry' },
  { id: 'txn_00481', time: '14:45:33', merchant: 'Meridian Travel', customer: 'Studio Lumière', method: 'Visa · HDFC', amount: '₹18,200', status: 'succeeded', note: 'Invoice INV-0228' },
  { id: 'txn_00480', time: '14:42:07', merchant: 'Nova Fintech', customer: 'First-time buyer', method: 'Cards', amount: '₹42,500', status: 'blocked', note: 'Velocity flag, risk.' },
  { id: 'txn_00479', time: '14:41:19', merchant: 'Luminary Studio', customer: 'Lumière Paris', method: 'SEPA', amount: '€1,890', status: 'routed', note: 'ACH timeout → SEPA' },
  { id: 'txn_00478', time: '14:38:56', merchant: 'Acme Corporation', customer: 'Rohan Shankar', method: 'UPI Autopay', amount: '₹4,500', status: 'succeeded', note: 'Quarterly mandate' },
  { id: 'txn_00477', time: '14:35:44', merchant: 'Horizon Labs', customer: 'Kavya Rao', method: 'NetBanking', amount: '₹22,400', status: 'succeeded', note: 'Direct debit' },
  { id: 'txn_00476', time: '14:32:11', merchant: 'Nova Fintech', customer: 'Amit Sharma', method: 'PhonePe', amount: '₹800', status: 'succeeded', note: '' },
  { id: 'txn_00475', time: '14:29:02', merchant: 'Meridian Travel', customer: 'Emma Dawson', method: 'Amex', amount: '$320', status: 'succeeded', note: 'International' },
  { id: 'txn_00474', time: '14:24:38', merchant: 'Axiora Global', customer: 'Rajiv Mehta', method: 'UPI', amount: '₹1,12,000', status: 'succeeded', note: '' },
  { id: 'txn_00473', time: '14:19:51', merchant: 'Acme Corporation', customer: 'Test card', method: 'Visa', amount: '₹10,000', status: 'blocked', note: 'Enumeration pattern' },
];

export function Transactions() {
  const [filter, setFilter] = useState<'all' | 'succeeded' | 'routed' | 'blocked'>('all');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search && !(t.merchant + t.customer + t.id).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Ledger</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>Transactions</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
            Every payment across all merchants.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={<Icons.IconFilter size={14} />}>Filters</Button>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />}>Export</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Today" value="2,418 payments" change="+12.4%" />
        <StatCard label="Volume today" value="₹1.82 Cr" change="+8.2%" />
        <StatCard label="Success rate" value="93.7%" change="+0.3pts" />
        <StatCard label="Blocked" value="47" change="−12%" />
      </div>

      <Card padded={false}>
        <div style={{ padding: '18px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', background: colors.bg, padding: '4px', borderRadius: radius.pill }}>
            {['all', 'succeeded', 'routed', 'blocked'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                style={{
                  padding: '6px 14px', borderRadius: radius.pill,
                  fontSize: '12px', fontWeight: 500,
                  background: filter === f ? colors.card : 'transparent',
                  color: filter === f ? colors.ink : colors.text2,
                  border: filter === f ? `0.5px solid ${colors.border}` : 'none',
                  cursor: 'pointer', textTransform: 'capitalize',
                  fontFamily: typography.family.sans,
                }}
              >
                {f}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <Icons.IconSearch size={14} color={colors.text2} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transaction id, merchant, customer…"
              style={{
                background: colors.bg, border: `0.5px solid ${colors.border}`,
                borderRadius: radius.pill, padding: '8px 14px 8px 36px',
                fontSize: '12px', width: '320px', outline: 'none',
                color: colors.ink, fontFamily: typography.family.sans,
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 0.7fr 1.5fr 1fr 1fr 0.9fr 0.7fr', gap: '16px', padding: '12px 24px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>ID</div>
          <div>Time</div>
          <div>Merchant · Customer</div>
          <div>Method</div>
          <div style={{ textAlign: 'right' }}>Amount</div>
          <div>Status</div>
          <div></div>
        </div>

        <div>
          {filtered.map((t, i) => (
            <TxnRow key={t.id} txn={t} isLast={i === filtered.length - 1} />
          ))}
        </div>

        <div style={{ padding: '14px 24px', borderTop: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: colors.text2 }}>Showing 10 of 2,418 transactions</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" size="sm">Previous</Button>
            <Button variant="secondary" size="sm">Next →</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, value, change }: { label: string; value: string; change: string }) {
  const positive = change.startsWith('+');
  return (
    <Card padded style={{ padding: '18px' }}>
      <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ fontSize: '11px', fontWeight: 500, color: positive ? colors.teal : colors.text2 }}>{change}</div>
      </div>
    </Card>
  );
}

function TxnRow({ txn, isLast }: any) {
  const statusMap: Record<string, { color: string; label: string }> = {
    succeeded: { color: colors.ink, label: 'Succeeded' },
    routed: { color: colors.teal, label: 'Routed' },
    blocked: { color: colors.text2, label: 'Blocked' },
  };
  const s = statusMap[txn.status];
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '0.8fr 0.7fr 1.5fr 1fr 1fr 0.9fr 0.7fr', gap: '16px',
      padding: '16px 24px',
      borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`,
      alignItems: 'center',
      fontSize: '13px',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = colors.bg)}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{txn.id}</div>
      <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{txn.time}</div>
      <div>
        <div style={{ color: colors.ink, fontWeight: 500, marginBottom: '2px' }}>{txn.merchant}</div>
        <div style={{ color: colors.text3, fontSize: '11px' }}>{txn.customer}</div>
      </div>
      <div style={{ fontSize: '12px', color: colors.text2 }}>{txn.method}</div>
      <div style={{ textAlign: 'right', fontWeight: 600, color: txn.status === 'blocked' ? colors.text2 : colors.ink, textDecoration: txn.status === 'blocked' ? 'line-through' : 'none' }}>
        {txn.amount}
      </div>
      <div>
        <span style={{ fontFamily: typography.family.mono, fontSize: '10px', letterSpacing: '0.08em', color: s.color, textTransform: 'uppercase', fontWeight: 500 }}>
          {s.label}
        </span>
        {txn.note && <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>{txn.note}</div>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <Icons.IconArrowUpRight size={14} color={colors.text3} />
      </div>
    </div>
  );
}
