import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, PageLoader, ErrorState, Modal } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const AMBER = '#B48C3C';
const RED   = '#D64545';

export function Webhooks() {
  const { data, loading, error, refetch } = useAsync(() => configService.getWebhooks(), []);
  const [tab, setTab] = useState<'endpoints' | 'deliveries' | 'events'>('endpoints');
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const [createOpen, setCreateOpen] = useState(false);

  if (error) return <ErrorState message={`Couldn't load webhooks — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading webhooks" />;

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{data.header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{data.header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{data.header.subtitle}</div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => setCreateOpen(true)}>Add endpoint</Button>
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

      <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill, width: 'fit-content', marginBottom: '20px', border: `0.5px solid ${colors.border}` }}>
        {[
          { id: 'endpoints',  label: 'Endpoints',  count: data.endpoints.length },
          { id: 'deliveries', label: 'Deliveries', count: data.deliveries.length },
          { id: 'events',     label: 'Event catalog' },
        ].map(t => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id as any)} style={{
              padding: '7px 16px', borderRadius: radius.pill, fontSize: '12px', fontWeight: active ? 600 : 500,
              background: active ? 'rgba(28,111,107,0.085)' : 'transparent',
              color: active ? colors.teal : colors.text2,
              border: active ? '0.5px solid rgba(28,111,107,0.3)' : '0.5px solid transparent',
              cursor: 'pointer', fontFamily: typography.family.sans, transition: 'all 0.18s',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
            }}>
              {t.label}
              {t.count !== undefined && <span style={{ fontSize: '10px', opacity: 0.7, fontFamily: typography.family.mono }}>· {t.count}</span>}
            </button>
          );
        })}
      </div>

      {tab === 'endpoints' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.endpoints.map((ep: any) => (
            <EndpointCard key={ep.id} ep={ep} onClick={() => setSelectedEndpoint(ep)} />
          ))}
        </div>
      )}

      {tab === 'deliveries' && (
        <Card padded={false}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.1fr 2fr 0.7fr 0.7fr 0.9fr', gap: '14px', padding: '12px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
            <div>Event</div><div>Endpoint</div><div>Payload</div><div style={{ textAlign: 'right' }}>HTTP</div><div style={{ textAlign: 'right' }}>Latency</div><div style={{ textAlign: 'right' }}>Status</div>
          </div>
          {data.deliveries.map((d: any, i: number) => {
            const ep = data.endpoints.find((e: any) => e.id === d.endpoint);
            return (
              <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.1fr 2fr 0.7fr 0.7fr 0.9fr', gap: '14px', padding: '14px 24px', borderBottom: i < data.deliveries.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '12px' }}>
                <div>
                  <div style={{ color: colors.ink, fontFamily: typography.family.mono, fontWeight: 500, fontSize: '11px' }}>{d.event}</div>
                  <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono, marginTop: '2px' }}>{d.deliveredAt}</div>
                </div>
                <div style={{ color: colors.text2, fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ep?.description || d.endpoint}</div>
                <div style={{ color: colors.text2, fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.payloadSummary}</div>
                <div style={{ textAlign: 'right', fontFamily: typography.family.mono, color: d.httpCode >= 200 && d.httpCode < 300 ? colors.teal : d.httpCode >= 500 ? AMBER : RED, fontWeight: 600 }}>{d.httpCode}</div>
                <div style={{ textAlign: 'right', fontFamily: typography.family.mono, color: colors.text2 }}>{d.latency}</div>
                <div style={{ textAlign: 'right' }}>
                  <DeliveryStatus status={d.status} attempts={d.attempts} />
                  {d.nextRetry && <div style={{ color: AMBER, fontSize: '9px', marginTop: '2px' }}>retry {d.nextRetry}</div>}
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {tab === 'events' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {data.eventCatalog.map((cat: any) => (
            <Card key={cat.category} padded>
              <Kicker style={{ marginBottom: '12px' }}>{cat.category}</Kicker>
              {cat.events.map((e: any, i: number) => (
                <div key={e.name} style={{ padding: '10px 0', borderBottom: i < cat.events.length - 1 ? `0.5px solid ${colors.border}` : 'none' }}>
                  <div style={{ fontSize: '12px', fontFamily: typography.family.mono, color: colors.ink, fontWeight: 600, marginBottom: '3px' }}>{e.name}</div>
                  <div style={{ fontSize: '11px', color: colors.text2, lineHeight: 1.5 }}>{e.desc}</div>
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}

      {selectedEndpoint && <EndpointDrawer ep={selectedEndpoint} onClose={() => setSelectedEndpoint(null)} />}
      <CreateEndpointModal open={createOpen} onClose={() => setCreateOpen(false)} eventCatalog={data.eventCatalog} />
    </div>
  );
}

function EndpointCard({ ep, onClick }: any) {
  return (
    <Card padded onClick={onClick} style={{ padding: '18px 22px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: ep.status === 'active' ? colors.teal : colors.text3 }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>{ep.description}</span>
            <span style={{ fontSize: '9px', padding: '2px 7px', background: ep.status === 'active' ? 'rgba(28,111,107,0.08)' : 'rgba(138,138,136,0.08)', color: ep.status === 'active' ? colors.teal : colors.text3, borderRadius: radius.pill, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{ep.status}</span>
          </div>
          <div style={{ fontSize: '11px', fontFamily: typography.family.mono, color: colors.text2, marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ep.url}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {ep.events.slice(0, 5).map((e: string) => (
              <span key={e} style={{ fontSize: '10px', fontFamily: typography.family.mono, padding: '2px 7px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, color: colors.text2 }}>{e}</span>
            ))}
            {ep.events.length > 5 && <span style={{ fontSize: '10px', color: colors.text3, padding: '2px 4px' }}>+{ep.events.length - 5} more</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: ep.deliveryStats.successRate >= 99 ? colors.teal : AMBER, fontFamily: typography.family.mono }}>{ep.deliveryStats.successRate}%</div>
          <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{ep.deliveryStats.deliveries24h.toLocaleString('en-IN')} · 24h</div>
          <div style={{ fontSize: '10px', color: colors.text3, marginTop: '4px' }}>last {ep.deliveryStats.lastSuccess}</div>
        </div>
      </div>
    </Card>
  );
}

function DeliveryStatus({ status, attempts }: any) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    delivered: { color: colors.teal, bg: 'rgba(28,111,107,0.08)', label: 'Delivered' },
    retrying:  { color: AMBER,       bg: 'rgba(180,140,60,0.08)', label: `Retry ${attempts}` },
    failed:    { color: RED,         bg: 'rgba(214,69,69,0.08)',  label: 'DLQ' },
  };
  const m = map[status] || map.delivered;
  return (
    <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: radius.pill, background: m.bg, color: m.color, border: `0.5px solid ${m.color}40`, fontWeight: 600, letterSpacing: '0.04em', fontFamily: typography.family.mono }}>{m.label}</span>
  );
}

function EndpointDrawer({ ep, onClose }: any) {
  const [secretRevealed, setSecretRevealed] = useState(false);
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '100%', height: '100%', background: colors.card, borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Webhook endpoint</Kicker>
            <div style={{ fontSize: '16px', fontWeight: 600, color: colors.ink }}>{ep.description}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}><Icons.IconX size={18} /></button>
        </div>

        <Kicker style={{ marginBottom: '8px' }}>URL</Kicker>
        <div style={{ padding: '12px 14px', background: '#1A1A1A', borderRadius: radius.md, marginBottom: '20px', fontFamily: typography.family.mono, fontSize: '12px', color: '#E4E4E0', wordBreak: 'break-all', lineHeight: 1.55 }}>{ep.url}</div>

        <Kicker style={{ marginBottom: '8px' }}>Signing secret</Kicker>
        <div style={{ padding: '12px 14px', background: '#1A1A1A', borderRadius: radius.md, marginBottom: '6px', fontFamily: typography.family.mono, fontSize: '12px', color: '#E4E4E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <span style={{ wordBreak: 'break-all' }}>{secretRevealed ? ep.secret : ep.secret.slice(0, 12) + '••••••••••••••••••••••••••••'}</span>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button onClick={() => setSecretRevealed(!secretRevealed)} style={{ background: 'transparent', border: '0.5px solid #444', color: '#B4B4B0', padding: '4px 8px', borderRadius: radius.sm, fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>{secretRevealed ? 'Hide' : 'Reveal'}</button>
            <button onClick={() => { navigator.clipboard.writeText(ep.secret); toast.success('Secret copied'); }} style={{ background: 'transparent', border: '0.5px solid #444', color: '#B4B4B0', padding: '4px 8px', borderRadius: radius.sm, fontSize: '10px', cursor: 'pointer', fontFamily: 'inherit' }}>Copy</button>
          </div>
        </div>
        <div style={{ fontSize: '10px', color: colors.text3, marginBottom: '20px', fontFamily: typography.family.mono }}>Last rotated: {ep.secretLastRotated}</div>

        <Kicker style={{ marginBottom: '10px' }}>Subscribed events ({ep.events.length})</Kicker>
        <div style={{ padding: '12px 14px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {ep.events.map((e: string) => (
            <span key={e} style={{ fontSize: '11px', fontFamily: typography.family.mono, padding: '4px 9px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm, color: colors.ink }}>{e}</span>
          ))}
        </div>

        <Kicker style={{ marginBottom: '10px' }}>Delivery stats · 24h</Kicker>
        <div style={{ padding: '14px 16px', background: colors.bg, borderRadius: radius.md, marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          <Stat label="Success rate" value={`${ep.deliveryStats.successRate}%`} tone={ep.deliveryStats.successRate >= 99 ? 'teal' : 'amber'} />
          <Stat label="Deliveries"   value={ep.deliveryStats.deliveries24h.toLocaleString('en-IN')} />
          <Stat label="Last success" value={ep.deliveryStats.lastSuccess} />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="primary" size="sm" onClick={() => toast.success('Test event sent', { description: 'A test payment.succeeded payload was POSTed to your endpoint' })}>Send test event</Button>
          <Button variant="secondary" size="sm" onClick={() => toast.success('Secret rotated', { description: 'New signing secret active · old secret valid for 24h grace period' })}>Rotate secret</Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success(ep.status === 'active' ? 'Endpoint paused' : 'Endpoint resumed')}>{ep.status === 'active' ? 'Pause' : 'Resume'}</Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success('Endpoint deleted')} style={{ color: RED, marginLeft: 'auto' }}>Delete</Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: any) {
  const color = tone === 'teal' ? colors.teal : tone === 'amber' ? AMBER : colors.ink;
  return (
    <div>
      <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: 600, color, fontFamily: typography.family.mono }}>{value}</div>
    </div>
  );
}

function CreateEndpointModal({ open, onClose, eventCatalog }: any) {
  const [url, setUrl] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const toggle = (name: string) => {
    setSelectedEvents(prev => prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]);
  };

  return (
    <Modal open={open} onClose={onClose} kicker="New endpoint" title="Add a webhook endpoint" width={580}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Endpoint URL</label>
          <input type="text" placeholder="https://api.your-app.com/payze/events" value={url} onChange={e => setUrl(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <input type="text" placeholder="Production · main event sink" value={desc} onChange={e => setDesc(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Events to subscribe ({selectedEvents.length} selected)</label>
          <div style={{ maxHeight: '240px', overflowY: 'auto', border: `0.5px solid ${colors.border}`, borderRadius: radius.md, padding: '10px' }}>
            {eventCatalog.map((cat: any) => (
              <div key={cat.category} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{cat.category}</div>
                {cat.events.map((e: any) => (
                  <label key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 6px', cursor: 'pointer', borderRadius: radius.sm }}>
                    <input type="checkbox" checked={selectedEvents.includes(e.name)} onChange={() => toggle(e.name)} />
                    <span style={{ fontSize: '11px', fontFamily: typography.family.mono, color: colors.ink, minWidth: '180px' }}>{e.name}</span>
                    <span style={{ fontSize: '10px', color: colors.text3 }}>{e.desc}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '8px', borderTop: `0.5px solid ${colors.border}` }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => { toast.success('Endpoint created', { description: `${selectedEvents.length} events subscribed · signing secret generated` }); onClose(); }}>Create endpoint</Button>
        </div>
      </div>
    </Modal>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '11px', color: colors.text2, fontWeight: 500, marginBottom: '6px' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, fontSize: '13px', color: colors.ink, outline: 'none', fontFamily: 'inherit' };
