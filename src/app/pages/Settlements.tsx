import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, Drawer } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';

type Batch = {
  id: string;
  merchant: string;
  date: string;
  txns: number;
  gross: string;
  fees: string;
  net: string;
  rail: 'NEFT' | 'RTGS' | 'IMPS' | 'UPI';
  status: 'Settled' | 'Settling' | 'Pending' | 'Failed';
  utr?: string;
  account?: string;
  eta?: string;
  reason?: string;
};

const batches: Batch[] = [
  { id: 'STL-9824', merchant: 'Zolve Financial', date: 'Today 06:30', txns: 1284, gross: '₹45,20,000.00', fees: '−₹13,560.00', net: '₹45,06,440.00', rail: 'NEFT', status: 'Settled', utr: 'BNK000129384', account: 'HDFC •••• 8923' },
  { id: 'STL-9823', merchant: 'CRED Genie', date: 'Today 05:45', txns: 3891, gross: '₹1,12,40,000.00', fees: '−₹33,720.00', net: '₹1,12,06,280.00', rail: 'RTGS', status: 'Settled', utr: 'BNK000129382', account: 'ICICI •••• 4412' },
  { id: 'STL-9822', merchant: 'Urban Threads Co.', date: 'Expected 18:00', txns: 412, gross: '₹8,45,200.00', fees: '−₹2,535.60', net: '₹8,42,664.40', rail: 'NEFT', status: 'Settling', eta: 'T+1 standard', account: 'Axis •••• 7382' },
  { id: 'STL-9821', merchant: 'Bira 91 DTC', date: 'Tomorrow 06:30', txns: 48, gross: '₹18,500.00', fees: '−₹55.50', net: '₹18,444.50', rail: 'NEFT', status: 'Pending', account: 'Kotak •••• 2911' },
  { id: 'STL-9820', merchant: 'Sarva Foods', date: 'Yesterday 08:15', txns: 672, gross: '₹22,40,000.00', fees: '−₹6,720.00', net: '₹22,33,280.00', rail: 'RTGS', status: 'Settled', utr: 'BNK000128845', account: 'HDFC •••• 1204' },
  { id: 'STL-9819', merchant: 'Mamaearth Retail', date: 'Yesterday 06:30', txns: 940, gross: '₹35,00,000.00', fees: '−₹10,500.00', net: '₹34,89,500.00', rail: 'RTGS', status: 'Failed', account: 'SBI •••• 3344', reason: 'Bank reject — beneficiary name mismatch' },
  { id: 'STL-9818', merchant: 'Nykaa Beauty Hub', date: '15 Apr 08:15', txns: 1350, gross: '₹51,20,000.00', fees: '−₹15,360.00', net: '₹51,04,640.00', rail: 'RTGS', status: 'Settled', utr: 'BNK000128720', account: 'HDFC •••• 5547' },
];

