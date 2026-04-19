import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

export function Risk() {
  const { data, loading, error, refetch } = useAsync(() => configService.getRisk(), []);
  const { data: forecast } = useAsync(() => configService.getForecast(), []);
  const { data: opData } = useAsync(() => configService.getOperatorPolish(), []);
  const { data: evidenceLib } = useAsync(() => configService.getDisputeEvidence(), []);
  const [tab, setTab] = useState<'forecast' | 'signals' | 'rules' | 'disputes'>('forecast');
  const [disputeSubTab, setDisputeSubTab] = useState<'list' | 'evidence'>('list');
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);

  if (error) return <ErrorState message={`Couldn't load risk — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading risk posture" />;

  const { header, gauge, composite, metrics, anomalies, register, rules, disputes } = data;

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{header.subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('Exporting risk report')}>Export</Button>
          <Button variant="primary" icon={<Icons.IconSettings size={14} />} onClick={() => setTab('rules')}>Risk rules</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)', gap: '20px', marginBottom: '20px' }}>
        <Card padded style={{ padding: '32px' }}>
          <Kicker style={{ marginBottom: '20px' }}>Composite risk posture</Kicker>
          <RiskGauge score={gauge.score} label={gauge.label} />
          <div style={{ fontSize: '12px', color: colors.text2, marginTop: '18px', lineHeight: 1.6, textAlign: 'center' }}>{composite}</div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {metrics.map((m: any) => <MetricCard key={m.label} {...m} />)}
        </div>
      </div>

      <Card padded={false}>
        <div style={{ padding: '16px 24px', borderBottom: `0.5px solid ${colors.border}` }}>
          <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill, width: 'fit-content' }}>
            {[
              { id: 'forecast', label: (<span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Icons.IconSparkle size={11} color={tab === 'forecast' ? colors.teal : colors.text2} />Pre-mortem</span>) },
              { id: 'signals', label: 'Live signals' },
              { id: 'rules', label: 'Rules engine' },
              { id: 'disputes', label: 'Disputes' },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)} style={{
                padding: '6px 14px', borderRadius: radius.pill, fontSize: '12px', fontWeight: 500,
                background: tab === t.id ? colors.card : 'transparent',
                color: tab === t.id ? colors.ink : colors.text2,
                border: tab === t.id ? `0.5px solid ${colors.border}` : 'none',
                cursor: 'pointer', fontFamily: typography.family.sans,
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {tab === 'forecast' && <ForecastTab data={forecast} />}

        {tab === 'signals' && (
          <>
            <div style={{ padding: '18px 24px', borderBottom: `0.5px solid ${colors.border}` }}>
              <Kicker style={{ marginBottom: '12px' }}>Anomalies, last 24 hours</Kicker>
              {anomalies.map((a: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '10px 0', borderBottom: i < anomalies.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'flex-start' }}>
                  <div style={{ width: '4px', height: '32px', background: a.severity === 'high' ? colors.ink : a.severity === 'medium' ? colors.text2 : colors.borderHover, borderRadius: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink, marginBottom: '2px' }}>{a.title}</div>
                    <div style={{ fontSize: '11px', color: colors.text2 }}>{a.detail}</div>
                  </div>
                  <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text3 }}>{a.time}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '18px 24px' }}>
              <Kicker style={{ marginBottom: '12px' }}>Scored attempts · the register</Kicker>
              <div style={{ display: 'grid', gridTemplateColumns: '0.6fr 2fr 0.6fr 0.7fr 0.8fr', gap: '16px', padding: '10px 0', borderTop: `0.5px solid ${colors.ink}`, borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <div>N°</div><div>Subject · Signal</div><div>Score</div><div>Hour</div>
                <div style={{ textAlign: 'right' }}>Judgement</div>
              </div>
              {register.map((r: any, i: number) => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '0.6fr 2fr 0.6fr 0.7fr 0.8fr', gap: '16px', padding: '18px 0', borderBottom: i < register.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center' }}>
                  <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: r.score >= 80 ? colors.ink : colors.text3 }}>{r.id}</div>
                  <div>
                    <div style={{ fontSize: '13px', color: colors.ink, fontWeight: 500, marginBottom: '2px' }}>
                      {r.subject}
                      {r.pill && <span style={{ fontFamily: typography.family.mono, fontSize: '10px', letterSpacing: '0.1em', color: colors.teal, border: `0.5px solid ${colors.teal}`, padding: '2px 8px', marginLeft: '8px', borderRadius: radius.pill, textTransform: 'uppercase' }}>{r.pill}</span>}
                    </div>
                    <div style={{ fontSize: '11px', color: colors.text3, lineHeight: 1.5 }}>{r.sub}</div>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: r.score >= 80 ? colors.ink : r.score >= 40 ? colors.text2 : colors.teal, letterSpacing: '-0.015em' }}>{r.score}</div>
                  <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{r.time}</div>
                  <div style={{ textAlign: 'right', fontFamily: typography.family.mono, fontSize: '10px', letterSpacing: '0.1em', color: r.score >= 80 ? colors.ink : colors.text2, textTransform: 'uppercase', fontWeight: 500 }}>{r.verdict}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'rules' && (
          <div style={{ padding: '18px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
              <Kicker>Active rules</Kicker>
              <Button variant="primary" size="sm" icon={<Icons.IconPlus size={12} />} onClick={() => toast.success('Rule builder opened')}>New rule</Button>
            </div>
            {rules.map((r: any, i: number) => (
              <div key={r.name} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.5fr', gap: '16px', padding: '16px 0', borderBottom: i < rules.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', color: colors.ink, fontWeight: 500 }}>{r.name}</div>
                <div style={{ fontSize: '12px', color: colors.text2 }}>{r.triggers.toLocaleString('en-IN')} triggers</div>
                <div style={{ fontSize: '12px', color: colors.text2 }}>{r.blocked.toLocaleString('en-IN')} blocked</div>
                <div style={{ textAlign: 'right' }}>
                  <Pill tone={r.active ? 'teal' : 'neutral'}>{r.active ? 'Active' : 'Inactive'}</Pill>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'disputes' && (
          <div style={{ padding: '18px 24px' }}>
            {/* Sub-tab pill nav */}
            <div style={{ display: 'inline-flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill, border: `0.5px solid ${colors.border}`, marginBottom: '16px' }}>
              {[
                { id: 'list',     label: 'Active disputes', hint: `${disputes.length}` },
                { id: 'evidence', label: 'Evidence uploads', hint: opData?.disputeUploads ? `${opData.disputeUploads.queue.length} in queue` : '…' },
              ].map((t: any) => {
                const active = disputeSubTab === t.id;
                return (
                  <button key={t.id} onClick={() => setDisputeSubTab(t.id)} style={{
                    padding: '7px 16px', borderRadius: radius.pill, fontSize: '12px', fontWeight: active ? 600 : 500,
                    background: active ? 'rgba(28,111,107,0.09)' : 'transparent',
                    color: active ? colors.teal : colors.text2,
                    border: active ? '0.5px solid rgba(28,111,107,0.3)' : '0.5px solid transparent',
                    cursor: 'pointer', fontFamily: typography.family.sans,
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                  }}>
                    <span>{t.label}</span>
                    <span style={{ fontSize: '10px', color: active ? colors.teal : colors.text3, opacity: 0.75, fontFamily: typography.family.mono }}>· {t.hint}</span>
                  </button>
                );
              })}
            </div>

            {disputeSubTab === 'list' && <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', marginBottom: '12px', background: colors.tealTint, borderRadius: radius.md }}>
              <Icons.IconSparkle size={12} color={colors.teal} />
              <div style={{ fontSize: '12px', color: colors.ink, lineHeight: 1.5 }}>
                Click any dispute — Nexora has pre-assembled the evidence package.
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 0.9fr 1.5fr 0.9fr 0.9fr 1fr 0.3fr', gap: '16px', padding: '10px 0', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <div>Dispute</div><div>Txn</div><div>Reason</div><div>Amount</div><div>Evidence by</div><div>Status</div><div></div>
            </div>
            {disputes.map((d: any, i: number) => (
              <div
                key={d.id}
                onClick={() => setSelectedDispute(d)}
                style={{
                  display: 'grid', gridTemplateColumns: '0.9fr 0.9fr 1.5fr 0.9fr 0.9fr 1fr 0.3fr', gap: '16px',
                  padding: '16px 0', borderBottom: i < disputes.length - 1 ? `0.5px solid ${colors.border}` : 'none',
                  alignItems: 'center', fontSize: '13px', cursor: 'pointer', transition: 'background 0.15s',
                  marginLeft: '-24px', marginRight: '-24px', paddingLeft: '24px', paddingRight: '24px',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = colors.bg)}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.ink }}>{d.id}</div>
                <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{d.txn}</div>
                <div style={{ color: colors.ink }}>{d.reason}</div>
                <div style={{ color: colors.ink, fontWeight: 600 }}>{d.amount}</div>
                <div style={{ color: colors.text2 }}>{d.due}</div>
                <div><Pill tone={d.status === 'Won' ? 'teal' : d.status === 'Evidence needed' ? 'outline' : 'neutral'}>{d.status}</Pill></div>
                <div style={{ textAlign: 'right' }}><Icons.IconArrowUpRight size={13} color={colors.text3} /></div>
              </div>
            ))}
            </>}

            {disputeSubTab === 'evidence' && (
              opData?.disputeUploads
                ? <EvidenceUploads data={opData.disputeUploads} active={selectedEvidence || opData.disputeUploads.queue[0]} setActive={setSelectedEvidence} />
                : <PageLoader label="Loading evidence portal" />
            )}
          </div>
        )}
      </Card>

      {selectedDispute && (
        <DisputeEvidenceDrawer
          dispute={selectedDispute}
          evidence={evidenceLib?.evidenceByDispute?.[selectedDispute.id]}
          fallback={evidenceLib?.fallback?.message}
          onClose={() => setSelectedDispute(null)}
        />
      )}
    </div>
  );
}

function ForecastTab({ data }: { data: any }) {
  if (!data) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: colors.text3, fontSize: '13px' }}>
        Loading forecast…
      </div>
    );
  }

  const severityColor = (s: string) => s === 'high' ? colors.ink : s === 'medium' ? colors.text2 : colors.borderHover;

  return (
    <>
      <div style={{ padding: '24px 24px 18px 24px', borderBottom: `0.5px solid ${colors.border}`, background: colors.bg }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icons.IconSparkle size={14} color={colors.teal} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: colors.teal, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '2px' }}>{data.kicker}</div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.01em', marginBottom: '4px' }}>{data.title}</div>
            <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55 }}>{data.subtitle}</div>
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Confidence</div>
            <div style={{ fontSize: '12px', color: colors.ink, fontWeight: 500, marginTop: '2px' }}>{data.confidence}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '6px 24px' }}>
        {data.events.map((e: any, i: number) => (
          <div key={e.id} style={{ padding: '20px 0', borderBottom: i < data.events.length - 1 ? `0.5px solid ${colors.border}` : 'none' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '3px', background: severityColor(e.severity), borderRadius: '2px', alignSelf: 'stretch', minHeight: '40px', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2, fontWeight: 500 }}>{e.when}</span>
                    <Pill tone={e.severity === 'high' ? 'ink' : e.severity === 'medium' ? 'outline' : 'neutral'}>{e.severity}</Pill>
                    <span style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>{e.category}</span>
                  </div>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: colors.ink, marginBottom: '6px', letterSpacing: '-0.005em' }}>{e.title}</div>
                <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.6, marginBottom: '14px' }}>{e.detail}</div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '14px' }}>
                  <div style={{ padding: '12px', background: colors.bg, borderRadius: radius.md }}>
                    <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '8px' }}>Affected merchants</div>
                    {e.affected.map((a: any, j: number) => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', fontSize: '12px' }}>
                        <span style={{ color: colors.ink }}>{a.merchant}</span>
                        <span style={{ fontSize: '10px', color: a.fallbackReady ? colors.teal : colors.text2, fontFamily: typography.family.mono, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
                          {a.fallbackReady ? '✓ READY' : '! REVIEW'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '12px', background: colors.tealTint, borderRadius: radius.md }}>
                    <div style={{ fontSize: '10px', color: colors.teal, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '8px' }}>Recommended</div>
                    {e.actions.map((a: string, j: number) => (
                      <div key={j} style={{ display: 'flex', gap: '6px', padding: '3px 0', fontSize: '12px', color: colors.ink, lineHeight: 1.5 }}>
                        <span style={{ color: colors.teal, flexShrink: 0 }}>·</span>
                        <span>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 24px', borderTop: `0.5px solid ${colors.border}`, background: colors.bg, fontSize: '11px', color: colors.text2, lineHeight: 1.6, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Icons.IconChart size={14} color={colors.text2} />
        {data.historicalMatch}
      </div>
    </>
  );
}

function RiskGauge({ score, label }: { score: number; label: string }) {
  const angle = -138 + (score / 100) * 276;
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg viewBox="0 0 280 260" style={{ width: '100%', maxWidth: '260px' }}>
        <circle cx="140" cy="140" r="110" fill="none" stroke={colors.border} strokeWidth="0.5" />
        <path d="M 38 140 A 102 102 0 0 1 242 140" fill="none" stroke={colors.borderHover} strokeWidth="0.5" />
        {[0, 25, 50, 75, 100].map((v, i) => {
          const a = (-180 + (v / 100) * 180) * (Math.PI / 180);
          const x = 140 + Math.cos(a) * 120;
          const y = 140 + Math.sin(a) * 120;
          return <text key={i} x={x} y={y} fontFamily={typography.family.mono} fontSize="9" fill={colors.text3} textAnchor="middle" dominantBaseline="middle">{v}</text>;
        })}
        <g transform={`rotate(${angle} 140 140)`}>
          <line x1="140" y1="140" x2="140" y2="46" stroke={colors.ink} strokeWidth="1.5" />
          <circle cx="140" cy="140" r="6" fill={colors.ink} />
          <circle cx="140" cy="140" r="3" fill={colors.teal} />
        </g>
        <text x="140" y="195" textAnchor="middle" fontFamily={typography.family.sans} fontSize="56" fontWeight="600" fill={colors.ink} letterSpacing="-0.02em">{score}</text>
        <text x="140" y="220" textAnchor="middle" fontFamily={typography.family.mono} fontSize="10" fill={colors.text2} letterSpacing="3">{label.toUpperCase()}</text>
      </svg>
    </div>
  );
}

function MetricCard({ label, value, sub }: any) {
  return (
    <Card padded style={{ padding: '18px' }}>
      <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: colors.text2 }}>{sub}</div>
    </Card>
  );
}

const iconMap: Record<string, any> = {
  IconInvoice: Icons.IconInvoice, IconLink: Icons.IconLink, IconMail: Icons.IconMail,
  IconShield: Icons.IconShield, IconDownload: Icons.IconDownload, IconUser: Icons.IconUser,
  IconClock: Icons.IconClock,
};

function DisputeEvidenceDrawer({ dispute, evidence, fallback, onClose }: any) {
  const { data: collab } = useAsync(() => configService.getCollaboration(), []);
  const presence = collab?.presence?.[dispute.id] || [];
  const initialComments = collab?.commentsByDispute?.[dispute.id] || [];
  const [comments, setComments] = useState<any[]>(initialComments);
  const [newComment, setNewComment] = useState('');

  // Keep comments in sync when collab data arrives
  React.useEffect(() => {
    if (collab && initialComments.length && comments.length === 0) {
      setComments(initialComments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collab]);

  const sendComment = () => {
    if (!newComment.trim()) return;
    setComments([...comments, {
      id: `c_local_${Date.now()}`,
      author: 'Kavya Venkatesh', initials: 'KV', color: colors.ink,
      time: 'just now',
      text: newComment,
    }]);
    setNewComment('');
    toast.success('Comment posted · 2 others notified');
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '680px', maxWidth: '100%', height: '100%', background: colors.card,
        borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Icons.IconSparkle size={12} color={colors.teal} />
              <Kicker color={colors.teal} style={{ margin: 0 }}>Evidence Autopilot</Kicker>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{dispute.id}</div>
            <div style={{ fontSize: '12px', color: colors.text2, marginTop: '2px' }}>{dispute.reason} · {dispute.amount}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        {/* Collab presence strip */}
        {presence.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 14px', marginBottom: '20px',
            background: colors.bg, border: `0.5px solid ${colors.border}`,
            borderRadius: radius.md,
          }}>
            <div style={{ display: 'flex', marginLeft: '4px' }}>
              {presence.map((p: any, i: number) => (
                <div key={p.id} title={`${p.name} · ${p.status}`} style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: p.color, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 600,
                  marginLeft: i === 0 ? 0 : '-6px',
                  border: `2px solid ${colors.bg}`,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                  position: 'relative',
                }}>{p.initials}
                  <span style={{
                    position: 'absolute', right: '-1px', bottom: '-1px',
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: colors.teal, border: `1.5px solid ${colors.bg}`,
                    animation: 'payze-pulse-dot 2s ease-in-out infinite',
                  }} />
                </div>
              ))}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: colors.ink, fontWeight: 500 }}>
                Viewing with {presence.map((p: any) => p.name.split(' ')[0]).join(' & ')}
              </div>
              <div style={{ fontSize: '10px', color: colors.text3 }}>
                {presence.map((p: any) => p.status).join(' · ')}
              </div>
            </div>
          </div>
        )}

        {dispute.udir && (
          <div style={{ marginBottom: '20px', padding: '16px', border: `0.5px solid ${colors.border}`, borderRadius: radius.md, background: colors.bg }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <Kicker style={{ margin: 0 }}>UDIR · NPCI dispute integration</Kicker>
              <span style={{ fontSize: '9px', color: colors.teal, letterSpacing: '0.08em', fontWeight: 600, padding: '2px 8px', background: 'rgba(28,111,107,0.08)', border: '0.5px solid rgba(28,111,107,0.25)', borderRadius: radius.pill }}>{dispute.udir.rail}</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', color: dispute.udir.status === 'resolved_in_favour' ? colors.teal : '#B48C3C', fontWeight: 500 }}>
                {dispute.udir.status === 'resolved_in_favour' ? '✓ Resolved in customer\'s favour' :
                 dispute.udir.status === 'in_investigation'   ? 'In investigation · NPCI TAT active' : dispute.udir.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '12px 14px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>UDIR reference</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{dispute.udir.ref}</div>
                <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>Raised {dispute.udir.raisedAt}</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>NPCI TAT</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{dispute.udir.tatElapsed} / {dispute.udir.npciTat}</div>
                <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>
                  {dispute.udir.tatRemaining === '—' ? dispute.udir.expectedBy : `${dispute.udir.tatRemaining} remaining`}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Customer PSP</div>
                <div style={{ fontSize: '11px', color: colors.ink }}>{dispute.udir.customerPsp}</div>
              </div>
              <div>
                <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Beneficiary PSP</div>
                <div style={{ fontSize: '11px', color: colors.ink }}>{dispute.udir.beneficiaryPsp}</div>
              </div>
            </div>

            <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>UDIR timeline</div>
            {dispute.udir.timeline.map((t: any, i: number) => {
              const dotColor = t.status === 'done' ? colors.teal : t.status === 'pending' ? '#B48C3C' : colors.text3;
              return (
                <div key={i} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: i < dispute.udir.timeline.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'flex-start' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, marginTop: '5px', flexShrink: 0, opacity: t.status === 'upcoming' ? 0.4 : 1 }} />
                  <div style={{ minWidth: '94px', fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono, marginTop: '1px' }}>{t.at}</div>
                  <div style={{ flex: 1, minWidth: 0, opacity: t.status === 'upcoming' ? 0.6 : 1 }}>
                    <div style={{ fontSize: '12px', color: colors.ink, fontWeight: 500, marginBottom: '2px' }}>{t.event}</div>
                    <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.45 }}>{t.detail}</div>
                  </div>
                </div>
              );
            })}

            {dispute.udir.status === 'in_investigation' && (
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px', paddingTop: '12px', borderTop: `0.5px solid ${colors.border}` }}>
                <Button variant="secondary" size="sm" onClick={() => toast.success('UDIR status refreshed from NPCI')}>Refresh UDIR</Button>
                <Button variant="ghost" size="sm" onClick={() => toast.success('Escalation to NPCI arbitration queued · requires 2-of-3 custodian sign-off')}>Escalate to NPCI</Button>
              </div>
            )}
          </div>
        )}

        {!evidence ? (
          <div style={{ padding: '20px', background: colors.bg, borderRadius: radius.md, fontSize: '13px', color: colors.text2, lineHeight: 1.6, marginBottom: '20px' }}>
            {fallback}
            <div style={{ marginTop: '14px' }}>
              <Button variant="primary" icon={<Icons.IconSparkle size={14} color="#fff" />} onClick={() => toast.success('Nexora is assembling evidence…')}>
                Assemble evidence
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Win probability card */}
            <div style={{ padding: '18px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>Win probability</div>
                <div style={{ fontSize: '11px', color: colors.text3, fontFamily: typography.family.mono }}>Submit by {evidence.submitBy}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
                <div style={{
                  fontSize: '40px', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, fontFamily: typography.family.mono,
                  color: evidence.winProbability >= 60 ? colors.teal : evidence.winProbability >= 40 ? colors.ink : colors.text2,
                }}>{evidence.winProbability}</div>
                <div style={{ fontSize: '14px', color: colors.text3 }}>%</div>
              </div>
              <div style={{ height: '4px', background: 'rgba(26,26,26,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '10px' }}>
                <div style={{
                  width: `${evidence.winProbability}%`, height: '100%',
                  background: evidence.winProbability >= 60 ? colors.teal : evidence.winProbability >= 40 ? colors.ink : colors.text2,
                  borderRadius: '2px',
                }} />
              </div>
              <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.5 }}>{evidence.winProbabilityNote}</div>
              {evidence.recommendation && (
                <div style={{ marginTop: '12px', padding: '10px 12px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, fontSize: '12px', color: colors.ink, lineHeight: 1.55 }}>
                  <span style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nexora's recommendation</span>
                  {evidence.recommendation}
                </div>
              )}
            </div>

            {/* Evidence items */}
            {evidence.items.length > 0 && (
              <>
                <Kicker style={{ marginBottom: '12px' }}>Evidence package · {evidence.items.length} items</Kicker>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                  {evidence.items.map((item: any, i: number) => {
                    const Icon = iconMap[item.icon] || Icons.IconShield;
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '12px',
                        padding: '12px 14px',
                        background: item.attached ? colors.bg : colors.card,
                        border: `0.5px solid ${item.attached ? colors.border : colors.borderHover}`,
                        borderStyle: item.attached ? 'solid' : 'dashed',
                        borderRadius: radius.md,
                      }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: radius.sm,
                          background: item.attached ? colors.card : 'transparent',
                          border: item.attached ? `0.5px solid ${colors.border}` : `0.5px dashed ${colors.borderHover}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Icon size={14} color={item.attached ? colors.ink : colors.text3} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', color: colors.ink, fontWeight: 500, marginBottom: '2px' }}>{item.label}</div>
                          <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.5 }}>{item.sub}</div>
                          <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono, marginTop: '4px' }}>
                            source · {item.source}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {item.attached ? (
                            <Pill tone="teal">✓ attached</Pill>
                          ) : (
                            <Button variant="secondary" size="sm" onClick={() => toast.success(`Fetching ${item.label}…`)}>
                              {item.action || 'Fetch'}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Narrative draft */}
            <Kicker style={{ marginBottom: '10px' }}>Cover narrative · draft</Kicker>
            <div style={{ padding: '14px 16px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px', fontSize: '12px', color: colors.ink, lineHeight: 1.7, fontStyle: 'italic' }}>
              "{evidence.narrativeDraft}"
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {evidence.winProbability >= 20 ? (
                <Button variant="primary" icon={<Icons.IconSend size={14} />} onClick={() => toast.success(`Evidence submitted for ${dispute.id}`)}>
                  Submit to card network
                </Button>
              ) : (
                <Button variant="secondary" disabled>Already submitted</Button>
              )}
              <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('Draft downloaded as PDF')}>
                Download draft PDF
              </Button>
              <Button variant="ghost" onClick={() => toast.success('Narrative copied')} icon={<Icons.IconCopy size={14} />}>
                Copy narrative
              </Button>
            </div>
          </>
        )}

        {/* Comments thread */}
        {presence.length > 0 && (
          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: `0.5px solid ${colors.border}` }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
              <Kicker style={{ margin: 0 }}>Team comments</Kicker>
              <span style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{comments.length} messages</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
              {comments.map((c: any) => (
                <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: c.color || colors.ink, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: 600,
                    flexShrink: 0, marginTop: '2px',
                  }}>{c.initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: colors.ink }}>{c.author}</span>
                      <span style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{c.time}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: colors.ink, lineHeight: 1.55 }}>{c.text}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Composer */}
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: '10px',
              padding: '10px 12px',
              background: colors.bg, border: `0.5px solid ${colors.border}`,
              borderRadius: radius.md,
            }}>
              <div style={{
                width: '24px', height: '24px', borderRadius: '50%',
                background: colors.ink, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 600, flexShrink: 0,
              }}>KV</div>
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment(); } }}
                placeholder="Add a comment… (Enter to post, Shift+Enter for newline)"
                rows={1}
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent', color: colors.ink,
                  fontSize: '12px', fontFamily: 'inherit',
                  resize: 'none', padding: '4px 0', minHeight: '18px', maxHeight: '80px', lineHeight: 1.5,
                }}
              />
              <button
                onClick={sendComment}
                disabled={!newComment.trim()}
                style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: newComment.trim() ? colors.ink : colors.borderHover,
                  color: '#fff', border: 'none',
                  cursor: newComment.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
              >
                <Icons.IconArrowRight size={11} color="#fff" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Evidence Uploads (moved from Settings → Tools) ─────────────────
