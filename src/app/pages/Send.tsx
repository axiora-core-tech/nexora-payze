import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState, SectionTabs, Modal } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const AMBER = '#B48C3C';
const RED   = '#D64545';

type TabId = 'compose' | 'audit' | 'reminders';

export function Send() {
  const { data, loading, error, refetch } = useAsync(() => configService.getSend(), []);
  const [tab, setTab] = useState<TabId>('compose');
  const [pushMechOpen, setPushMechOpen] = useState(false);

  if (error) return <ErrorState message={`Couldn't load send — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading send" />;

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '18px' }}>
        <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Collect · Send to customer</Kicker>
        <div style={{ ...typography.pageTitle, color: colors.ink }}>Send a payment request</div>
        <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>Reach customers where they are — UPI push, WhatsApp, SMS, email. Track every delivery through to payment.</div>
      </div>

      <SectionTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'compose',   label: 'Compose',        hint: 'New payment request' },
          { id: 'audit',     label: 'Delivery audit', hint: `${data.deliveryAudit.length} recent` },
          { id: 'reminders', label: 'Reminders',      hint: 'Auto-follow-up rules' },
        ]}
      />

      {tab === 'compose'   && <ComposeTab channels={data.channels} smsTemplates={data.smsTemplates} whatsappTemplates={data.whatsappTemplates} upiPushMechanics={data.upiPushMechanics} onShowPushMech={() => setPushMechOpen(true)} />}
      {tab === 'audit'     && <AuditTab audit={data.deliveryAudit} channels={data.channels} />}
      {tab === 'reminders' && <RemindersTab rules={data.reminderRules} />}

      <UpiPushMechModal open={pushMechOpen} mech={data.upiPushMechanics} onClose={() => setPushMechOpen(false)} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Compose · pick channel + recipient + amount
// ══════════════════════════════════════════════════════════════════════
function ComposeTab({ channels, smsTemplates, whatsappTemplates, upiPushMechanics, onShowPushMech }: any) {
  const [channelId, setChannelId] = useState('upi_push');
  const [recipientPhone, setRecipientPhone] = useState('+91 ');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [templateId, setTemplateId] = useState(smsTemplates[0]?.id || '');

  const channel = channels.find((c: any) => c.id === channelId);
  const activeTemplates = channelId === 'sms' ? smsTemplates : channelId === 'whatsapp' ? whatsappTemplates : [];

  const send = () => {
    toast.success('Payment request sent', { description: `${channel?.label} dispatched to ${recipientPhone || recipientEmail}. Track in Delivery audit.` });
    setRecipientPhone('+91 '); setRecipientEmail(''); setCustomerName(''); setAmount(''); setDescription('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '16px' }}>
      {/* Left — composer */}
      <Card padded>
        <Kicker style={{ marginBottom: '14px' }}>Choose a delivery channel</Kicker>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {channels.map((c: any) => {
            const selected = channelId === c.id;
            return (
              <button key={c.id} onClick={() => setChannelId(c.id)} style={{
                display: 'flex', alignItems: 'flex-start', gap: '14px',
                padding: '14px 16px',
                background: selected ? 'rgba(28,111,107,0.06)' : colors.bg,
                border: `0.5px solid ${selected ? 'rgba(28,111,107,0.35)' : colors.border}`,
                borderRadius: radius.md, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                transition: 'all 0.15s',
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: radius.sm, background: selected ? colors.teal : colors.card, border: `0.5px solid ${selected ? colors.teal : colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {c.icon === 'IconQR'   && <Icons.IconQR size={15} color={selected ? '#fff' : colors.ink} />}
                  {c.icon === 'IconBell' && <Icons.IconBell size={15} color={selected ? '#fff' : colors.ink} />}
                  {c.icon === 'IconMail' && <Icons.IconMail size={15} color={selected ? '#fff' : colors.ink} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: colors.ink }}>{c.label}</span>
                    {c.primary && <span style={{ fontSize: '9px', color: colors.teal, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase', padding: '2px 7px', background: 'rgba(28,111,107,0.08)', border: '0.5px solid rgba(28,111,107,0.25)', borderRadius: radius.pill }}>Recommended</span>}
                  </div>
                  <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.5, marginBottom: '4px' }}>{c.subtitle}</div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>
                    <span>Avg conversion <span style={{ color: colors.ink, fontWeight: 600 }}>{c.avgConversion}</span></span>
                    <span>·</span>
                    <span>{c.channelCost}</span>
                    {c.id === 'upi_push' && <button onClick={(e) => { e.stopPropagation(); onShowPushMech(); }} style={{ marginLeft: 'auto', padding: '2px 8px', background: 'transparent', border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '10px', color: colors.text2, cursor: 'pointer', fontFamily: 'inherit' }}>How it works</button>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div style={{ padding: '12px 14px', background: colors.bg, borderRadius: radius.md, marginBottom: '24px', fontSize: '11px', color: colors.text2, lineHeight: 1.55 }}>
          <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>How this channel works</div>
          {channel?.detail}
        </div>

        <Kicker style={{ marginBottom: '14px' }}>Recipient</Kicker>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>Customer name</label>
            <input type="text" placeholder="Rohan Shankar" value={customerName} onChange={e => setCustomerName(e.target.value)} style={inputStyle} />
          </div>
          {channel?.requiresPhone ? (
            <div>
              <label style={labelStyle}>Phone number</label>
              <input type="tel" placeholder="+91 98765 43210" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} style={{ ...inputStyle, fontFamily: typography.family.mono }} />
            </div>
          ) : (
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" placeholder="rohan@example.com" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} style={{ ...inputStyle, fontFamily: typography.family.mono }} />
            </div>
          )}
        </div>

        <Kicker style={{ marginBottom: '14px' }}>Payment details</Kicker>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={labelStyle}>Amount (₹)</label>
            <input type="text" placeholder="4,500" value={amount} onChange={e => setAmount(e.target.value)} style={{ ...inputStyle, fontFamily: typography.family.mono }} />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <input type="text" placeholder="Monthly yoga class · May" value={description} onChange={e => setDescription(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {activeTemplates.length > 0 && (
          <>
            <Kicker style={{ marginBottom: '10px' }}>
              {channelId === 'sms' ? 'DLT template' : 'WhatsApp template'}
              <span style={{ marginLeft: '10px', fontSize: '9px', color: colors.teal, letterSpacing: '0.08em', padding: '2px 8px', background: 'rgba(28,111,107,0.08)', border: '0.5px solid rgba(28,111,107,0.25)', borderRadius: radius.pill, fontWeight: 600, textTransform: 'uppercase' }}>{channelId === 'sms' ? 'TRAI approved' : 'Meta approved'}</span>
            </Kicker>
            <select value={templateId} onChange={e => setTemplateId(e.target.value)} style={{ ...inputStyle, marginBottom: '10px' }}>
              {activeTemplates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <div style={{ padding: '12px 14px', background: colors.bg, borderRadius: radius.md, fontSize: '12px', color: colors.text2, lineHeight: 1.55, fontFamily: typography.family.mono, marginBottom: '20px', whiteSpace: 'pre-line' }}>
              {activeTemplates.find((t: any) => t.id === templateId)?.body}
            </div>
          </>
        )}

        <Button variant="primary" fullWidth icon={<Icons.IconSend size={14} />} onClick={send}>Send payment request</Button>
      </Card>

      {/* Right — preview */}
      <Card padded>
        <Kicker style={{ marginBottom: '14px' }}>Live preview</Kicker>
        {channelId === 'upi_push' && <UpiPushPreview customerName={customerName} amount={amount} description={description} />}
        {channelId === 'sms' && <SmsPreview phone={recipientPhone} customerName={customerName} amount={amount} description={description} />}
        {channelId === 'whatsapp' && <WhatsAppPreview customerName={customerName} amount={amount} description={description} />}
        {channelId === 'email' && <EmailPreview email={recipientEmail} customerName={customerName} amount={amount} description={description} />}
      </Card>
    </div>
  );
}

// ── Channel previews ────────────────────────────────────────────────
function UpiPushPreview({ customerName, amount, description }: any) {
  return (
    <div style={{ padding: '20px', background: '#0B0B0B', borderRadius: radius.lg, color: '#fff' }}>
      <div style={{ fontSize: '9px', color: '#8A8A88', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>PhonePe · Push notification</div>
      <div style={{ padding: '14px 16px', background: '#1A1A1A', border: '0.5px solid #2A2A2A', borderRadius: radius.md }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6739B7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700 }}>P</div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600 }}>PhonePe · Payment Request</div>
            <div style={{ fontSize: '9px', color: '#8A8A88' }}>Just now · from Merchant</div>
          </div>
        </div>
        <div style={{ fontSize: '13px', marginBottom: '4px' }}>{customerName ? `Hi ${customerName.split(' ')[0]},` : 'Hi there,'}</div>
        <div style={{ fontSize: '11px', color: '#B4B4B0', lineHeight: 1.55, marginBottom: '14px' }}>Pay <span style={{ color: '#fff', fontWeight: 600 }}>₹{amount || '—'}</span> to your merchant for {description || 'service'}</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{ flex: 1, padding: '10px', background: '#6739B7', border: 'none', color: '#fff', borderRadius: radius.md, fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}>Pay now</button>
          <button style={{ padding: '10px 14px', background: 'transparent', border: '0.5px solid #2A2A2A', color: '#8A8A88', borderRadius: radius.md, fontSize: '12px', fontFamily: 'inherit' }}>Decline</button>
        </div>
      </div>
      <div style={{ fontSize: '10px', color: '#8A8A88', marginTop: '14px', fontFamily: typography.family.mono, textAlign: 'center' }}>Intent expires in 10 minutes · UPI BHIM spec v2.7</div>
    </div>
  );
}

function SmsPreview({ phone, customerName, amount, description }: any) {
  return (
    <div>
      <div style={{ padding: '14px 16px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, marginBottom: '12px' }}>
        <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono, marginBottom: '6px' }}>{phone || '+91 98765 43210'}</div>
        <div style={{ padding: '12px 14px', background: '#F0F3FB', borderRadius: radius.md, borderTopLeftRadius: '2px', fontSize: '12px', color: '#1A1A1A', lineHeight: 1.55 }}>
          Hi {customerName?.split(' ')[0] || 'there'}, please pay ₹{amount || '—'} to Your Merchant using this link: payze.app/p/rY8a (valid 24h) · Powered by Payze
        </div>
        <div style={{ fontSize: '10px', color: colors.text3, marginTop: '6px', textAlign: 'right', fontFamily: typography.family.mono }}>Just now · SMS</div>
      </div>
      <div style={{ fontSize: '10px', color: colors.text3, textAlign: 'center' }}>
        Sender ID: <span style={{ fontFamily: typography.family.mono, color: colors.ink, fontWeight: 500 }}>PAYZEP</span> · DLT pre-approved
      </div>
    </div>
  );
}

function WhatsAppPreview({ customerName, amount, description }: any) {
  return (
    <div style={{ padding: '16px', background: '#E5DDD5', borderRadius: radius.md }}>
      <div style={{ padding: '14px 16px', background: '#DCF8C6', borderRadius: radius.md, borderTopLeftRadius: '2px', maxWidth: '88%' }}>
        <div style={{ fontSize: '12px', color: '#303030', lineHeight: 1.55, marginBottom: '10px' }}>
          Hi {customerName?.split(' ')[0] || 'there'},<br /><br />
          Your Merchant has requested a payment of <strong>₹{amount || '—'}</strong> from you.<br /><br />
          <em>{description || 'Service'}</em><br /><br />
          Tap below to pay securely. Valid for 24 hours.
        </div>
        <button style={{ width: '100%', padding: '10px', background: '#128C7E', border: 'none', color: '#fff', borderRadius: radius.sm, fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}>Pay ₹{amount || '—'}</button>
        <div style={{ fontSize: '9px', color: '#667781', textAlign: 'right', marginTop: '8px', fontFamily: typography.family.mono }}>14:38 · ✓✓</div>
      </div>
    </div>
  );
}

function EmailPreview({ email, customerName, amount, description }: any) {
  return (
    <div style={{ background: colors.bg, borderRadius: radius.md, border: `0.5px solid ${colors.border}`, overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px', background: colors.card, borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>
        To: {email || 'customer@example.com'} · From: merchant@payze.com
      </div>
      <div style={{ padding: '18px 20px', background: '#fff' }}>
        <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink, marginBottom: '12px' }}>Payment request from Your Merchant</div>
        <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.65, marginBottom: '16px' }}>
          Hi {customerName?.split(' ')[0] || 'there'},<br /><br />
          You have a payment of <strong>₹{amount || '—'}</strong> due.<br /><br />
          <em>{description || 'Service'}</em>
        </div>
        <button style={{ padding: '12px 24px', background: colors.teal, border: 'none', color: '#fff', borderRadius: radius.pill, fontSize: '12px', fontWeight: 600, fontFamily: 'inherit' }}>Pay ₹{amount || '—'} →</button>
        <div style={{ fontSize: '10px', color: colors.text3, marginTop: '16px', paddingTop: '12px', borderTop: `0.5px solid ${colors.border}` }}>Powered by Payze · DKIM signed · SPF validated</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Delivery audit
// ══════════════════════════════════════════════════════════════════════
function AuditTab({ audit, channels }: any) {
  return (
    <Card padded={false}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1.4fr 1fr 0.8fr', gap: '14px', padding: '14px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
        <div>Recipient · Ref</div><div>Channel</div><div>Timeline</div><div style={{ textAlign: 'right' }}>Amount</div><div style={{ textAlign: 'right' }}>Outcome</div>
      </div>
      {audit.map((d: any, i: number) => {
        const channel = channels.find((c: any) => c.id === d.channel);
        const chColor = d.channel === 'upi_push' ? '#6739B7' : d.channel === 'whatsapp' ? '#128C7E' : d.channel === 'sms' ? '#F0F3FB' : colors.text2;
        return (
          <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1.4fr 1fr 0.8fr', gap: '14px', padding: '16px 24px', borderBottom: i < audit.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: colors.ink, fontWeight: 500, fontSize: '12px' }}>{d.recipient}</div>
              <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono, marginTop: '2px' }}>{d.referenceId} · {d.sentAt}</div>
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', background: d.channel === 'sms' ? chColor : `${chColor}15`, border: `0.5px solid ${d.channel === 'sms' ? colors.border : `${chColor}40`}`, borderRadius: radius.pill, fontSize: '10px', color: d.channel === 'sms' ? colors.ink : chColor, fontWeight: 600, fontFamily: typography.family.mono, letterSpacing: '0.04em' }}>
                {channel?.label}
              </div>
            </div>
            <div>
              {d.timeline.map((ev: any, idx: number) => {
                const color = ev.status === 'done' ? colors.teal : ev.status === 'failed' ? RED : colors.text3;
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '2px 0', fontSize: '10px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, marginTop: '5px', flexShrink: 0 }} />
                    <span style={{ color: colors.text3, fontFamily: typography.family.mono, flexShrink: 0, minWidth: '58px' }}>{ev.at}</span>
                    <span style={{ color: ev.status === 'failed' ? RED : colors.ink }}>{ev.event}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: colors.ink, fontFamily: typography.family.mono, fontWeight: 600, fontSize: '13px' }}>{d.amount}</div>
              {d.elapsedSeconds && <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono, marginTop: '2px' }}>paid in {d.elapsedSeconds < 60 ? `${d.elapsedSeconds}s` : `${Math.floor(d.elapsedSeconds / 60)}m`}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <OutcomeBadge outcome={d.outcome} />
              <div style={{ color: colors.text3, fontSize: '10px', marginTop: '4px', lineHeight: 1.4 }}>{d.outcomeDetail}</div>
            </div>
          </div>
        );
      })}
    </Card>
  );
}

function OutcomeBadge({ outcome }: any) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    paid:               { color: colors.teal, bg: 'rgba(28,111,107,0.08)', label: 'Paid' },
    clicked_not_paid:   { color: AMBER,       bg: 'rgba(180,140,60,0.08)', label: 'Clicked · not paid' },
    no_response:        { color: colors.text3,bg: 'rgba(138,138,136,0.08)', label: 'No response' },
    failed:             { color: RED,         bg: 'rgba(214,69,69,0.08)',  label: 'Failed' },
  };
  const m = map[outcome] || map.no_response;
  return <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: radius.pill, background: m.bg, color: m.color, border: `0.5px solid ${m.color}40`, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: typography.family.mono }}>{m.label}</span>;
}

