import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const iconMap: Record<string, any> = {
  IconEye: Icons.IconEye, IconClock: Icons.IconClock, IconSend: Icons.IconSend,
  IconSettings: Icons.IconSettings, IconTrash: Icons.IconTrash,
};

export function Subscriptions() {
  const { data, loading, error, refetch } = useAsync(() => configService.getSubscriptions(), []);
  const { data: intel } = useAsync(() => configService.getSubIntelligence(), []);
  const [tab, setTab] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [range, setRange] = useState('30d');
  const [actionsFor, setActionsFor] = useState<string | null>(null);
  const [riskOpen, setRiskOpen] = useState<string | null>(null);

  if (error) return <ErrorState message={`Couldn't load subscriptions — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading subscriptions" />;

  const { header, stats, typeTabs, statusFilters, dateRanges, rowActions, subscriptions } = data;
  const riskBySub = intel?.subscriptionRisk || {};

  const filtered = subscriptions.filter((s: any) => {
    if (tab !== 'all' && s.type !== tab) return false;
    if (status !== 'all' && s.status.toLowerCase() !== status) return false;
    return true;
  });

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{header.subtitle}</div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => toast.success('New subscription builder opened')}>New subscription</Button>
      </div>

      {intel && (
        <Card padded={false} style={{ marginBottom: '20px' }}>
          <div style={{ padding: '18px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icons.IconSparkle size={13} color={colors.teal} />
            </div>
            <div style={{ flex: 1 }}>
              <Kicker color={colors.teal} style={{ marginBottom: '4px' }}>{intel.kicker}</Kicker>
              <div style={{ fontSize: '13px', color: colors.ink, lineHeight: 1.55 }}>{intel.summary}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {intel.intelligence.map((i: any, idx: number) => (
              <div key={i.label} style={{
                padding: '16px 20px',
                borderRight: idx < intel.intelligence.length - 1 ? `0.5px solid ${colors.border}` : 'none',
              }}>
                <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>{i.label}</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: i.tone === 'teal' ? colors.teal : colors.ink, letterSpacing: '-0.015em', marginBottom: '4px' }}>{i.value}</div>
                <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.5 }}>{i.sub}</div>
              </div>
            ))}
          </div>
          {intel.mandateRefresh?.length > 0 && (
            <div style={{ padding: '14px 24px', borderTop: `0.5px solid ${colors.border}`, background: colors.bg }}>
              <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Mandates expiring soon</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {intel.mandateRefresh.map((m: any) => (
                  <div key={m.sub} style={{ display: 'grid', gridTemplateColumns: '0.8fr 1fr 0.7fr 1.5fr', gap: '12px', alignItems: 'center', fontSize: '11px', padding: '4px 0' }}>
                    <span style={{ fontFamily: typography.family.mono, color: colors.text2 }}>{m.sub}</span>
                    <span style={{ color: colors.ink, fontWeight: 500 }}>{m.customer}</span>
                    <span style={{ color: colors.text2 }}>expires {m.expires}</span>
                    <span style={{ color: m.fallback ? colors.teal : colors.text2 }}>{m.fallback ? '✓ ' : '! '}{m.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {stats.map((s: any) => <StatCard key={s.label} {...s} />)}
      </div>

      <Card padded={false}>
        <div style={{ padding: '16px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill }}>
            {typeTabs.map((t: any) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '6px 12px', borderRadius: radius.pill, fontSize: '11px', fontWeight: 500,
                background: tab === t.id ? colors.card : 'transparent',
                color: tab === t.id ? colors.ink : colors.text2,
                border: tab === t.id ? `0.5px solid ${colors.border}` : 'none',
                cursor: 'pointer', fontFamily: typography.family.sans,
              }}>{t.label}</button>
            ))}
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} style={selectStyle}>
            {statusFilters.map((s: string) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select value={range} onChange={e => setRange(e.target.value)} style={selectStyle}>
            {dateRanges.map((r: any) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <Button variant="ghost" size="sm" icon={<Icons.IconDownload size={12} />} style={{ marginLeft: 'auto' }} onClick={() => toast.success('CSV downloaded')}>Export</Button>
        </div>

        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '1fr 1.4fr 0.9fr 0.9fr 0.9fr 0.8fr 0.4fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Subscriber</div><div>Plan</div><div>Amount</div><div>Method</div><div>Next charge</div><div>Status</div><div></div>
        </div>

        {filtered.map((s: any, i: number) => (
          <div key={s.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 1.4fr 0.9fr 0.9fr 0.9fr 0.8fr 0.4fr', gap: '16px',
            padding: '16px 24px',
            borderBottom: i < filtered.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            alignItems: 'center', fontSize: '13px',
          }}>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                {s.customer}
                {riskBySub[s.id] && riskBySub[s.id].risk !== 'low' && (
                  <button
                    onClick={() => setRiskOpen(riskOpen === s.id ? null : s.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '1px 7px 1px 5px',
                      background: riskBySub[s.id].risk === 'high' ? 'rgba(26,26,26,0.06)' : 'rgba(26,26,26,0.03)',
                      border: `0.5px solid ${colors.borderHover}`,
                      borderRadius: radius.pill,
                      fontSize: '10px', color: colors.text2, cursor: 'pointer',
                      fontFamily: 'inherit', letterSpacing: '0.05em',
                    }}
                    title="Nexora flagged this mandate"
                  >
                    <Icons.IconSparkle size={9} color={colors.teal} />
                    {riskBySub[s.id].churnProbability}% churn risk
                  </button>
                )}
              </div>
              <div style={{ fontSize: '11px', color: colors.text3 }}>{s.collected} successful collections</div>
            </div>
            <div style={{ color: colors.text2, fontSize: '12px' }}>{s.plan}</div>
            <div style={{ color: colors.ink, fontWeight: 600 }}>{s.amount}</div>
            <div style={{ color: colors.text2, fontSize: '12px' }}>{s.method}</div>
            <div style={{ color: colors.text2 }}>{s.nextCharge}</div>
            <div><Pill tone={s.status === 'Active' ? 'teal' : s.status === 'Paused' ? 'outline' : 'neutral'}>{s.status}</Pill></div>
            <div style={{ textAlign: 'right', position: 'relative' }}>
              <button onClick={() => setActionsFor(actionsFor === s.id ? null : s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text3, padding: '4px' }}>
                <Icons.IconSettings size={14} />
              </button>
              {actionsFor === s.id && (
                <>
                  <div onClick={() => setActionsFor(null)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, boxShadow: colors.shadowMd, minWidth: '160px', zIndex: 50, padding: '6px' }}>
                    {rowActions.filter((a: any) => {
                      if (a.label === 'Pause') return s.status !== 'Paused';
                      if (a.label === 'Resume') return s.status === 'Paused';
                      return true;
                    }).map((a: any) => {
                      const IconComp = iconMap[a.icon] || Icons.IconSettings;
                      return (
                        <button key={a.label} onClick={() => { toast.success(`${a.label}: ${s.id}`); setActionsFor(null); }} style={{
                          display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px',
                          background: 'transparent', border: 'none', borderRadius: radius.sm,
                          fontSize: '12px', color: colors.ink, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                        }}>
                          <IconComp size={12} color={colors.text2} />
                          {a.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </Card>

      {riskOpen && riskBySub[riskOpen] && (
        <SubscriptionRiskDrawer
          sub={subscriptions.find((s: any) => s.id === riskOpen)}
          risk={riskBySub[riskOpen]}
          onClose={() => setRiskOpen(null)}
        />
      )}
    </div>
  );
}

function SubscriptionRiskDrawer({ sub, risk, onClose }: any) {
  const tone = risk.risk === 'high' ? 'outline' : risk.risk === 'medium' ? 'outline' : 'teal';
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '520px', maxWidth: '100%', height: '100%', background: colors.card,
        borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Icons.IconSparkle size={12} color={colors.teal} />
              <Kicker color={colors.teal} style={{ margin: 0 }}>Churn intelligence</Kicker>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{sub.id}</div>
            <div style={{ fontSize: '12px', color: colors.text2, marginTop: '2px' }}>{sub.customer} · {sub.plan}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        <div style={{ padding: '18px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>Churn probability</div>
            <Pill tone={tone}>{risk.risk} risk</Pill>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
            <div style={{ fontSize: '40px', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1, fontFamily: typography.family.mono, color: colors.ink }}>{risk.churnProbability}</div>
            <div style={{ fontSize: '14px', color: colors.text3 }}>%</div>
          </div>
          <div style={{ height: '4px', background: 'rgba(26,26,26,0.08)', borderRadius: '2px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${risk.churnProbability}%`, height: '100%', background: colors.ink, borderRadius: '2px' }} />
          </div>
          <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55 }}>{risk.reason}</div>
        </div>

        <Kicker style={{ marginBottom: '10px' }}>Signals</Kicker>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
          {risk.signals.map((s: string, i: number) => (
            <div key={i} style={{ display: 'flex', gap: '8px', padding: '8px 12px', background: colors.bg, borderRadius: radius.sm, fontSize: '12px', color: colors.ink, lineHeight: 1.5 }}>
              <span style={{ color: colors.text3, flexShrink: 0 }}>·</span>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div style={{ padding: '14px 16px', background: colors.tealTint, borderRadius: radius.md, marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', color: colors.teal, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>Recommended action</div>
          <div style={{ fontSize: '13px', color: colors.ink, lineHeight: 1.6 }}>{risk.action}</div>
        </div>

        {risk.template && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="primary" icon={<Icons.IconSend size={14} />} onClick={() => toast.success(`Retention offer sent using template: ${risk.template}`)}>
              Send retention offer
            </Button>
            <Button variant="secondary" onClick={() => toast.success('Campaign saved for batch send')}>Save for batch</Button>
            <Button variant="ghost" onClick={() => toast.success('Dismissed — won\'t surface again this cycle')}>Dismiss</Button>
          </div>
        )}
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

const selectStyle: React.CSSProperties = {
  padding: '6px 10px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill,
  fontSize: '12px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
};