function EvidenceUploads({ data, active, setActive }: any) {
  const AMBER_LOCAL = '#B48C3C';
  const RED_LOCAL = '#D64545';
  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.queue.map((d: any) => {
            const isCritical = d.status === 'critical';
            const isActive = active?.id === d.id;
            return (
              <button key={d.id} onClick={() => setActive(d)} style={{
                padding: '14px 16px', textAlign: 'left',
                background: isActive ? colors.card : colors.bg,
                border: isActive ? `0.5px solid rgba(28,111,107,0.4)` : `0.5px solid ${colors.border}`,
                borderRadius: radius.md, cursor: 'pointer', fontFamily: 'inherit',
                borderLeft: isCritical ? `3px solid ${RED_LOCAL}` : (isActive ? `3px solid ${colors.teal}` : `3px solid transparent`),
              }}>
                <div style={{ fontSize: '11px', color: colors.text3, fontFamily: typography.family.mono, marginBottom: '3px' }}>{d.id}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, marginBottom: '3px' }}>{d.merchant}</div>
                <div style={{ fontSize: '11px', color: colors.text2, marginBottom: '6px' }}>{d.customer} · {d.amount}</div>
                <div style={{ fontSize: '10px', color: isCritical ? RED_LOCAL : (d.hoursLeft < 48 ? AMBER_LOCAL : colors.text3), fontFamily: typography.family.mono, fontWeight: isCritical ? 700 : 500 }}>
                  {isCritical ? `⚠ ${d.hoursLeft}h left` : `${d.hoursLeft}h left`}
                </div>
              </button>
            );
          })}
        </div>

        {active && (
          <Card padded style={{ padding: '24px 26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <Kicker style={{ marginBottom: '4px' }}>Dispute · {active.id}</Kicker>
                <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.015em' }}>{active.amount}</div>
                <div style={{ fontSize: '12px', color: colors.text2, marginTop: '2px' }}>{active.merchant} · {active.customer}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>Deadline</div>
                <div style={{ fontSize: '12px', color: colors.ink, fontFamily: typography.family.mono }}>{active.deadline}</div>
              </div>
            </div>

            {active.winProbability !== null && (
              <div style={{ padding: '14px 16px', background: active.winProbability >= 60 ? 'rgba(28,111,107,0.06)' : 'rgba(214,69,69,0.05)', border: `0.5px solid ${active.winProbability >= 60 ? 'rgba(28,111,107,0.25)' : 'rgba(214,69,69,0.2)'}`, borderRadius: radius.md, marginBottom: '14px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: active.winProbability >= 60 ? colors.teal : RED_LOCAL, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, fontFamily: typography.family.mono, flexShrink: 0 }}>{active.winProbability}%</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', color: active.winProbability >= 60 ? colors.teal : RED_LOCAL, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Win probability</div>
                  <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55 }}>{active.narrative}</div>
                </div>
              </div>
            )}

            <div style={{ padding: '24px', background: colors.bg, border: `1.5px dashed ${colors.borderHover}`, borderRadius: radius.md, marginBottom: '14px', textAlign: 'center', cursor: 'pointer' }} onClick={() => toast.success('File picker opened')}>
              <Icons.IconFileText size={20} color={colors.text2} />
              <div style={{ fontSize: '12px', color: colors.ink, fontWeight: 500, marginTop: '6px' }}>Drop evidence files here</div>
              <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>PDF · JPG · PNG · CSV up to 10 MB · auto-OCR + categorize</div>
            </div>

            {active.evidenceCollected.length > 0 && (
              <>
                <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Collected · {active.evidenceCollected.length}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  {active.evidenceCollected.map((e: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm }}>
                      <Icons.IconCheck size={14} color={colors.teal} strokeWidth={2.5} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', color: colors.ink, fontWeight: 500 }}>{e.type}</div>
                        <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{e.filename} · {e.size} · uploaded {e.uploadedAt}</div>
                      </div>
                      {e.ocrComplete && <Pill tone="teal">OCR done</Pill>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {active.evidenceMissing.length > 0 && (
              <>
                <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Missing · {active.evidenceMissing.length}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  {active.evidenceMissing.map((e: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(180,140,60,0.06)', border: `0.5px solid rgba(180,140,60,0.25)`, borderRadius: radius.sm }}>
                      <Icons.IconAlert size={14} color={AMBER_LOCAL} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', color: colors.ink, fontWeight: 500 }}>{e.type} {e.required && <span style={{ color: RED_LOCAL, fontSize: '10px', marginLeft: '4px' }}>required</span>}</div>
                        <div style={{ fontSize: '10px', color: colors.text2 }}>{e.hint}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '8px', paddingTop: '14px', borderTop: `0.5px solid ${colors.border}` }}>
              <Button variant="primary" size="sm" disabled={active.evidenceMissing.some((e: any) => e.required)} onClick={() => toast.success('Evidence submitted to acquirer · Visa Resolve Online')}>Submit to acquirer</Button>
              <Button variant="secondary" size="sm" onClick={() => toast.success('Evidence saved as draft')}>Save draft</Button>
              <Button variant="ghost" size="sm" onClick={() => toast.success('Accepted · merchant refunded customer')} style={{ marginLeft: 'auto' }}>Accept & refund</Button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
