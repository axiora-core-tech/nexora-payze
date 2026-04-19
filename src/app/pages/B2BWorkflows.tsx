import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const AMBER = '#B48C3C';
const RED   = '#D64545';

type InnerTab = 'quotes' | 'recurring' | 'plans' | 'taxes' | 'erp';

export function B2BWorkflows() {
  const { data, loading, error, refetch } = useAsync(() => configService.getB2BWorkflows(), []);
  const [tab, setTab] = useState<InnerTab>('quotes');

  if (error) return <ErrorState message={`Couldn't load B2B workflows — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading B2B" />;

  const tabs: Array<{ id: InnerTab; label: string; hint: string }> = [
    { id: 'quotes',    label: 'Quotes',              hint: `${data.quotes.records.length} · ${data.quotes.stats[0].value} open` },
    { id: 'recurring', label: 'Recurring invoices',  hint: `${data.recurringInvoices.schedules.length} schedules` },
    { id: 'plans',     label: 'Subscription plans',  hint: `${data.subscriptionPlans.plans.length} plans` },
    { id: 'taxes',     label: 'Auto tax invoices',    hint: data.autoTaxInvoices.enabled ? 'Auto-fire on' : 'Off' },
    { id: 'erp',       label: 'ERP push',             hint: `${data.standingOrders.integrations.length} integrations` },
  ];

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '18px' }}>
        <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Collect · B2B workflows</Kicker>
        <div style={{ ...typography.pageTitle, color: colors.ink }}>B2B workflows</div>
        <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>Quotes → invoices → payments → ERP. The end-to-end B2B flow.</div>
      </div>

      <div style={{ display: 'inline-flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill, border: `0.5px solid ${colors.border}`, marginBottom: '22px', flexWrap: 'wrap' }}>
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '7px 16px', borderRadius: radius.pill, fontSize: '12px', fontWeight: active ? 600 : 500,
              background: active ? 'rgba(28,111,107,0.09)' : 'transparent',
              color: active ? colors.teal : colors.text2,
              border: active ? '0.5px solid rgba(28,111,107,0.3)' : '0.5px solid transparent',
              cursor: 'pointer', fontFamily: typography.family.sans,
              display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}>
              <span>{t.label}</span>
              <span style={{ fontSize: '10px', color: active ? colors.teal : colors.text3, opacity: 0.75 }}>· {t.hint}</span>
            </button>
          );
        })}
      </div>

      {tab === 'quotes'    && <QuotesView data={data.quotes} />}
      {tab === 'recurring' && <RecurringView data={data.recurringInvoices} />}
      {tab === 'plans'     && <PlansView data={data.subscriptionPlans} />}
      {tab === 'taxes'     && <AutoTaxView data={data.autoTaxInvoices} />}
      {tab === 'erp'       && <ERPView data={data.standingOrders} />}
    </div>
  );
}

// ── Quotes ─────────────────────────────────────────────────────────
function QuotesView({ data }: any) {
  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => <StatTile key={s.label} stat={s} />)}
      </div>
      <Card padded={false}>
        <div style={{ padding: '14px 20px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Kicker>Open + recent quotes</Kicker>
          <Button variant="primary" size="sm" icon={<Icons.IconPlus size={12} />} onClick={() => toast.success('Quote composer opened')}>New quote</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.1fr 1.1fr 1fr 1fr 0.9fr', gap: '14px', padding: '12px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Title</div><div>Merchant</div><div>Customer</div><div style={{ textAlign: 'right' }}>Amount</div><div>Status</div><div>Converted to</div>
        </div>
        {data.records.map((q: any, i: number) => {
          const statusMap: Record<string, { color: string; label: string }> = {
            sent:     { color: AMBER,       label: 'Sent' },
            accepted: { color: colors.teal, label: 'Accepted' },
            expired:  { color: RED,         label: 'Expired' },
            declined: { color: RED,         label: 'Declined' },
          };
          const s = statusMap[q.status] || statusMap.sent;
          return (
            <div key={q.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.1fr 1.1fr 1fr 1fr 0.9fr', gap: '14px', padding: '14px 24px', borderBottom: i < data.records.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
              <div>
                <div style={{ color: colors.ink, fontWeight: 500 }}>{q.title}</div>
                <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono }}>{q.id} · {q.sentAt}</div>
              </div>
              <div style={{ color: colors.text2 }}>{q.merchant}</div>
              <div style={{ color: colors.text2 }}>{q.customer}</div>
              <div style={{ textAlign: 'right', color: colors.ink, fontWeight: 600, fontFamily: typography.family.mono }}>{q.amount}</div>
              <div>
                <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: radius.pill, background: `${s.color}15`, color: s.color, border: `0.5px solid ${s.color}40`, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: typography.family.mono }}>{s.label}</span>
                {q.expiresIn && <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>Expires {q.expiresIn}</div>}
                {q.acceptedAt && <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>{q.acceptedAt}</div>}
              </div>
              <div>
                {q.convertedInvoice ? (
                  <span style={{ fontSize: '11px', color: colors.teal, fontFamily: typography.family.mono, fontWeight: 500 }}>{q.convertedInvoice} →</span>
                ) : (
                  <span style={{ fontSize: '11px', color: colors.text3 }}>—</span>
                )}
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}

// ── Recurring invoices ────────────────────────────────────────────
function RecurringView({ data }: any) {
  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => <StatTile key={s.label} stat={s} />)}
      </div>
      <Card padded={false}>
        <div style={{ padding: '14px 20px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Kicker>Active schedules</Kicker>
          <Button variant="primary" size="sm" icon={<Icons.IconPlus size={12} />} onClick={() => toast.success('Schedule builder opened')}>New schedule</Button>
        </div>
        {data.schedules.map((r: any, i: number) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.1fr 1fr 0.9fr 1fr 1fr', gap: '14px', padding: '14px 24px', borderBottom: i < data.schedules.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{r.title}</div>
              <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono }}>{r.id}</div>
            </div>
            <div style={{ color: colors.text2 }}>{r.customer}</div>
            <div style={{ textAlign: 'right', color: colors.ink, fontWeight: 600, fontFamily: typography.family.mono }}>{r.amount}</div>
            <div>
              <span style={{ fontSize: '10px', padding: '2px 7px', background: 'rgba(28,111,107,0.08)', color: colors.teal, border: '0.5px solid rgba(28,111,107,0.25)', borderRadius: radius.pill, fontWeight: 600, fontFamily: typography.family.mono, letterSpacing: '0.04em' }}>{r.cadence}</span>
              <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>{r.occurrencesLeft}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: colors.ink }}>Next: {r.nextRun}</div>
              <div style={{ fontSize: '10px', color: colors.text3 }}>Last: {r.lastRun}</div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: r.autoSend ? colors.teal : colors.text3 }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: r.autoSend ? colors.teal : colors.text3 }} />
                Auto-send {r.autoSend ? 'on' : 'off'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: r.autoCharge ? colors.teal : colors.text3, marginTop: '3px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: r.autoCharge ? colors.teal : colors.text3 }} />
                Auto-charge {r.autoCharge ? 'on' : 'off'}
              </div>
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}

// ── Subscription plans ────────────────────────────────────────────
function PlansView({ data }: any) {
  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => <StatTile key={s.label} stat={s} />)}
      </div>

      <Card padded style={{ marginBottom: '16px' }}>
        <Kicker style={{ marginBottom: '8px' }}>Browse page</Kicker>
        <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '10px' }}>Customer-facing hosted page to browse plans and subscribe.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: colors.bg, borderRadius: radius.sm }}>
          <Icons.IconLink size={14} color={colors.text2} />
          <code style={{ flex: 1, fontFamily: typography.family.mono, fontSize: '12px', color: colors.ink }}>{data.browsePageLink}</code>
          <Button variant="ghost" size="sm" icon={<Icons.IconCopy size={11} />} onClick={() => { navigator.clipboard.writeText(`https://${data.browsePageLink}`); toast.success('Link copied'); }}>Copy</Button>
        </div>
      </Card>

      <Card padded={false}>
        <div style={{ padding: '14px 20px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Kicker>Active plans</Kicker>
          <Button variant="primary" size="sm" icon={<Icons.IconPlus size={12} />} onClick={() => toast.success('Plan builder opened')}>New plan</Button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.1fr 1fr 0.9fr 1fr 1fr', gap: '14px', padding: '12px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Plan</div><div>Merchant</div><div>Price</div><div>Cycle</div><div style={{ textAlign: 'right' }}>Active</div><div style={{ textAlign: 'right' }}>MRR</div>
        </div>
        {data.plans.map((p: any, i: number) => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.1fr 1fr 0.9fr 1fr 1fr', gap: '14px', padding: '14px 24px', borderBottom: i < data.plans.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: colors.ink, fontWeight: 500 }}>{p.name}</span>
                {p.featured && <Pill tone="teal">featured</Pill>}
              </div>
              <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono, marginTop: '2px' }}>{p.id}{p.trial ? ` · ${p.trial} trial` : ''}</div>
            </div>
            <div style={{ color: colors.text2 }}>{p.merchant}</div>
            <div style={{ color: colors.ink, fontWeight: 600, fontFamily: typography.family.mono }}>{p.price}</div>
            <div style={{ color: colors.text2, fontSize: '11px', fontFamily: typography.family.mono }}>{p.billingCycle}</div>
            <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 600 }}>{p.activeSubs.toLocaleString('en-IN')}</div>
            <div style={{ textAlign: 'right', color: colors.teal, fontFamily: typography.family.mono, fontWeight: 600 }}>{p.mrr}</div>
          </div>
        ))}
      </Card>
    </>
  );
}

