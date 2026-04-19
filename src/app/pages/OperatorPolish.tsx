import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState, Modal } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const AMBER = '#B48C3C';
const RED   = '#D64545';

type InnerTab = 'fraud' | 'disputeNotif' | 'disputeUploads' | 'receipts' | 'subAnalytics';

export function OperatorPolish() {
  const { data, loading, error, refetch } = useAsync(() => configService.getOperatorPolish(), []);
  const [tab, setTab] = useState<InnerTab>('fraud');

  if (error) return <ErrorState message={`Couldn't load operator tools — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading operator tools" />;

  const tabs: Array<{ id: InnerTab; label: string; hint: string }> = [
    { id: 'fraud',          label: 'Fraud rules',         hint: `${data.fraudRules.rules.length} rules · ${data.fraudRules.rules.filter((r: any) => r.active).length} active` },
    { id: 'disputeUploads', label: 'Evidence uploads',     hint: `${data.disputeUploads.queue.length} in queue` },
    { id: 'disputeNotif',   label: 'Dispute alerts',        hint: `${data.disputeNotifications.rules.filter((r: any) => r.active).length} rules on` },
    { id: 'receipts',       label: 'Receipt editor',        hint: `${data.receiptEditor.currentTemplate.blocks.length} blocks` },
    { id: 'subAnalytics',   label: 'Subscription analytics', hint: data.subscriptionAnalytics.stats[0].value },
  ];

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '18px' }}>
        <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Operator tools</Kicker>
        <div style={{ ...typography.pageTitle, color: colors.ink }}>Operator polish</div>
        <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>The tools your risk, finance, and CS teams use every day.</div>
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

      {tab === 'fraud'          && <FraudRulesView data={data.fraudRules} />}
      {tab === 'disputeUploads' && <DisputeUploadsView data={data.disputeUploads} />}
      {tab === 'disputeNotif'   && <DisputeNotifView data={data.disputeNotifications} />}
      {tab === 'receipts'       && <ReceiptEditorView data={data.receiptEditor} />}
      {tab === 'subAnalytics'   && <SubAnalyticsView data={data.subscriptionAnalytics} />}
    </div>
  );
}

// ── P6.1 Fraud rule editor ─────────────────────────────────────────
function FraudRulesView({ data }: any) {
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const actionMap: Record<string, { color: string; label: string }> = {
    block:         { color: RED,         label: 'BLOCK' },
    step_up_3ds:   { color: AMBER,       label: 'STEP-UP 3DS' },
    manual_review: { color: AMBER,       label: 'MANUAL REVIEW' },
    log_only:      { color: colors.teal, label: 'LOG ONLY' },
  };

  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => <StatTile key={s.label} stat={s} />)}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
        <Kicker>Active rules</Kicker>
        <Button variant="primary" size="sm" icon={<Icons.IconPlus size={12} />} onClick={() => setCreating(true)}>New rule</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.rules.map((r: any) => {
          const a = actionMap[r.action] || actionMap.log_only;
          return (
            <Card key={r.id} padded onClick={() => setEditing(r)} style={{ padding: '18px 22px', cursor: 'pointer', opacity: r.active ? 1 : 0.55 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{r.name}</span>
                    <Pill tone="outline">{r.category}</Pill>
                    {r.active ? <Pill tone="teal">active</Pill> : <Pill tone="outline">paused</Pill>}
                    <span style={{ fontSize: '9px', padding: '2px 8px', background: `${a.color}15`, color: a.color, border: `0.5px solid ${a.color}40`, borderRadius: radius.pill, fontWeight: 700, letterSpacing: '0.08em', fontFamily: typography.family.mono }}>→ {a.label}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '10px' }}>{r.description}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {r.conditions.map((c: any, i: number) => (
                      <span key={i} style={{ fontSize: '10px', padding: '4px 9px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, fontFamily: typography.family.mono, color: colors.text2 }}>
                        <span style={{ color: colors.ink }}>{c.field}</span> <span style={{ color: colors.teal, fontWeight: 700 }}>{c.op}</span> <span style={{ color: colors.ink }}>{c.value}</span>
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, minWidth: '120px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{r.fires30d}</div>
                  <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>fires · 30d</div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', fontSize: '10px' }}>
                    <span style={{ color: colors.teal, fontFamily: typography.family.mono }}>{r.trueFraud30d}T</span>
                    <span style={{ color: AMBER, fontFamily: typography.family.mono }}>{r.falsePositives30d}FP</span>
                  </div>
                  <div style={{ fontSize: '10px', color: colors.text3, marginTop: '4px' }}>{r.lastFired}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {(editing || creating) && <RuleEditor rule={editing} actionPalette={data.actionPalette} fieldCatalog={data.fieldCatalog} onClose={() => { setEditing(null); setCreating(false); }} />}
    </>
  );
}

function RuleEditor({ rule, actionPalette, fieldCatalog, onClose }: any) {
  const isNew = !rule;
  const [name, setName] = useState(rule?.name || '');
  const [description, setDescription] = useState(rule?.description || '');
  const [action, setAction] = useState(rule?.action || 'log_only');

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.45)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '640px', maxWidth: '100%', height: '100%', background: colors.card, borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '4px' }}>{isNew ? 'New rule' : 'Edit rule'}</Kicker>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono }}>{name || 'unnamed_rule'}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Rule name (snake_case)</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="velocity_anomaly_v3" style={{ ...inputStyle, fontFamily: typography.family.mono }} />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="What this rule catches" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Action when matched</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {actionPalette.map((a: any) => {
                const colorMap: Record<string, string> = { red: RED, amber: AMBER, teal: colors.teal };
                const color = colorMap[a.color] || colors.text2;
                const selected = action === a.id;
                return (
                  <button key={a.id} onClick={() => setAction(a.id)} style={{
                    padding: '12px 14px',
                    background: selected ? `${color}10` : colors.bg,
                    border: `0.5px solid ${selected ? color : colors.border}`,
                    borderRadius: radius.md, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: colors.ink }}>{a.label}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: colors.text2, lineHeight: 1.4 }}>{a.description}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Conditions {!isNew && <span style={{ color: colors.text3, fontWeight: 400, marginLeft: '6px' }}>(showing existing)</span>}</label>
            {!isNew && rule.conditions.map((c: any, i: number) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.6fr 1fr', gap: '6px', marginBottom: '6px' }}>
                <input value={c.field} readOnly style={{ ...inputStyle, fontFamily: typography.family.mono, fontSize: '11px' }} />
                <input value={c.op} readOnly style={{ ...inputStyle, fontFamily: typography.family.mono, fontSize: '11px', textAlign: 'center' }} />
                <input value={c.value} readOnly style={{ ...inputStyle, fontFamily: typography.family.mono, fontSize: '11px' }} />
              </div>
            ))}
            <Button variant="ghost" size="sm" icon={<Icons.IconPlus size={11} />} onClick={() => toast.success('Condition row added')}>Add condition</Button>
          </div>

          <div>
            <label style={labelStyle}>Available fields</label>
            <div style={{ background: colors.bg, padding: '10px 12px', borderRadius: radius.sm, display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
              {fieldCatalog.flatMap((ns: any) => ns.fields.map((f: string) => `${ns.namespace}.${f}`)).map((f: string) => (
                <span key={f} style={{ fontSize: '10px', padding: '3px 7px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, fontFamily: typography.family.mono, color: colors.text2 }}>{f}</span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `0.5px solid ${colors.border}`, marginTop: '6px' }}>
            <Button variant="secondary" size="sm" onClick={() => toast.success('Tested against last 30d · would have fired 142 times · 138T / 4FP')}>Test against history</Button>
            <Button variant="primary" size="sm" onClick={() => { toast.success(isNew ? 'Rule shipped · live in 30s' : 'Rule updated · live in 30s'); onClose(); }} style={{ marginLeft: 'auto' }}>{isNew ? 'Ship rule' : 'Save'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── P6.2 Dispute uploads ────────────────────────────────────────
function DisputeUploadsView({ data }: any) {
  const [active, setActive] = useState<any>(data.queue[0]);
  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px' }}>
        {/* Queue list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.queue.map((d: any) => {
            const isCritical = d.status === 'critical';
            const isActive = active?.id === d.id;
            return (
              <button key={d.id} onClick={() => setActive(d)} style={{
                padding: '14px 16px', textAlign: 'left',
                background: isActive ? colors.card : colors.bg,
                border: isActive ? `0.5px solid rgba(28,111,107,0.4)` : `0.5px solid ${colors.border}`,
                borderRadius: radius.md, cursor: 'pointer', fontFamily: 'inherit',
                borderLeft: isCritical ? `3px solid ${RED}` : (isActive ? `3px solid ${colors.teal}` : `3px solid transparent`),
              }}>
                <div style={{ fontSize: '11px', color: colors.text3, fontFamily: typography.family.mono, marginBottom: '3px' }}>{d.id}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, marginBottom: '3px' }}>{d.merchant}</div>
                <div style={{ fontSize: '11px', color: colors.text2, marginBottom: '6px' }}>{d.customer} · {d.amount}</div>
                <div style={{ fontSize: '10px', color: isCritical ? RED : (d.hoursLeft < 48 ? AMBER : colors.text3), fontFamily: typography.family.mono, fontWeight: isCritical ? 700 : 500 }}>
                  {isCritical ? `⚠ ${d.hoursLeft}h left` : `${d.hoursLeft}h left`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Detail */}
        {active && (
          <Card padded style={{ padding: '24px 26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <Kicker style={{ marginBottom: '4px' }}>Dispute · {active.id}</Kicker>
                <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.015em' }}>{active.amount}</div>
                <div style={{ fontSize: '12px', color: colors.text2, marginTop: '2px' }}>{active.merchant} · {active.customer}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '3px' }}>Deadline</div>
                <div style={{ fontSize: '12px', color: colors.ink, fontFamily: typography.family.mono }}>{active.deadline}</div>
              </div>
            </div>

            {active.winProbability !== null && (
              <div style={{ padding: '14px 16px', background: active.winProbability >= 60 ? 'rgba(28,111,107,0.06)' : 'rgba(214,69,69,0.05)', border: `0.5px solid ${active.winProbability >= 60 ? 'rgba(28,111,107,0.25)' : 'rgba(214,69,69,0.2)'}`, borderRadius: radius.md, marginBottom: '14px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: active.winProbability >= 60 ? colors.teal : RED, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 700, fontFamily: typography.family.mono, flexShrink: 0 }}>{active.winProbability}%</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '10px', color: active.winProbability >= 60 ? colors.teal : RED, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>Win probability</div>
                  <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55 }}>{active.narrative}</div>
                </div>
              </div>
            )}

            {/* Dropzone */}
            <div style={{ padding: '24px', background: colors.bg, border: `1.5px dashed ${colors.borderHover}`, borderRadius: radius.md, marginBottom: '14px', textAlign: 'center', cursor: 'pointer' }} onClick={() => toast.success('File picker opened')}>
              <Icons.IconFileText size={20} color={colors.text2} />
              <div style={{ fontSize: '12px', color: colors.ink, fontWeight: 500, marginTop: '6px' }}>Drop evidence files here</div>
              <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>PDF · JPG · PNG · CSV up to 10 MB · auto-OCR + categorize</div>
            </div>

            {active.evidenceCollected.length > 0 && (
              <>
                <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Collected · {active.evidenceCollected.length}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  {active.evidenceCollected.map((e: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm }}>
                      <Icons.IconCheck size={14} color={colors.teal} strokeWidth={2.5} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', color: colors.ink, fontWeight: 500 }}>{e.type}</div>
                        <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{e.filename} · {e.size} · uploaded {e.uploadedAt}</div>
                      </div>
                      {e.ocrComplete && <Pill tone="teal">OCR done</Pill>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {active.evidenceMissing.length > 0 && (
              <>
                <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>Missing · {active.evidenceMissing.length}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  {active.evidenceMissing.map((e: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(180,140,60,0.06)', border: `0.5px solid rgba(180,140,60,0.25)`, borderRadius: radius.sm }}>
                      <Icons.IconAlert size={14} color={AMBER} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', color: colors.ink, fontWeight: 500 }}>{e.type} {e.required && <span style={{ color: RED, fontSize: '10px', marginLeft: '4px' }}>required</span>}</div>
                        <div style={{ fontSize: '10px', color: colors.text2 }}>{e.hint}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '8px', paddingTop: '14px', borderTop: `0.5px solid ${colors.border}` }}>
              <Button variant="primary" size="sm" disabled={active.evidenceMissing.some((e: any) => e.required)} onClick={() => toast.success('Evidence submitted to acquirer · Visa Resolve Online')}>Submit to acquirer</Button>
              <Button variant="secondary" size="sm" onClick={() => toast.success('Evidence saved as draft')}>Save draft</Button>
              <Button variant="ghost" size="sm" onClick={() => toast.success('Accepted · merchant refunded customer')} style={{ marginLeft: 'auto' }}>Accept & refund</Button>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}

// ── P6.3 Dispute notifications ─────────────────────────────────
function DisputeNotifView({ data }: any) {
  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
        <Kicker>Notification rules</Kicker>
        <Button variant="primary" size="sm" icon={<Icons.IconPlus size={12} />} onClick={() => toast.success('Notification builder opened')}>New rule</Button>
      </div>

      <Card padded={false}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 1fr 0.7fr 0.7fr', gap: '14px', padding: '12px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Trigger</div><div>Channels</div><div>Audience</div><div style={{ textAlign: 'right' }}>Fired 30d</div><div style={{ textAlign: 'right' }}>Status</div>
        </div>
        {data.rules.map((r: any, i: number) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 1fr 0.7fr 0.7fr', gap: '14px', padding: '14px 24px', borderBottom: i < data.rules.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px', opacity: r.active ? 1 : 0.55 }}>
            <div style={{ color: colors.ink, fontWeight: 500 }}>{r.trigger}</div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {r.channels.map((ch: string, idx: number) => (
                <span key={idx} style={{ fontSize: '10px', padding: '2px 7px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, fontFamily: typography.family.mono, color: colors.text2 }}>{ch}</span>
              ))}
            </div>
            <div style={{ color: colors.text2, fontSize: '11px' }}>{r.audience}</div>
            <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 500 }}>{r.fired30d}</div>
            <div style={{ textAlign: 'right' }}>{r.active ? <Pill tone="teal">on</Pill> : <Pill tone="outline">off</Pill>}</div>
          </div>
        ))}
      </Card>
    </>
  );
}

// ── P6.4 Receipt editor ────────────────────────────────────────
function ReceiptEditorView({ data }: any) {
  const [activeBlock, setActiveBlock] = useState<number | null>(null);

  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 280px', gap: '16px' }}>
        {/* Left: Block library */}
        <div>
          <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>Block library</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.blockTypes.map((bt: any) => (
              <button key={bt.type} onClick={() => toast.success(`${bt.label} block added to template`)} style={{
                padding: '10px 12px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: colors.ink }}>{bt.label}</div>
                <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{bt.type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Center: live receipt preview */}
        <Card padded style={{ background: '#FCFCF8', padding: '24px 28px' }}>
          <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>Live preview · {data.currentTemplate.name}</div>

          {data.currentTemplate.blocks.map((b: any, i: number) => {
            const isActive = activeBlock === i;
            return (
              <div key={i} onClick={() => setActiveBlock(i)} style={{
                padding: '14px 16px', marginBottom: '8px',
                background: isActive ? 'rgba(28,111,107,0.06)' : '#fff',
                border: `0.5px solid ${isActive ? 'rgba(28,111,107,0.4)' : colors.border}`,
                borderRadius: radius.sm, cursor: 'pointer',
              }}>
                <div style={{ fontSize: '9px', color: isActive ? colors.teal : colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px', fontFamily: typography.family.mono }}>{b.type}</div>
                {b.type === 'header'    && <div><div style={{ fontSize: '17px', fontWeight: 700, color: colors.ink }}>STUDIO LUMIÈRE</div><div style={{ fontSize: '10px', color: colors.text3 }}>Receipt · INV-2026-00842</div></div>}
                {b.type === 'summary'   && <div><div style={{ fontSize: '24px', fontWeight: 700, color: colors.ink, fontFamily: typography.family.mono }}>₹2,499.00</div><div style={{ fontSize: '10px', color: colors.text3 }}>Paid via Card · HDFC ending 4242</div></div>}
                {b.type === 'lineItems' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '8px', fontSize: '11px' }}>
                    <div style={{ color: colors.ink }}>Brand identity consultation · 1 hr</div>
                    <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono }}>₹2,118.64</div>
                    <div style={{ borderTop: `0.5px solid ${colors.border}`, paddingTop: '4px', color: colors.text3, fontSize: '10px' }}>Subtotal</div>
                    <div style={{ borderTop: `0.5px solid ${colors.border}`, paddingTop: '4px', textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono, fontSize: '10px' }}>₹2,118.64</div>
                  </div>
                )}
                {b.type === 'tax'       && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '4px', fontSize: '11px' }}>
                    <div style={{ color: colors.text2 }}>CGST 9%</div>
                    <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono }}>₹190.68</div>
                    <div style={{ color: colors.text2 }}>SGST 9%</div>
                    <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono }}>₹190.68</div>
                  </div>
                )}
                {b.type === 'footer'    && <div style={{ fontSize: '10px', color: colors.text3 }}>GSTIN: 29AAACS1234A1Z5 · Ferns Icon, Bengaluru 560037 · help@studiolumiere.design</div>}
              </div>
            );
          })}
        </Card>

        {/* Right: Field catalog */}
        <div>
          <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>Merge fields · drag in</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '480px', overflowY: 'auto' }}>
            {Array.from(new Set(data.fieldCatalog.map((f: any) => f.category))).map((cat: any) => (
              <div key={cat}>
                <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, padding: '8px 4px 4px 4px' }}>{cat}</div>
                {data.fieldCatalog.filter((f: any) => f.category === cat).map((f: any) => (
                  <div key={f.name} onClick={() => { navigator.clipboard.writeText(f.name); toast.success(`${f.name} copied`); }} style={{ padding: '6px 10px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, cursor: 'pointer', marginBottom: '3px' }}>
                    <code style={{ fontSize: '10px', color: colors.ink, fontFamily: typography.family.mono }}>{f.name}</code>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
        <Button variant="secondary" size="sm" icon={<Icons.IconDownload size={12} />} onClick={() => toast.success('Test receipt sent to your inbox')}>Send test</Button>
        <Button variant="primary" size="sm" onClick={() => toast.success('Template saved · live in 30s for new receipts')}>Save template</Button>
      </div>
    </>
  );
}

// ── P6.5 Subscription analytics ───────────────────────────────
function SubAnalyticsView({ data }: any) {
  return (
    <>
      <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px', maxWidth: '720px' }}>{data.summary}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => <StatTile key={s.label} stat={s} />)}
      </div>

      {/* MRR trend */}
      <Card padded style={{ marginBottom: '20px' }}>
        <Kicker style={{ marginBottom: '14px' }}>MRR trend · last 7 months</Kicker>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px' }}>
          {data.mrrTrend.map((m: any, i: number) => {
            const maxMrr = Math.max(...data.mrrTrend.map((x: any) => x.mrr));
            const heightPct = (m.mrr / maxMrr) * 100;
            return (
              <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ fontSize: '10px', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 600 }}>₹{(m.mrr / 100000).toFixed(1)}L</div>
                <div style={{ width: '100%', height: `${heightPct}%`, background: i === data.mrrTrend.length - 1 ? colors.teal : colors.borderHover, borderRadius: '3px 3px 0 0', minHeight: '12px' }} />
                <div style={{ fontSize: '9px', color: colors.text3, fontFamily: typography.family.mono }}>{m.month.split(' ')[0]}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Cohort table */}
      <Card padded style={{ marginBottom: '20px' }}>
        <Kicker style={{ marginBottom: '14px' }}>Retention cohorts · % active by month since signup</Kicker>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid ${colors.border}` }}>
                <th style={{ textAlign: 'left', padding: '8px 10px', fontSize: '10px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Cohort</th>
                <th style={{ textAlign: 'right', padding: '8px 10px', fontSize: '10px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>Size</th>
                {[0,1,2,3,4,5,6].map(m => <th key={m} style={{ textAlign: 'center', padding: '8px 10px', fontSize: '10px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>M{m}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.cohorts.map((c: any) => (
                <tr key={c.joined} style={{ borderBottom: `0.5px solid ${colors.border}` }}>
                  <td style={{ padding: '8px 10px', color: colors.ink, fontWeight: 500 }}>{c.joined}</td>
                  <td style={{ padding: '8px 10px', textAlign: 'right', color: colors.text2, fontFamily: typography.family.mono }}>{c.size}</td>
                  {Array.from({ length: 7 }).map((_, idx) => {
                    const v = c.active[idx];
                    if (!v) return <td key={idx} style={{ padding: '8px 10px', textAlign: 'center', color: colors.text3 }}>—</td>;
                    const num = parseInt(v);
                    const intensity = num / 100;
                    return <td key={idx} style={{ padding: '8px 10px', textAlign: 'center', background: `rgba(28,111,107,${intensity * 0.18})`, color: colors.ink, fontFamily: typography.family.mono, fontWeight: 500 }}>{v}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Churn reasons + top plans */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <Card padded>
          <Kicker style={{ marginBottom: '12px' }}>Churn reasons · 30d</Kicker>
          {data.churnReasons.map((r: any) => (
            <div key={r.reason} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px' }}>
                <span style={{ color: colors.ink }}>{r.reason}</span>
                <span style={{ color: colors.text2, fontFamily: typography.family.mono }}>{r.count} · {r.pct}%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: colors.bg, borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${r.pct * 4}%`, maxWidth: '100%', height: '100%', background: colors.teal }} />
              </div>
            </div>
          ))}
        </Card>

        <Card padded={false}>
          <div style={{ padding: '14px 18px', borderBottom: `0.5px solid ${colors.border}` }}>
            <Kicker>Top plans · by MRR</Kicker>
          </div>
          {data.topPlans.map((p: any, i: number) => (
            <div key={p.plan} style={{ padding: '12px 18px', borderBottom: i < data.topPlans.length - 1 ? `0.5px solid ${colors.border}` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: colors.ink, fontWeight: 500 }}>{p.plan}</span>
                <span style={{ fontSize: '13px', color: colors.teal, fontFamily: typography.family.mono, fontWeight: 600 }}>{p.mrr}</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>
                <span>{p.subs.toLocaleString('en-IN')} subs</span>
                <span style={{ color: parseFloat(p.churn) > 5 ? AMBER : colors.teal }}>{p.churn} churn</span>
                <span style={{ color: p.trend === 'up' ? colors.teal : RED, marginLeft: 'auto' }}>{p.trend === 'up' ? '↗ growing' : '↘ declining'}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

// ── Helpers ──────────────────────────────────────────────────
function StatTile({ stat }: any) {
  return (
    <Card padded style={{ padding: '16px 18px' }}>
      <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>{stat.label}</div>
      <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink, fontFamily: typography.family.mono, letterSpacing: '-0.02em', marginBottom: '4px' }}>{stat.value}</div>
      <div style={{ fontSize: '11px', color: colors.text2 }}>{stat.sub}</div>
    </Card>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', color: colors.text2, fontWeight: 500, marginBottom: '6px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, fontSize: '13px', color: colors.ink, outline: 'none', fontFamily: 'inherit' };
