import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const AMBER = '#B48C3C';
const RED   = '#D64545';

type InnerTab = 'entities' | 'splits' | 'multiCurrency' | 'rbac' | 'twoFA' | 'audit' | 'schedule' | 'sdk';

export function Enterprise() {
  const { data, loading, error, refetch } = useAsync(() => configService.getEnterprise(), []);
  const [tab, setTab] = useState<InnerTab>('entities');

  if (error) return <ErrorState message={`Couldn't load enterprise — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading enterprise" />;

  const tabs: Array<{ id: InnerTab; label: string; hint: string }> = [
    { id: 'entities',      label: 'Entities',       hint: `${data.entities.entities.length} MIDs` },
    { id: 'splits',        label: 'Splits',          hint: `${data.splits.rules.length} rules` },
    { id: 'multiCurrency', label: 'Multi-currency',  hint: `${data.multiCurrency.holdingAccounts.length} accounts` },
    { id: 'rbac',          label: 'Roles · RBAC',    hint: `${data.rbac.roles.length} roles · ${data.rbac.users.length} users` },
    { id: 'twoFA',         label: '2FA',             hint: data.twoFA.stats[0].value },
    { id: 'audit',         label: 'Operator audit',  hint: `${data.operatorAudit.events.length} recent` },
    { id: 'schedule',      label: 'Settlement',      hint: data.settlementSchedule.currentSchedule.cadence },
    { id: 'sdk',           label: 'Mobile SDKs',     hint: `${data.mobileSDK.sdks.length} platforms` },
  ];

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '18px' }}>
        <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{data.header.kicker}</Kicker>
        <div style={{ ...typography.pageTitle, color: colors.ink }}>{data.header.title}</div>
        <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{data.header.subtitle}</div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.md, border: `0.5px solid ${colors.border}`, marginBottom: '22px' }}>
        {tabs.map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 14px', borderRadius: radius.sm, fontSize: '12px', fontWeight: active ? 600 : 500,
              background: active ? colors.card : 'transparent',
              color: active ? colors.ink : colors.text2,
              border: active ? '0.5px solid rgba(28,111,107,0.3)' : '0.5px solid transparent',
              cursor: 'pointer', fontFamily: typography.family.sans,
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              boxShadow: active ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
              transition: 'all 0.15s ease',
            }}>
              <span>{t.label}</span>
              <span style={{ fontSize: '10px', color: active ? colors.teal : colors.text3, opacity: 0.85, fontFamily: typography.family.mono }}>{t.hint}</span>
            </button>
          );
        })}
      </div>

      {tab === 'entities'      && <EntitiesView data={data.entities} />}
      {tab === 'splits'        && <SplitsView data={data.splits} />}
      {tab === 'multiCurrency' && <MultiCurrencyView data={data.multiCurrency} />}
      {tab === 'rbac'          && <RBACView data={data.rbac} />}
      {tab === 'twoFA'         && <TwoFAView data={data.twoFA} />}
      {tab === 'audit'         && <OperatorAuditView data={data.operatorAudit} />}
      {tab === 'schedule'      && <ScheduleView data={data.settlementSchedule} />}
      {tab === 'sdk'           && <SDKView data={data.mobileSDK} />}
    </div>
  );
}

// ── P5.1 Entities / multi-MID ──────────────────────────────────────
function EntitiesView({ data }: any) {
  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '12px', maxWidth: '720px' }}>{data.summary}</div>
      <Card padded style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: radius.md, background: colors.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>{data.superAccount.charAt(0)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>Super-account</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, marginTop: '2px' }}>{data.superAccount}</div>
          <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono, marginTop: '2px' }}>CIN: {data.superAccountCIN}</div>
        </div>
        <Button variant="primary" size="sm" icon={<Icons.IconPlus size={12} />} onClick={() => toast.success('Entity onboarding wizard opened')}>Add entity</Button>
      </Card>

      <Card padded={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.1fr 1fr 1fr 0.8fr', gap: '14px', padding: '12px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Entity</div><div>PAN · GSTIN</div><div>Settlement bank</div><div>MID</div><div style={{ textAlign: 'right' }}>Volume / mo</div><div style={{ textAlign: 'right' }}>Status</div>
        </div>
        {data.entities.map((e: any, i: number) => (
          <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.1fr 1fr 1fr 0.8fr', gap: '14px', padding: '14px 24px', borderBottom: i < data.entities.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px', opacity: e.active ? 1 : 0.55 }}>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{e.name}</div>
              <div style={{ color: colors.text3, fontSize: '10px' }}>{e.category}</div>
            </div>
            <div>
              <div style={{ color: colors.ink, fontFamily: typography.family.mono, fontSize: '11px' }}>{e.pan}</div>
              <div style={{ color: colors.text3, fontFamily: typography.family.mono, fontSize: '10px' }}>{e.gstin}</div>
            </div>
            <div style={{ color: colors.text2, fontFamily: typography.family.mono, fontSize: '11px' }}>{e.settlementBank}</div>
            <div style={{ color: colors.text2, fontFamily: typography.family.mono, fontSize: '11px' }}>{e.mid}</div>
            <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 600 }}>{e.monthlyVolume}</div>
            <div style={{ textAlign: 'right' }}>{e.active ? <Pill tone="teal">active</Pill> : <Pill tone="outline">dormant</Pill>}</div>
          </div>
        ))}
      </Card>

      <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(28,111,107,0.05)', border: '0.5px solid rgba(28,111,107,0.2)', borderRadius: radius.md, fontSize: '11px', color: colors.text2, lineHeight: 1.55 }}>
        <span style={{ fontSize: '9px', color: colors.teal, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginRight: '6px' }}>Regulatory</span>
        {data.regulationRef}
      </div>
    </>
  );
}

// ── P5.2 Splits ─────────────────────────────────────────────────────
function SplitsView({ data }: any) {
  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => <StatTile key={s.label} stat={s} />)}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
        <Kicker>Split rules</Kicker>
        <Button variant="primary" size="sm" icon={<Icons.IconPlus size={12} />} onClick={() => toast.success('Split rule builder opened')}>New rule</Button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
        {data.rules.map((r: any) => (
          <Card key={r.id} padded style={{ padding: '18px 20px', opacity: r.active ? 1 : 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: colors.ink }}>{r.name}</span>
                  {r.active ? <Pill tone="teal">active</Pill> : <Pill tone="outline">paused</Pill>}
                </div>
                <div style={{ fontSize: '11px', color: colors.text3 }}>Scope: {r.scope}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: colors.teal, fontFamily: typography.family.mono }}>{r.cumulative}</div>
                <div style={{ fontSize: '10px', color: colors.text3 }}>cumulative · last {r.lastFired}</div>
              </div>
            </div>
            <div style={{ display: 'flex', height: '20px', borderRadius: radius.sm, overflow: 'hidden', marginBottom: '8px' }}>
              {r.splits.map((s: any, idx: number) => {
                const palette = [colors.teal, AMBER, '#6739B7', RED];
                return <div key={idx} style={{ width: `${s.pct}%`, background: palette[idx % palette.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff', fontWeight: 600, fontFamily: typography.family.mono }}>{s.pct}%</div>;
              })}
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              {r.splits.map((s: any, idx: number) => {
                const palette = [colors.teal, AMBER, '#6739B7', RED];
                return (
                  <div key={idx} style={{ fontSize: '11px', color: colors.text2, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: palette[idx % palette.length] }} />
                    <span style={{ color: colors.ink, fontWeight: 500 }}>{s.party}</span> · {s.pct}%
                  </div>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <Kicker style={{ marginBottom: '10px' }}>Recent splits · last firings</Kicker>
      <Card padded={false}>
        {data.recentSplits.map((sp: any, i: number) => (
          <div key={sp.id} style={{ padding: '14px 22px', borderBottom: i < data.recentSplits.length - 1 ? `0.5px solid ${colors.border}` : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: colors.text3, fontFamily: typography.family.mono }}>{sp.id}</span>
                <span style={{ fontSize: '10px', color: colors.text3 }}>· txn {sp.txn} · {sp.firedAt}</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{sp.totalAmount}</span>
            </div>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '11px' }}>
              {sp.parts.map((p: any, idx: number) => (
                <div key={idx} style={{ color: colors.text2 }}>
                  {p.party} <span style={{ color: colors.ink, fontFamily: typography.family.mono, fontWeight: 600 }}>{p.amount}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}

// ── P5.3 Multi-currency ─────────────────────────────────────────────
function MultiCurrencyView({ data }: any) {
  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.holdingAccounts.map((h: any) => (
          <Card key={h.currency} padded style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', padding: '3px 9px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontFamily: typography.family.mono, fontWeight: 600, color: colors.ink, letterSpacing: '0.04em' }}>{h.currency}</span>
              {h.balance === '£0' || h.balance === '$0' || h.balance === '€0' ? <Pill tone="outline">pending</Pill> : <Pill tone="teal">active</Pill>}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.02em', marginBottom: '6px' }}>{h.balance}</div>
            <div style={{ fontSize: '11px', color: colors.text2, marginBottom: '12px' }}>{h.provider}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '10px' }}>
              <div><div style={{ color: colors.text3, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Account</div><div style={{ color: colors.ink, fontFamily: typography.family.mono }}>{h.accountHint}</div></div>
              <div><div style={{ color: colors.text3, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>30d settled</div><div style={{ color: colors.ink, fontFamily: typography.family.mono }}>{h.settled30d}</div></div>
            </div>
            <div style={{ fontSize: '10px', color: colors.text3, marginTop: '8px' }}>Fee: {h.fee}</div>
          </Card>
        ))}
      </div>

      <Kicker style={{ marginBottom: '10px' }}>Auto-conversion rules</Kicker>
      <Card padded={false} style={{ marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.6fr 0.6fr 0.6fr 0.7fr 1.5fr', gap: '14px', padding: '12px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>From</div><div>To</div><div>Auto</div><div style={{ textAlign: 'right' }}>Rate</div><div>Behaviour</div>
        </div>
        {data.conversions.map((c: any, i: number) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.6fr 0.6fr 0.6fr 0.7fr 1.5fr', gap: '14px', padding: '12px 24px', borderBottom: i < data.conversions.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
            <div style={{ color: colors.ink, fontWeight: 500, fontFamily: typography.family.mono }}>{c.from}</div>
            <div style={{ color: colors.ink, fontWeight: 500, fontFamily: typography.family.mono }}>{c.to}</div>
            <div>{c.auto ? <Pill tone="teal">on</Pill> : <Pill tone="outline">off</Pill>}</div>
            <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 600 }}>{c.rate}</div>
            <div style={{ color: colors.text2, fontSize: '11px' }}>{c.stickRate}</div>
          </div>
        ))}
      </Card>

      <div style={{ padding: '10px 14px', background: 'rgba(28,111,107,0.05)', border: '0.5px solid rgba(28,111,107,0.2)', borderRadius: radius.md, fontSize: '11px', color: colors.text2, lineHeight: 1.55 }}>
        <span style={{ fontSize: '9px', color: colors.teal, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginRight: '6px' }}>Regulatory</span>
        {data.regulationRef}
      </div>
    </>
  );
}

// ── P5.5 RBAC ─────────────────────────────────────────────────────
function RBACView({ data }: any) {
  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>

      <Kicker style={{ marginBottom: '10px' }}>Roles · {data.roles.length}</Kicker>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
        {data.roles.map((r: any) => (
          <Card key={r.id} padded style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>{r.name}</span>
                  {r.builtIn ? <Pill tone="outline">built-in</Pill> : <Pill tone="teal">custom</Pill>}
                </div>
              </div>
              <span style={{ fontSize: '12px', fontFamily: typography.family.mono, color: colors.ink, fontWeight: 600 }}>{r.userCount} {r.userCount === 1 ? 'user' : 'users'}</span>
            </div>
            <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.55, marginBottom: '8px' }}>{r.description}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {r.permissions.slice(0, 4).map((p: string, i: number) => (
                <span key={i} style={{ fontSize: '9px', padding: '2px 6px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, color: colors.text2, fontFamily: typography.family.mono }}>{p}</span>
              ))}
              {r.permissions.length > 4 && <span style={{ fontSize: '9px', color: colors.text3, padding: '2px 6px' }}>+{r.permissions.length - 4} more</span>}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
        <Kicker>Users · {data.users.length}</Kicker>
        <Button variant="primary" size="sm" icon={<Icons.IconPlus size={12} />} onClick={() => toast.success('Invite user · email sent')}>Invite</Button>
      </div>
      <Card padded={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 1fr 1fr 1fr', gap: '14px', padding: '12px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>User</div><div>Email</div><div>Role</div><div>2FA</div><div style={{ textAlign: 'right' }}>Last active</div>
        </div>
        {data.users.map((u: any, i: number) => {
          const role = data.roles.find((r: any) => r.id === u.role);
          return (
            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.4fr 1fr 1fr 1fr', gap: '14px', padding: '12px 24px', borderBottom: i < data.users.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: colors.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 600 }}>{u.name.split(' ').map((p: string) => p[0]).slice(0, 2).join('')}</div>
                <span style={{ color: colors.ink, fontWeight: 500 }}>{u.name}</span>
              </div>
              <div style={{ color: colors.text2, fontFamily: typography.family.mono, fontSize: '11px' }}>{u.email}</div>
              <div style={{ color: colors.text2 }}>{role?.name || u.role}</div>
              <div>
                {u.twoFAMethod === 'None' ? <Pill tone="amber">missing</Pill> : <span style={{ fontSize: '11px', color: colors.text2 }}>{u.twoFAMethod}</span>}
                <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>{u.last2fa}</div>
              </div>
              <div style={{ textAlign: 'right', color: u.lastActive === 'Active now' ? colors.teal : colors.text3, fontSize: '11px', fontFamily: typography.family.mono }}>{u.lastActive}</div>
            </div>
          );
        })}
      </Card>
    </>
  );
}

// ── P5.6 2FA ────────────────────────────────────────────────────────
function TwoFAView({ data }: any) {
  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => <StatTile key={s.label} stat={s} />)}
      </div>

      <Card padded style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(28,111,107,0.05)', border: '0.5px solid rgba(28,111,107,0.25)' }}>
        <Icons.IconShield size={24} color={colors.teal} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: colors.ink, marginBottom: '2px' }}>Policy</div>
          <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.55 }}>{data.policy}</div>
        </div>
      </Card>

      <Kicker style={{ marginBottom: '10px' }}>Available methods</Kicker>
      <Card padded={false}>
        {data.methods.map((m: any, i: number) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.6fr 1.4fr 0.8fr 0.6fr', gap: '14px', padding: '14px 24px', borderBottom: i < data.methods.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px', opacity: m.secure ? 1 : 0.55 }}>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{m.method}</div>
            </div>
            <div style={{ textAlign: 'center', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 600 }}>{m.enrolledUsers}</div>
            <div style={{ color: colors.text2, fontSize: '11px' }}>{m.availableFor}</div>
            <div>{m.recommended === true ? <Pill tone="teal">recommended</Pill> : m.recommended === false ? <Pill tone="amber">disabled</Pill> : <span style={{ fontSize: '10px', color: colors.text2 }}>{m.recommended}</span>}</div>
            <div style={{ textAlign: 'right' }}>{m.secure ? <Icons.IconCheck size={14} color={colors.teal} /> : <span style={{ fontSize: '10px', color: RED }}>insecure</span>}</div>
          </div>
        ))}
      </Card>
    </>
  );
}

// ── P5.7 Operator audit ─────────────────────────────────────────
function OperatorAuditView({ data }: any) {
  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => <StatTile key={s.label} stat={s} />)}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
        <Kicker>Recent events</Kicker>
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button variant="ghost" size="sm" icon={<Icons.IconDownload size={12} />} onClick={() => toast.success('Audit log exported · CSV signed')}>Export CSV</Button>
        </div>
      </div>
      <Card padded={false}>
        {data.events.map((e: any, i: number) => {
          const sevColor = e.severity === 'high' ? RED : e.severity === 'elevated' ? AMBER : colors.text3;
          return (
            <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '4px 1.2fr 1fr 1.6fr 1.6fr 1fr', gap: '14px', padding: '12px 20px', borderBottom: i < data.events.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
              <div style={{ width: '4px', height: '24px', background: sevColor, borderRadius: '2px' }} />
              <div>
                <div style={{ color: colors.ink, fontWeight: 500 }}>{e.actor}</div>
                <div style={{ color: colors.text3, fontSize: '10px' }}>{e.actorRole}</div>
              </div>
              <div>
                <span style={{ fontSize: '9px', padding: '2px 7px', borderRadius: radius.pill, background: `${sevColor}15`, color: sevColor, border: `0.5px solid ${sevColor}40`, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: typography.family.mono }}>{e.severity}</span>
              </div>
              <div style={{ color: colors.ink }}>{e.action}</div>
              <div style={{ color: colors.text2, fontSize: '11px', fontFamily: typography.family.mono, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.target}</div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{e.at}</div>
                <div style={{ fontSize: '9px', color: colors.text3, fontFamily: typography.family.mono }}>{e.ip}</div>
              </div>
            </div>
          );
        })}
      </Card>
    </>
  );
}

// ── P4.3 Settlement schedule ─────────────────────────────────
function ScheduleView({ data }: any) {
  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>

      <Card padded style={{ marginBottom: '20px', background: 'linear-gradient(135deg, rgba(28,111,107,0.06), rgba(28,111,107,0.01))', border: '0.5px solid rgba(28,111,107,0.3)' }}>
        <div style={{ fontSize: '10px', color: colors.teal, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>Current schedule · {data.currentSchedule.tier} tier</div>
        <div style={{ fontSize: '24px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.015em', marginBottom: '4px' }}>{data.currentSchedule.cadence}</div>
        <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '14px' }}>Cutoff <span style={{ fontFamily: typography.family.mono, color: colors.ink }}>{data.currentSchedule.cutoffTime}</span> · first landing <span style={{ fontFamily: typography.family.mono, color: colors.ink }}>{data.currentSchedule.firstLandingTime}</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          {Object.entries(data.currentSchedule.specialRails).map(([key, val]: any) => (
            <div key={key} style={{ padding: '10px 12px', background: colors.card, borderRadius: radius.sm, border: `0.5px solid ${colors.border}` }}>
              <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>{key.replace(/_/g, ' ')}</div>
              <div style={{ fontSize: '11px', color: colors.ink }}>{val}</div>
            </div>
          ))}
        </div>
      </Card>

      <Kicker style={{ marginBottom: '10px' }}>Available tiers</Kicker>
      <Card padded={false} style={{ marginBottom: '20px' }}>
        {data.availableOptions.map((o: any, i: number) => {
          const isCurrent = (data.currentSchedule.tier === 'low' && o.id === 'tier_t1');
          return (
            <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr 0.8fr 1.6fr', gap: '14px', padding: '14px 24px', borderBottom: i < data.availableOptions.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px', background: isCurrent ? 'rgba(28,111,107,0.04)' : 'transparent' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: colors.ink, fontWeight: 600 }}>{o.name}</span>
                  {isCurrent && <Pill tone="teal">current</Pill>}
                </div>
              </div>
              <div style={{ color: colors.text2 }}>{o.cadence}</div>
              <div style={{ color: colors.text3, fontSize: '11px', fontFamily: typography.family.mono }}>{o.cutoffs}</div>
              <div style={{ color: colors.ink, fontFamily: typography.family.mono, fontWeight: 500 }}>{o.fee}</div>
              <div style={{ color: colors.text2, fontSize: '11px' }}>{o.availableTo}</div>
            </div>
          );
        })}
      </Card>

      <Kicker style={{ marginBottom: '10px' }}>MDR by method</Kicker>
      <Card padded={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr 1.4fr', gap: '14px', padding: '12px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Method</div><div style={{ textAlign: 'right' }}>MDR</div><div>Payze portion</div>
        </div>
        {data.mdrBreakdown.map((m: any, i: number) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr 1.4fr', gap: '14px', padding: '12px 24px', borderBottom: i < data.mdrBreakdown.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
            <div style={{ color: colors.ink, fontWeight: 500 }}>{m.method}</div>
            <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 600 }}>{m.mdr}</div>
            <div style={{ color: colors.text2, fontFamily: typography.family.mono, fontSize: '11px' }}>{m.payzeFee}</div>
          </div>
        ))}
      </Card>
    </>
  );
}

// ── P5.4 Mobile SDK ─────────────────────────────────────────────
function SDKView({ data }: any) {
  const [activeSdk, setActiveSdk] = useState(data.sdks[0].platform);
  const sdk = data.sdks.find((s: any) => s.platform === activeSdk);

  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {data.sdks.map((s: any) => (
          <button key={s.platform} onClick={() => setActiveSdk(s.platform)} style={{
            padding: '8px 16px', borderRadius: radius.pill,
            background: activeSdk === s.platform ? colors.ink : colors.card,
            color: activeSdk === s.platform ? '#fff' : colors.text2,
            border: `0.5px solid ${activeSdk === s.platform ? colors.ink : colors.border}`,
            fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: typography.family.sans,
          }}>{s.platform}</button>
        ))}
      </div>

      <Card padded style={{ marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
          <div><div style={kbdLabel}>Version</div><div style={kbdValue}>{sdk.version}</div></div>
          <div><div style={kbdLabel}>Language</div><div style={kbdValue}>{sdk.language}</div></div>
          <div><div style={kbdLabel}>Min OS</div><div style={kbdValue}>{sdk.minOS}</div></div>
          <div><div style={kbdLabel}>Binary size</div><div style={kbdValue}>{sdk.binarySize}</div></div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>Install</div>
          <div style={{ padding: '10px 14px', background: '#1A1A1A', color: '#E4E4E0', fontFamily: typography.family.mono, fontSize: '12px', borderRadius: radius.sm, marginBottom: '6px' }}>{sdk.install}</div>
          <div style={{ fontSize: '10px', color: colors.text3 }}>or {sdk.installAlt}</div>
        </div>

        <div>
          <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>Quick start</div>
          <pre style={{ padding: '14px 18px', background: '#1A1A1A', color: '#E4E4E0', fontFamily: typography.family.mono, fontSize: '12px', borderRadius: radius.md, overflowX: 'auto', lineHeight: 1.65, margin: 0 }}>{sdk.snippet}</pre>
        </div>
      </Card>

      <Kicker style={{ marginBottom: '10px' }}>What you get</Kicker>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {data.features.map((f: string, i: number) => (
          <div key={i} style={{ display: 'flex', gap: '10px', padding: '12px 14px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.md }}>
            <Icons.IconCheck size={14} color={colors.teal} strokeWidth={2.5} />
            <span style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.5 }}>{f}</span>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Helpers ────────────────────────────────────────────────────────
function StatTile({ stat }: any) {
  return (
    <Card padded style={{ padding: '16px 18px' }}>
      <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>{stat.label}</div>
      <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.02em', marginBottom: '4px' }}>{stat.value}</div>
      <div style={{ fontSize: '11px', color: colors.text2 }}>{stat.sub}</div>
    </Card>
  );
}

const kbdLabel: React.CSSProperties = { fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' };
const kbdValue: React.CSSProperties = { fontSize: '13px', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 500 };