export function Settlements() {
  const [status, setStatus] = useState<'all' | 'settled' | 'settling' | 'failed'>('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('Last 7 days');
  const [selected, setSelected] = useState<Batch | null>(null);

  const filtered = batches.filter(b => {
    if (status !== 'all' && b.status.toLowerCase() !== status) return false;
    if (search && !(b.id + b.merchant).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('Exporting 7-day settlement CSV')}>Export CSV</Button>
          <Button variant="primary" icon={<Icons.IconSettings size={14} />}>Payout config</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Settled today" value="₹1.57 Cr" sub="5,175 transactions" tone="teal" />
        <StatCard label="Settling now" value="₹8.45 L" sub="expected 18:00" tone="neutral" />
        <StatCard label="Pending" value="₹18,500" sub="tomorrow 06:30" tone="neutral" />
        <StatCard label="Failed, 30d" value="₹35.00 L" sub="1 batch · action needed" tone="rose" />
      </div>

      <Card padded={false} style={{ marginBottom: '20px' }}>
        <div style={{ padding: '18px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'settled', label: 'Settled' },
              { id: 'settling', label: 'Settling' },
              { id: 'failed', label: 'Failed' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatus(f.id as any)}
                style={{
                  padding: '6px 14px', borderRadius: radius.pill, fontSize: '12px', fontWeight: 500,
                  background: status === f.id ? colors.card : 'transparent',
                  color: status === f.id ? colors.ink : colors.text2,
                  border: status === f.id ? `0.5px solid ${colors.border}` : 'none',
                  cursor: 'pointer', fontFamily: typography.family.sans,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                const ranges = ['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days'];
                setDateRange(ranges[(ranges.indexOf(dateRange) + 1) % ranges.length]);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '12px', cursor: 'pointer', fontFamily: typography.family.sans, color: colors.ink }}>
              <Icons.IconCalendar size={12} /> {dateRange}
              <Icons.IconChevronDown size={11} />
            </button>
            <div style={{ position: 'relative' }}>
              <Icons.IconSearch size={13} color={colors.text2} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search batch id or merchant…"
                style={{ background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, padding: '8px 12px 8px 32px', fontSize: '12px', width: '240px', outline: 'none', color: colors.ink, fontFamily: typography.family.sans }} />
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '0.7fr 1.2fr 0.9fr 0.8fr 0.9fr 0.6fr 0.8fr 0.5fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Batch</div>
          <div>Merchant · Account</div>
          <div>Date</div>
          <div>Txns</div>
          <div style={{ textAlign: 'right' }}>Net</div>
          <div>Rail</div>
          <div>Status</div>
          <div></div>
        </div>

        {filtered.map((b, i) => (
          <BatchRow key={b.id} batch={b} isLast={i === filtered.length - 1} onClick={() => setSelected(b)} />
        ))}
      </Card>

      {/* Payout configuration & accounts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        <Card padded>
          <Kicker style={{ marginBottom: '16px' }}>Payout schedule</Kicker>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <ScheduleRow title="Instant Settlement" desc="Funds credited within 15 minutes of capture." fee="1.5% premium" active={false} />
            <ScheduleRow title="T+1 Standard" desc="Settled on the next working day by 6:00 PM." fee="Included in MDR" active={true} />
            <ScheduleRow title="Weekly Payout" desc="Aggregated settlement every Friday." fee="Included in MDR" active={false} />
          </div>
        </Card>

        <Card padded>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
            <Kicker>Payout accounts</Kicker>
            <Button variant="ghost" size="sm" icon={<Icons.IconPlus size={12} />}>Add account</Button>
          </div>
          <PayoutAccount bank="HDFC Bank" masked="•••• 8923" holder="Acme Corp Ltd" ifsc="HDFC0000123" primary verified />
          <PayoutAccount bank="ICICI Bank" masked="•••• 4412" holder="Operations" ifsc="ICIC0000456" verified />
        </Card>
      </div>

      <Drawer
        open={selected !== null}
        onClose={() => setSelected(null)}
        kicker="Reconciliation"
        title={selected?.id || ''}
        width={560}
      >
        {selected && <BatchDetail batch={selected} />}
      </Drawer>
    </div>
  );
}

function StatCard({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: 'teal' | 'neutral' | 'rose' }) {
  const barColor = tone === 'teal' ? colors.teal : tone === 'rose' ? colors.rose : colors.borderHover;
  return (
    <Card padded style={{ padding: '18px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '24px', background: barColor, borderRadius: '0 2px 2px 0' }} />
      <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: colors.text2 }}>{sub}</div>
    </Card>
  );
}

function BatchRow({ batch, isLast, onClick }: { batch: Batch; isLast: boolean; onClick: () => void }) {
  const map: Record<Batch['status'], 'teal' | 'outline' | 'neutral' | 'rose'> = {
    Settled: 'teal', Settling: 'outline', Pending: 'neutral', Failed: 'rose',
  };
  return (
    <div
      onClick={onClick}
      style={{
        display: 'grid', gridTemplateColumns: '0.7fr 1.2fr 0.9fr 0.8fr 0.9fr 0.6fr 0.8fr 0.5fr', gap: '16px',
        padding: '16px 24px', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`,
        alignItems: 'center', fontSize: '13px', cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = colors.bg)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{batch.id}</div>
      <div>
        <div style={{ color: colors.ink, fontWeight: 500 }}>{batch.merchant}</div>
        <div style={{ fontFamily: typography.family.mono, fontSize: '10px', color: colors.text3 }}>{batch.account}</div>
      </div>
      <div style={{ color: colors.text2, fontSize: '12px' }}>{batch.date}</div>
      <div style={{ color: colors.text2 }}>{batch.txns.toLocaleString('en-IN')}</div>
      <div style={{ textAlign: 'right', fontWeight: 600, color: batch.status === 'Failed' ? colors.rose : colors.ink }}>{batch.net}</div>
      <div style={{ color: colors.text2, fontFamily: typography.family.mono, fontSize: '11px' }}>{batch.rail}</div>
      <div><Pill tone={map[batch.status]}>{batch.status}</Pill></div>
      <div style={{ textAlign: 'right' }}><Icons.IconArrowUpRight size={14} color={colors.text3} /></div>
    </div>
  );
}

function BatchDetail({ batch }: { batch: Batch }) {
  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Kicker style={{ marginBottom: '8px' }}>Net amount</Kicker>
        <div style={{ fontSize: '36px', fontWeight: 600, color: batch.status === 'Failed' ? colors.rose : colors.ink, letterSpacing: '-0.02em' }}>{batch.net}</div>
        <div style={{ marginTop: '8px' }}><Pill tone={batch.status === 'Settled' ? 'teal' : batch.status === 'Failed' ? 'rose' : 'outline'}>{batch.status}</Pill></div>
      </div>

      {batch.status === 'Failed' && batch.reason && (
        <div style={{ padding: '14px 16px', background: colors.roseTint, border: `0.5px solid ${colors.rose}40`, borderRadius: radius.md, marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <Icons.IconAlert size={16} color={colors.rose} style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <div style={{ fontSize: '13px', color: colors.rose, fontWeight: 600, marginBottom: '2px' }}>Settlement failed</div>
            <div style={{ fontSize: '12px', color: colors.text2 }}>{batch.reason}</div>
          </div>
        </div>
      )}

      <Card padded style={{ padding: '16px 18px', marginBottom: '16px' }}>
        <Kicker style={{ marginBottom: '12px' }}>Reconciliation</Kicker>
        <Row label="Gross amount" value={batch.gross} />
        <Row label="Payze fees" value={batch.fees} />
        <Row label="Net settled" value={batch.net} strong />
        <div style={{ padding: '10px 0', borderTop: `0.5px solid ${colors.border}`, marginTop: '4px' }}>
          <Row label="Matched transactions" value={`${batch.txns} of ${batch.txns}`} />
          <Row label="Unmatched variance" value="₹0.00" />
        </div>
      </Card>

      <Card padded style={{ padding: '16px 18px', marginBottom: '20px' }}>
        <Kicker style={{ marginBottom: '12px' }}>Banking</Kicker>
        <Row label="Rail" value={batch.rail} mono />
        <Row label="Account" value={batch.account || '—'} mono />
        {batch.utr && <Row label="UTR" value={batch.utr} mono />}
        <Row label="Scheduled" value={batch.date} />
        {batch.eta && <Row label="ETA" value={batch.eta} />}
      </Card>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Button variant="secondary" size="sm" icon={<Icons.IconDownload size={12} />}>Reconciliation PDF</Button>
        <Button variant="secondary" size="sm" icon={<Icons.IconDownload size={12} />}>Txn CSV ({batch.txns})</Button>
        {batch.status === 'Failed' && <Button variant="primary" size="sm" icon={<Icons.IconRefresh size={12} />}>Retry settlement</Button>}
      </div>
    </div>
  );
}

function ScheduleRow({ title, desc, fee, active }: { title: string; desc: string; fee: string; active: boolean }) {
  return (
    <div style={{
      padding: '14px 16px', background: active ? colors.tealTint : colors.bg,
      border: `0.5px solid ${active ? `${colors.teal}40` : colors.border}`,
      borderRadius: radius.md,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
    }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink, marginBottom: '2px' }}>{title}</div>
        <div style={{ fontSize: '11px', color: colors.text2 }}>{desc}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '11px', color: colors.text3, fontWeight: 500 }}>{fee}</div>
        {active && <Pill tone="teal" style={{ marginTop: '4px' }}>Active</Pill>}
      </div>
    </div>
  );
}

function PayoutAccount({ bank, masked, holder, ifsc, primary, verified }: any) {
  return (
    <div style={{ padding: '14px 0', borderBottom: `0.5px solid ${colors.border}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink }}>{bank} <span style={{ fontFamily: typography.family.mono, color: colors.text2, fontWeight: 400 }}>{masked}</span></div>
          <div style={{ fontSize: '11px', color: colors.text3, marginTop: '2px' }}>{holder} · {ifsc}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {primary && <Pill tone="teal">Primary</Pill>}
          {verified && <Pill tone="outline">Verified</Pill>}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong, mono }: { label: string; value: React.ReactNode; strong?: boolean; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '12px' }}>
      <span style={{ color: colors.text2 }}>{label}</span>
      <span style={{ color: colors.ink, fontWeight: strong ? 600 : 500, fontFamily: mono ? typography.family.mono : undefined }}>{value}</span>
    </div>
  );
}
