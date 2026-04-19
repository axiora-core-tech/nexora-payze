import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState, SectionTabs } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const AMBER = '#B48C3C';
const RED   = '#D64545';

export function Analytics() {
  const { data, loading, error, refetch } = useAsync(() => configService.getAnalytics(), []);
  const [tab, setTab] = useState<string>('overview');
  const [range, setRange] = useState('30d');

  if (error) return <ErrorState message={`Couldn't load analytics — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading analytics" />;

  const { header, dateRanges, tabs, intelligence, metrics, volumeChart,
    concentration, hourHeatmap, methodMatrix, geography, benchmarks,
    funnel, funnelNarrative, funnelByMethod,
    cohorts, revenueRetention } = data;

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{header.subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={range} onChange={e => setRange(e.target.value)} style={{ padding: '8px 14px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '12px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit' }}>
            {dateRanges.map((r: any) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <Button variant="secondary" icon={<Icons.IconMail size={14} />} onClick={() => toast.success('Weekly report scheduled')}>Schedule</Button>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('CSV exported')}>Export</Button>
        </div>
      </div>

      <IntelligenceStrip insights={intelligence} />

      <SectionTabs active={tab} onChange={setTab} tabs={tabs} />

      {tab === 'overview' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', marginBottom: '20px' }}>
            {metrics.map((m: any) => <SparklineTile key={m.label} {...m} />)}
          </div>

          <Card padded style={{ padding: '28px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <div>
                <Kicker style={{ marginBottom: '4px' }}>{volumeChart.title}</Kicker>
                <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{volumeChart.total}</div>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '2px', background: colors.ink }} /><span style={{ color: colors.text2 }}>This period</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '1px', borderTop: `1px dashed ${colors.text3}` }} /><span style={{ color: colors.text2 }}>Previous</span></div>
              </div>
            </div>
            <svg viewBox="0 0 800 260" style={{ width: '100%', height: '240px' }} preserveAspectRatio="none">
              {[0, 1, 2, 3, 4].map(i => <line key={i} x1="0" y1={i * 50 + 20} x2="800" y2={i * 50 + 20} stroke={colors.border} strokeWidth="0.5" />)}
              <path d={volumeChart.previous} fill="none" stroke={colors.text3} strokeWidth="1" strokeDasharray="4,4" />
              <path d={volumeChart.current} fill="none" stroke={colors.ink} strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="780" cy="5" r="4" fill={colors.teal} />
            </svg>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <ConcentrationCard data={concentration} />
            <HourHeatmap data={hourHeatmap} />
          </div>

          <Card padded>
            <Kicker style={{ marginBottom: '18px' }}>Geography · by tier and region</Kicker>
            {geography.map((g: any, i: number) => (
              <div key={g.name} style={{ padding: '12px 0', borderBottom: i < geography.length - 1 ? `0.5px solid ${colors.border}` : 'none' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.5fr', gap: '16px', alignItems: 'baseline', marginBottom: '6px' }}>
                  <div>
                    <div style={{ color: colors.ink, fontWeight: 500, fontSize: '13px', marginBottom: '2px' }}>{g.name}</div>
                    <div style={{ fontSize: '11px', color: colors.text3 }}>{g.cities}</div>
                  </div>
                  <div style={{ color: colors.ink, fontFamily: typography.family.mono, fontSize: '12px', fontWeight: 500, textAlign: 'right' }}>{g.volume}</div>
                  <div style={{ color: g.growth.startsWith('+') ? colors.teal : g.growth.startsWith('-') ? RED : colors.text2, fontFamily: typography.family.mono, fontSize: '11px', fontWeight: 500, textAlign: 'right' }}>{g.growth}</div>
                </div>
                <div style={{ height: '4px', background: 'rgba(26,26,26,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${g.share}%`, height: '100%', background: colors.ink, borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </Card>
        </>
      )}

      {tab === 'performance' && (
        <>
          <Card padded style={{ marginBottom: '20px' }}>
            <Kicker style={{ marginBottom: '14px' }}>Method matrix · success, dispute, ticket size</Kicker>
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 1fr 0.9fr 0.9fr 0.9fr 2fr', gap: '14px', padding: '8px 0', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
              <div>Method</div>
              <div style={{ textAlign: 'right' }}>Share</div>
              <div style={{ textAlign: 'right' }}>Volume</div>
              <div style={{ textAlign: 'right' }}>Success</div>
              <div style={{ textAlign: 'right' }}>Avg ticket</div>
              <div style={{ textAlign: 'right' }}>Dispute</div>
              <div>Note</div>
            </div>
            {methodMatrix.map((m: any, i: number) => (
              <div key={m.method} style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.7fr 1fr 0.9fr 0.9fr 0.9fr 2fr', gap: '14px', padding: '14px 0', borderBottom: i < methodMatrix.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
                <div style={{ color: colors.ink, fontWeight: 500 }}>{m.method}</div>
                <div style={{ textAlign: 'right', color: colors.text2, fontFamily: typography.family.mono }}>{m.share}%</div>
                <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 500 }}>{m.volume}</div>
                <div style={{ textAlign: 'right' }}>
                  <SuccessBadge value={m.successRate} />
                </div>
                <div style={{ textAlign: 'right', color: colors.text2, fontFamily: typography.family.mono }}>{m.avgTicket}</div>
                <div style={{ textAlign: 'right', color: m.disputeRate > 0.5 ? RED : m.disputeRate > 0.2 ? AMBER : colors.text2, fontFamily: typography.family.mono }}>{m.disputeRate.toFixed(2)}%</div>
                <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.45 }}>{m.note}</div>
              </div>
            ))}
          </Card>

          <Card padded style={{ marginBottom: '20px' }}>
            <Kicker style={{ marginBottom: '18px' }}>Checkout funnel · all merchants</Kicker>
            {funnel.map((s: any, i: number) => (
              <div key={s.stage} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <div>
                    <span style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text3, marginRight: '10px' }}>0{i + 1}</span>
                    <span style={{ color: colors.ink, fontWeight: 500 }}>{s.stage}</span>
                  </div>
                  <span style={{ color: colors.text2, fontFamily: typography.family.mono, fontSize: '12px' }}>
                    {s.count.toLocaleString('en-IN')} · <span style={{ color: colors.ink, fontWeight: 600 }}>{s.pct}%</span>
                  </span>
                </div>
                <div style={{ height: '24px', background: 'rgba(26,26,26,0.04)', borderRadius: radius.sm, overflow: 'hidden' }}>
                  <div style={{ width: `${s.pct}%`, height: '100%', background: i === funnel.length - 1 ? colors.teal : colors.ink, borderRadius: radius.sm }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: '20px', padding: '14px 16px', background: 'rgba(28,111,107,0.06)', border: `0.5px solid rgba(28,111,107,0.25)`, borderRadius: radius.md, fontSize: '12px', color: colors.ink, lineHeight: 1.6 }}>
              <span style={{ color: colors.teal, fontWeight: 600 }}>Routing saves ₹3.82 Cr </span> · {funnelNarrative}
            </div>
          </Card>

          <Card padded style={{ marginBottom: '20px' }}>
            <Kicker style={{ marginBottom: '14px' }}>Funnel by method · final conversion</Kicker>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 0.8fr', gap: '10px', padding: '8px 0', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
              <div>Method</div>
              <div style={{ textAlign: 'right' }}>Init</div>
              <div style={{ textAlign: 'right' }}>Selected</div>
              <div style={{ textAlign: 'right' }}>To bank</div>
              <div style={{ textAlign: 'right' }}>Succ 1st</div>
              <div style={{ textAlign: 'right' }}>Succ after</div>
              <div style={{ textAlign: 'right' }}>Final</div>
            </div>
            {funnelByMethod.map((f: any, i: number) => {
              const convColor = f.convFinal >= 90 ? colors.teal : f.convFinal >= 70 ? colors.ink : f.convFinal >= 50 ? AMBER : RED;
              return (
                <div key={f.method} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 0.8fr', gap: '10px', padding: '11px 0', borderBottom: i < funnelByMethod.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '11px', fontFamily: typography.family.mono }}>
                  <div style={{ color: colors.ink, fontWeight: 500, fontFamily: typography.family.sans }}>{f.method}</div>
                  <div style={{ textAlign: 'right', color: colors.text2 }}>{f.init.toLocaleString('en-IN')}</div>
                  <div style={{ textAlign: 'right', color: colors.text2 }}>{f.selected.toLocaleString('en-IN')}</div>
                  <div style={{ textAlign: 'right', color: colors.text2 }}>{f.sentToBank.toLocaleString('en-IN')}</div>
                  <div style={{ textAlign: 'right', color: colors.text2 }}>{f.succeededFirst.toLocaleString('en-IN')}</div>
                  <div style={{ textAlign: 'right', color: colors.ink, fontWeight: 600 }}>{f.succeededAfter.toLocaleString('en-IN')}</div>
                  <div style={{ textAlign: 'right', color: convColor, fontWeight: 600, fontSize: '12px' }}>{f.convFinal}%</div>
                </div>
              );
            })}
          </Card>

          <Card padded>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '14px' }}>
              <Kicker>Benchmarks · Payze vs industry</Kicker>
              <div style={{ fontSize: '11px', color: colors.text2, maxWidth: '380px', textAlign: 'right', lineHeight: 1.5 }}>{benchmarks.summary}</div>
            </div>
            {benchmarks.metrics.map((b: any, i: number) => <BenchmarkBar key={b.name} {...b} isLast={i === benchmarks.metrics.length - 1} />)}
          </Card>
        </>
      )}

      {tab === 'customers' && (
        <>
          <Card padded style={{ marginBottom: '20px' }}>
            <Kicker style={{ marginBottom: '18px' }}>Cohort retention · % of signup cohort active by month</Kicker>
            <CohortTable cohorts={cohorts} valueType="pct" />
          </Card>

          <Card padded style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px', gap: '14px', flexWrap: 'wrap' }}>
              <Kicker>Revenue retention · NRR by cohort</Kicker>
              <div style={{ display: 'flex', gap: '18px', fontSize: '11px', color: colors.text2, fontFamily: typography.family.mono }}>
                <span>GRR target <span style={{ color: colors.ink, fontWeight: 600 }}>{revenueRetention.grrTarget}%</span></span>
                <span>NRR target <span style={{ color: colors.ink, fontWeight: 600 }}>{revenueRetention.nrrTarget}%</span></span>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '16px', lineHeight: 1.55 }}>{revenueRetention.summary}</div>
            <CohortTable cohorts={revenueRetention.cohorts.map((c: any) => ({ month: c.month, retention: c.nrr }))} valueType="nrr" />
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <LtvTile label="Average LTV · 12m"  value={revenueRetention.ltv.average12m} sub="blended across all merchants" />
            <LtvTile label="Top decile LTV · 12m" value={revenueRetention.ltv.top1Decile}  sub="best 10% of customers" />
            <LtvTile label="Payback period"       value={`${revenueRetention.ltv.paybackMonths} mo`} sub="CAC / gross margin per month" />
          </div>
        </>
      )}
    </div>
  );
}

