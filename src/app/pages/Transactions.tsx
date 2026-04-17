import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';

const FX_TO_INR: Record<string, number> = { INR: 1, USD: 83.2, EUR: 90.4, GBP: 105.8, AED: 22.65 };

type Txn = {
  id: string; time: string; merchant: string; customer: string; method: string; rail: string;
  sourceAmount: number; sourceCurrency: string;
  status: 'succeeded' | 'routed' | 'blocked';
  note: string;
  events: { time: string; label: string; detail: string }[];
};

const transactions: Txn[] = [
  { id: 'txn_00482', time: '14:47:12', merchant: 'Zomato Foods', customer: 'Priya Venkataraman', method: 'UPI · GPay', rail: 'NPCI', sourceAmount: 7800, sourceCurrency: 'INR', status: 'routed', note: 'Succeeded after card retry',
    events: [{ time: '14:47:08', label: 'Initiated', detail: 'Visa ending 4242 · bank declined (05 — do not honor)' }, { time: '14:47:10', label: 'Fallback', detail: 'Routed to UPI · customer re-auth on GPay' }, { time: '14:47:12', label: 'Succeeded', detail: 'UPI ref: 4827341092' }] },
  { id: 'txn_00481', time: '14:45:33', merchant: 'Razorpay Technologies', customer: 'Studio Lumière', method: 'Visa · HDFC', rail: 'Visa', sourceAmount: 18200, sourceCurrency: 'INR', status: 'succeeded', note: 'Invoice INV-0228',
    events: [{ time: '14:45:31', label: 'Initiated', detail: 'Visa ending 8833 · HDFC' }, { time: '14:45:33', label: 'Succeeded', detail: 'Auth code: 284A19' }] },
  { id: 'txn_00480', time: '14:42:07', merchant: 'Cred Club', customer: 'First-time buyer', method: 'Cards', rail: 'Visa', sourceAmount: 42500, sourceCurrency: 'INR', status: 'blocked', note: 'Velocity flag, risk review',
    events: [{ time: '14:42:05', label: 'Attempted', detail: 'New account · billing address mismatch' }, { time: '14:42:07', label: 'Blocked', detail: 'Rule: first_time_high_value' }] },
  { id: 'txn_00479', time: '14:41:19', merchant: 'Nykaa Beauty', customer: 'Amélie Dubois (Paris)', method: 'SEPA', rail: 'SEPA', sourceAmount: 1890, sourceCurrency: 'EUR', status: 'routed', note: 'ACH timeout → SEPA',
    events: [{ time: '14:41:11', label: 'Initiated', detail: 'ACH via bank timeout' }, { time: '14:41:14', label: 'Fallback', detail: 'Re-routed via SEPA Instant' }, { time: '14:41:19', label: 'Succeeded', detail: 'SEPA ref: RF8912MN' }] },
  { id: 'txn_00478', time: '14:38:56', merchant: 'Zomato Foods', customer: 'Rohan Shankar', method: 'UPI Autopay', rail: 'NPCI', sourceAmount: 4500, sourceCurrency: 'INR', status: 'succeeded', note: 'Quarterly mandate',
    events: [{ time: '14:38:56', label: 'Succeeded', detail: 'UPI ref: 2938471092' }] },
  { id: 'txn_00477', time: '14:35:44', merchant: 'Urban Company', customer: 'Kavya Rao', method: 'NetBanking', rail: 'HDFC', sourceAmount: 22400, sourceCurrency: 'INR', status: 'succeeded', note: 'Direct debit',
    events: [{ time: '14:35:44', label: 'Succeeded', detail: 'Bank ref: NB0018237' }] },
  { id: 'txn_00475', time: '14:29:02', merchant: 'MakeMyTrip', customer: 'Emma Dawson (NYC)', method: 'Amex', rail: 'Amex', sourceAmount: 320, sourceCurrency: 'USD', status: 'succeeded', note: 'International · cross-border fee',
    events: [{ time: '14:29:02', label: 'Succeeded', detail: 'Auth code: AX9912BC' }] },
  { id: 'txn_00474', time: '14:24:38', merchant: 'BookMyShow', customer: 'Rajiv Mehta', method: 'UPI', rail: 'NPCI', sourceAmount: 112000, sourceCurrency: 'INR', status: 'succeeded', note: '',
    events: [{ time: '14:24:38', label: 'Succeeded', detail: 'UPI ref: 9812734091' }] },
];

