import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

type TabId = 'overview' | 'escrow' | 'kyc' | 'reporting' | 'grievance' | 'infrastructure';

const tabs: { id: TabId; label: string }[] = [
  { id: 'overview',       label: 'Overview' },
  { id: 'escrow',         label: 'Escrow' },
  { id: 'kyc',            label: 'KYC & merchant risk' },
  { id: 'reporting',      label: 'Regulatory reporting' },
  { id: 'grievance',      label: 'Grievance' },
  { id: 'infrastructure', label: 'Data & infrastructure' },
];

export function Compliance() {
  const { data, loading, error, refetch } = useAsync(() => configService.getCompliance(), []);
  const [tab, setTab] = useState<TabId>('overview');

  if (error) return <ErrorState message={`Couldn't load Compliance — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading compliance posture" />;

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '20px' }}>
        <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{data.header.kicker}</Kicker>
        <div style={{ ...typography.pageTitle, color: colors.ink }}>{data.header.title}</div>
        <div style={{ fontSize: '13px', color: colors.text2, marginTop: '4px', maxWidth: '760px' }}>{data.header.subtitle}</div>
      </div>

      <PostureHeader posture={data.posture} onPillarClick={(id: string) => setTab(id as TabId)} />

      <div style={{ display: 'flex', gap: '4px', marginBottom: '18px', borderBottom: `0.5px solid ${colors.border}`, overflowX: 'auto' }}>
        {tabs.map(t => {
          const active = tab === t.id;
          const pillar = data.posture.pillars.find((p: any) => p.id === t.id);
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '10px 14px', fontSize: '12px', fontWeight: 500, fontFamily: 'inherit',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: active ? colors.ink : colors.text2,
              borderBottom: active ? `1.5px solid ${colors.teal}` : '1.5px solid transparent',
              marginBottom: '-0.5px',
              display: 'flex', alignItems: 'center', gap: '8px',
              whiteSpace: 'nowrap',
            }}>
              {t.label}
              {pillar?.status === 'attention' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#B48C3C' }} />}
            </button>
          );
        })}
      </div>

      {tab === 'overview'       && <OverviewTab data={data} />}
      {tab === 'escrow'         && <EscrowTab data={data.escrow} />}
      {tab === 'kyc'            && <KycTab data={data.kyc} />}
      {tab === 'reporting'      && <ReportingTab data={data.reporting} />}
      {tab === 'grievance'      && <GrievanceTab data={data.grievance} />}
      {tab === 'infrastructure' && <InfrastructureTab data={data.infrastructure} />}
    </div>
  );
}

// ── Posture header ───────────────────────────────────────────────────
function PostureHeader({ posture, onPillarClick }: any) {
  return (
    <Card padded style={{ padding: '22px 24px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '28px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <ScoreCircle score={posture.overallScore} />
          <div>
            <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '4px' }}>Overall posture</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.015em', marginBottom: '2px' }}>{posture.band}</div>
            <div style={{ fontSize: '12px', color: colors.text2 }}>{posture.subtitle}</div>
            <div style={{ fontSize: '10px', color: colors.text3, marginTop: '6px', fontFamily: typography.family.mono }}>Last calculated · {posture.asOf}</div>
          </div>
        </div>
        <div style={{ height: '56px', width: '0.5px', background: colors.border, alignSelf: 'stretch' }} />
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {posture.pillars.map((p: any) => (
            <button key={p.id} onClick={() => onPillarClick(p.id)} style={{
              textAlign: 'left', padding: '10px 12px', border: `0.5px solid ${colors.border}`,
              background: colors.card, borderRadius: radius.md, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = colors.bg)}
              onMouseLeave={e => (e.currentTarget.style.background = colors.card)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <StatusDot status={p.status} />
                <span style={{ fontSize: '11px', fontWeight: 500, color: colors.ink }}>{p.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', fontFamily: typography.family.mono, color: colors.text2 }}>{p.score}</span>
              </div>
              <div style={{ fontSize: '10px', color: colors.text3, lineHeight: 1.4 }}>{p.detail}</div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ScoreCircle({ score }: { score: number }) {
  const radiusC = 32;
  const circumference = 2 * Math.PI * radiusC;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div style={{ position: 'relative', width: '76px', height: '76px' }}>
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={radiusC} fill="none" stroke={colors.border} strokeWidth="4" />
        <circle cx="38" cy="38" r={radiusC} fill="none" stroke={colors.teal} strokeWidth="4"
          strokeDasharray={circumference} strokeDashoffset={offset} transform="rotate(-90 38 38)" strokeLinecap="round" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em' }}>{score}</div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'compliant' ? colors.teal : status === 'attention' ? '#B48C3C' : '#D64545';
  return <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }} />;
}

// ── Overview tab ─────────────────────────────────────────────────────
function OverviewTab({ data }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '16px' }}>
      <Card padded>
        <Kicker style={{ marginBottom: '14px' }}>Active obligations · next 60 days</Kicker>
        {data.reporting.obligations.slice(0, 6).map((o: any, i: number) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 0.8fr', gap: '12px', padding: '11px 0', borderBottom: i < 5 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{o.type}</div>
              <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>{o.authority}</div>
            </div>
            <div style={{ color: colors.text2, fontFamily: typography.family.mono, fontSize: '11px' }}>{o.frequency}</div>
            <div style={{ color: colors.ink, fontFamily: typography.family.mono, fontSize: '11px' }}>{o.nextDue}</div>
            <div><Pill tone={o.status.includes('track') || o.status.includes('draft') ? 'outline' : 'teal'}>{o.status}</Pill></div>
          </div>
        ))}
      </Card>

      <Card padded>
        <Kicker style={{ marginBottom: '14px' }}>Items needing attention</Kicker>
        <AttentionItem
          Icon={Icons.IconUser}
          label="2 merchants pending re-KYC"
          detail="Urban Company · due this month  ·  MakeMyTrip · overdue 12 days"
          tone="amber"
        />
        <AttentionItem
          Icon={Icons.IconMail}
          label="GR-2026-00283 approaching SLA"
          detail="Rohan Malhotra · Cred Club · 2 days remaining"
          tone="amber"
        />
        <AttentionItem
          Icon={Icons.IconShield}
          label="STR-2026-00014 review due"
          detail="Cred Club member_4821 · 5 days on 7-day clock"
          tone="amber"
        />
        <div style={{ padding: '14px 0 0 0', borderTop: `0.5px solid ${colors.border}`, marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: colors.text2 }}>
            <StatusDot status="compliant" />
            <span>No SLA breaches · No regulatory breaches · No material issues last 90 days</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function AttentionItem({ Icon, label, detail, tone }: any) {
  return (
    <div style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: `0.5px solid ${colors.border}`, alignItems: 'flex-start' }}>
      <div style={{ width: '26px', height: '26px', borderRadius: radius.sm, background: tone === 'amber' ? 'rgba(180,140,60,0.12)' : colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={13} color={tone === 'amber' ? '#B48C3C' : colors.ink} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', color: colors.ink, fontWeight: 500, marginBottom: '2px' }}>{label}</div>
        <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.45 }}>{detail}</div>
      </div>
    </div>
  );
}

// ── Escrow tab ───────────────────────────────────────────────────────
function EscrowTab({ data }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
      <Card padded>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr', gap: '20px' }}>
          <div>
            <Kicker style={{ marginBottom: '6px' }}>Nodal / escrow account</Kicker>
            <div style={{ fontSize: '14px', fontWeight: 600, color: colors.ink, marginBottom: '3px' }}>{data.account.bank}</div>
            <div style={{ fontSize: '11px', color: colors.text2, fontFamily: typography.family.mono }}>{data.account.accountNumber} · {data.account.ifsc}</div>
            <div style={{ fontSize: '10px', color: colors.text3, marginTop: '4px' }}>{data.account.type}</div>
          </div>
          <EscrowStat label="Balance"             value={`₹${(data.account.balance / 100).toLocaleString('en-IN')}`} sub="across all merchants" />
          <EscrowStat label="Pending settlement"  value={`₹${(data.account.pendingSettlement / 100).toLocaleString('en-IN')}`} sub="awaiting T+X release" />
          <EscrowStat label="Settled today"       value={`₹${(data.account.settledToday / 100).toLocaleString('en-IN')}`} sub={`released · ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`} />
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card padded>
          <Kicker style={{ marginBottom: '14px' }}>Reconciliation</Kicker>
          <div style={{ padding: '14px', background: 'rgba(28,111,107,0.06)', border: `0.5px solid rgba(28,111,107,0.25)`, borderRadius: radius.md, marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Icons.IconCheck size={13} color={colors.teal} strokeWidth={2.4} />
              <span style={{ fontSize: '12px', color: colors.teal, fontWeight: 600, letterSpacing: '0.02em' }}>MATCHED</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>synced {data.reconciliation.lastReconciled}</span>
            </div>
            <div style={{ fontSize: '11px', color: colors.text2 }}>Bank statement balance matches internal ledger · delta ₹0 · auto-reconcile every 5 minutes.</div>
          </div>
          <ReconRow label="Bank statement balance" value={`₹${(data.reconciliation.bankStatementBalance / 100).toLocaleString('en-IN')}`} />
          <ReconRow label="Internal ledger balance" value={`₹${(data.reconciliation.ledgerBalance / 100).toLocaleString('en-IN')}`} />
          <ReconRow label="Delta" value={`₹${data.reconciliation.delta}`} tone="teal" isLast />
        </Card>

        <Card padded>
          <Kicker style={{ marginBottom: '14px' }}>Hold rules · by merchant tier</Kicker>
          {data.holdRules.map((h: any, i: number) => (
            <div key={h.tier} style={{ padding: '12px 0', borderBottom: i < data.holdRules.length - 1 ? `0.5px solid ${colors.border}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Pill tone={h.tier === 'low' ? 'teal' : h.tier === 'medium' ? 'outline' : 'neutral'}>{h.tier}</Pill>
                <span style={{ fontSize: '12px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{h.settlement}</span>
              </div>
              <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.5 }}>{h.description}</div>
            </div>
          ))}
        </Card>
      </div>

      <Card padded>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <Kicker>Recent movements · escrow account</Kicker>
          <Button variant="ghost" size="sm" icon={<Icons.IconDownload size={12} />} onClick={() => toast.success('Statement exported as CSV')}>Export</Button>
        </div>
        {data.movements.map((m: any, i: number) => {
          const positive = m.amount > 0;
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.7fr 0.7fr 2fr 1fr 1fr', gap: '12px', padding: '10px 0', borderBottom: i < data.movements.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
              <span style={{ fontFamily: typography.family.mono, color: colors.text2, fontSize: '11px' }}>{m.time}</span>
              <Pill tone={m.type === 'inbound' ? 'teal' : m.type === 'refund' ? 'outline' : 'neutral'}>{m.type}</Pill>
              <span style={{ color: colors.ink }}>{m.source}</span>
              <span style={{ textAlign: 'right', color: positive ? colors.teal : colors.ink, fontFamily: typography.family.mono, fontWeight: 500 }}>
                {positive ? '+' : ''}₹{Math.abs(m.amount / 100).toLocaleString('en-IN')}
              </span>
              <span style={{ textAlign: 'right', fontFamily: typography.family.mono, fontSize: '11px', color: colors.text3 }}>{m.ref}</span>
            </div>
          );
        })}
      </Card>

      <Card padded style={{ padding: '18px 20px', background: colors.bg }}>
        <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>Regulatory basis</div>
        <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.6 }}>{data.regulatoryNotes}</div>
        <div style={{ fontSize: '10px', color: colors.text3, marginTop: '6px', fontFamily: typography.family.mono }}>RBI approval · {data.account.regulatorApprovalNumber}</div>
      </Card>
    </div>
  );
}