// ── Intelligence strip ───────────────────────────────────────────────
function IntelligenceStrip({ insights }: { insights: any[] }) {
  const toneOf = (s: string) => s === 'high' ? RED : s === 'opportunity' ? colors.teal : AMBER;
  const labelOf = (s: string) => s === 'high' ? 'Alert' : s === 'opportunity' ? 'Opportunity' : 'Watch';

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icons.IconSparkle size={11} color={colors.teal} />
        </div>
        <Kicker color={colors.teal} style={{ margin: 0 }}>Nexora intelligence</Kicker>
        <span style={{ fontSize: '11px', color: colors.text3 }}>{insights.length} items surfaced this week</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${insights.length}, 1fr)`, gap: '12px' }}>
        {insights.map((ins: any, i: number) => {
          const tone = toneOf(ins.severity);
          return (
            <Card key={i} padded={false} style={{ padding: '16px 18px', borderLeft: `3px solid ${tone}`, borderRadius: `0 ${radius.lg} ${radius.lg} 0` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: tone }} />
                <span style={{ fontSize: '10px', color: tone, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>{labelOf(ins.severity)}</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, marginBottom: '6px', letterSpacing: '-0.005em', lineHeight: 1.35 }}>{ins.title}</div>
              <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.55, marginBottom: '10px' }}>{ins.detail}</div>
              <Button variant="ghost" size="sm" onClick={() => toast.success(`Opening ${ins.action.toLowerCase()}…`)}>{ins.action} →</Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Metric tile with sparkline ───────────────────────────────────────
function SparklineTile({ label, value, change, up, sparkline }: any) {
  const min = Math.min(...sparkline);
  const max = Math.max(...sparkline);
  const range = max - min || 1;
  const w = 100, h = 24;
  const points = sparkline.map((v: number, i: number) => {
    const x = (i / (sparkline.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y.toFixed(1)}`;
  }).join(' ');
  const lastX = w;
  const lastY = h - ((sparkline[sparkline.length - 1] - min) / range) * h;

  return (
    <Card padded style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', marginBottom: '2px', fontFamily: typography.family.mono }}>{value}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
        <span style={{ fontSize: '10px', fontWeight: 500, color: up ? colors.teal : RED, fontFamily: typography.family.mono }}>{up ? '↗' : '↘'} {change}</span>
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
          <polyline points={points} fill="none" stroke={up ? colors.teal : RED} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={lastX} cy={lastY.toFixed(1)} r="2" fill={up ? colors.teal : RED} />
        </svg>
      </div>
    </Card>
  );
}

