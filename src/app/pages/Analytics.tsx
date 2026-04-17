import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';

export function Analytics() {
  const [tab, setTab] = useState<'overview' | 'cohorts' | 'funnels'>('overview');
  const [range, setRange] = useState('30d');

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Intelligence</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>Analytics</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>Trends, cohorts, and funnels across the platform.</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={range} onChange={e => setRange(e.target.value)} style={{ padding: '8px 14px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '12px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit' }}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="ytd">Year to date</option>
          </select>
          <Button variant="secondary" icon={<Icons.IconMail size={14} />} onClick={() => toast.success('Report scheduled weekly')}>Schedule</Button>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('CSV exported')}>Export</Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill, width: 'fit-content', marginBottom: '20px' }}>
        {[{ id: 'overview', label: 'Overview' }, { id: 'cohorts', label: 'Cohorts' }, { id: 'funnels', label: 'Funnels' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id as any)} style={{
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
            <MetricTile label="Total volume" value="₹18.42 Cr" change="+24.1%" up />
            <MetricTile label="Transactions" value="84,217" change="+18.7%" up />
            <MetricTile label="Avg ticket" value="₹2,186" change="+4.6%" up />
            <MetricTile label="Success rate" value="93.7%" change="+0.3pts" up />
          </div>

          <Card padded style={{ padding: '32px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <div>
                <Kicker style={{ marginBottom: '4px' }}>Volume, last 30 days</Kicker>
                <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>₹18,42,00,000</div>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '11px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '2px', background: colors.ink }} />
                  <span style={{ color: colors.text2 }}>This period</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '1px', borderTop: `1px dashed ${colors.text3}` }} />
                  <span style={{ color: colors.text2 }}>Previous</span>
                </div>
              </div>
            </div>
            <svg viewBox="0 0 800 260" style={{ width: '100%', height: '260px' }} preserveAspectRatio="none">
              {[0, 1, 2, 3, 4].map(i => <line key={i} x1="0" y1={i * 50 + 20} x2="800" y2={i * 50 + 20} stroke={colors.border} strokeWidth="0.5" />)}
              <path d="M 0 180 L 30 170 L 60 185 L 90 160 L 120 155 L 150 140 L 180 145 L 210 130 L 240 120 L 270 110 L 300 130 L 330 115 L 360 100 L 390 90 L 420 95 L 450 80 L 480 85 L 510 70 L 540 60 L 570 65 L 600 50 L 630 55 L 660 40 L 690 35 L 720 30 L 750 25 L 780 20" fill="none" stroke={colors.text3} strokeWidth="1" strokeDasharray="4,4" />
              <path d="M 0 190 L 30 175 L 60 180 L 90 155 L 120 145 L 150 130 L 180 138 L 210 120 L 240 108 L 270 95 L 300 115 L 330 100 L 360 82 L 390 75 L 420 80 L 450 62 L 480 68 L 510 50 L 540 40 L 570 45 L 600 28 L 630 32 L 660 22 L 690 18 L 720 12 L 750 8 L 780 5" fill="none" stroke={colors.ink} strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="780" cy="5" r="4" fill={colors.teal} />
            </svg>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <Card padded>
              <Kicker style={{ marginBottom: '18px' }}>Top payment methods</Kicker>
              {[{ name: 'UPI', share: 62, volume: '₹11.42 Cr' }, { name: 'Cards', share: 22, volume: '₹4.05 Cr' }, { name: 'NetBanking', share: 9, volume: '₹1.66 Cr' }, { name: 'Wallets', share: 5, volume: '₹92.1 L' }, { name: 'International', share: 2, volume: '₹37.0 L' }].map(m => (
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
              {[{ name: 'India', share: 78, volume: '₹14.36 Cr' }, { name: 'UAE', share: 8, volume: '₹1.47 Cr' }, { name: 'Europe', share: 6, volume: '₹1.10 Cr' }, { name: 'United States', share: 4, volume: '₹73.7 L' }, { name: 'Rest of world', share: 4, volume: '₹73.7 L' }].map(g => (
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
                {[
                  { month: 'Oct 2025', size: 412, retention: [100, 82, 74, 68, 64, 60, 58] },
                  { month: 'Nov 2025', size: 524, retention: [100, 80, 72, 66, 62, 58, null] },
                  { month: 'Dec 2025', size: 628, retention: [100, 84, 76, 70, 66, null, null] },
                  { month: 'Jan 2026', size: 712, retention: [100, 85, 78, 72, null, null, null] },
                  { month: 'Feb 2026', size: 891, retention: [100, 87, 80, null, null, null, null] },
                  { month: 'Mar 2026', size: 924, retention: [100, 88, null, null, null, null, null] },
                  { month: 'Apr 2026', size: 412, retention: [100, null, null, null, null, null, null] },
                ].map(c => (
                  <tr key={c.month} style={{ borderTop: `0.5px solid ${colors.border}` }}>
                    <td style={{ padding: '10px 12px', color: colors.ink, fontWeight: 500 }}>{c.month}</td>
                    <td style={{ padding: '10px 12px', color: colors.text2, fontFamily: typography.family.mono }}>{c.size}</td>
                    {c.retention.map((r, i) => (
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
          {[
            { stage: 'Checkout initiated', count: 184212, pct: 100 },
            { stage: 'Payment method selected', count: 168432, pct: 91.4 },
            { stage: 'Auth sent to bank', count: 152108, pct: 82.5 },
            { stage: 'Succeeded (first attempt)', count: 129824, pct: 70.5 },
            { stage: 'Succeeded (after fallback)', count: 147280, pct: 79.9 },
          ].map((s, i) => (
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
                <div style={{ width: `${s.pct}%`, height: '100%', background: i === 4 ? colors.teal : colors.ink, borderRadius: radius.sm }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: '20px', padding: '16px', background: colors.bg, borderRadius: radius.md, fontSize: '12px', color: colors.text2, lineHeight: 1.6 }}>
            Payze routing recovers <span style={{ color: colors.ink, fontWeight: 600 }}>17,456 payments</span> that would have been lost — a <span style={{ color: colors.teal, fontWeight: 600 }}>9.4 point</span> improvement over bank-only routing.
          </div>
        </Card>
      )}
    </div>
  );
}

function MetricTile({ label, value, change, up }: { label: string; value: string; change: string; up: boolean }) {
  return (
    <Card padded style={{ padding: '18px' }}>
      <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: '11px', fontWeight: 500, color: up ? colors.teal : colors.text2, marginTop: '4px' }}>{up ? '↗' : '↘'} {change}</div>
    </Card>
  );
}
