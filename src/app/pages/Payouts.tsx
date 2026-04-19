import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState, Modal, SectionTabs } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const AMBER = '#B48C3C';
const RED   = '#D64545';

type TabId = 'recent' | 'beneficiaries' | 'rails' | 'batch';

export function Payouts() {
  const { data, loading, error, refetch } = useAsync(() => configService.getPayouts(), []);
  const [tab, setTab] = useState<TabId>('recent');
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [selectedBen, setSelectedBen] = useState<any>(null);

  if (error) return <ErrorState message={`Couldn't load payouts — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading payouts" />;

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{data.header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{data.header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{data.header.subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('Batch CSV template downloaded')}>Batch upload</Button>
          <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => setComposerOpen(true)}>Send payout</Button>
        </div>
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

      <SectionTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'recent',         label: 'Recent payouts', hint: `${data.recentPayouts.length} in last 7 days` },
          { id: 'beneficiaries',  label: 'Beneficiaries',  hint: `${data.beneficiaries.length} verified contacts` },
          { id: 'rails',          label: 'Rails',          hint: 'IMPS · NEFT · RTGS · UPI' },
          { id: 'batch',          label: 'Batch uploads',  hint: 'CSV history' },
        ]}
      />

      {tab === 'recent' && <RecentPayouts list={data.recentPayouts} onPick={setSelectedPayout} />}
      {tab === 'beneficiaries' && <BeneficiariesView list={data.beneficiaries} onPick={setSelectedBen} />}
      {tab === 'rails' && <RailIntelligence data={data.railIntelligence} />}
      {tab === 'batch' && <BatchUploadsList list={data.batchUploads} />}

      {selectedPayout && <PayoutDrawer payout={selectedPayout} beneficiaries={data.beneficiaries} onClose={() => setSelectedPayout(null)} />}
      {selectedBen     && <BeneficiaryDrawer ben={selectedBen} onClose={() => setSelectedBen(null)} />}
      <SendPayoutModal open={composerOpen} beneficiaries={data.beneficiaries} rails={data.railIntelligence.rails} onClose={() => setComposerOpen(false)} />
    </div>
  );
}

function RecentPayouts({ list, onPick }: any) {
  return (
    <Card padded={false}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 0.9fr 1.8fr 0.9fr', gap: '14px', padding: '12px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
        <div>Beneficiary</div><div>Rail</div><div style={{ textAlign: 'right' }}>Amount</div><div>Fee</div><div>Purpose</div><div style={{ textAlign: 'right' }}>Status · Time</div>
      </div>
      {list.map((p: any, i: number) => (
        <div key={p.id} onClick={() => onPick(p)} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 0.9fr 1.8fr 0.9fr', gap: '14px', padding: '14px 24px', borderBottom: i < list.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = colors.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
          <div>
            <div style={{ color: colors.ink, fontWeight: 500 }}>{p.beneficiary}</div>
            <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono }}>{p.id}</div>
          </div>
          <div>
            <RailBadge rail={p.rail} />
            <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono, marginTop: '2px' }}>{p.ref || '—'}</div>
          </div>
          <div style={{ textAlign: 'right', color: colors.ink, fontWeight: 600, fontFamily: typography.family.mono }}>{p.amount}</div>
          <div style={{ color: colors.text2, fontSize: '11px', fontFamily: typography.family.mono }}>{p.fee}</div>
          <div style={{ color: colors.text2, fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.purpose}</div>
          <div style={{ textAlign: 'right' }}>
            <PayoutStatusBadge status={p.status} />
            <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono, marginTop: '2px' }}>{p.initiatedAt}</div>
          </div>
        </div>
      ))}
    </Card>
  );
}

function RailBadge({ rail }: { rail: string }) {
  const colorMap: Record<string, string> = {
    'IMPS':        colors.teal,
    'NEFT':        colors.text2,
    'RTGS':        colors.ink,
    'UPI Payout':  '#6739B7',
    'Card Payout': AMBER,
  };
  const color = colorMap[rail] || colors.text2;
  return <span style={{ fontSize: '10px', padding: '2px 7px', background: `${color}15`, color, border: `0.5px solid ${color}40`, borderRadius: radius.pill, fontWeight: 600, fontFamily: typography.family.mono, letterSpacing: '0.04em', display: 'inline-block' }}>{rail}</span>;
}

function PayoutStatusBadge({ status }: any) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    succeeded:        { color: colors.teal, bg: 'rgba(28,111,107,0.08)', label: 'Succeeded' },
    awaiting_kyc:     { color: AMBER,       bg: 'rgba(180,140,60,0.08)', label: 'Awaiting KYC' },
    failed:           { color: RED,         bg: 'rgba(214,69,69,0.08)',  label: 'Failed' },
    in_transit:       { color: AMBER,       bg: 'rgba(180,140,60,0.08)', label: 'In transit' },
  };
  const m = map[status] || map.succeeded;
  return <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: radius.pill, background: m.bg, color: m.color, border: `0.5px solid ${m.color}40`, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: typography.family.mono }}>{m.label}</span>;
}

function BeneficiariesView({ list, onPick }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
      {list.map((b: any) => (
        <Card key={b.id} padded onClick={() => onPick(b)} style={{ padding: '16px 18px', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: colors.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>{b.name.charAt(0)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>{b.name}</span>
                {b.verified ? <Pill tone="teal">verified</Pill> : <Pill tone="outline">KYC pending</Pill>}
              </div>
              <div style={{ fontSize: '11px', color: colors.text2 }}>{b.type} · {b.kind === 'upi' ? 'UPI' : 'Bank account'}</div>
            </div>
          </div>
          <div style={{ padding: '8px 10px', background: colors.bg, borderRadius: radius.sm, fontSize: '11px', color: colors.ink, fontFamily: typography.family.mono, marginBottom: '10px' }}>
            {b.kind === 'upi' ? b.upi : `${b.bank?.ifsc} · ${b.bank?.account}`}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '11px', color: colors.text2 }}>
            <div><div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>Total paid</div><div style={{ fontSize: '12px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{b.totalPaid}</div></div>
            <div><div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>Payouts</div><div style={{ fontSize: '12px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{b.txnCount}</div></div>
            <div><div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>Last</div><div style={{ fontSize: '11px', color: colors.text2 }}>{b.lastPaid}</div></div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function RailIntelligence({ data }: any) {
  return (
    <div>
      <div style={{ fontSize: '13px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>
      <Card padded={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1.6fr 1fr 1.2fr 2fr', gap: '14px', padding: '12px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Rail</div><div>Speed</div><div style={{ textAlign: 'right' }}>Fee</div><div>Limit</div><div>Best for</div>
        </div>
        {data.rails.map((r: any, i: number) => (
          <div key={r.rail} style={{ display: 'grid', gridTemplateColumns: '120px 1.6fr 1fr 1.2fr 2fr', gap: '14px', padding: '14px 24px', borderBottom: i < data.rails.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
            <div><RailBadge rail={r.rail} /></div>
            <div style={{ color: colors.ink, fontWeight: 500 }}>{r.speed}</div>
            <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 600 }}>₹{r.costRupees.toFixed(2)}</div>
            <div style={{ color: colors.text2, fontFamily: typography.family.mono, fontSize: '11px' }}>{r.limitINR}</div>
            <div style={{ color: colors.text2, fontSize: '11px' }}>{r.bestFor}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function BatchUploadsList({ list }: any) {
  return (
    <Card padded={false}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 0.9fr 1fr 0.8fr', gap: '14px', padding: '12px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
        <div>Batch · file</div><div>Uploaded</div><div style={{ textAlign: 'right' }}>Rows</div><div style={{ textAlign: 'right' }}>Succeeded</div><div style={{ textAlign: 'right' }}>Total</div><div style={{ textAlign: 'right' }}>Status</div>
      </div>
      {list.map((b: any, i: number) => (
        <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 0.9fr 1fr 0.8fr', gap: '14px', padding: '14px 24px', borderBottom: i < list.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
          <div>
            <div style={{ color: colors.ink, fontWeight: 500, fontFamily: typography.family.mono }}>{b.fileName}</div>
            <div style={{ color: colors.text3, fontSize: '10px' }}>{b.id} · by {b.uploadedBy}</div>
          </div>
          <div style={{ color: colors.text2, fontSize: '11px' }}>{b.uploadedAt}</div>
          <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 500 }}>{b.rows}</div>
          <div style={{ textAlign: 'right', color: b.failed > 0 ? AMBER : colors.teal, fontFamily: typography.family.mono, fontWeight: 600 }}>{b.succeeded}/{b.rows}</div>
          <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 600 }}>{b.totalAmount}</div>
          <div style={{ textAlign: 'right' }}><Pill tone="teal">{b.status}</Pill></div>
        </div>
      ))}
    </Card>
  );
}

function PayoutDrawer({ payout, beneficiaries, onClose }: any) {
  const ben = beneficiaries.find((b: any) => b.name === payout.beneficiary);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '560px', maxWidth: '100%', height: '100%', background: colors.card, borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '4px' }}>Payout</Kicker>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{payout.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        <div style={{ fontSize: '32px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', fontFamily: typography.family.mono, marginBottom: '4px' }}>{payout.amount}</div>
        <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '20px' }}>To {payout.beneficiary} · via <RailBadge rail={payout.rail} /></div>

        <div style={{ padding: '14px 16px', background: colors.bg, borderRadius: radius.md, marginBottom: '18px' }}>
          <Row label="Status"        value={<PayoutStatusBadge status={payout.status} />} />
          <Row label="Purpose"       value={payout.purpose} />
          <Row label="Initiated"     value={payout.initiatedAt} />
          <Row label="Landed"        value={payout.landedAt || 'Pending'} />
          <Row label="Ref"           value={payout.ref || '—'} mono />
          <Row label="Fee"           value={payout.fee} mono />
          <Row label="Initiated by"  value={payout.initiatedBy} isLast />
        </div>

        {payout.blockReason && (
          <div style={{ padding: '12px 14px', background: 'rgba(180,140,60,0.06)', border: `0.5px solid rgba(180,140,60,0.25)`, borderRadius: radius.md, marginBottom: '18px' }}>
            <div style={{ fontSize: '11px', color: AMBER, fontWeight: 600, marginBottom: '4px' }}>Blocked</div>
            <div style={{ fontSize: '12px', color: colors.ink, lineHeight: 1.5 }}>{payout.blockReason}</div>
          </div>
        )}

        {ben && (
          <>
            <Kicker style={{ marginBottom: '10px' }}>Beneficiary</Kicker>
            <div style={{ padding: '12px 14px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px', fontSize: '12px' }}>
              <div style={{ color: colors.ink, fontWeight: 600, marginBottom: '4px' }}>{ben.name}</div>
              <div style={{ color: colors.text2, fontSize: '11px', fontFamily: typography.family.mono }}>{ben.kind === 'upi' ? ben.upi : `${ben.bank?.ifsc} · ${ben.bank?.account}`}</div>
              <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono, marginTop: '4px' }}>PAN: {ben.pan}</div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" icon={<Icons.IconDownload size={12} />} onClick={() => toast.success('Receipt PDF downloaded')}>Receipt</Button>
          {payout.status === 'failed' && <Button variant="primary" size="sm" onClick={() => toast.success('Payout retry initiated')}>Retry</Button>}
          {payout.status === 'awaiting_kyc' && <Button variant="primary" size="sm" onClick={() => toast.success('KYC reminder sent to beneficiary')}>Nudge KYC</Button>}
          <Button variant="ghost" size="sm" icon={<Icons.IconCopy size={12} />} onClick={() => { navigator.clipboard.writeText(payout.id); toast.success('Payout ID copied'); }}>Copy ID</Button>
        </div>
      </div>
    </div>
  );
}

function BeneficiaryDrawer({ ben, onClose }: any) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '520px', maxWidth: '100%', height: '100%', background: colors.card, borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '4px' }}>Beneficiary</Kicker>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink }}>{ben.name}</div>
            <div style={{ fontSize: '11px', color: colors.text2, marginTop: '2px' }}>{ben.type} · {ben.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '18px' }}>
          {ben.verified ? <Pill tone="teal">verified</Pill> : <Pill tone="outline">KYC pending</Pill>}
          <Pill tone="outline">{ben.kind === 'upi' ? 'UPI' : 'Bank account'}</Pill>
        </div>
        <div style={{ padding: '14px 16px', background: colors.bg, borderRadius: radius.md, marginBottom: '18px' }}>
          {ben.kind === 'upi' ? (
            <Row label="UPI handle" value={ben.upi} mono />
          ) : (
            <>
              <Row label="Account holder" value={ben.bank?.holder} />
              <Row label="IFSC" value={ben.bank?.ifsc} mono />
              <Row label="Account" value={ben.bank?.account} mono />
            </>
          )}
          <Row label="PAN"        value={ben.pan} mono />
          <Row label="Total paid" value={ben.totalPaid} mono />
          <Row label="Payouts"    value={ben.txnCount.toString()} mono />
          <Row label="Last paid"  value={ben.lastPaid} isLast />
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="primary" size="sm" icon={<Icons.IconSend size={12} />} onClick={() => toast.success('Payout composer pre-filled')}>Send payout</Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success('Edit form opened')}>Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success('Beneficiary archived')} style={{ color: RED, marginLeft: 'auto' }}>Archive</Button>
        </div>
      </div>
    </div>
  );
}

function SendPayoutModal({ open, beneficiaries, rails, onClose }: any) {
  const [benId, setBenId] = useState('');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [rail, setRail] = useState('IMPS');

  const submit = () => {
    toast.success('Payout initiated', { description: `₹${amount} to ${beneficiaries.find((b: any) => b.id === benId)?.name || 'beneficiary'} via ${rail}. Webhook will fire on landing.` });
    setBenId(''); setAmount(''); setPurpose('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} kicker="New payout" title="Send a payout" width={520}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Beneficiary</label>
          <select value={benId} onChange={e => setBenId(e.target.value)} style={inputStyle}>
            <option value="">Pick from saved…</option>
            {beneficiaries.filter((b: any) => b.verified).map((b: any) => <option key={b.id} value={b.id}>{b.name} · {b.kind === 'upi' ? b.upi : b.bank?.account}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Amount (₹)</label>
            <input type="text" value={amount} onChange={e => setAmount(e.target.value)} placeholder="25,000" style={{ ...inputStyle, fontFamily: typography.family.mono }} />
          </div>
          <div>
            <label style={labelStyle}>Rail</label>
            <select value={rail} onChange={e => setRail(e.target.value)} style={inputStyle}>
              {rails.map((r: any) => <option key={r.rail} value={r.rail}>{r.rail} · {r.speed.split(' ')[0]} · ₹{r.costRupees}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Purpose</label>
          <input type="text" value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Vendor invoice · Q2 design" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: `0.5px solid ${colors.border}` }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>Send payout</Button>
        </div>
      </div>
    </Modal>
  );
}

function Row({ label, value, mono, isLast }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`, fontSize: '12px', gap: '12px' }}>
      <span style={{ color: colors.text3, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, flexShrink: 0 }}>{label}</span>
      <span style={{ color: colors.ink, fontFamily: mono ? typography.family.mono : 'inherit', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', color: colors.text2, fontWeight: 500, marginBottom: '6px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, fontSize: '13px', color: colors.ink, outline: 'none', fontFamily: 'inherit' };