// ══════════════════════════════════════════════════════════════════════
// Reminders
// ══════════════════════════════════════════════════════════════════════
function RemindersTab({ rules }: any) {
  return (
    <>
      <Card padded style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <Kicker style={{ margin: 0 }}>Reminder rules</Kicker>
          <Button variant="ghost" size="sm" icon={<Icons.IconPlus size={11} />} onClick={() => toast.success('New rule editor opened')} style={{ marginLeft: 'auto' }}>New rule</Button>
        </div>
        <div style={{ fontSize: '12px', color: colors.text2, lineHeight: 1.55, marginBottom: '16px' }}>{rules.summary}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rules.rules.map((r: any) => (
            <div key={r.id} style={{ padding: '14px 16px', background: r.active ? 'rgba(28,111,107,0.04)' : colors.bg, border: `0.5px solid ${r.active ? 'rgba(28,111,107,0.25)' : colors.border}`, borderRadius: radius.md, display: 'grid', gridTemplateColumns: '24px 1.2fr 1.6fr 1.4fr 100px 80px', gap: '14px', alignItems: 'center' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.active ? colors.teal : colors.text3 }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>{r.name}</div>
                <div style={{ fontSize: '10px', color: colors.text3, marginTop: '2px' }}>{r.appliesTo}</div>
              </div>
              <div style={{ fontSize: '11px', color: colors.text2, fontFamily: typography.family.mono }}>{r.schedule}</div>
              <div style={{ fontSize: '11px', color: colors.text2 }}>{r.channel}</div>
              <div>
                {r.active ? <Pill tone="teal">active</Pill> : <Pill tone="outline">paused</Pill>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => toast.success(r.active ? `${r.name} paused` : `${r.name} activated`)}>{r.active ? 'Pause' : 'Activate'}</Button>
            </div>
          ))}
        </div>
      </Card>

      <Card padded={false}>
        <div style={{ padding: '14px 24px', borderBottom: `0.5px solid ${colors.border}` }}>
          <Kicker>Recent reminders sent</Kicker>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 0.8fr 0.8fr 1fr', gap: '14px', padding: '10px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Reference</div><div>Customer</div><div>Channel</div><div>Day</div><div style={{ textAlign: 'right' }}>Outcome</div>
        </div>
        {rules.recentReminders.map((r: any, i: number) => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 0.8fr 0.8fr 1fr', gap: '14px', padding: '12px 24px', borderBottom: i < rules.recentReminders.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
            <div style={{ color: colors.text2, fontFamily: typography.family.mono }}>{r.referenceId}</div>
            <div style={{ color: colors.ink, fontWeight: 500 }}>{r.customer}</div>
            <div style={{ color: colors.text2, fontFamily: typography.family.mono, fontSize: '11px' }}>{r.channel}</div>
            <div style={{ color: colors.text3, fontSize: '11px' }}>{r.sentAt} <span style={{ color: colors.text3, fontFamily: typography.family.mono }}>· +{r.daysSinceOriginal}d</span></div>
            <div style={{ textAlign: 'right' }}><OutcomeBadge outcome={r.outcome} /></div>
          </div>
        ))}
      </Card>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════
// UPI Push mechanics explainer modal
// ══════════════════════════════════════════════════════════════════════
function UpiPushMechModal({ open, mech, onClose }: any) {
  return (
    <Modal open={open} onClose={onClose} kicker="Technical reference" title={mech.title} width={620}>
      <div style={{ fontSize: '11px', color: colors.text3, fontFamily: typography.family.mono, marginBottom: '20px' }}>{mech.regulationRef}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {mech.steps.map((s: any) => (
          <div key={s.num} style={{ display: 'flex', gap: '14px', padding: '14px 16px', background: colors.bg, borderRadius: radius.md }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: colors.teal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, fontFamily: typography.family.mono }}>{s.num}</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink, marginBottom: '2px' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.55 }}>{s.detail}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '12px 14px', background: colors.bg, borderRadius: radius.md, fontSize: '11px', color: colors.text2, lineHeight: 1.55 }}>
        <strong style={{ color: colors.ink }}>Intent timeout:</strong> {mech.timeoutMinutes} minutes · <strong style={{ color: colors.ink }}>Cancellable:</strong> {mech.cancellable ? 'Yes · merchant can abort before customer approves' : 'No'}
      </div>
    </Modal>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', color: colors.text2, fontWeight: 500, marginBottom: '6px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, fontSize: '13px', color: colors.ink, outline: 'none', fontFamily: 'inherit' };
