import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState, Modal } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const AMBER = '#B48C3C';
const RED   = '#D64545';

type InnerTab = 'fraud' | 'disputeNotif' | 'receipts';

export function OperatorPolish() {
  const { data, loading, error, refetch } = useAsync(() => configService.getOperatorPolish(), []);
  const [tab, setTab] = useState<InnerTab>('fraud');

  if (error) return <ErrorState message={`Couldn't load operator tools — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading operator tools" />;

  const tabs: Array<{ id: InnerTab; label: string; hint: string }> = [
    { id: 'fraud',          label: 'Fraud rules',         hint: `${data.fraudRules.rules.length} rules · ${data.fraudRules.rules.filter((r: any) => r.active).length} active` },
    { id: 'disputeNotif',   label: 'Dispute alerts',        hint: `${data.disputeNotifications.rules.filter((r: any) => r.active).length} rules on` },
    { id: 'receipts',       label: 'Receipt editor',        hint: `${data.receiptEditor.currentTemplate.blocks.length} blocks` },
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
      {tab === 'disputeNotif'   && <DisputeNotifView data={data.disputeNotifications} />}
      {tab === 'receipts'       && <ReceiptEditorView data={data.receiptEditor} />}
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
