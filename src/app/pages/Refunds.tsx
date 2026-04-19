import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, PageLoader, ErrorState, Modal } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const AMBER = '#B48C3C';
const RED   = '#D64545';

export function Refunds() {
  const { data, loading, error, refetch } = useAsync(() => configService.getRefunds(), []);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [issueOpen, setIssueOpen] = useState(false);

  if (error) return <ErrorState message={`Couldn't load refunds — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading refunds" />;

  const filtered = data.refunds.filter((r: any) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (reasonFilter !== 'all' && r.reason !== reasonFilter) return false;
    if (search && !(r.id + r.txn + r.customer + r.merchant).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{data.header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{data.header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{data.header.subtitle}</div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => setIssueOpen(true)}>Issue refund</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => (
          <Card key={s.label} padded style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: colors.text2 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <Card padded style={{ marginBottom: '20px' }}>
        <Kicker style={{ marginBottom: '14px' }}>Refund SLA · by method</Kicker>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 0.7fr', gap: '14px', padding: '8px 0', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Method</div><div>Target TAT</div><div>Actual</div><div style={{ textAlign: 'right' }}>Status</div>
        </div>
        {data.slaTargets.map((s: any, i: number) => (
          <div key={s.method} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1.5fr 0.7fr', gap: '14px', padding: '11px 0', borderBottom: i < data.slaTargets.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
            <div style={{ color: colors.ink, fontWeight: 500 }}>{s.method}</div>
            <div style={{ color: colors.text2 }}>{s.tat}</div>
            <div style={{ color: colors.ink, fontFamily: typography.family.mono, fontWeight: 500 }}>{s.actual}</div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '10px', color: colors.teal, fontWeight: 600, fontFamily: typography.family.mono, textTransform: 'uppercase', letterSpacing: '0.08em' }}>✓ {s.status}</span>
            </div>
          </div>
        ))}
      </Card>

      <Card padded={false}>
        <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Search by refund ID, txn, customer…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: '240px', padding: '8px 12px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '12px', color: colors.ink, outline: 'none' }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="all">All statuses</option>
            <option value="succeeded">Succeeded</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
          <select value={reasonFilter} onChange={e => setReasonFilter(e.target.value)} style={selectStyle}>
            <option value="all">All reasons</option>
            {data.reasonCodes.map((r: any) => <option key={r.code} value={r.code}>{r.label}</option>)}
          </select>
          <Button variant="ghost" size="sm" icon={<Icons.IconDownload size={12} />} onClick={() => toast.success('CSV exported')}>Export</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr 0.8fr 1.1fr 0.9fr', gap: '14px', padding: '14px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Refund</div><div>Customer · merchant</div><div style={{ textAlign: 'right' }}>Amount</div><div>Type</div><div>Reason</div><div style={{ textAlign: 'right' }}>Status · SLA</div>
        </div>
        {filtered.map((r: any, i: number) => (
          <div key={r.id} onClick={() => setSelected(r)} style={{
            display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr 0.8fr 1.1fr 0.9fr', gap: '14px',
            padding: '14px 24px', borderBottom: i < filtered.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            alignItems: 'center', fontSize: '12px', cursor: 'pointer', transition: 'background 0.15s',
          }} onMouseEnter={e => { e.currentTarget.style.background = colors.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            <div>
              <div style={{ color: colors.ink, fontWeight: 600, fontFamily: typography.family.mono }}>{r.id}</div>
              <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono, marginTop: '2px' }}>{r.txn}</div>
            </div>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{r.customer}</div>
              <div style={{ color: colors.text3, fontSize: '11px' }}>{r.merchant}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: colors.ink, fontWeight: 600, fontFamily: typography.family.mono }}>{r.refundedAmount}</div>
              <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono, textDecoration: r.type === 'partial' ? 'none' : 'line-through' }}>of {r.originalAmount}</div>
            </div>
            <div>
              <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: radius.pill, background: r.type === 'full' ? 'rgba(28,111,107,0.08)' : 'rgba(180,140,60,0.08)', color: r.type === 'full' ? colors.teal : AMBER, border: `0.5px solid ${r.type === 'full' ? 'rgba(28,111,107,0.25)' : 'rgba(180,140,60,0.25)'}`, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{r.type}</span>
            </div>
            <div style={{ color: colors.text2, fontSize: '11px' }}>{(data.reasonCodes.find((rc: any) => rc.code === r.reason) || {}).label || r.reason}</div>
            <div style={{ textAlign: 'right' }}>
              <StatusPill status={r.status} />
              <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono, marginTop: '2px' }}>{r.sla}</div>
            </div>
          </div>
        ))}
      </Card>

      {selected && <RefundDrawer refund={selected} reasonCodes={data.reasonCodes} onClose={() => setSelected(null)} />}
      <IssueRefundModal open={issueOpen} reasonCodes={data.reasonCodes} onClose={() => setIssueOpen(false)} />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    succeeded:   { color: colors.teal, bg: 'rgba(28,111,107,0.08)',   label: 'Succeeded' },
    processing:  { color: AMBER,       bg: 'rgba(180,140,60,0.08)',   label: 'Processing' },
    failed:      { color: RED,         bg: 'rgba(214,69,69,0.08)',    label: 'Failed' },
  };
  const m = map[status] || map.processing;
  return (
    <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: radius.pill, background: m.bg, color: m.color, border: `0.5px solid ${m.color}40`, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: typography.family.mono }}>
      {m.label}
    </span>
  );
}

function RefundDrawer({ refund, reasonCodes, onClose }: any) {
  const reasonInfo = reasonCodes.find((r: any) => r.code === refund.reason);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '560px', maxWidth: '100%', height: '100%', background: colors.card, borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Refund</Kicker>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{refund.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '40px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.025em', lineHeight: 1, fontFamily: typography.family.mono }}>{refund.refundedAmount}</span>
        </div>
        <div style={{ fontSize: '12px', color: colors.text3, marginBottom: '24px' }}>
          {refund.type === 'partial' ? `Partial of ${refund.originalAmount}` : `Full refund of ${refund.originalAmount}`} · refunded to {refund.method}
        </div>

        <div style={{ padding: '14px 16px', background: colors.bg, borderRadius: radius.md, marginBottom: '16px' }}>
          <DetailRow label="Status"            value={<StatusPill status={refund.status} />} />
          <DetailRow label="Original txn"      value={refund.txn} mono />
          <DetailRow label="ARN"               value={refund.arn || 'Not yet issued'} mono />
          <DetailRow label="Customer"          value={refund.customer} />
          <DetailRow label="Merchant"          value={refund.merchant} />
          <DetailRow label="Issued by"         value={refund.issuedBy} />
          <DetailRow label="Issued at"         value={refund.issuedAt} />
          <DetailRow label="Settled at"        value={refund.settledAt || 'In progress'} />
          <DetailRow label="SLA"               value={refund.sla} isLast />
        </div>

        <Kicker style={{ marginBottom: '8px' }}>Reason</Kicker>
        <div style={{ padding: '12px 14px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', fontFamily: typography.family.mono, padding: '2px 8px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, color: colors.ink, fontWeight: 600, letterSpacing: '0.06em' }}>{refund.reason}</span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: colors.ink }}>{reasonInfo?.label}</span>
          </div>
          <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.5, marginBottom: '8px' }}>{reasonInfo?.desc}</div>
          <div style={{ fontSize: '12px', color: colors.ink, lineHeight: 1.55, padding: '8px 10px', background: colors.card, borderRadius: radius.sm, border: `0.5px solid ${colors.border}`, fontStyle: 'italic' }}>"{refund.reasonNote}"</div>
        </div>

        {refund.status === 'failed' && (
          <div style={{ padding: '12px 14px', background: 'rgba(214,69,69,0.06)', border: `0.5px solid rgba(214,69,69,0.25)`, borderRadius: radius.md, marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: RED, fontWeight: 600, marginBottom: '4px' }}>Action needed</div>
            <div style={{ fontSize: '12px', color: colors.ink, lineHeight: 1.5 }}>Refund failed at the source rail. Try a different method (bank transfer to verified account) or contact the customer for an alternative.</div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" icon={<Icons.IconDownload size={12} />} onClick={() => toast.success('Receipt PDF downloaded')}>Download receipt</Button>
          {refund.status === 'failed' && <Button variant="primary" size="sm" onClick={() => toast.success('Refund retry initiated · alternate channel')}>Retry refund</Button>}
          <Button variant="ghost" size="sm" icon={<Icons.IconCopy size={12} />} onClick={() => { navigator.clipboard.writeText(refund.id); toast.success('Refund ID copied'); }}>Copy ID</Button>
        </div>
      </div>
    </div>
  );
}

function IssueRefundModal({ open, reasonCodes, onClose }: any) {
  const [txnId, setTxnId] = useState('');
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState(reasonCodes[0].code);
  const [note, setNote] = useState('');

  const submit = () => {
    toast.success('Refund initiated', { description: `Refund for ${txnId || 'txn'} queued · webhook will fire on completion` });
    onClose();
    setTxnId(''); setAmount(''); setNote(''); setRefundType('full');
  };

  return (
    <Modal open={open} onClose={onClose} kicker="Refunds" title="Issue a refund" width={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Original transaction ID</label>
          <input type="text" placeholder="txn_00481" value={txnId} onChange={e => setTxnId(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Refund type</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setRefundType('full')} style={{ ...typeBtnStyle, ...(refundType === 'full' ? typeBtnActiveStyle : {}) }}>Full refund</button>
            <button onClick={() => setRefundType('partial')} style={{ ...typeBtnStyle, ...(refundType === 'partial' ? typeBtnActiveStyle : {}) }}>Partial refund</button>
          </div>
        </div>
        {refundType === 'partial' && (
          <div>
            <label style={labelStyle}>Refund amount</label>
            <input type="text" placeholder="₹2,500" value={amount} onChange={e => setAmount(e.target.value)} style={inputStyle} />
          </div>
        )}
        <div>
          <label style={labelStyle}>Reason</label>
          <select value={reason} onChange={e => setReason(e.target.value)} style={inputStyle}>
            {reasonCodes.map((r: any) => <option key={r.code} value={r.code}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Note (visible to customer in receipt)</label>
          <textarea placeholder="Brief explanation…" value={note} onChange={e => setNote(e.target.value)} style={{ ...inputStyle, minHeight: '64px', resize: 'vertical', fontFamily: 'inherit' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: `0.5px solid ${colors.border}` }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>Issue refund</Button>
        </div>
      </div>
    </Modal>
  );
}

function DetailRow({ label, value, isLast, mono }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`, fontSize: '12px', gap: '12px' }}>
      <span style={{ color: colors.text3, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>{label}</span>
      <span style={{ color: colors.ink, fontFamily: mono ? typography.family.mono : 'inherit', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

const selectStyle: React.CSSProperties = { padding: '8px 14px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '12px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit', outline: 'none' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', color: colors.text2, fontWeight: 500, marginBottom: '6px', letterSpacing: '0.02em' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, fontSize: '13px', color: colors.ink, outline: 'none', fontFamily: 'inherit' };
const typeBtnStyle: React.CSSProperties = { flex: 1, padding: '10px 14px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, fontSize: '12px', color: colors.text2, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 };
const typeBtnActiveStyle: React.CSSProperties = { background: 'rgba(28,111,107,0.08)', borderColor: 'rgba(28,111,107,0.3)', color: colors.teal, fontWeight: 600 };
