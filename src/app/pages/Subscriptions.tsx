import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const iconMap: Record<string, any> = {
  IconEye: Icons.IconEye, IconClock: Icons.IconClock, IconSend: Icons.IconSend,
  IconSettings: Icons.IconSettings, IconTrash: Icons.IconTrash,
};

export function Subscriptions() {
  const { data, loading, error, refetch } = useAsync(() => configService.getSubscriptions(), []);
  const [tab, setTab] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [range, setRange] = useState('30d');
  const [actionsFor, setActionsFor] = useState<string | null>(null);

  if (error) return <ErrorState message={`Couldn't load subscriptions — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading subscriptions" />;

  const { header, stats, typeTabs, statusFilters, dateRanges, rowActions, subscriptions } = data;

  const filtered = subscriptions.filter((s: any) => {
    if (tab !== 'all' && s.type !== tab) return false;
    if (status !== 'all' && s.status.toLowerCase() !== status) return false;
    return true;
  });

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{header.subtitle}</div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => toast.success('New subscription builder opened')}>New subscription</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {stats.map((s: any) => <StatCard key={s.label} {...s} />)}
      </div>

      <Card padded={false}>
        <div style={{ padding: '16px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill }}>
            {typeTabs.map((t: any) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '6px 12px', borderRadius: radius.pill, fontSize: '11px', fontWeight: 500,
                background: tab === t.id ? colors.card : 'transparent',
                color: tab === t.id ? colors.ink : colors.text2,
                border: tab === t.id ? `0.5px solid ${colors.border}` : 'none',
                cursor: 'pointer', fontFamily: typography.family.sans,
              }}>{t.label}</button>
            ))}
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)} style={selectStyle}>
            {statusFilters.map((s: string) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select value={range} onChange={e => setRange(e.target.value)} style={selectStyle}>
            {dateRanges.map((r: any) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <Button variant="ghost" size="sm" icon={<Icons.IconDownload size={12} />} style={{ marginLeft: 'auto' }} onClick={() => toast.success('CSV downloaded')}>Export</Button>
        </div>

        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '1fr 1.4fr 0.9fr 0.9fr 0.9fr 0.8fr 0.4fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Subscriber</div><div>Plan</div><div>Amount</div><div>Method</div><div>Next charge</div><div>Status</div><div></div>
        </div>

        {filtered.map((s: any, i: number) => (
          <div key={s.id} style={{
            display: 'grid', gridTemplateColumns: '1fr 1.4fr 0.9fr 0.9fr 0.9fr 0.8fr 0.4fr', gap: '16px',
            padding: '16px 24px',
            borderBottom: i < filtered.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            alignItems: 'center', fontSize: '13px',
          }}>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{s.customer}</div>
              <div style={{ fontSize: '11px', color: colors.text3 }}>{s.collected} successful collections</div>
            </div>
            <div style={{ color: colors.text2, fontSize: '12px' }}>{s.plan}</div>
            <div style={{ color: colors.ink, fontWeight: 600 }}>{s.amount}</div>
            <div style={{ color: colors.text2, fontSize: '12px' }}>{s.method}</div>
            <div style={{ color: colors.text2 }}>{s.nextCharge}</div>
            <div><Pill tone={s.status === 'Active' ? 'teal' : s.status === 'Paused' ? 'outline' : 'neutral'}>{s.status}</Pill></div>
            <div style={{ textAlign: 'right', position: 'relative' }}>
              <button onClick={() => setActionsFor(actionsFor === s.id ? null : s.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text3, padding: '4px' }}>
                <Icons.IconSettings size={14} />
              </button>
              {actionsFor === s.id && (
                <>
                  <div onClick={() => setActionsFor(null)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '4px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, boxShadow: colors.shadowMd, minWidth: '160px', zIndex: 50, padding: '6px' }}>
                    {rowActions.filter((a: any) => {
                      if (a.label === 'Pause') return s.status !== 'Paused';
                      if (a.label === 'Resume') return s.status === 'Paused';
                      return true;
                    }).map((a: any) => {
                      const IconComp = iconMap[a.icon] || Icons.IconSettings;
                      return (
                        <button key={a.label} onClick={() => { toast.success(`${a.label}: ${s.id}`); setActionsFor(null); }} style={{
                          display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px',
                          background: 'transparent', border: 'none', borderRadius: radius.sm,
                          fontSize: '12px', color: colors.ink, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                        }}>
                          <IconComp size={12} color={colors.text2} />
                          {a.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function StatCard({ label, value, sub }: any) {
  return (
    <Card padded style={{ padding: '18px' }}>
      <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: colors.text2 }}>{sub}</div>
    </Card>
  );
}

const selectStyle: React.CSSProperties = {
  padding: '6px 10px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill,
  fontSize: '12px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
};
