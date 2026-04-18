import React from 'react';
import { useParams } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

export function Dashboard() {
  const params = useParams<{ slug?: string }>();
  const basePath = params.slug ? `/t/${params.slug}` : '/app';
  const { data, loading, error, refetch } = useAsync(() => configService.getDashboard(), []);

  if (error) return <ErrorState message={`Couldn't load dashboard — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading dashboard" />;

  const { header, balance, activity, acceptance, routing, topMerchants } = data;
  const accentIdx = balance.amount.lastIndexOf(balance.accentDigits);
  const amountBefore = balance.amount.slice(0, accentIdx);

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px' }}>
        <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{header.kicker}</Kicker>
        <div style={{ ...typography.pageTitle, color: colors.ink }}>{header.title}</div>
        <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{header.subtitle}</div>
      </div>

      <Card padded style={{ padding: '32px', marginBottom: '20px' }}>
        <Kicker style={{ marginBottom: '16px' }}>{balance.label}</Kicker>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '22px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '32px', color: colors.text2, fontWeight: 400 }}>{balance.currency}</span>
          <span style={{ ...typography.heroNum, color: colors.ink }}>
            {amountBefore}<span style={{ color: colors.teal }}>{balance.accentDigits}</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '28px', paddingTop: '18px', borderTop: `0.5px solid ${colors.border}`, flexWrap: 'wrap' }}>
          {balance.supportingStats.map((s: any, i: number) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div style={{ width: '0.5px', background: colors.border }} />}
              <div>
                <div style={{ color: colors.text3, fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>{s.label}</div>
                <div style={{ color: colors.ink, fontSize: '15px', fontWeight: 600 }}>
                  {s.value}{' '}
                  {s.extra && <span style={{ color: colors.teal, fontWeight: 500, fontSize: '12px' }}>{s.extra}</span>}
                  {s.extraMuted && <span style={{ color: colors.text2, fontSize: '12px', fontWeight: 400 }}>{s.extraMuted}</span>}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: `0.5px solid ${colors.border}`, display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Kicker style={{ fontSize: '10px' }}>{balance.trendLabel}</Kicker>
          <div style={{ flex: 1, display: 'flex', gap: '3px', alignItems: 'flex-end', height: '32px' }}>
            {balance.trendBars.map((h: number, i: number) => (
              <div key={i} style={{
                flex: 1, borderRadius: '1.5px', height: `${h}%`,
                background: i === balance.trendBars.length - 2 ? 'rgba(28,111,107,0.5)' : i === balance.trendBars.length - 1 ? colors.teal : 'rgba(26,26,26,0.12)',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: colors.teal }}>{balance.trendChange}</span>
            <span style={{ fontSize: '11px', color: colors.text3 }}>{balance.trendRange}</span>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)', gap: '20px', marginBottom: '20px' }}>
        <Card padded={false}>
          <div style={{ padding: '20px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: colors.teal, boxShadow: `0 0 0 3px ${colors.tealTintStrong}`, animation: 'payze-pulse-dot 2s ease-in-out infinite' }} />
              <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>Live activity</div>
              <div style={{ fontSize: '12px', color: colors.text2 }}>across all merchants</div>
            </div>
            <div style={{ fontSize: '12px', color: colors.text2 }}>last 12 minutes</div>
          </div>
          <div style={{ padding: '4px 24px' }}>
            {activity.map((t: any, i: number) => (
              <ActivityRow key={i} {...t} isLast={i === activity.length - 1} />
            ))}
          </div>
          <div style={{ padding: '14px 24px', borderTop: `0.5px solid ${colors.border}`, textAlign: 'center' }}>
            <a href={`${basePath}/transactions`} style={{ fontSize: '12px', fontWeight: 500, color: colors.ink, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              See the full ledger <Icons.IconArrowUpRight size={12} />
            </a>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Card padded>
            <Kicker style={{ marginBottom: '14px' }}>Acceptance by method</Kicker>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {acceptance.map((m: any) => (
                <div key={m.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: colors.ink, fontWeight: 500 }}>{m.name}</span>
                    <span style={{ color: colors.ink, fontWeight: 600 }}>{m.rate}%</span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(26,26,26,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${m.rate}%`, height: '100%', background: colors.ink, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padded>
            <Kicker style={{ marginBottom: '12px' }}>Routing, last 24 hours</Kicker>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', color: colors.text2 }}>₹</span>
              <span style={{ fontSize: '28px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em' }}>{routing.amount}</span>
            </div>
            <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.5 }}>
              <span style={{ color: colors.ink, fontWeight: 600 }}>{routing.payments}</span> routed via fallback · median resolution <span style={{ color: colors.ink, fontWeight: 600 }}>{routing.median}</span>
            </div>
          </Card>
        </div>
      </div>

      <Card padded>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '18px' }}>
          <div>
            <Kicker style={{ marginBottom: '4px' }}>Top merchants · today</Kicker>
            <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>By volume, live</div>
          </div>
          <a href={`${basePath}/tenants`} style={{ fontSize: '12px', fontWeight: 500, color: colors.ink }}>All 47 merchants →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          {topMerchants.map((m: any, i: number) => (
            <MerchantTile key={i} {...m} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function ActivityRow({ time, sec, merchant, desc, sub, amount, tone, tag, isLast }: any) {
  const bar = tone === 'teal' ? colors.tealTintStrong : tone === 'blocked' ? 'rgba(26,26,26,0.25)' : 'rgba(26,26,26,0.1)';
  const amountColor = tone === 'teal' ? colors.teal : tone === 'blocked' ? colors.text2 : colors.ink;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}` }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '46px' }}>
        <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2, fontWeight: 500 }}>{time}</div>
        <div style={{ fontFamily: typography.family.mono, fontSize: '10px', color: colors.text3 }}>{sec}</div>
      </div>
      <div style={{ width: '4px', height: '40px', background: bar, borderRadius: '2px', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', color: colors.ink, marginBottom: '2px' }}>
          <span style={{ fontWeight: 600 }}>{merchant}</span>{' '}
          <span style={{ color: colors.text2 }}>· {desc}</span>
          {tag === 'blocked' && (
            <span style={{ fontFamily: typography.family.mono, fontSize: '10px', letterSpacing: '0.08em', color: colors.text2, textTransform: 'uppercase', marginLeft: '6px', textDecoration: 'underline' }}>BLOCKED</span>
          )}
        </div>
        <div style={{ fontSize: '11px', color: colors.text3 }}>{sub}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: amountColor, textDecoration: tone === 'blocked' ? 'line-through' : 'none' }}>{amount}</div>
        <div style={{ fontSize: '10px', color: tone === 'teal' ? colors.teal : colors.text3, marginTop: '2px', fontFamily: tone === 'teal' ? typography.family.mono : undefined, letterSpacing: tone === 'teal' ? '0.08em' : 'normal', textTransform: tone === 'teal' ? 'uppercase' : 'none' }}>
          {tone === 'teal' ? 'ROUTED' : tone === 'blocked' ? 'flagged · risk' : 'succeeded'}
        </div>
      </div>
    </div>
  );
}

function MerchantTile({ initial, name, gmv, change, up, path }: any) {
  return (
    <div style={{ padding: '14px', background: colors.bg, borderRadius: radius.md }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: colors.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600 }}>
          {initial}
        </div>
        <div style={{ fontSize: '12px', fontWeight: 500, color: colors.ink }}>{name}</div>
      </div>
      <svg viewBox="0 0 100 28" style={{ width: '100%', height: '28px' }} preserveAspectRatio="none">
        <path d={path} fill="none" stroke={up ? colors.teal : colors.text2} strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>{gmv}</div>
        <div style={{ fontSize: '10px', color: up ? colors.teal : colors.text2, fontWeight: 500 }}>{change}</div>
      </div>
    </div>
  );
}
