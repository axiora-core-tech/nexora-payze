import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState, Modal } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

export function SmartCollect() {
  const { data, loading, error, refetch } = useAsync(() => configService.getSmartCollect(), []);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  if (error) return <ErrorState message={`Couldn't load Smart Collect — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading Smart Collect" />;

  const filtered = data.virtualAccounts.filter((v: any) => statusFilter === 'all' || v.status === statusFilter);

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{data.header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{data.header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{data.header.subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="ghost" icon={<Icons.IconExternal size={14} />} onClick={() => setHowItWorksOpen(true)}>How it works</Button>
          <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => setCreateOpen(true)}>Create VA</Button>
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

      {/* Recent inflows · the magic moment */}
      <Card padded style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: colors.teal, animation: 'payze-pulse-dot 2s ease-in-out infinite' }} />
          <Kicker style={{ margin: 0 }}>Auto-reconciled inflows · last 24h</Kicker>
        </div>
        {data.recentInflows.map((inf: any, i: number) => {
          const va = data.virtualAccounts.find((v: any) => v.id === inf.va);
          return (
            <div key={inf.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 1.6fr 0.8fr', gap: '14px', padding: '12px 0', borderBottom: i < data.recentInflows.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: colors.ink, fontWeight: 500 }}>{inf.sender}</div>
                <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>to VA {va?.accountNumber.slice(-8)}</div>
              </div>
              <div>
                <span style={{ fontSize: '10px', padding: '2px 7px', background: `${colors.teal}15`, color: colors.teal, border: `0.5px solid ${colors.teal}40`, borderRadius: radius.pill, fontWeight: 600, fontFamily: typography.family.mono }}>{inf.rail}</span>
                <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>{inf.receivedAt}</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{inf.amount}</div>
              <div>
                <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>Matched to</div>
                <div style={{ fontSize: '11px', color: colors.ink }}>{inf.matchedTo}</div>
                <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>narration: "{inf.narration}"</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: colors.teal, fontFamily: typography.family.mono }}>{inf.reconciledIn}</div>
                <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>to reconcile</div>
              </div>
            </div>
          );
        })}
      </Card>

      {/* VA list */}
      <Card padded={false}>
        <div style={{ padding: '14px 20px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
          <Kicker>Virtual accounts · {filtered.length}</Kicker>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '6px 12px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '11px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit' }}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="awaiting_inflow">Awaiting inflow</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.6fr 0.7fr 0.9fr 0.9fr', gap: '14px', padding: '10px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Customer / VA</div><div>Merchant</div><div>Account · IFSC</div><div style={{ textAlign: 'right' }}>Inflows</div><div style={{ textAlign: 'right' }}>Collected</div><div style={{ textAlign: 'right' }}>Status</div>
        </div>
        {filtered.map((v: any, i: number) => (
          <div key={v.id} onClick={() => setSelected(v)} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.6fr 0.7fr 0.9fr 0.9fr', gap: '14px', padding: '14px 24px', borderBottom: i < filtered.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = colors.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{v.customerName}</div>
              <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono }}>{v.id} · {v.linkedTo.type}: {v.linkedTo.ref}</div>
            </div>
            <div style={{ color: colors.text2 }}>{v.merchantName}</div>
            <div>
              <div style={{ color: colors.ink, fontFamily: typography.family.mono, fontSize: '11px' }}>{v.accountNumber}</div>
              <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono }}>{v.ifsc} · HDFC nodal</div>
            </div>
            <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 500 }}>{v.receivedCount}</div>
            <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 600 }}>{v.receivedTotal}</div>
            <div style={{ textAlign: 'right' }}>
              <VAStatusBadge status={v.status} />
              <div style={{ color: colors.text3, fontSize: '10px', marginTop: '2px' }}>{v.lastInflow}</div>
            </div>
          </div>
        ))}
      </Card>

      {selected && <VADetailDrawer va={selected} onClose={() => setSelected(null)} />}
      <CreateVAModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <HowItWorksModal open={howItWorksOpen} howItWorks={data.howItWorks} onClose={() => setHowItWorksOpen(false)} />
    </div>
  );
}

function VAStatusBadge({ status }: any) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    active:          { color: colors.teal,  bg: 'rgba(28,111,107,0.08)', label: 'Active' },
    awaiting_inflow: { color: '#B48C3C',    bg: 'rgba(180,140,60,0.08)', label: 'Awaiting' },
    deactivated:     { color: colors.text3, bg: 'rgba(138,138,136,0.08)',label: 'Deactivated' },
  };
  const m = map[status] || map.active;
  return <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: radius.pill, background: m.bg, color: m.color, border: `0.5px solid ${m.color}40`, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: typography.family.mono }}>{m.label}</span>;
}

function VADetailDrawer({ va, onClose }: any) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '560px', maxWidth: '100%', height: '100%', background: colors.card, borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '4px' }}>Virtual account</Kicker>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink }}>{va.customerName}</div>
            <div style={{ fontSize: '11px', color: colors.text2, marginTop: '2px' }}>{va.merchantName} · created {va.createdAt}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 18px', background: '#1A1A1A', borderRadius: radius.md, marginBottom: '14px' }}>
          <div style={{ fontSize: '9px', color: '#8A8A88', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>Account number</div>
          <div style={{ fontSize: '18px', fontFamily: typography.family.mono, color: '#E4E4E0', fontWeight: 500, marginBottom: '10px', letterSpacing: '0.04em' }}>{va.accountNumber}</div>
          <div style={{ display: 'flex', gap: '20px', fontSize: '11px' }}>
            <div>
              <div style={{ fontSize: '9px', color: '#8A8A88', letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>IFSC</div>
              <div style={{ fontFamily: typography.family.mono, color: '#E4E4E0' }}>{va.ifsc}</div>
            </div>
            <div>
              <div style={{ fontSize: '9px', color: '#8A8A88', letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Held at</div>
              <div style={{ color: '#E4E4E0' }}>HDFC Bank · Nodal escrow</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '18px' }}>
          <Button variant="secondary" size="sm" icon={<Icons.IconCopy size={12} />} onClick={() => { navigator.clipboard.writeText(va.accountNumber); toast.success('Account number copied'); }}>Copy account</Button>
          <Button variant="ghost" size="sm" icon={<Icons.IconCopy size={12} />} onClick={() => { navigator.clipboard.writeText(`${va.ifsc} / ${va.accountNumber}`); toast.success('IFSC + account copied'); }}>Copy IFSC + account</Button>
        </div>

        <div style={{ padding: '14px 16px', background: colors.bg, borderRadius: radius.md, marginBottom: '18px' }}>
          <Row label="Status"        value={<VAStatusBadge status={va.status} />} />
          <Row label="Linked to"     value={`${va.linkedTo.type}: ${va.linkedTo.ref}`} mono />
          <Row label="Inflows"       value={va.receivedCount.toString()} mono />
          <Row label="Total collected" value={va.receivedTotal} mono />
          <Row label="Last inflow"   value={va.lastInflow} isLast />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="primary" size="sm" icon={<Icons.IconSend size={12} />} onClick={() => toast.success('Account details emailed to customer')}>Share with customer</Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success(va.status === 'active' ? 'VA deactivated' : 'VA reactivated')}>{va.status === 'active' ? 'Deactivate' : 'Reactivate'}</Button>
        </div>
      </div>
    </div>
  );
}

function CreateVAModal({ open, onClose }: any) {
  const [linkType, setLinkType] = useState<'customer' | 'invoice'>('invoice');
  const [ref, setRef] = useState('');

  const submit = () => {
    toast.success('Virtual account created', { description: `Auto-reconciliation active. Account: HDFC0000001 / 11-digit ref generated.` });
    onClose();
    setRef('');
  };

  return (
    <Modal open={open} onClose={onClose} kicker="New virtual account" title="Create a VA" width={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Link to</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setLinkType('invoice')} style={{ flex: 1, padding: '10px 14px', background: linkType === 'invoice' ? 'rgba(28,111,107,0.08)' : colors.bg, border: `0.5px solid ${linkType === 'invoice' ? 'rgba(28,111,107,0.3)' : colors.border}`, borderRadius: radius.md, fontSize: '12px', color: linkType === 'invoice' ? colors.teal : colors.text2, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Invoice (one-time)</button>
            <button onClick={() => setLinkType('customer')} style={{ flex: 1, padding: '10px 14px', background: linkType === 'customer' ? 'rgba(28,111,107,0.08)' : colors.bg, border: `0.5px solid ${linkType === 'customer' ? 'rgba(28,111,107,0.3)' : colors.border}`, borderRadius: radius.md, fontSize: '12px', color: linkType === 'customer' ? colors.teal : colors.text2, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Customer (persistent)</button>
          </div>
        </div>
        <div>
          <label style={labelStyle}>{linkType === 'invoice' ? 'Invoice reference' : 'Customer ID'}</label>
          <input type="text" value={ref} onChange={e => setRef(e.target.value)} placeholder={linkType === 'invoice' ? 'INV-901' : 'cus_a4821'} style={{ ...inputStyle, fontFamily: typography.family.mono }} />
        </div>
        <div style={{ padding: '10px 12px', background: colors.bg, borderRadius: radius.sm, fontSize: '11px', color: colors.text2, lineHeight: 1.55 }}>
          A unique 11-digit account number will be created on HDFC nodal. When the customer transfers via NEFT/IMPS/RTGS to this VA, the payment is auto-matched to this {linkType} within 4 seconds.
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: `0.5px solid ${colors.border}` }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>Create VA</Button>
        </div>
      </div>
    </Modal>
  );
}

function HowItWorksModal({ open, howItWorks, onClose }: any) {
  return (
    <Modal open={open} onClose={onClose} kicker="Technical reference" title={howItWorks.kicker} width={600}>
      <div style={{ fontSize: '13px', color: colors.text2, lineHeight: 1.55, marginBottom: '20px' }}>{howItWorks.summary}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
        {howItWorks.steps.map((s: any) => (
          <div key={s.num} style={{ display: 'flex', gap: '14px', padding: '14px 16px', background: colors.bg, borderRadius: radius.md }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: colors.teal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0, fontFamily: typography.family.mono }}>{s.num}</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, marginBottom: '2px' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.55 }}>{s.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '10px 12px', background: 'rgba(28,111,107,0.05)', border: '0.5px solid rgba(28,111,107,0.2)', borderRadius: radius.md, fontSize: '11px', color: colors.text2, lineHeight: 1.55 }}>
        <span style={{ fontSize: '9px', color: colors.teal, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginRight: '6px' }}>Regulatory</span>
        {howItWorks.regulationRef}
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