const toInr = (a: number, c: string) => a * (FX_TO_INR[c] ?? 1);
const formatInr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
const formatSource = (a: number, c: string) => ({ INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED ' }[c] || '') + a.toLocaleString('en-IN');

export function Transactions() {
  const [filter, setFilter] = useState<'all' | 'succeeded' | 'routed' | 'blocked'>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Txn | null>(null);

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
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>Every payment, unified in INR with source preserved.</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={<Icons.IconFilter size={14} />}>Filters</Button>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('Exporting as CSV')}>Export CSV</Button>
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
              <button key={f} onClick={() => setFilter(f as any)} style={{
                padding: '6px 14px', borderRadius: radius.pill, fontSize: '12px', fontWeight: 500,
                background: filter === f ? colors.card : 'transparent',
                color: filter === f ? colors.ink : colors.text2,
                border: filter === f ? `0.5px solid ${colors.border}` : 'none',
                cursor: 'pointer', textTransform: 'capitalize', fontFamily: typography.family.sans,
              }}>{f}</button>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <Icons.IconSearch size={14} color={colors.text2} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search id, merchant, customer…"
              style={{ background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, padding: '8px 14px 8px 36px', fontSize: '12px', width: '320px', outline: 'none', color: colors.ink, fontFamily: typography.family.sans }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 0.7fr 1.4fr 1fr 1.1fr 0.9fr 0.3fr', gap: '16px', padding: '12px 24px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>ID</div><div>Time</div><div>Merchant · Customer</div><div>Method</div>
          <div style={{ textAlign: 'right' }}>Amount (INR / source)</div><div>Status</div><div></div>
        </div>

        {filtered.map((t, i) => <TxnRow key={t.id} txn={t} isLast={i === filtered.length - 1} onClick={() => setSelected(t)} />)}

        <div style={{ padding: '14px 24px', borderTop: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '12px', color: colors.text2 }}>Showing {filtered.length} of 2,418 transactions</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" size="sm">Previous</Button>
            <Button variant="secondary" size="sm">Next →</Button>
          </div>
        </div>
      </Card>

      {selected && <TxnDrawer txn={selected} onClose={() => setSelected(null)} />}
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

function TxnRow({ txn, isLast, onClick }: { txn: Txn; isLast: boolean; onClick: () => void }) {
  const map: Record<string, { color: string; label: string }> = {
    succeeded: { color: colors.ink, label: 'Succeeded' },
    routed: { color: colors.teal, label: 'Routed' },
    blocked: { color: colors.text2, label: 'Blocked' },
  };
  const s = map[txn.status];
  const inr = toInr(txn.sourceAmount, txn.sourceCurrency);
  const cross = txn.sourceCurrency !== 'INR';

  return (
    <div onClick={onClick} style={{
      display: 'grid', gridTemplateColumns: '0.8fr 0.7fr 1.4fr 1fr 1.1fr 0.9fr 0.3fr', gap: '16px',
      padding: '16px 24px', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`,
      alignItems: 'center', fontSize: '13px', cursor: 'pointer', transition: 'background 0.15s',
    }}
    onMouseEnter={e => (e.currentTarget.style.background = colors.bg)}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
      <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{txn.id}</div>
      <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{txn.time}</div>
      <div>
        <div style={{ color: colors.ink, fontWeight: 500, marginBottom: '2px' }}>{txn.merchant}</div>
        <div style={{ color: colors.text3, fontSize: '11px' }}>{txn.customer}</div>
      </div>
      <div style={{ fontSize: '12px', color: colors.text2 }}>{txn.method}</div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 600, color: txn.status === 'blocked' ? colors.text2 : colors.ink, textDecoration: txn.status === 'blocked' ? 'line-through' : 'none' }}>{formatInr(inr)}</div>
        {cross && <div style={{ fontSize: '11px', color: colors.text3, marginTop: '2px', fontFamily: typography.family.mono }}>{formatSource(txn.sourceAmount, txn.sourceCurrency)}</div>}
      </div>
      <div>
        <span style={{ fontFamily: typography.family.mono, fontSize: '10px', letterSpacing: '0.08em', color: s.color, textTransform: 'uppercase', fontWeight: 500 }}>{s.label}</span>
        {txn.note && <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>{txn.note}</div>}
      </div>
      <div style={{ textAlign: 'right' }}><Icons.IconArrowUpRight size={14} color={colors.text3} /></div>
    </div>
  );
}

function TxnDrawer({ txn, onClose }: { txn: Txn; onClose: () => void }) {
  const inr = toInr(txn.sourceAmount, txn.sourceCurrency);
  const cross = txn.sourceCurrency !== 'INR';
  const rate = FX_TO_INR[txn.sourceCurrency];

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '520px', maxWidth: '100%', height: '100%', background: colors.card,
        borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Transaction</Kicker>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{txn.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px', color: colors.text2, fontWeight: 400 }}>₹</span>
          <span style={{ fontSize: '48px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>{Math.round(inr).toLocaleString('en-IN')}</span>
        </div>
        {cross ? (
          <div style={{ fontSize: '12px', color: colors.text3, fontFamily: typography.family.mono, marginBottom: '24px' }}>
            Source: {formatSource(txn.sourceAmount, txn.sourceCurrency)} · rate {rate.toFixed(2)} {txn.sourceCurrency}→INR
          </div>
        ) : <div style={{ marginBottom: '24px' }} />}

        <div style={{ padding: '16px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px' }}>
          <DR label="Merchant" value={txn.merchant} />
          <DR label="Customer" value={txn.customer} />
          <DR label="Method" value={txn.method} />
          <DR label="Rail" value={txn.rail} mono />
          <DR label="Time" value={txn.time} mono />
          <DR label="Status" value={txn.status.toUpperCase()} isLast mono />
        </div>

        <Kicker style={{ marginBottom: '14px' }}>Event timeline</Kicker>
        <div style={{ marginBottom: '24px' }}>
          {txn.events.map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: '14px', paddingBottom: i < txn.events.length - 1 ? '16px' : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: i === txn.events.length - 1 ? colors.teal : colors.ink }} />
                {i < txn.events.length - 1 && <div style={{ width: '1px', flex: 1, background: colors.border, marginTop: '4px' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>{e.label}</div>
                  <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text3 }}>{e.time}</div>
                </div>
                <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.5 }}>{e.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {txn.status === 'succeeded' && <Button variant="secondary" size="sm" onClick={() => toast.success('Refund initiated')}>Refund</Button>}
          {txn.status === 'blocked' && <Button variant="secondary" size="sm" onClick={() => toast.success('Released')}>Release</Button>}
          <Button variant="ghost" size="sm" icon={<Icons.IconDownload size={12} />}>Receipt</Button>
          <Button variant="ghost" size="sm" icon={<Icons.IconCopy size={12} />} onClick={() => { navigator.clipboard.writeText(txn.id); toast.success('ID copied'); }}>Copy</Button>
        </div>
      </div>
    </div>
  );
}

function DR({ label, value, isLast, mono }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`, fontSize: '12px' }}>
      <span style={{ color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '10px', fontWeight: 500 }}>{label}</span>
      <span style={{ color: colors.ink, fontWeight: 500, fontFamily: mono ? typography.family.mono : undefined }}>{value}</span>
    </div>
  );
}
