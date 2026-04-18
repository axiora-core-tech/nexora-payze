import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

type Txn = {
  id: string; time: string; merchant: string; customer: string; method: string;
  rail: string; sourceAmount: number; sourceCurrency: string;
  status: string; note: string;
  events: { time: string; label: string; detail: string }[];
};

const PAGE_SIZE = 10;

export function Transactions() {
  const { data, loading, error, refetch } = useAsync(() => configService.getTransactions(), []);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Txn | null>(null);
  const [page, setPage] = useState(0);

  if (error) return <ErrorState message={`Couldn't load transactions — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading ledger" />;

  const fxToInr = data.fxToInr as Record<string, number>;
  const toInr = (amount: number, cur: string) => amount * (fxToInr[cur] ?? 1);
  const formatInr = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');
  const formatSource = (amount: number, cur: string) => {
    const sym: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£', AED: 'AED ', SGD: 'S$' };
    return (sym[cur] || '') + amount.toLocaleString('en-IN');
  };

  const filtered = (data.transactions as Txn[]).filter(t => {
    if (filter !== 'all' && t.status !== filter) return false;
    if (search && !(t.merchant + t.customer + t.id).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paged = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const setFilterReset = (f: string) => { setFilter(f); setPage(0); };
  const setSearchReset = (v: string) => { setSearch(v); setPage(0); };

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Ledger</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>Transactions</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
            Every payment across all merchants. Unified in INR, source preserved.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={<Icons.IconFilter size={14} />}>Filters</Button>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success(`Exporting ${filtered.length} transactions as CSV`)}>Export CSV</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => <StatCard key={s.label} {...s} />)}
      </div>

      <Card padded={false}>
        <div style={{ padding: '18px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '6px', background: colors.bg, padding: '4px', borderRadius: radius.pill }}>
            {data.filters.map((f: string) => (
              <button key={f} onClick={() => setFilterReset(f)} style={{
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
            <input value={search} onChange={(e) => setSearchReset(e.target.value)} placeholder="Search id, merchant, customer…" style={{
              background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill,
              padding: '8px 14px 8px 36px', fontSize: '12px', width: '320px', outline: 'none',
              color: colors.ink, fontFamily: typography.family.sans,
            }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 0.7fr 1.4fr 1fr 1.1fr 0.9fr 0.3fr', gap: '16px', padding: '12px 24px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>ID</div><div>Time</div><div>Merchant · Customer</div><div>Method</div>
          <div style={{ textAlign: 'right' }}>Amount (INR / source)</div><div>Status</div><div></div>
        </div>

        {paged.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: colors.text3, fontSize: '13px' }}>
            No transactions match these filters.
          </div>
        ) : (
          paged.map((t, i) => (
            <TxnRow key={t.id} txn={t} isLast={i === paged.length - 1} onClick={() => setSelected(t)}
              inr={toInr(t.sourceAmount, t.sourceCurrency)}
              formatInr={formatInr} formatSource={formatSource}
            />
          ))
        )}

        <div style={{ padding: '14px 24px', borderTop: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '12px', color: colors.text2 }}>
            {filtered.length === 0 ? 'No results' : (
              <>Showing <span style={{ color: colors.ink, fontWeight: 500 }}>{currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)}</span> of <span style={{ color: colors.ink, fontWeight: 500 }}>{filtered.length}</span>{filtered.length !== data.totalCount && ` (of ${data.totalCount.toLocaleString('en-IN')} total)`}</>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontSize: '11px', color: colors.text3, fontFamily: typography.family.mono, marginRight: '4px' }}>
              Page {currentPage + 1} of {totalPages}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>
              ← Previous
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1}>
              Next →
            </Button>
          </div>
        </div>
      </Card>

      {selected && <TxnDetailDrawer txn={selected} onClose={() => setSelected(null)} fxRate={fxToInr[selected.sourceCurrency]} toInr={toInr} formatSource={formatSource} />}
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

function TxnRow({ txn, isLast, onClick, inr, formatInr, formatSource }: any) {
  const statusMap: Record<string, { color: string; label: string }> = {
    succeeded: { color: colors.ink, label: 'Succeeded' },
    routed: { color: colors.teal, label: 'Routed' },
    blocked: { color: colors.text2, label: 'Blocked' },
    refunded: { color: colors.text2, label: 'Refunded' },
  };
  const s = statusMap[txn.status];
  const isCrossBorder = txn.sourceCurrency !== 'INR';

  return (
    <div onClick={onClick} style={{
      display: 'grid', gridTemplateColumns: '0.8fr 0.7fr 1.4fr 1fr 1.1fr 0.9fr 0.3fr', gap: '16px',
      padding: '16px 24px', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`,
      alignItems: 'center', fontSize: '13px', cursor: 'pointer', transition: 'background 0.15s',
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
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 600, color: txn.status === 'blocked' ? colors.text2 : colors.ink, textDecoration: txn.status === 'blocked' ? 'line-through' : 'none' }}>
          {formatInr(inr)}
        </div>
        {isCrossBorder && (
          <div style={{ fontSize: '11px', color: colors.text3, marginTop: '2px', fontFamily: typography.family.mono }}>
            {formatSource(txn.sourceAmount, txn.sourceCurrency)}
          </div>
        )}
      </div>
      <div>
        <span style={{ fontFamily: typography.family.mono, fontSize: '10px', letterSpacing: '0.08em', color: s.color, textTransform: 'uppercase', fontWeight: 500 }}>{s.label}</span>
        {txn.note && <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>{txn.note}</div>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <Icons.IconArrowUpRight size={14} color={colors.text3} />
      </div>
    </div>
  );
}

