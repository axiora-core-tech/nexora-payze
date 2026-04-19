import React from 'react';
import { Link, useParams } from 'react-router';
import { toast } from 'sonner';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { useAsync } from '../../hooks/useAsync';
import { configService, getSession } from '../../services';

const AMBER = '#B48C3C';
const RED   = '#D64545';

export function Dashboard() {
  const params = useParams<{ slug?: string }>();
  const basePath = params.slug ? `/t/${params.slug}` : '/app';
  const { data, loading, error, refetch } = useAsync(() => configService.getDashboard(), []);
  const session = getSession();

  if (error) return <ErrorState message={`Couldn't load dashboard — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading dashboard" />;

  const { header, intelligence, today, platformHealth, complianceAttention, activity, acceptance, routing, topMerchants } = data;
  const firstName = (session?.name || 'there').split(' ')[0];
  const dateLine  = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '22px' }}>
        <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{header.greeting}, {firstName}</Kicker>
        <div style={{ ...typography.pageTitle, color: colors.ink }}>Today · {dateLine}</div>
        <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{header.subtitle}</div>
      </div>

      <IntelligenceStrip insights={intelligence} basePath={basePath} />

      <TodayHero today={today} basePath={basePath} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '16px', marginBottom: '16px' }}>
        <LiveActivity activity={activity} basePath={basePath} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <PlatformHealth health={platformHealth} />
          <ComplianceAttention compliance={complianceAttention} basePath={basePath} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.9fr)', gap: '16px', marginBottom: '16px' }}>
        <Acceptance rows={acceptance} />
        <Routing24h routing={routing} />
      </div>

      <TopMerchantsCard merchants={topMerchants} basePath={basePath} />
    </div>
  );
}

// ── Intelligence strip ───────────────────────────────────────────────
function IntelligenceStrip({ insights, basePath }: any) {
  const toneOf  = (s: string) => s === 'high' ? RED : s === 'opportunity' ? colors.teal : AMBER;
  const labelOf = (s: string) => s === 'high' ? 'Priority' : s === 'opportunity' ? 'Opportunity' : 'Watch';

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.IconSparkle size={11} color={colors.teal} />
        </div>
        <Kicker color={colors.teal} style={{ margin: 0 }}>Nexora · this morning's brief</Kicker>
        <span style={{ fontSize: '11px', color: colors.text3 }}>{insights.length} items · refreshed 4m ago</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${insights.length}, 1fr)`, gap: '12px' }}>
        {insights.map((ins: any, i: number) => {
          const tone = toneOf(ins.severity);
          return (
            <Card key={i} padded={false} style={{ padding: '14px 16px', borderLeft: `3px solid ${tone}`, borderRadius: `0 ${radius.lg} ${radius.lg} 0` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tone }} />
                <span style={{ fontSize: '9px', color: tone, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>{labelOf(ins.severity)}</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, marginBottom: '6px', letterSpacing: '-0.005em', lineHeight: 1.35 }}>{ins.title}</div>
              <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.55, marginBottom: '8px' }}>{ins.detail}</div>
              <Link to={`${basePath}${ins.actionHref}`} style={{ fontSize: '11px', fontWeight: 500, color: colors.ink, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {ins.action} <Icons.IconArrowRight size={11} />
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Today hero ───────────────────────────────────────────────────────
function TodayHero({ today, basePath }: any) {
  const maxBar = Math.max(...today.hourly);

  return (
    <Card padded style={{ padding: '24px 28px', marginBottom: '16px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 2fr', gap: '28px', alignItems: 'stretch' }}>
        {/* Hero number + deltas + projection */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <Kicker style={{ marginBottom: '8px' }}>{today.grossLabel}</Kicker>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
              <span style={{ ...typography.heroNum, color: colors.ink, lineHeight: 1 }}>{today.grossVolume}</span>
            </div>
            <div style={{ display: 'flex', gap: '18px', fontSize: '11px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: colors.text3, fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>vs yesterday</div>
                <div style={{ color: today.deltaVsYesterday.up ? colors.teal : RED, fontWeight: 600, fontFamily: typography.family.mono, fontSize: '13px' }}>
                  {today.deltaVsYesterday.up ? '↗' : '↘'} {today.deltaVsYesterday.value}
                </div>
              </div>
              <div>
                <div style={{ color: colors.text3, fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>vs last week</div>
                <div style={{ color: today.deltaVsLastWeek.up ? colors.teal : RED, fontWeight: 600, fontFamily: typography.family.mono, fontSize: '13px' }}>
                  {today.deltaVsLastWeek.up ? '↗' : '↘'} {today.deltaVsLastWeek.value}
                </div>
              </div>
            </div>
          </div>
          <div style={{ padding: '10px 12px', background: colors.bg, borderRadius: radius.sm, fontSize: '11px', color: colors.text2, lineHeight: 1.5 }}>
            <span style={{ color: colors.text3, fontSize: '9px', letterSpacing: '0.08em', fontWeight: 600 }}>PROJECTED </span>
            {today.projectedEod}
          </div>
        </div>

        {/* Hourly bars + stats */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <Kicker>Volume by hour · IST</Kicker>
              <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>
                Peak <span style={{ color: colors.ink, fontWeight: 600 }}>{today.hourNow}:00</span> · now
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '52px' }}>
              {today.hourly.map((h: number, i: number) => {
                const isNow  = i === today.hourNow;
                const isPast = i <= today.hourNow;
                const fill = isNow ? colors.teal : isPast ? 'rgba(26,26,26,0.55)' : 'rgba(26,26,26,0.1)';
                return <div key={i} style={{ flex: 1, height: `${(h / maxBar) * 100}%`, background: fill, borderRadius: '1.5px', minHeight: '2px' }} />;
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: colors.text3, fontFamily: typography.family.mono, marginTop: '4px' }}>
              <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span>
            </div>
          </div>

          {/* 4 stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
            {today.stats.map((s: any) => (
              <div key={s.label} style={{ padding: '10px 12px', background: colors.bg, borderRadius: radius.sm }}>
                <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.01em' }}>{s.value}</div>
                {s.extra      && <div style={{ fontSize: '10px', color: colors.teal,  marginTop: '2px', fontWeight: 500 }}>{s.extra}</div>}
                {s.extraMuted && <div style={{ fontSize: '10px', color: colors.text2, marginTop: '2px' }}>{s.extraMuted}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ── Live activity ────────────────────────────────────────────────────
function LiveActivity({ activity, basePath }: any) {
  return (
    <Card padded={false}>
      <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: colors.teal, boxShadow: `0 0 0 3px ${colors.tealTintStrong}`, animation: 'payze-pulse-dot 2s ease-in-out infinite' }} />
          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.ink }}>Live activity</div>
        </div>
        <div style={{ fontSize: '11px', color: colors.text3 }}>across all merchants · last 12 min</div>
      </div>
      <div style={{ padding: '0 20px' }}>
        {activity.map((t: any, i: number) => (
          <ActivityRow key={i} {...t} isLast={i === activity.length - 1} />
        ))}
      </div>
      <div style={{ padding: '12px 20px', borderTop: `0.5px solid ${colors.border}`, textAlign: 'center' }}>
        <Link to={`${basePath}/money`} style={{ fontSize: '12px', fontWeight: 500, color: colors.ink, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          Open Money · Payments <Icons.IconArrowUpRight size={12} />
        </Link>
      </div>
    </Card>
  );
}

function ActivityRow({ time, sec, merchant, desc, sub, amount, tone, tag, isLast }: any) {
  const bar         = tone === 'teal'    ? colors.tealTintStrong : tone === 'blocked' ? 'rgba(214,69,69,0.25)' : 'rgba(26,26,26,0.08)';
  const amountColor = tone === 'teal'    ? colors.teal           : tone === 'blocked' ? colors.text2           : colors.ink;
  const tagLabel    = tag === 'routed' ? 'ROUTED' : tag === 'blocked' ? 'FLAGGED' : 'SUCCESS';
  const tagColor    = tag === 'routed' ? colors.teal : tag === 'blocked' ? RED : colors.text3;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '42px' }}>
        <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2, fontWeight: 500 }}>{time}</div>
        <div style={{ fontFamily: typography.family.mono, fontSize: '10px', color: colors.text3 }}>{sec}</div>
      </div>
      <div style={{ width: '3px', height: '34px', background: bar, borderRadius: '2px', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', color: colors.ink, marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ fontWeight: 600 }}>{merchant}</span>
          <span style={{ color: colors.text2 }}> · {desc}</span>
        </div>
        <div style={{ fontSize: '10px', color: colors.text3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: amountColor, textDecoration: tone === 'blocked' ? 'line-through' : 'none', fontFamily: typography.family.mono }}>{amount}</div>
        <div style={{ fontSize: '9px', color: tagColor, marginTop: '1px', fontFamily: typography.family.mono, letterSpacing: '0.08em', fontWeight: 600 }}>{tagLabel}</div>
      </div>
    </div>
  );
}

// ── Platform health ──────────────────────────────────────────────────
function PlatformHealth({ health }: any) {
  const anyDegraded = health.rails.some((r: any) => r.status !== 'healthy');
  return (
    <Card padded>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <Kicker>Platform health</Kicker>
        <span style={{ fontSize: '10px', fontWeight: 600, color: anyDegraded ? AMBER : colors.teal, fontFamily: typography.family.mono, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {anyDegraded ? '1 degraded' : 'All healthy'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '16px', paddingBottom: '12px', borderBottom: `0.5px solid ${colors.border}`, marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Uptime · 30d</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{health.uptime30d}</div>
        </div>
        <div>
          <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Incidents · 90d</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{health.incidents90d}</div>
        </div>
      </div>
      {health.rails.map((r: any, i: number) => {
        const dot = r.status === 'healthy' ? colors.teal : r.status === 'degraded' ? AMBER : RED;
        return (
          <div key={r.name} style={{ padding: '8px 0', borderBottom: i < health.rails.length - 1 ? `0.5px solid ${colors.border}` : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: dot }} />
              <span style={{ fontSize: '11px', color: colors.ink, fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
              <span style={{ fontSize: '10px', color: colors.text2, fontFamily: typography.family.mono, flexShrink: 0 }}>{r.latency}</span>
            </div>
            {r.note && <div style={{ fontSize: '10px', color: AMBER, marginLeft: '14px' }}>{r.note}</div>}
          </div>
        );
      })}
    </Card>
  );
}

// ── Compliance attention ─────────────────────────────────────────────
function ComplianceAttention({ compliance, basePath }: any) {
  return (
    <Card padded>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <Kicker>Compliance attention</Kicker>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.teal, fontFamily: typography.family.mono }}>{compliance.postureScore}</div>
          <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>POSTURE</div>
        </div>
      </div>
      {compliance.items.map((it: any, i: number) => {
        const tone = it.severity === 'high' ? RED : AMBER;
        return (
          <div key={i} style={{ padding: '10px 0', borderBottom: i < compliance.items.length - 1 ? `0.5px solid ${colors.border}` : 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tone, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', color: colors.ink, fontWeight: 500 }}>{it.item}</div>
              <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{it.type}</div>
            </div>
            <div style={{ fontSize: '10px', color: tone, fontWeight: 600, fontFamily: typography.family.mono, textAlign: 'right', flexShrink: 0 }}>{it.dueBy}</div>
          </div>
        );
      })}
      <Link to={`${basePath}/compliance`} style={{ fontSize: '11px', fontWeight: 500, color: colors.ink, display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '10px' }}>
        Open Compliance <Icons.IconArrowRight size={11} />
      </Link>
    </Card>
  );
}

// ── Acceptance by method ─────────────────────────────────────────────
function Acceptance({ rows }: any) {
  return (
    <Card padded>
      <Kicker style={{ marginBottom: '14px' }}>Acceptance by method · today</Kicker>
      {rows.map((m: any, i: number) => {
        const tone = m.rate >= 95 ? colors.teal : m.rate >= 85 ? colors.ink : m.rate >= 75 ? AMBER : RED;
        const trendColor = m.trend.startsWith('+') ? colors.teal : m.trend.startsWith('-') ? RED : colors.text3;
        return (
          <div key={m.name} style={{ padding: '10px 0', borderBottom: i < rows.length - 1 ? `0.5px solid ${colors.border}` : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '5px' }}>
              <span style={{ color: colors.ink, fontWeight: 500 }}>{m.name}</span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'baseline' }}>
                <span style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{m.volumeShare}% of vol</span>
                <span style={{ fontSize: '10px', color: trendColor, fontFamily: typography.family.mono, fontWeight: 500 }}>{m.trend}</span>
                <span style={{ color: tone, fontWeight: 600, fontFamily: typography.family.mono, fontSize: '13px', minWidth: '46px', textAlign: 'right' }}>{m.rate}%</span>
              </div>
            </div>
            <div style={{ height: '4px', background: 'rgba(26,26,26,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${m.rate}%`, height: '100%', background: tone, borderRadius: '2px' }} />
            </div>
          </div>
        );
      })}
    </Card>
  );
}

// ── Routing 24h ─────────────────────────────────────────────────────
function Routing24h({ routing }: any) {
  return (
    <Card padded>
      <Kicker style={{ marginBottom: '12px' }}>Smart routing · last 24 hours</Kicker>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '14px', color: colors.text2 }}>₹</span>
        <span style={{ fontSize: '32px', fontWeight: 600, color: colors.teal, letterSpacing: '-0.02em', fontFamily: typography.family.mono }}>{routing.amount}</span>
      </div>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.5, marginBottom: '16px' }}>{routing.label}</div>
      <div style={{ display: 'flex', gap: '14px', paddingTop: '14px', borderTop: `0.5px solid ${colors.border}` }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>Payments saved</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{routing.payments}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>Median resolution</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{routing.median}</div>
        </div>
      </div>
    </Card>
  );
}

// ── Top merchants ────────────────────────────────────────────────────
function TopMerchantsCard({ merchants, basePath }: any) {
  return (
    <Card padded>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
        <div>
          <Kicker style={{ marginBottom: '2px' }}>Top merchants · today by volume</Kicker>
          <div style={{ fontSize: '12px', color: colors.text2 }}>Live sparkline across the morning</div>
        </div>
        <Link to={`${basePath}/tenants`} style={{ fontSize: '12px', fontWeight: 500, color: colors.ink, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          All 47 merchants <Icons.IconArrowRight size={12} />
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
        {merchants.map((m: any, i: number) => (
          <MerchantTile key={i} {...m} />
        ))}
      </div>
    </Card>
  );
}

function MerchantTile({ initial, name, gmv, change, up, path, plan }: any) {
  return (
    <div style={{ padding: '14px', background: colors.bg, borderRadius: radius.md, position: 'relative', border: `0.5px solid ${colors.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: colors.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600 }}>
          {initial}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 500, color: colors.ink, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        <span style={{ fontSize: '8px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{plan}</span>
      </div>
      <svg viewBox="0 0 100 28" style={{ width: '100%', height: '32px' }} preserveAspectRatio="none">
        {up
          ? <path d={`${path} L 100 28 L 0 28 Z`} fill="rgba(28,111,107,0.08)" />
          : <path d={`${path} L 100 28 L 0 28 Z`} fill="rgba(214,69,69,0.06)" />
        }
        <path d={path} fill="none" stroke={up ? colors.teal : RED} strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{gmv}</div>
        <div style={{ fontSize: '11px', color: up ? colors.teal : RED, fontWeight: 600, fontFamily: typography.family.mono }}>{change}</div>
      </div>
    </div>
  );
}
