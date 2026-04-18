import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

export function Risk() {
  const { data, loading, error, refetch } = useAsync(() => configService.getRisk(), []);
  const [tab, setTab] = useState<'signals' | 'rules' | 'disputes'>('signals');

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
            <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 0.9fr 1.5fr 0.9fr 0.9fr 1fr', gap: '16px', padding: '10px 0', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              <div>Dispute</div><div>Txn</div><div>Reason</div><div>Amount</div><div>Evidence by</div><div>Status</div>
            </div>
            {disputes.map((d: any, i: number) => (
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

function MetricCard({ label, value, sub }: any) {
  return (
    <Card padded style={{ padding: '18px' }}>
      <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '28px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: colors.text2 }}>{sub}</div>
    </Card>
  );
}