// ── Auto tax invoices ────────────────────────────────────────────
function AutoTaxView({ data }: any) {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: data.enabled ? colors.teal : colors.text3, animation: data.enabled ? 'payze-pulse-dot 2s ease-in-out infinite' : 'none' }} />
        <span style={{ fontSize: '11px', color: data.enabled ? colors.teal : colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, fontFamily: typography.family.mono }}>{data.enabled ? 'Active · firing on every payment' : 'Disabled'}</span>
      </div>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => <StatTile key={s.label} stat={s} />)}
      </div>

      <Card padded={false}>
        <div style={{ padding: '14px 20px', borderBottom: `0.5px solid ${colors.border}` }}>
          <Kicker>Rules</Kicker>
        </div>
        {data.rules.map((r: any, i: number) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '24px 1fr 2fr 70px', gap: '14px', padding: '12px 24px', borderBottom: i < data.rules.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.active ? colors.teal : colors.text3 }} />
            <div style={{ color: colors.ink, fontWeight: 500 }}>{r.condition}</div>
            <div style={{ color: colors.text2 }}>{r.action}</div>
            <div style={{ textAlign: 'right' }}>{r.active ? <Pill tone="teal">active</Pill> : <Pill tone="outline">paused</Pill>}</div>
          </div>
        ))}
      </Card>
    </>
  );
}