function EscrowStat({ label, value, sub }: any) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.015em', fontFamily: typography.family.mono, marginBottom: '2px' }}>{value}</div>
      <div style={{ fontSize: '10px', color: colors.text3 }}>{sub}</div>
    </div>
  );
}

function ReconRow({ label, value, tone, isLast }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`, fontSize: '12px' }}>
      <span style={{ color: colors.text2 }}>{label}</span>
      <span style={{ fontFamily: typography.family.mono, fontWeight: 600, color: tone === 'teal' ? colors.teal : colors.ink }}>{value}</span>
    </div>
  );
}

// ── KYC tab ──────────────────────────────────────────────────────────
function KycTab({ data }: any) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <StatTile label="Total merchants"      value={data.summary.totalMerchants} />
        <StatTile label="KYC pending"          value={data.summary.kycPending}          sub="in review queue" tone={data.summary.kycPending > 0 ? 'amber' : 'teal'} />
        <StatTile label="Re-KYC due (quarter)" value={data.summary.reKycDueThisQuarter} sub="within 90 days" />
        <StatTile label="High-risk merchants"  value={data.summary.riskBreakdown.high}  sub="under monitoring" />
      </div>

      <Card padded>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <Kicker>KYC queue · awaiting review</Kicker>
          <span style={{ fontSize: '11px', color: colors.text3 }}>{data.queue.length} in queue</span>
        </div>
        {data.queue.map((k: any) => (
          <KycQueueRow key={k.id} item={k} expanded={selected === k.id} onToggle={() => setSelected(selected === k.id ? null : k.id)} />
        ))}
      </Card>

      <Card padded>
        <Kicker style={{ marginBottom: '14px' }}>Merchant risk tiers</Kicker>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.7fr 0.7fr 3fr', gap: '12px', padding: '8px 0', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Merchant</div><div>Tier</div><div>Score</div><div>Factors</div>
        </div>
        {data.merchantRiskTiers.map((m: any, i: number) => (
          <div key={m.merchant} style={{ display: 'grid', gridTemplateColumns: '2fr 0.7fr 0.7fr 3fr', gap: '12px', padding: '10px 0', borderBottom: i < data.merchantRiskTiers.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
            <div style={{ color: colors.ink, fontWeight: 500 }}>{m.merchant}</div>
            <div><Pill tone={m.tier === 'low' ? 'teal' : m.tier === 'medium' ? 'outline' : 'neutral'}>{m.tier}</Pill></div>
            <div style={{ fontFamily: typography.family.mono, color: colors.ink, fontWeight: 500 }}>{m.score}</div>
            <div style={{ fontSize: '11px', color: colors.text2 }}>{m.factors.join(' · ')}</div>
          </div>
        ))}
      </Card>

      {data.reKycDue.length > 0 && (
        <Card padded>
          <Kicker style={{ marginBottom: '14px' }}>Re-KYC due</Kicker>
          {data.reKycDue.map((r: any, i: number) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr 1fr', gap: '12px', padding: '10px 0', borderBottom: i < data.reKycDue.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{r.merchant}</div>
              <div style={{ color: colors.text2 }}>Last KYC · {r.lastKyc}</div>
              <div style={{ color: colors.text2 }}>{r.due}</div>
              <div><Pill tone={r.status === 'overdue' ? 'neutral' : 'outline'}>{r.status === 'overdue' ? 'overdue' : 'due soon'}</Pill></div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function KycQueueRow({ item: k, expanded, onToggle }: any) {
  return (
    <div style={{ borderBottom: `0.5px solid ${colors.border}` }}>
      <div onClick={onToggle} style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.8fr 1fr 1fr 0.4fr', gap: '14px', padding: '14px 0', alignItems: 'center', cursor: 'pointer', fontSize: '12px' }}>
        <div>
          <div style={{ color: colors.ink, fontWeight: 500, marginBottom: '2px' }}>{k.merchant}</div>
          <div style={{ fontSize: '11px', color: colors.text3 }}>{k.industry}</div>
        </div>
        <div><Pill tone={k.riskCategory === 'high' ? 'neutral' : k.riskCategory === 'medium' ? 'outline' : 'teal'}>{k.riskCategory}</Pill></div>
        <div style={{ color: colors.text2, fontSize: '11px' }}>{k.submittedAt}</div>
        <div style={{ color: colors.text2, fontSize: '11px' }}>{k.reviewer}</div>
        <div><Pill tone={k.status === 'escalated' ? 'neutral' : 'outline'}>{k.status.replace(/_/g, ' ')}</Pill></div>
        <div style={{ textAlign: 'right' }}>
          <Icons.IconArrowUpRight size={12} color={colors.text3} style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </div>
      </div>
      {expanded && (
        <div style={{ background: colors.bg, padding: '16px', borderRadius: radius.md, marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <div>
            <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>Documents</div>
            {k.documents.map((d: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < k.documents.length - 1 ? `0.5px solid ${colors.border}` : 'none', fontSize: '11px', gap: '8px' }}>
                <div style={{ color: colors.text2, minWidth: '80px' }}>{d.type}</div>
                <div style={{ color: colors.ink, fontFamily: d.value && d.value.match(/[A-Z0-9]/) ? typography.family.mono : 'inherit', flex: 1 }}>{d.value || '—'}</div>
                <Pill tone={d.status.includes('verified') || d.status === 'completed' ? 'teal' : 'outline'}>
                  {d.status.replace(/_/g, ' ')}
                </Pill>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>Sanctions screening</div>
            {k.screening.map((s: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < k.screening.length - 1 ? `0.5px solid ${colors.border}` : 'none', fontSize: '11px', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ color: colors.text2, minWidth: '90px' }}>{s.list}</div>
                <div style={{ color: s.result === 'clear' ? colors.teal : '#B48C3C', textAlign: 'right', flex: 1, lineHeight: 1.4 }}>{s.result}</div>
              </div>
            ))}
            {k.escalationReason && (
              <div style={{ padding: '10px 12px', background: 'rgba(180,140,60,0.08)', border: '0.5px solid rgba(180,140,60,0.3)', borderRadius: radius.sm, marginTop: '12px', fontSize: '11px', color: colors.ink, lineHeight: 1.5 }}>
                <div style={{ fontSize: '9px', color: '#B48C3C', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Escalation note</div>
                {k.escalationReason}
              </div>
            )}
            <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
              <Button variant="primary" size="sm" onClick={() => toast.success(`${k.merchant} approved · activated`)}>Approve</Button>
              <Button variant="secondary" size="sm" onClick={() => toast.success('Escalated to compliance officer')}>Escalate</Button>
              <Button variant="ghost" size="sm" onClick={() => toast.success('Additional documents requested')}>Request more</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reporting tab ────────────────────────────────────────────────────
function ReportingTab({ data }: any) {
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <Card padded>
        <Kicker style={{ marginBottom: '14px' }}>Regulatory obligations</Kicker>
        {data.obligations.map((o: any, i: number) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 0.9fr', gap: '14px', padding: '11px 0', borderBottom: i < data.obligations.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500, marginBottom: '2px' }}>{o.type}</div>
              <div style={{ fontSize: '10px', color: colors.text3 }}>{o.authority}</div>
            </div>
            <div style={{ color: colors.text2, fontSize: '11px' }}>{o.frequency}</div>
            <div style={{ color: colors.ink, fontFamily: typography.family.mono, fontSize: '11px' }}>{o.nextDue}</div>
            <div><Pill tone="outline">{o.status}</Pill></div>
            <Button variant="ghost" size="sm" onClick={() => toast.success(`${o.type} opened`)}>Open →</Button>
          </div>
        ))}
      </Card>

      <Card padded>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <Kicker>Suspicious Transaction Reports · 7-day review clock</Kicker>
          <Button variant="primary" size="sm" icon={<Icons.IconPlus size={12} />} onClick={() => toast.success('STR draft created')}>Raise STR</Button>
        </div>
        {data.strQueue.map((s: any) => (
          <div key={s.id} style={{ padding: '14px 0', borderBottom: `0.5px solid ${colors.border}`, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{s.id}</span>
                <Pill tone={s.status === 'filed' ? 'teal' : s.priority === 'high' ? 'neutral' : 'outline'}>{s.status.replace(/_/g, ' ')}</Pill>
                {s.priority === 'high' && <Pill tone="neutral">high priority</Pill>}
              </div>
              <div style={{ fontSize: '13px', color: colors.ink, fontWeight: 500, marginBottom: '4px' }}>{s.subject}</div>
              <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.5 }}>{s.reason}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '3px' }}>Aggregate</div>
              <div style={{ fontSize: '14px', fontFamily: typography.family.mono, fontWeight: 600, color: colors.ink }}>₹{(s.aggregateAmount / 100).toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '10px', color: colors.text3, marginTop: '6px' }}>Reviewer · {s.reviewer}</div>
            </div>
            <div>
              {s.status === 'filed' ? (
                <>
                  <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '3px' }}>Filed</div>
                  <div style={{ fontSize: '11px', color: colors.teal, fontWeight: 500 }}>{s.filedAt}</div>
                  <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono, marginTop: '2px' }}>{s.filingRef}</div>
                </>
              ) : (
                <SLAClock total={s.slaTotal} remaining={s.slaRemaining} />
              )}
            </div>
          </div>
        ))}
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card padded>
          <Kicker style={{ marginBottom: '14px' }}>Cash/high-value Transaction Report · {data.ctrStats.period}</Kicker>
          <CtrStat label="Digital txns ≥ ₹10L" current={data.ctrStats.monthToDate.digitalTxnsAbove10L} prior={data.ctrStats.priorMonth.digitalTxnsAbove10L} />
          <CtrStat label="Digital txns ≥ ₹50L" current={data.ctrStats.monthToDate.digitalTxnsAbove50L} prior={data.ctrStats.priorMonth.digitalTxnsAbove50L} />
          <CtrStat label="Aggregate volume"    current={`₹${(data.ctrStats.monthToDate.aggregateVolume / 100).toLocaleString('en-IN')}`} prior={`₹${(data.ctrStats.priorMonth.aggregateVolume / 100).toLocaleString('en-IN')}`} isLast />
          <div style={{ marginTop: '12px', padding: '10px 12px', background: colors.bg, borderRadius: radius.sm, fontSize: '11px', color: colors.text2 }}>
            Filing due by <span style={{ color: colors.ink, fontWeight: 500 }}>{data.ctrStats.filingDueBy}</span> · status <Pill tone="outline">{data.ctrStats.status.replace(/_/g, ' ')}</Pill>
          </div>
        </Card>

        <Card padded>
          <Kicker style={{ marginBottom: '14px' }}>Recent filings</Kicker>
          {data.recentFilings.map((f: any, i: number) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', padding: '10px 0', borderBottom: i < data.recentFilings.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '11px' }}>
              <div>
                <div style={{ color: colors.ink, fontWeight: 500, fontFamily: typography.family.mono, fontSize: '11px' }}>{f.ref}</div>
                <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>{f.type} · {f.period}</div>
              </div>
              <div style={{ color: colors.text2 }}>{f.filed}</div>
              <div style={{ textAlign: 'right' }}><Pill tone="teal">{f.status}</Pill></div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function SLAClock({ total, remaining }: any) {
  const pct = (remaining / total) * 100;
  const tone = remaining <= 2 ? '#D64545' : remaining <= 4 ? '#B48C3C' : colors.teal;
  return (
    <div>
      <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '4px' }}>SLA · 7-day clock</div>
      <div style={{ fontSize: '14px', fontFamily: typography.family.mono, fontWeight: 600, color: tone, marginBottom: '6px' }}>{remaining}d remaining</div>
      <div style={{ height: '4px', background: colors.border, borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: tone }} />
      </div>
    </div>
  );
}

function CtrStat({ label, current, prior, isLast }: any) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '12px', padding: '10px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`, fontSize: '12px', alignItems: 'baseline' }}>
      <div style={{ color: colors.text2 }}>{label}</div>
      <div style={{ fontFamily: typography.family.mono, fontWeight: 600, color: colors.ink, textAlign: 'right' }}>{current}</div>
      <div style={{ fontFamily: typography.family.mono, color: colors.text3, textAlign: 'right', fontSize: '11px' }}>prior · {prior}</div>
    </div>
  );
}

