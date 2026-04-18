import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

export function Analytics() {
  const { data, loading, error, refetch } = useAsync(() => configService.getAnalytics(), []);
  const [tab, setTab] = useState<string>('overview');
  const [range, setRange] = useState('30d');

  if (error) return <ErrorState message={`Couldn't load analytics — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading analytics" />;

  const { header, dateRanges, tabs, metrics, volumeChart, methods, geography, cohorts, funnel, funnelNarrative } = data;

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{header.subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={range} onChange={e => setRange(e.target.value)} style={{ padding: '8px 14px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '12px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit' }}>
            {dateRanges.map((r: any) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <Button variant="secondary" icon={<Icons.IconMail size={14} />} onClick={() => toast.success('Report scheduled weekly')}>Schedule</Button>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('CSV exported')}>Export</Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill, width: 'fit-content', marginBottom: '20px' }}>
        {tabs.map((t: any) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '6px 14px', borderRadius: radius.pill, fontSize: '12px', fontWeight: 500,
            background: tab === t.id ? colors.card : 'transparent',
            color: tab === t.id ? colors.ink : colors.text2,
            border: tab === t.id ? `0.5px solid ${colors.border}` : 'none',
            cursor: 'pointer', fontFamily: typography.family.sans,
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {metrics.map((m: any) => <MetricTile key={m.label} {...m} />)}
          </div>

          <Card padded style={{ padding: '32px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <div>
                <Kicker style={{ marginBottom: '4px' }}>{volumeChart.title}</Kicker>
                <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>{volumeChart.total}</div>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '2px', background: colors.ink }} /><span style={{ color: colors.text2 }}>This period</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '1px', borderTop: `1px dashed ${colors.text3}` }} /><span style={{ color: colors.text2 }}>Previous</span></div>
              </div>
            </div>
            <svg viewBox="0 0 800 260" style={{ width: '100%', height: '260px' }} preserveAspectRatio="none">
              {[0, 1, 2, 3, 4].map(i => <line key={i} x1="0" y1={i * 50 + 20} x2="800" y2={i * 50 + 20} stroke={colors.border} strokeWidth="0.5" />)}
              <path d={volumeChart.previous} fill="none" stroke={colors.text3} strokeWidth="1" strokeDasharray="4,4" />
              <path d={volumeChart.current} fill="none" stroke={colors.ink} strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="780" cy="5" r="4" fill={colors.teal} />
            </svg>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Card padded>
              <Kicker style={{ marginBottom: '18px' }}>Top payment methods</Kicker>
              {methods.map((m: any) => (
                <div key={m.name} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ color: colors.ink, fontWeight: 500 }}>{m.name}</span>
                    <span style={{ color: colors.text2 }}>{m.volume} <span style={{ color: colors.text3 }}>· {m.share}%</span></span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(26,26,26,0.06)', borderRadius: '2px' }}>
                    <div style={{ width: `${m.share}%`, height: '100%', background: colors.ink, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </Card>
            <Card padded>
              <Kicker style={{ marginBottom: '18px' }}>By geography</Kicker>
              {geography.map((g: any) => (
                <div key={g.name} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ color: colors.ink, fontWeight: 500 }}>{g.name}</span>
                    <span style={{ color: colors.text2 }}>{g.volume} <span style={{ color: colors.text3 }}>· {g.share}%</span></span>
                  </div>
                  <div style={{ height: '4px', background: 'rgba(26,26,26,0.06)', borderRadius: '2px' }}>
                    <div style={{ width: `${g.share}%`, height: '100%', background: colors.ink, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </Card>
          </div>
        </>
      )}

      {tab === 'cohorts' && (
        <Card padded style={{ padding: '32px' }}>
          <Kicker style={{ marginBottom: '18px' }}>Customer cohorts · retention by signup month</Kicker>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Cohort</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>Size</th>
                  {['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map(m => (
                    <th key={m} style={{ textAlign: 'center', padding: '10px 12px', fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, fontFamily: typography.family.mono }}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cohorts.map((c: any) => (
                  <tr key={c.month} style={{ borderTop: `0.5px solid ${colors.border}` }}>
                    <td style={{ padding: '10px 12px', color: colors.ink, fontWeight: 500 }}>{c.month}</td>
                    <td style={{ padding: '10px 12px', color: colors.text2, fontFamily: typography.family.mono }}>{c.size}</td>
                    {c.retention.map((r: number | null, i: number) => (
                      <td key={i} style={{ padding: '10px 12px', textAlign: 'center' }}>
                        {r === null ? <span style={{ color: colors.text3 }}>—</span> : (
                          <span style={{ display: 'inline-block', padding: '4px 8px', background: `rgba(28,111,107,${r / 150})`, borderRadius: radius.sm, fontSize: '11px', fontFamily: typography.family.mono, color: r >= 80 ? '#fff' : colors.ink, fontWeight: 500 }}>
                            {r}%
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === 'funnels' && (
        <Card padded style={{ padding: '32px' }}>
          <Kicker style={{ marginBottom: '20px' }}>Checkout funnel · all merchants, last 30 days</Kicker>
          {funnel.map((s: any, i: number) => (
            <div key={s.stage} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <div>
                  <span style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text3, marginRight: '10px' }}>0{i + 1}</span>
                  <span style={{ color: colors.ink, fontWeight: 500 }}>{s.stage}</span>
                </div>
                <span style={{ color: colors.text2, fontFamily: typography.family.mono }}>
                  {s.count.toLocaleString('en-IN')} · <span style={{ color: colors.ink, fontWeight: 600 }}>{s.pct}%</span>
                </span>
              </div>
              <div style={{ height: '28px', background: 'rgba(26,26,26,0.04)', borderRadius: radius.sm, overflow: 'hidden' }}>
                <div style={{ width: `${s.pct}%`, height: '100%', background: i === funnel.length - 1 ? colors.teal : colors.ink, borderRadius: radius.sm }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: '20px', padding: '16px', background: colors.bg, borderRadius: radius.md, fontSize: '12px', color: colors.text2, lineHeight: 1.6 }}>
            {funnelNarrative}
          </div>
        </Card>
      )}
    </div>
  );
}

function MetricTile({ label, value, change, up }: any) {
  return (
    <Card padded style={{ padding: '18px' }}>
      <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: '11px', fontWeight: 500, color: up ? colors.teal : colors.text2, marginTop: '4px' }}>{up ? '↗' : '↘'} {change}</div>
    </Card>
  );
}
