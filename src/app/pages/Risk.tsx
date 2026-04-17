import React from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button } from '../../design/primitives';
import * as Icons from '../../design/icons';

const riskRegister = [
  { id: 'R.047', subject: 'First-time purchase, high ticket', sub: 'Card issued abroad; billing address mismatch; 7-day-old account', score: 91, time: '14:32', verdict: 'declined' },
  { id: 'R.046', subject: 'Velocity anomaly, four cards in eight minutes', sub: 'Same device fingerprint; consecutive declines on three; pattern familiar', score: 87, time: '14:19', verdict: 'blocked' },
  { id: 'R.045', subject: 'Returning subscriber — elevated amount', sub: '22-month customer; step-up auth requested, honoured', score: 42, time: '13:58', verdict: 'passed', pill: 'Permitted w/3DS' },
  { id: 'R.044', subject: 'Card tested against seven micro-amounts', sub: 'Classic enumeration, visible in first three attempts; rest never reached bank', score: 96, time: '11:07', verdict: 'blocked' },
  { id: 'R.043', subject: 'Mid-ticket, corporate card, known buyer', sub: 'Quiet signals throughout; flagged only for amount novelty', score: 18, time: '10:22', verdict: 'allowed' },
];

export function Risk() {
  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Risk</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>Watch</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
            Signals, scores, and decisions. Updated live.
          </div>
        </div>
        <Button variant="secondary" icon={<Icons.IconSettings size={14} />}>Risk rules</Button>
      </div>

      {/* Hero row: gauge + stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)', gap: '20px', marginBottom: '20px' }}>
        <Card padded style={{ padding: '32px' }}>
          <Kicker style={{ marginBottom: '20px' }}>Composite risk posture</Kicker>
          <RiskGauge score={23} label="Vigilant" />
          <div style={{ fontSize: '12px', color: colors.text2, marginTop: '18px', lineHeight: 1.6, textAlign: 'center' }}>
            Three attempts declined this hour; none permitted passage.
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', alignContent: 'stretch' }}>
          <MetricCard label="Declined today" value="11" sub="of 427 attempts" />
          <MetricCard label="Disputes open" value="3" sub="2 awaiting docs" />
          <MetricCard label="Win rate, YTD" value="78%" sub="industry avg: 34%" />
          <MetricCard label="Blocked by rules" value="₹42,800" sub="22 attempts" />
        </div>
      </div>

      {/* Register */}
      <Card padded>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
          <div>
            <Kicker style={{ marginBottom: '4px' }}>The register</Kicker>
            <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>Attempts, scored and judged</div>
          </div>
          <Button variant="ghost" size="sm">View all →</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '0.6fr 2fr 0.6fr 0.7fr 0.8fr', gap: '16px', padding: '10px 0', borderTop: `0.5px solid ${colors.ink}`, borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>N°</div>
          <div>Subject · Signal</div>
          <div>Score</div>
          <div>Hour</div>
          <div style={{ textAlign: 'right' }}>Judgement</div>
        </div>

        {riskRegister.map((r, i) => (
          <div key={r.id} style={{
            display: 'grid', gridTemplateColumns: '0.6fr 2fr 0.6fr 0.7fr 0.8fr', gap: '16px',
            padding: '18px 0', borderBottom: i < riskRegister.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            alignItems: 'center',
          }}>
            <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: r.score >= 80 ? colors.ink : colors.text3 }}>{r.id}</div>
            <div>
              <div style={{ fontSize: '13px', color: colors.ink, fontWeight: 500, marginBottom: '2px' }}>
                {r.subject}
                {r.pill && (
                  <span style={{ fontFamily: typography.family.mono, fontSize: '10px', letterSpacing: '0.1em', color: colors.teal, border: `0.5px solid ${colors.teal}`, padding: '2px 8px', marginLeft: '8px', borderRadius: radius.pill, textTransform: 'uppercase' }}>
                    {r.pill}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11px', color: colors.text3, fontStyle: 'italic', lineHeight: 1.5 }}>{r.sub}</div>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: r.score >= 80 ? colors.ink : r.score >= 40 ? colors.text2 : colors.teal, letterSpacing: '-0.015em' }}>{r.score}</div>
            <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{r.time}</div>
            <div style={{ textAlign: 'right', fontFamily: typography.family.mono, fontSize: '10px', letterSpacing: '0.1em', color: r.score >= 80 ? colors.ink : colors.text2, textTransform: 'uppercase', fontWeight: 500 }}>
              {r.verdict}
            </div>
          </div>
        ))}
      </Card>
    </div>
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
          return (
            <text key={i} x={x} y={y} fontFamily={typography.family.mono} fontSize="9" fill={colors.text3} textAnchor="middle" dominantBaseline="middle">
              {v}
            </text>
          );
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

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card padded style={{ padding: '18px' }}>
      <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: colors.text2 }}>{sub}</div>
    </Card>
  );
}