// ── Grievance tab ────────────────────────────────────────────────────
function GrievanceTab({ data }: any) {
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <Card padded>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr 1fr', gap: '20px', alignItems: 'flex-start' }}>
          <div>
            <Kicker style={{ marginBottom: '6px' }}>Principal Nodal Officer</Kicker>
            <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.01em', marginBottom: '3px' }}>{data.nodalOfficer.name}</div>
            <div style={{ fontSize: '11px', color: colors.text2, marginBottom: '10px' }}>{data.nodalOfficer.designation}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
              <div style={{ color: colors.ink, fontFamily: typography.family.mono }}>{data.nodalOfficer.email}</div>
              <div style={{ color: colors.text2, fontFamily: typography.family.mono }}>{data.nodalOfficer.phone}</div>
              <div style={{ color: colors.text3, marginTop: '2px' }}>{data.nodalOfficer.workingHours}</div>
            </div>
            <div style={{ fontSize: '10px', color: colors.text3, lineHeight: 1.5, marginTop: '10px', padding: '10px 12px', background: colors.bg, borderRadius: radius.sm }}>
              {data.nodalOfficer.address}
            </div>
          </div>
          <SlaStatTile label="Open tickets"         value={data.slaStats.openTickets}           sub="in progress" />
          <SlaStatTile label="Approaching SLA"      value={data.slaStats.approachingSla}        sub="within 5 days" tone="amber" />
          <SlaStatTile label="Average resolution"   value={`${data.slaStats.averageResolutionDays}d`} sub={`last 30d · ${data.slaStats.resolvedLast30d} resolved`} tone="teal" />
        </div>
      </Card>

      <Card padded>
        <Kicker style={{ marginBottom: '14px' }}>Escalation path · as published on payze.com/nodal-officer</Kicker>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', border: `0.5px solid ${colors.border}`, borderRadius: radius.md, overflow: 'hidden' }}>
          {data.escalationPath.map((step: any, i: number) => (
            <div key={i} style={{ padding: '14px 16px', borderRight: i < data.escalationPath.length - 1 ? `0.5px solid ${colors.border}` : 'none', background: i === 1 ? colors.bg : colors.card }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i === 1 ? colors.teal : colors.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600, fontFamily: typography.family.mono }}>{step.step}</div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: colors.ink }}>{step.level}</span>
              </div>
              <div style={{ fontSize: '11px', color: colors.text2, marginBottom: '4px' }}>SLA · <span style={{ fontFamily: typography.family.mono, color: colors.ink }}>{step.sla}</span></div>
              <div style={{ fontSize: '10px', color: colors.text3, lineHeight: 1.5 }}>{step.via}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '10px', color: colors.text3, marginTop: '10px' }}>
          Per RBI Integrated Ombudsman Scheme, 2021 · if unresolved by Nodal Officer within 30 days, customer may escalate to RBI Ombudsman at cms.rbi.org.in.
        </div>
      </Card>

      <Card padded>
        <Kicker style={{ marginBottom: '14px' }}>Open tickets</Kicker>
        {data.tickets.map((t: any) => (
          <div key={t.id} style={{ padding: '14px 0', borderBottom: `0.5px solid ${colors.border}`, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <span style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{t.id}</span>
                <Pill tone={t.status === 'escalation_warning' ? 'neutral' : 'outline'}>{t.status.replace(/_/g, ' ')}</Pill>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink, marginBottom: '2px' }}>{t.subject}</div>
              <div style={{ fontSize: '11px', color: colors.text2 }}>{t.customer} · {t.merchant} · {t.category}</div>
            </div>
            <div>
              <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '3px' }}>Open for</div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{t.daysOpen}d</div>
              <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>Assigned · {t.assignedTo}</div>
            </div>
            <div>
              <SLAClock total={30} remaining={t.slaDaysRemaining} />
            </div>
            <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.5 }}>{t.note}</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function SlaStatTile({ label, value, sub, tone }: any) {
  const color = tone === 'teal' ? colors.teal : tone === 'amber' ? '#B48C3C' : colors.ink;
  return (
    <div>
      <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 600, color, letterSpacing: '-0.015em', fontFamily: typography.family.mono, marginBottom: '2px' }}>{value}</div>
      <div style={{ fontSize: '10px', color: colors.text3 }}>{sub}</div>
    </div>
  );
}

