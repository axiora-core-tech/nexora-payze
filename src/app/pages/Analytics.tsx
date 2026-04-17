import React from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button } from '../../design/primitives';
import * as Icons from '../../design/icons';

export function Analytics() {
  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Intelligence</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>Analytics</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
            Trends, cohorts, and comparisons across the platform.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" size="sm">Last 30 days</Button>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />}>Export</Button>
        </div>
      </div>

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
              <span style={{ width: '10px', height: '2px', background: colors.text3, borderTop: `1px dashed ${colors.text3}` }} />
              <span style={{ color: colors.text2 }}>Previous</span>
            </div>
          </div>
        </div>

        <svg viewBox="0 0 800 260" style={{ width: '100%', height: '260px' }} preserveAspectRatio="none">
          {[0, 1, 2, 3, 4].map(i => (
            <line key={i} x1="0" y1={i * 50 + 20} x2="800" y2={i * 50 + 20} stroke={colors.border} strokeWidth="0.5" />
          ))}
          <path d="M 0 180 L 30 170 L 60 185 L 90 160 L 120 155 L 150 140 L 180 145 L 210 130 L 240 120 L 270 110 L 300 130 L 330 115 L 360 100 L 390 90 L 420 95 L 450 80 L 480 85 L 510 70 L 540 60 L 570 65 L 600 50 L 630 55 L 660 40 L 690 35 L 720 30 L 750 25 L 780 20"
            fill="none" stroke={colors.text3} strokeWidth="1" strokeDasharray="4,4" />
          <path d="M 0 190 L 30 175 L 60 180 L 90 155 L 120 145 L 150 130 L 180 138 L 210 120 L 240 108 L 270 95 L 300 115 L 330 100 L 360 82 L 390 75 L 420 80 L 450 62 L 480 68 L 510 50 L 540 40 L 570 45 L 600 28 L 630 32 L 660 22 L 690 18 L 720 12 L 750 8 L 780 5"
            fill="none" stroke={colors.ink} strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="780" cy="5" r="4" fill={colors.teal} />
        </svg>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Card padded>
          <Kicker style={{ marginBottom: '18px' }}>Top payment methods</Kicker>
          {[
            { name: 'UPI', share: 62, volume: '₹11.42 Cr' },
            { name: 'Cards', share: 22, volume: '₹4.05 Cr' },
            { name: 'NetBanking', share: 9, volume: '₹1.66 Cr' },
            { name: 'Wallets', share: 5, volume: '₹92.1 L' },
            { name: 'International', share: 2, volume: '₹37.0 L' },
          ].map(m => (
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
          {[
            { name: 'India', share: 78, volume: '₹14.36 Cr' },
            { name: 'UAE', share: 8, volume: '₹1.47 Cr' },
            { name: 'Europe', share: 6, volume: '₹1.10 Cr' },
            { name: 'United States', share: 4, volume: '₹73.7 L' },
            { name: 'Rest of world', share: 4, volume: '₹73.7 L' },
          ].map(g => (
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