function TxnDetailDrawer({ txn, onClose, fxRate, toInr, formatSource }: any) {
  const inr = toInr(txn.sourceAmount, txn.sourceCurrency);
  const isCrossBorder = txn.sourceCurrency !== 'INR';

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '520px', maxWidth: '100%', height: '100%', background: colors.card,
        borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Transaction</Kicker>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.01em' }}>{txn.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '24px', color: colors.text2, fontWeight: 400 }}>₹</span>
          <span style={{ fontSize: '48px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>
            {Math.round(inr).toLocaleString('en-IN')}
          </span>
        </div>
        {isCrossBorder && (
          <div style={{ fontSize: '12px', color: colors.text3, fontFamily: typography.family.mono, marginBottom: '24px' }}>
            Source: {formatSource(txn.sourceAmount, txn.sourceCurrency)} · rate {fxRate.toFixed(2)} {txn.sourceCurrency}→INR
          </div>
        )}
        {!isCrossBorder && <div style={{ marginBottom: '24px' }} />}

        <div style={{ padding: '16px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px' }}>
          <DetailRow label="Merchant" value={txn.merchant} />
          <DetailRow label="Customer" value={txn.customer} />
          <DetailRow label="Method" value={txn.method} />
          <DetailRow label="Rail" value={txn.rail} mono />
          <DetailRow label="Time" value={txn.time} mono />
          <DetailRow label="Status" value={txn.status.toUpperCase()} isLast mono />
        </div>

        <Kicker style={{ marginBottom: '14px' }}>Event timeline</Kicker>
        <div style={{ marginBottom: '24px' }}>
          {txn.events.map((e: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '14px', paddingBottom: i < txn.events.length - 1 ? '16px' : 0, position: 'relative' }}>
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
          {txn.status === 'blocked' && <Button variant="secondary" size="sm" onClick={() => toast.success('Released to retry')}>Release</Button>}
          <Button variant="ghost" size="sm" icon={<Icons.IconDownload size={12} />}>Download receipt</Button>
          <Button variant="ghost" size="sm" icon={<Icons.IconCopy size={12} />} onClick={() => { navigator.clipboard.writeText(txn.id); toast.success('ID copied'); }}>Copy id</Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, isLast, mono }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`, fontSize: '12px' }}>
      <span style={{ color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '10px', fontWeight: 500 }}>{label}</span>
      <span style={{ color: colors.ink, fontWeight: 500, fontFamily: mono ? typography.family.mono : undefined }}>{value}</span>
    </div>
  );
}