// ── Infrastructure tab ───────────────────────────────────────────────
function InfrastructureTab({ data }: any) {
  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <Card padded>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          <Kicker>Data localization · RBI April 2018</Kicker>
          <Pill tone="teal">✓ compliant</Pill>
        </div>
        <div style={{ fontSize: '11px', color: colors.text3, fontFamily: typography.family.mono, marginBottom: '16px' }}>{data.dataLocalization.regulationRef}</div>

        <div style={{ padding: '14px 16px', background: colors.bg, borderRadius: radius.md, marginBottom: '14px' }}>
          <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '10px' }}>Payment data resides in</div>
          {data.dataLocalization.regions.map((r: any, i: number) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 2fr', gap: '12px', padding: '9px 0', borderBottom: i < data.dataLocalization.regions.length - 1 ? `0.5px solid ${colors.border}` : 'none', fontSize: '12px', alignItems: 'center' }}>
              <div style={{ color: colors.ink, fontFamily: typography.family.mono, fontWeight: 500 }}>{r.region}</div>
              <div><Pill tone={r.role === 'primary' ? 'teal' : 'outline'}>{r.role}</Pill></div>
              <div style={{ fontSize: '11px', color: colors.text2 }}>{r.dataTypes.join(' · ')}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '10px' }}>Cross-border flows</div>
        {data.dataLocalization.crossBorderFlows.map((f: any, i: number) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1.5fr 0.8fr', gap: '12px', padding: '9px 0', borderBottom: i < data.dataLocalization.crossBorderFlows.length - 1 ? `0.5px solid ${colors.border}` : 'none', fontSize: '11px', alignItems: 'center' }}>
            <div style={{ color: colors.ink, fontWeight: 500 }}>{f.flow}</div>
            <div style={{ color: colors.text2 }}>Outbound · {f.outboundData}</div>
            <div style={{ color: colors.text2 }}>Safeguard · {f.safeguard}</div>
            <div><Pill tone="teal">{f.status}</Pill></div>
          </div>
        ))}

        <div style={{ fontSize: '10px', color: colors.text3, marginTop: '12px' }}>
          Last audited · <span style={{ color: colors.ink, fontWeight: 500 }}>{data.dataLocalization.lastAudit}</span> by {data.dataLocalization.auditor} · next audit {data.dataLocalization.nextAudit}.
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card padded>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <Kicker>Disaster recovery</Kicker>
            <Pill tone="teal">{data.disasterRecovery.drReadiness}</Pill>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '16px', marginBottom: '16px' }}>
            <RtoRpoTile label="RTO" required={data.disasterRecovery.rto.required} actual={data.disasterRecovery.rto.actualLastDrill} />
            <RtoRpoTile label="RPO" required={data.disasterRecovery.rpo.required} actual={data.disasterRecovery.rpo.actualLastDrill} />
          </div>
          <ReconRow label="Last DR drill"       value={data.disasterRecovery.lastDrill} />
          <ReconRow label="Next scheduled"      value={data.disasterRecovery.nextScheduledDrill} />
          <ReconRow label="Prod incident SLA"   value={data.disasterRecovery.lastIncident} tone="teal" isLast />
        </Card>

        <Card padded>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <Kicker>PCI-DSS posture</Kicker>
            <Pill tone="teal">{data.pciDss.certificationLevel}</Pill>
          </div>
          <div style={{ fontSize: '11px', color: colors.text3, marginBottom: '16px', marginTop: '6px' }}>Certified by {data.pciDss.certifiedBy} · valid through {data.pciDss.validThrough}</div>
          <ReconRow label="Last quarterly scan"   value={data.pciDss.lastQuarterlyScan} />
          <ReconRow label="Scan result"           value={data.pciDss.scanResult} tone="teal" />
          <ReconRow label="Tokenization coverage" value={`${data.pciDss.tokenizationCoverage}%`} tone="teal" />
          <ReconRow label="Key rotation"          value={`${data.pciDss.keyRotationLastDone}  →  ${data.pciDss.nextKeyRotation}`} isLast />
        </Card>
      </div>
    </div>
  );
}

function StatTile({ label, value, sub, tone }: any) {
  const color = tone === 'teal' ? colors.teal : tone === 'amber' ? '#B48C3C' : colors.ink;
  return (
    <Card padded style={{ padding: '16px 18px' }}>
      <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 600, color, letterSpacing: '-0.015em', fontFamily: typography.family.mono, marginBottom: '2px' }}>{value}</div>
      {sub && <div style={{ fontSize: '10px', color: colors.text3 }}>{sub}</div>}
    </Card>
  );
}

function RtoRpoTile({ label, required, actual }: any) {
  return (
    <div style={{ padding: '12px 14px', background: colors.bg, borderRadius: radius.md }}>
      <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: 600, color: colors.teal, fontFamily: typography.family.mono, letterSpacing: '-0.01em', marginBottom: '4px' }}>{actual}</div>
      <div style={{ fontSize: '10px', color: colors.text3 }}>required · <span style={{ fontFamily: typography.family.mono }}>{required}</span></div>
    </div>
  );
}
