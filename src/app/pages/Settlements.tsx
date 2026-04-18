import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

export function Settlements() {
  const { data, loading, error, refetch } = useAsync(() => configService.getSettlements(), []);
  const [status, setStatus] = useState<string>('all');
  const [merchantFilter, setMerchantFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [selected, setSelected] = useState<any>(null);

  if (error) return <ErrorState message={`Couldn't load settlements — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading settlements" />;

  const { header, stats, statusFilters, dateRanges, batches } = data;

  const filtered = batches.filter((b: any) => {
    if (status !== 'all' && b.status.toLowerCase() !== status) return false;
    if (merchantFilter !== 'all' && b.merchant !== merchantFilter) return false;
    return true;
  });

  const merchants = Array.from(new Set(batches.map((b: any) => b.merchant))) as string[];

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{header.subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={<Icons.IconSettings size={14} />} onClick={() => toast.success('Payout config opened')}>Payout config</Button>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success(`Exporting ${filtered.length} batches as CSV`)}>Export CSV</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {stats.map((s: any) => <StatCard key={s.label} {...s} />)}
      </div>

      <Card padded={false}>
        <div style={{ padding: '16px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill }}>
            {statusFilters.map((s: string) => (
              <button key={s} onClick={() => setStatus(s)} style={{
                padding: '6px 12px', borderRadius: radius.pill, fontSize: '11px', fontWeight: 500,
                background: status === s ? colors.card : 'transparent',
                color: status === s ? colors.ink : colors.text2,
                border: status === s ? `0.5px solid ${colors.border}` : 'none',
                cursor: 'pointer', textTransform: 'capitalize', fontFamily: typography.family.sans,
              }}>{s}</button>
            ))}
          </div>
          <select value={merchantFilter} onChange={e => setMerchantFilter(e.target.value)} style={selectStyle}>
            <option value="all">All merchants</option>
            {merchants.map((m: string) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={selectStyle}>
            {dateRanges.map((r: any) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <div style={{ marginLeft: 'auto', fontSize: '12px', color: colors.text2 }}>{filtered.length} of {batches.length}</div>
        </div>

        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '0.9fr 1.4fr 1fr 0.7fr 1fr 0.9fr 0.4fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Batch</div><div>Merchant · Count</div><div style={{ textAlign: 'right' }}>Amount</div>
          <div>Rail</div><div>Arrives</div><div>Status</div><div></div>
        </div>

        {filtered.map((b: any, i: number) => {
          const statusTone = b.status === 'Settled' ? 'teal' : b.status === 'Settling' ? 'outline' : b.status === 'Failed' ? 'outline' : 'neutral';
          return (
            <div key={b.id} style={{
              display: 'grid', gridTemplateColumns: '0.9fr 1.4fr 1fr 0.7fr 1fr 0.9fr 0.4fr', gap: '16px',
              padding: '16px 24px',
              borderBottom: i < filtered.length - 1 ? `0.5px solid ${colors.border}` : 'none',
              alignItems: 'center', fontSize: '13px', cursor: 'pointer',
            }}
              onClick={() => setSelected(b)}
              onMouseEnter={(e) => (e.currentTarget.style.background = colors.bg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{b.id}</div>
              <div>
                <div style={{ color: colors.ink, fontWeight: 500 }}>{b.merchant}</div>
                <div style={{ color: colors.text3, fontSize: '11px' }}>{b.count.toLocaleString('en-IN')} transactions</div>
              </div>
              <div style={{ textAlign: 'right', fontWeight: 600, color: colors.ink }}>{b.amount}</div>
              <div style={{ color: colors.text2, fontFamily: typography.family.mono, fontSize: '11px' }}>{b.method}</div>
              <div style={{ color: colors.text2, fontSize: '12px' }}>{b.arrived}</div>
              <div><Pill tone={statusTone as any}>{b.status}</Pill></div>
              <div style={{ textAlign: 'right' }}><Icons.IconArrowUpRight size={14} color={colors.text3} /></div>
            </div>
          );
        })}
      </Card>

      {selected && <ReconciliationPanel batch={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function ReconciliationPanel({ batch, onClose }: { batch: any; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '560px', maxWidth: '100%', height: '100%', background: colors.card,
        borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Reconciliation report</Kicker>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{batch.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        <div style={{ fontSize: '48px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '8px' }}>{batch.amount}</div>
        <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '24px' }}>
          Net of {batch.count.toLocaleString('en-IN')} transactions · to {batch.merchant}
        </div>

        <div style={{ padding: '16px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px' }}>
          <DetailRow label="Status" value={batch.status} />
          <DetailRow label="Rail" value={batch.method} mono />
          <DetailRow label="Account" value={batch.account} mono />
          <DetailRow label="UTR" value={batch.utr} mono />
          <DetailRow label="Arrived" value={batch.arrived} />
          <DetailRow label="Processing fee" value={batch.fee} />
          <DetailRow label="GST" value={batch.tax} isLast />
        </div>

        <Kicker style={{ marginBottom: '14px' }}>Reconciliation breakdown</Kicker>
        <div style={{ padding: '16px', background: colors.bg, borderRadius: radius.md, marginBottom: '24px', fontSize: '12px', fontFamily: typography.family.mono }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span style={{ color: colors.text2 }}>Gross volume</span>
            <span style={{ color: colors.ink }}>{batch.amount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span style={{ color: colors.text2 }}>Refunds</span><span style={{ color: colors.text2 }}>− ₹0</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span style={{ color: colors.text2 }}>Chargebacks</span><span style={{ color: colors.text2 }}>− ₹0</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}><span style={{ color: colors.text2 }}>Processing fees</span><span style={{ color: colors.text2 }}>− {batch.fee}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: `0.5px solid ${colors.border}`, marginTop: '4px', paddingTop: '10px' }}><span style={{ color: colors.text2 }}>GST @ 18%</span><span style={{ color: colors.text2 }}>− {batch.tax}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0 0', borderTop: `0.5px solid ${colors.ink}`, marginTop: '4px' }}>
            <span style={{ color: colors.ink, fontWeight: 600 }}>Net settled</span>
            <span style={{ color: colors.ink, fontWeight: 600 }}>{batch.amount}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="primary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('CSV downloaded')}>Download CSV</Button>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('PDF downloaded')}>Download PDF</Button>
          <Button variant="ghost" icon={<Icons.IconMail size={14} />} onClick={() => toast.success('Report emailed')}>Email</Button>
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

function DetailRow({ label, value, isLast, mono }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`, fontSize: '12px' }}>
      <span style={{ color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '10px', fontWeight: 500 }}>{label}</span>
      <span style={{ color: colors.ink, fontWeight: 500, fontFamily: mono ? typography.family.mono : undefined }}>{value}</span>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '6px 10px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill,
  fontSize: '12px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
};
