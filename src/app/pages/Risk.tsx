import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';

const riskRegister = [
  { id: 'R.047', subject: 'First-time purchase, high ticket', sub: 'Card issued abroad · billing mismatch · 7-day-old account', score: 91, time: '14:32', verdict: 'declined' },
  { id: 'R.046', subject: 'Velocity: four cards in eight minutes', sub: 'Same device fingerprint · three consecutive declines', score: 87, time: '14:19', verdict: 'blocked' },
  { id: 'R.045', subject: 'Returning subscriber — elevated amount', sub: '22-month customer · step-up auth honoured', score: 42, time: '13:58', verdict: 'passed', pill: 'Permitted w/3DS' },
  { id: 'R.044', subject: 'Card tested against seven micro-amounts', sub: 'Classic enumeration · first three visible · rest blocked', score: 96, time: '11:07', verdict: 'blocked' },
  { id: 'R.043', subject: 'Mid-ticket · corporate card · known buyer', sub: 'Quiet signals · flagged only for amount novelty', score: 18, time: '10:22', verdict: 'allowed' },
];

const anomalies = [
  { time: '14:32', title: 'HDFC Visa decline rate elevated', detail: 'Normally 8% · now 23% for past 12 min · fallback to RuPay active', severity: 'high' },
  { time: '13:45', title: 'Unusual geography cluster', detail: '14 attempts from 3 IPs in Ho Chi Minh · new for Razorpay Tech', severity: 'medium' },
  { time: '12:08', title: 'SEPA timeout window', detail: '4 timeouts from Deutsche Bank · routed via alternative', severity: 'low' },
];

const rules = [
  { name: 'First-time high-value check', triggers: 428, blocked: 47, active: true },
  { name: 'Card enumeration detection', triggers: 1241, blocked: 1183, active: true },
  { name: 'Billing address mismatch', triggers: 312, blocked: 22, active: true },
  { name: 'Velocity > 4 attempts / 10 min', triggers: 187, blocked: 142, active: true },
  { name: 'High-risk MCC restriction', triggers: 0, blocked: 0, active: false },
];

const disputes = [
  { id: 'dp_9012', txn: 'txn_00248', reason: 'Product not as described', amount: '₹12,400', due: '24 Apr', status: 'Evidence needed' },
  { id: 'dp_9011', txn: 'txn_00189', reason: 'Duplicate charge', amount: '₹4,800', due: '20 Apr', status: 'Submitted' },
  { id: 'dp_9010', txn: 'txn_00102', reason: 'Unrecognised charge', amount: '₹22,000', due: '18 Apr', status: 'Won' },
];

export function Risk() {
  const [tab, setTab] = useState<'signals' | 'rules' | 'disputes'>('signals');

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Risk</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>Watch</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>Signals, scored attempts, rules, and disputes.</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('Exporting risk report')}>Export</Button>
          <Button variant="primary" icon={<Icons.IconSettings size={14} />} onClick={() => setTab('rules')}>Risk rules</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)', gap: '20px', marginBottom: '20px' }}>
        <Card padded style={{ padding: '32px' }}>
          <Kicker style={{ marginBottom: '20px' }}>Composite risk posture</Kicker>
          <RiskGauge score={23} label="Vigilant" />
          <div style={{ fontSize: '12px', color: colors.text2, marginTop: '18px', lineHeight: 1.6, textAlign: 'center' }}>
            Three attempts declined this hour; all permitted passage deemed safe.
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <MetricCard label="Declined today" value="11" sub="of 427 attempts" />
          <MetricCard label="Disputes open" value="3" sub="2 awaiting docs" />
          <MetricCard label="Win rate, YTD" value="78%" sub="industry avg: 34%" />
          <MetricCard label="Blocked by rules" value="₹42,800" sub="22 attempts" />
        </div>
      </div>

      <Card padded={false}>
        <div style={{ padding: '16px 24px', borderBottom: `0.5px solid ${colors.border}` }}>
          <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill, width: 'fit-content' }}>
            {[
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

        {tab === 'signals' && (
          <>
            <div style={{ padding: '18px 24px', borderBottom: `0.5px solid ${colors.border}` }}>
              <Kicker style={{ marginBottom: '12px' }}>Anomalies, last 24 hours</Kicker>
              {anomalies.map((a, i) => (
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
                <div>N°</div>
                <div>Subject · Signal</div>
                <div>Score</div>
                <div>Hour</div>
                <div style={{ textAlign: 'right' }}>Judgement</div>
              </div>
              {riskRegister.map((r, i) => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '0.6fr 2fr 0.6fr 0.7fr 0.8fr', gap: '16px', padding: '18px 0', borderBottom: i < riskRegister.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center' }}>
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
                  <div style={{ textAlign: 'right', fontFamily: typography.family.mono, fontSize: '10px', letterSpacing: '0.1em', color: r.score >= 80 ? colors.ink : colors.text2, textTransform: 'uppercase', fontWeight: 500 }}>
                    {r.verdict}
                  </div>
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
            {rules.map((r, i) => (
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
            <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 0.9fr 1.5fr 0.9fr 0.9fr 1fr', gap: '16px', padding: '10px 0', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <div>Dispute</div>
              <div>Txn</div>
              <div>Reason</div>
              <div>Amount</div>
              <div>Evidence by</div>
              <div>Status</div>
            </div>
            {disputes.map((d, i) => (
              <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '0.9fr 0.9fr 1.5fr 0.9fr 0.9fr 1fr', gap: '16px', padding: '16px 0', borderBottom: i < disputes.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '13px' }}>
                <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.ink }}>{d.id}</div>
                <div style={{ fontFamily: typography.family.mono, fontSize: '11px', color: colors.text2 }}>{d.txn}</div>
                <div style={{ color: colors.ink }}>{d.reason}</div>
                <div style={{ color: colors.ink, fontWeight: 600 }}>{d.amount}</div>
                <div style={{ color: colors.text2 }}>{d.due}</div>
                <div><Pill tone={d.status === 'Won' ? 'teal' : d.status === 'Evidence needed' ? 'outline' : 'neutral'}>{d.status}</Pill></div>
              </div>
            ))}
          </div>
        )}
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

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <Card padded style={{ padding: '18px' }}>
      <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: colors.text2 }}>{sub}</div>
    </Card>
  );
}