// ── ERP standing orders ──────────────────────────────────────────
function ERPView({ data }: any) {
  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {data.integrations.map((i: any) => {
          const statusMap: Record<string, { color: string; label: string }> = {
            healthy: { color: colors.teal, label: 'Healthy' },
            warning: { color: AMBER,       label: 'Warning' },
            failed:  { color: RED,         label: 'Failed' },
          };
          const s = statusMap[i.status] || statusMap.healthy;
          return (
            <Card key={i.id} padded style={{ padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: colors.ink, marginBottom: '3px' }}>{i.name}</div>
                  <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{i.type} · setup by {i.setupBy}</div>
                </div>
                <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: radius.pill, background: `${s.color}15`, color: s.color, border: `0.5px solid ${s.color}40`, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: typography.family.mono }}>{s.label}</span>
              </div>
              <div style={{ padding: '8px 10px', background: colors.bg, borderRadius: radius.sm, fontSize: '11px', color: colors.text2, fontFamily: typography.family.mono, marginBottom: '10px', wordBreak: 'break-all' }}>{i.destination}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', color: colors.text2 }}>
                <div><div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>Last run</div><div style={{ fontSize: '11px', color: colors.ink }}>{i.lastRun}</div></div>
                <div><div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>Next run</div><div style={{ fontSize: '11px', color: colors.ink }}>{i.nextRun}</div></div>
              </div>
              <div style={{ fontSize: '10px', color: colors.text3, marginTop: '8px' }}>Last sync: {i.rowsSentLast}</div>
            </Card>
          );
        })}
      </div>
      <Button variant="primary" size="sm" icon={<Icons.IconPlus size={12} />} onClick={() => toast.success('Integration catalog opened')}>Add integration</Button>
    </>
  );
}

function StatTile({ stat }: any) {
  return (
    <Card padded style={{ padding: '16px 18px' }}>
      <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>{stat.label}</div>
      <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.02em', marginBottom: '4px' }}>{stat.value}</div>
      <div style={{ fontSize: '11px', color: colors.text2 }}>{stat.sub}</div>
    </Card>
  );
}
