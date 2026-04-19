import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const AMBER = '#B48C3C';
const RED   = '#D64545';

export function Dunning() {
  const { data, loading, error, refetch } = useAsync(() => configService.getDunning(), []);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);

  if (error) return <ErrorState message={`Couldn't load dunning — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading dunning" />;

  const filtered = data.activeRetries.filter((r: any) => statusFilter === 'all' || r.status === statusFilter);

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '24px' }}>
        <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{data.header.kicker}</Kicker>
        <div style={{ ...typography.pageTitle, color: colors.ink }}>{data.header.title}</div>
        <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{data.header.subtitle}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => (
          <Card key={s.label} padded style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: colors.text2 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      {/* Retry schedule ladder */}
      <Card padded style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '14px' }}>
          <Kicker style={{ margin: 0 }}>Retry schedule · {data.retrySchedule.defaultRule}</Kicker>
          <Button variant="ghost" size="sm" onClick={() => toast.success('Custom schedule editor opened')}>Customize</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px', position: 'relative' }}>
          {/* connector line */}
          <div style={{ position: 'absolute', top: '20px', left: '8%', right: '8%', height: '0.5px', background: colors.border, zIndex: 0 }} />
          {data.retrySchedule.ladder.map((step: any) => (
            <div key={step.attempt} style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: step.attempt === 1 ? colors.teal : colors.card, border: `1px solid ${step.attempt === 1 ? colors.teal : colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto', fontSize: '13px', fontWeight: 700, color: step.attempt === 1 ? '#fff' : colors.ink, fontFamily: typography.family.mono }}>{step.attempt}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: colors.ink, marginBottom: '2px' }}>{step.label}</div>
              <div style={{ fontSize: '10px', color: colors.teal, fontFamily: typography.family.mono, marginBottom: '4px' }}>{step.timing}</div>
              <div style={{ fontSize: '10px', color: colors.text2, lineHeight: 1.4, padding: '0 6px' }}>{step.behaviour}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Issuer intelligence */}
      <Card padded style={{ marginBottom: '20px' }}>
        <Kicker style={{ marginBottom: '6px' }}>{data.retrySchedule.intelligentTimingBy.kicker}</Kicker>
        <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '14px' }}>{data.retrySchedule.intelligentTimingBy.detail}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {data.retrySchedule.intelligentTimingBy.issuerData.map((i: any) => {
            const isTop = i.successRate >= 60;
            return (
              <div key={i.issuer} style={{ padding: '12px 14px', background: colors.bg, border: `0.5px solid ${isTop ? 'rgba(28,111,107,0.25)' : colors.border}`, borderRadius: radius.md }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: colors.ink }}>{i.issuer}</span>
                  <span style={{ fontSize: '11px', color: isTop ? colors.teal : colors.ink, fontFamily: typography.family.mono, fontWeight: 600 }}>{i.successRate}%</span>
                </div>
                <div style={{ fontSize: '10px', color: colors.text2, fontFamily: typography.family.mono }}>Best: {i.bestRetryDay} at {i.bestRetryHour}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Failure code strategy */}
      <Card padded={false} style={{ marginBottom: '20px' }}>
        <div style={{ padding: '14px 20px', borderBottom: `0.5px solid ${colors.border}` }}>
          <Kicker>Failure code strategy</Kicker>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1.4fr 1.4fr 90px 1.6fr', gap: '14px', padding: '10px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Code</div><div>Meaning</div><div>Strategy</div><div style={{ textAlign: 'right' }}>Recovery</div><div>Hint</div>
        </div>
        {data.failureCodeStrategy.map((f: any, i: number) => (
          <div key={f.code} style={{ display: 'grid', gridTemplateColumns: '80px 1.4fr 1.4fr 90px 1.6fr', gap: '14px', padding: '12px 24px', borderBottom: i < data.failureCodeStrategy.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
            <div><span style={{ fontSize: '11px', padding: '3px 8px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, fontFamily: typography.family.mono, color: colors.ink, fontWeight: 600 }}>{f.code}</span></div>
            <div style={{ color: colors.ink, fontWeight: 500 }}>{f.label}</div>
            <div style={{ color: colors.text2, fontSize: '11px' }}>{f.strategy}</div>
            <div style={{ textAlign: 'right', color: colors.ink, fontWeight: 600, fontFamily: typography.family.mono }}>{f.avgRecovery}</div>
            <div style={{ color: colors.text3, fontSize: '11px' }}>{f.hint}</div>
          </div>
        ))}
      </Card>

      {/* Active retries */}
      <Card padded={false} style={{ marginBottom: '20px' }}>
        <div style={{ padding: '14px 20px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between' }}>
          <Kicker>Active retries · {filtered.length}</Kicker>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '6px 12px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '11px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
            <option value="all">All</option>
            <option value="retrying">Retrying</option>
            <option value="awaiting_method_switch">Awaiting method switch</option>
            <option value="giving_up">Giving up</option>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 1fr 1.4fr 0.8fr', gap: '14px', padding: '10px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Customer · merchant</div><div>Failure</div><div style={{ textAlign: 'right' }}>Amount</div><div>Attempt</div><div>Next</div><div style={{ textAlign: 'right' }}>P(recovery)</div>
        </div>
        {filtered.map((r: any, i: number) => (
          <div key={r.id} onClick={() => setSelected(r)} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 0.8fr 1fr 1.4fr 0.8fr', gap: '14px', padding: '14px 24px', borderBottom: i < filtered.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => { e.currentTarget.style.background = colors.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{r.customer}</div>
              <div style={{ color: colors.text3, fontSize: '10px' }}>{r.merchant} · {r.cadence}</div>
            </div>
            <div>
              <div style={{ color: colors.ink, fontSize: '11px' }}>{r.failureLabel}</div>
              <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono }}>{r.failureCode} · {r.issuer}</div>
            </div>
            <div style={{ textAlign: 'right', color: colors.ink, fontWeight: 600, fontFamily: typography.family.mono }}>{r.amount}</div>
            <div>
              <AttemptBar attempt={r.attempt} total={r.totalAttempts} status={r.status} />
            </div>
            <div style={{ color: colors.text2, fontSize: '11px' }}>{r.nextAttemptAt}</div>
            <div style={{ textAlign: 'right' }}>
              <ProbBadge p={r.recoveryProbability} status={r.status} />
            </div>
          </div>
        ))}
      </Card>

      {/* Recent recoveries */}
      <Card padded={false}>
        <div style={{ padding: '14px 20px', borderBottom: `0.5px solid ${colors.border}` }}>
          <Kicker>Recent recoveries · last 24h</Kicker>
        </div>
        {data.recentRecoveries.map((r: any, i: number) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.9fr 1fr 0.9fr 1fr', gap: '14px', padding: '12px 24px', borderBottom: i < data.recentRecoveries.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
            <div style={{ color: colors.ink, fontWeight: 500 }}>{r.customer}</div>
            <div style={{ color: colors.text2 }}>{r.merchant}</div>
            <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 600 }}>{r.amount}</div>
            <div style={{ color: colors.text3, fontSize: '11px' }}>Recovered attempt {r.attempt} · {r.daysToRecover === 0 ? 'same day' : `+${r.daysToRecover}d`}</div>
            <div style={{ color: colors.text2, fontSize: '11px' }}>{r.method}</div>
            <div style={{ color: colors.text3, fontFamily: typography.family.mono, fontSize: '10px', textAlign: 'right' }}>{r.recoveredAt}</div>
          </div>
        ))}
      </Card>

      {selected && <RetryDrawer retry={selected} schedule={data.retrySchedule.ladder} onClose={() => setSelected(null)} />}
    </div>
  );
}