// ── Concentration card ───────────────────────────────────────────────
function ConcentrationCard({ data }: any) {
  const bandColor = data.hhi < 1500 ? colors.teal : data.hhi < 2500 ? AMBER : RED;
  return (
    <Card padded>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '12px' }}>
        <Kicker>Merchant concentration</Kicker>
        <Pill tone={data.hhi < 1500 ? 'teal' : 'outline'}>{data.hhiBand}</Pill>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px', padding: '12px 14px', background: colors.bg, borderRadius: radius.md }}>
        <div>
          <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>HHI</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: bandColor, fontFamily: typography.family.mono, letterSpacing: '-0.01em' }}>{data.hhi.toLocaleString('en-IN')}</div>
        </div>
        <div>
          <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Top 5</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.01em' }}>{data.top5.share}%</div>
        </div>
        <div>
          <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Top 10</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.01em' }}>{data.top10.share}%</div>
        </div>
      </div>
      <div style={{ marginBottom: '12px' }}>
        {data.distribution.map((m: any, i: number) => (
          <div key={m.merchant} style={{ marginBottom: i < data.distribution.length - 1 ? '9px' : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
              <span style={{ color: m.merchant.startsWith('Everyone else') ? colors.text3 : colors.ink, fontWeight: 500, fontStyle: m.merchant.startsWith('Everyone else') ? 'italic' : 'normal' }}>{m.merchant}</span>
              <span style={{ color: colors.text2, fontFamily: typography.family.mono }}>{m.volume} <span style={{ color: colors.text3 }}>· {m.share}%</span></span>
            </div>
            <div style={{ height: '3px', background: 'rgba(26,26,26,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${(m.share / 22.4) * 100}%`, height: '100%', background: i === 0 ? bandColor : i < 5 ? colors.ink : colors.text3, borderRadius: '2px' }} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '10px', color: colors.text3, lineHeight: 1.55, padding: '10px 12px', background: colors.bg, borderRadius: radius.sm }}>{data.hhiNote}</div>
    </Card>
  );
}

// ── Hour-of-day heatmap ──────────────────────────────────────────────
function HourHeatmap({ data }: any) {
  const { days, data: grid, peak, note } = data;
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const max = Math.max(...grid.flat());

  return (
    <Card padded>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', gap: '12px' }}>
        <Kicker>Volume heatmap · hour × day</Kicker>
        <div style={{ fontSize: '11px', color: colors.text2, textAlign: 'right' }}>
          Peak <span style={{ fontFamily: typography.family.mono, color: colors.ink, fontWeight: 600 }}>{peak.day} {peak.hour}:00</span> · {peak.volume}
        </div>
      </div>
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '34px repeat(24, 1fr)', gap: '2px' }}>
          <div />
          {hours.map(h => (
            <div key={h} style={{ fontSize: '8px', color: colors.text3, textAlign: 'center', fontFamily: typography.family.mono, paddingBottom: '3px' }}>
              {h % 4 === 0 ? h.toString().padStart(2, '0') : ''}
            </div>
          ))}
          {grid.map((row: number[], rowIdx: number) => (
            <React.Fragment key={rowIdx}>
              <div style={{ fontSize: '10px', color: colors.text2, fontWeight: 500, alignSelf: 'center', fontFamily: typography.family.mono }}>{days[rowIdx]}</div>
              {row.map((v, colIdx) => {
                const intensity = v / max;
                const isPeak = days[rowIdx] === peak.day && colIdx === peak.hour;
                return (
                  <div key={colIdx} style={{
                    height: '18px',
                    background: intensity < 0.08 ? colors.bg : `rgba(28,111,107,${0.1 + intensity * 0.85})`,
                    borderRadius: '2px',
                    border: isPeak ? `1px solid ${colors.ink}` : 'none',
                    cursor: 'default',
                  }} title={`${days[rowIdx]} ${colIdx}:00 · intensity ${v}`} />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: colors.text3, marginTop: '10px', marginBottom: '10px' }}>
        <span>Lower volume</span>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[0.15, 0.3, 0.5, 0.7, 0.9].map(a => (
            <div key={a} style={{ width: '18px', height: '6px', background: `rgba(28,111,107,${a})`, borderRadius: '1px' }} />
          ))}
        </div>
        <span>Higher volume</span>
      </div>
      <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.55, padding: '10px 12px', background: colors.bg, borderRadius: radius.sm }}>{note}</div>
    </Card>
  );
}

// ── Success rate badge ───────────────────────────────────────────────
function SuccessBadge({ value }: { value: number }) {
  const tone = value >= 95 ? colors.teal : value >= 85 ? colors.ink : value >= 75 ? AMBER : RED;
  return (
    <span style={{
      fontFamily: typography.family.mono, fontWeight: 600, fontSize: '12px', color: tone,
    }}>{value.toFixed(1)}%</span>
  );
}

// ── Benchmark comparison bar ─────────────────────────────────────────
function BenchmarkBar({ name, payze, industry, leader, unit, status, note, isLast }: any) {
  // Normalize: for dispute/latency, lower is better; for rates higher is better
  const lowerIsBetter = name.includes('Dispute') || name.includes('latency');
  const scale = Math.max(payze, industry, leader) * 1.15;
  const pzLeft = (payze / scale) * 100;
  const indLeft = (industry / scale) * 100;
  const ldLeft = (leader / scale) * 100;

  return (
    <div style={{ padding: '14px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 3fr 2fr', gap: '18px', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: colors.ink, marginBottom: '3px' }}>{name}</div>
          <div style={{ fontSize: '10px', color: status === 'above' ? colors.teal : AMBER, fontWeight: 500 }}>
            {status === 'above' ? '✓ at or above industry' : '! below industry'}
          </div>
        </div>
        <div style={{ position: 'relative', height: '26px', background: colors.bg, borderRadius: '4px' }}>
          {/* Industry tick */}
          <div title="Industry average" style={{ position: 'absolute', left: `${indLeft}%`, top: 0, width: '1.5px', height: '100%', background: colors.text3 }} />
          <div style={{ position: 'absolute', left: `${indLeft}%`, top: '-14px', transform: 'translateX(-50%)', fontSize: '9px', color: colors.text3, fontFamily: typography.family.mono, whiteSpace: 'nowrap' }}>ind {industry}{unit}</div>
          {/* Leader tick */}
          <div title="Industry leader" style={{ position: 'absolute', left: `${ldLeft}%`, top: 0, width: '1.5px', height: '100%', background: colors.teal, opacity: 0.5 }} />
          {/* Payze bar */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pzLeft}%`, background: status === 'above' ? 'rgba(28,111,107,0.25)' : 'rgba(180,140,60,0.25)', borderRadius: '4px' }} />
          <div style={{ position: 'absolute', left: `${pzLeft}%`, top: 0, bottom: 0, width: '2px', background: status === 'above' ? colors.teal : AMBER }} />
          <div style={{ position: 'absolute', left: `${pzLeft}%`, top: 0, bottom: 0, transform: 'translateX(6px)', display: 'flex', alignItems: 'center', fontSize: '11px', fontFamily: typography.family.mono, fontWeight: 600, color: status === 'above' ? colors.teal : AMBER, whiteSpace: 'nowrap' }}>
            {payze}{unit}
          </div>
        </div>
        <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.5 }}>{note}</div>
      </div>
    </div>
  );
}

// ── Cohort table (shared between retention and revenue) ─────────────
function CohortTable({ cohorts, valueType }: any) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            <th style={thStyle}>Cohort</th>
            {['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map(m => (
              <th key={m} style={{ ...thStyle, textAlign: 'center', fontFamily: typography.family.mono }}>{m}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((c: any) => (
            <tr key={c.month} style={{ borderTop: `0.5px solid ${colors.border}` }}>
              <td style={{ padding: '10px 12px', color: colors.ink, fontWeight: 500 }}>{c.month}</td>
              {c.retention.map((r: number | null, i: number) => (
                <td key={i} style={{ padding: '10px 12px', textAlign: 'center' }}>
                  {r === null ? <span style={{ color: colors.text3 }}>—</span> : (
                    <CohortCell value={r} valueType={valueType} />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CohortCell({ value, valueType }: any) {
  if (valueType === 'nrr') {
    // NRR: >100% is green, <100% fades
    const intensity = Math.min(Math.max((value - 80) / 60, 0), 1);
    const bg = value >= 100 ? `rgba(28,111,107,${0.15 + intensity * 0.7})` : `rgba(180,140,60,${(100 - value) / 100})`;
    const textColor = value >= 115 ? '#fff' : colors.ink;
    return (
      <span style={{ display: 'inline-block', padding: '4px 10px', background: bg, borderRadius: radius.sm, fontSize: '11px', fontFamily: typography.family.mono, color: textColor, fontWeight: 600 }}>
        {value}%
      </span>
    );
  }
  // pct retention
  return (
    <span style={{ display: 'inline-block', padding: '4px 8px', background: `rgba(28,111,107,${value / 150})`, borderRadius: radius.sm, fontSize: '11px', fontFamily: typography.family.mono, color: value >= 80 ? '#fff' : colors.ink, fontWeight: 500 }}>
      {value}%
    </span>
  );
}

function LtvTile({ label, value, sub }: any) {
  return (
    <Card padded style={{ padding: '18px' }}>
      <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', fontFamily: typography.family.mono, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: colors.text2 }}>{sub}</div>
    </Card>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  fontSize: '10px',
  color: colors.text3,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fontWeight: 500,
};