function AttemptBar({ attempt, total, status }: any) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '3px', marginBottom: '3px' }}>
        {Array.from({ length: total }).map((_, i) => {
          const completed = i < attempt - 1;
          const current = i === attempt - 1;
          const givingUp = status === 'giving_up';
          const color = givingUp && current ? RED : completed ? colors.teal : current ? AMBER : colors.borderHover;
          return <div key={i} style={{ flex: 1, height: '4px', background: color, borderRadius: '2px' }} />;
        })}
      </div>
      <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{attempt}/{total}</div>
    </div>
  );
}

function ProbBadge({ p, status }: any) {
  const color = status === 'giving_up' ? RED : p >= 60 ? colors.teal : p >= 40 ? AMBER : RED;
  return <span style={{ fontSize: '12px', fontWeight: 600, color, fontFamily: typography.family.mono }}>{p}%</span>;
}

function RetryDrawer({ retry, schedule, onClose }: any) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '560px', maxWidth: '100%', height: '100%', background: colors.card, borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '4px' }}>Retry in progress</Kicker>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{retry.id}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        <div style={{ fontSize: '28px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', fontFamily: typography.family.mono, marginBottom: '4px' }}>{retry.amount}</div>
        <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '20px' }}>{retry.customer} · {retry.merchant} · {retry.cadence}</div>

        <div style={{ padding: '14px 16px', background: colors.bg, borderRadius: radius.md, marginBottom: '18px' }}>
          <Row label="Failure code"  value={`${retry.failureCode} · ${retry.failureLabel}`} mono />
          <Row label="Issuer"         value={retry.issuer} />
          <Row label="Failed on"      value={retry.failedOn} />
          <Row label="Attempt"        value={`${retry.attempt} of ${retry.totalAttempts}`} mono />
          <Row label="Next attempt"   value={retry.nextAttemptAt} />
          <Row label="P(recovery)"    value={`${retry.recoveryProbability}%`} mono isLast />
        </div>

        <Kicker style={{ marginBottom: '10px' }}>Retry ladder</Kicker>
        <div style={{ marginBottom: '20px' }}>
          {schedule.map((s: any) => {
            const completed = s.attempt < retry.attempt;
            const current = s.attempt === retry.attempt;
            return (
              <div key={s.attempt} style={{ display: 'flex', gap: '12px', padding: '8px 0', opacity: s.attempt > retry.attempt ? 0.45 : 1 }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: completed ? colors.teal : current ? AMBER : colors.bg, border: `1px solid ${completed ? colors.teal : current ? AMBER : colors.border}`, color: completed || current ? '#fff' : colors.text3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, flexShrink: 0, fontFamily: typography.family.mono }}>{s.attempt}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: colors.ink }}>{s.label} <span style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono, marginLeft: '6px' }}>{s.timing}</span></div>
                  <div style={{ fontSize: '10px', color: colors.text2 }}>{s.behaviour}</div>
                </div>
                {completed && <Icons.IconCheck size={12} color={colors.teal} strokeWidth={2} />}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="primary" size="sm" onClick={() => toast.success('Retry triggered now · webhook will fire on outcome')}>Retry now</Button>
          <Button variant="secondary" size="sm" onClick={() => toast.success('Customer sent update card reminder')}>Email customer</Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success('Retries paused · customer will not be charged')}>Pause retries</Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success('Marked as churned · escalated to reactivation flow')} style={{ color: RED, marginLeft: 'auto' }}>Give up</Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono, isLast }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`, fontSize: '12px', gap: '12px' }}>
      <span style={{ color: colors.text3, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, flexShrink: 0 }}>{label}</span>
      <span style={{ color: colors.ink, fontFamily: mono ? typography.family.mono : 'inherit', textAlign: 'right' }}>{value}</span>
    </div>
  );
}
