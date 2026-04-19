import React, { useState } from 'react';
import { useSearchParams } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState, SectionTabs } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';
import { Invoices } from './Invoices';
import { Subscriptions } from './Subscriptions';
import { Send } from './Send';
import { PaymentPages } from './PaymentPages';
import { CheckoutStudio } from './CheckoutStudio';

type SectionId = 'surfaces' | 'pages' | 'invoices' | 'subscriptions' | 'send' | 'studio';

type Surface = {
  id: string;
  title: string;
  type: 'fixed' | 'custom' | 'recurring';
  amount: number | null;
  currency: string;
  description: string;
  customer: string;
  status: 'active' | 'paused' | 'expired' | 'draft';
  created: string;
  expiresIn: string | null;
  billingCycle?: string;
  trialDays?: number;
  suggestedAmounts?: number[];
  channels: {
    link?:  { enabled: boolean; shortCode?: string; url?: string };
    qr?:    { enabled: boolean };
    embed?: { enabled: boolean };
  };
  analytics: { views: number; payments: number; revenue: number; conversionRate: number };
};

export function Collect() {
  const [searchParams, setSearchParams] = useSearchParams();
  const section = (searchParams.get('section') as SectionId) || 'surfaces';

  const setSection = (next: SectionId) => {
    if (next === 'surfaces') setSearchParams({});
    else setSearchParams({ section: next });
  };

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <SectionTabs
        active={section}
        onChange={setSection}
        tabs={[
          { id: 'surfaces',      label: 'Surfaces',      hint: 'Links, QR, embeds' },
          { id: 'pages',         label: 'Pages',         hint: 'Hosted checkout forms' },
          { id: 'invoices',      label: 'Invoices',      hint: 'B2B billing with GST' },
          { id: 'subscriptions', label: 'Subscriptions', hint: 'Active mandates' },
          { id: 'send',          label: 'Send',          hint: 'UPI push · SMS · WhatsApp' },
          { id: 'studio',        label: 'Studio',        hint: 'Customize · A/B test' },
        ]}
      />
      {section === 'surfaces'      && <SurfacesSection />}
      {section === 'pages'         && <PaymentPages />}
      {section === 'invoices'      && <Invoices />}
      {section === 'subscriptions' && <Subscriptions />}
      {section === 'send'          && <Send />}
      {section === 'studio'        && <CheckoutStudio />}
    </div>
  );
}

function SurfacesSection() {
  const { data, loading, error, refetch } = useAsync(() => configService.getCollect(), []);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Surface | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  if (error) return <ErrorState message={`Couldn't load Collect — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading surfaces" />;

  const filtered = (data.surfaces as Surface[]).filter(s => {
    if (typeFilter !== 'all' && s.type !== typeFilter) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (search && !(s.title + s.customer + (s.channels.link?.shortCode || '')).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{data.header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{data.header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px', maxWidth: '640px' }}>{data.header.subtitle}</div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => setCreateOpen(true)}>
          New surface
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {data.stats.map((s: any) => (
          <Card key={s.label} padded style={{ padding: '18px' }}>
            <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontSize: '22px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.02em', marginBottom: '4px', fontFamily: s.label.includes('Best') ? typography.family.mono : 'inherit' }}>{s.value}</div>
            <div style={{ fontSize: '11px', color: colors.text2 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <Card padded={false}>
        <div style={{ padding: '16px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill }}>
            {data.typeFilters.map((t: any) => (
              <button key={t.id} onClick={() => setTypeFilter(t.id)} style={{
                padding: '6px 14px', borderRadius: radius.pill, fontSize: '12px', fontWeight: 500,
                background: typeFilter === t.id ? colors.card : 'transparent',
                color: typeFilter === t.id ? colors.ink : colors.text2,
                border: typeFilter === t.id ? `0.5px solid ${colors.border}` : 'none',
                cursor: 'pointer', fontFamily: typography.family.sans,
              }}>{t.label}</button>
            ))}
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{
            padding: '6px 10px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill,
            fontSize: '12px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
          }}>
            {data.statusFilters.map((s: string) => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <div style={{ position: 'relative', marginLeft: 'auto' }}>
            <Icons.IconSearch size={14} color={colors.text2} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, customer, short code…" style={{
              background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill,
              padding: '8px 14px 8px 34px', fontSize: '12px', width: '280px', outline: 'none',
              color: colors.ink, fontFamily: 'inherit',
            }} />
          </div>
        </div>

        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '2fr 0.9fr 1fr 0.9fr 1.1fr 0.9fr 0.3fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Surface · customer</div><div>Type</div><div>Amount</div><div>Channels</div><div>Performance</div><div>Status</div><div></div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: '60px 24px', textAlign: 'center', color: colors.text3, fontSize: '13px' }}>
            No surfaces match these filters.
          </div>
        ) : filtered.map((s, i) => (
          <SurfaceRow
            key={s.id}
            surface={s}
            isLast={i === filtered.length - 1}
            onClick={() => setSelected(s)}
          />
        ))}
      </Card>

      {selected && <SurfaceDetailDrawer surface={selected} embedTemplate={data.embedSnippetTemplate} onClose={() => setSelected(null)} />}
      {createOpen && <CreateSurfaceModal defaults={data.createDefaults} onClose={() => setCreateOpen(false)} />}
    </div>
  );
}

function SurfaceRow({ surface: s, isLast, onClick }: { surface: Surface; isLast: boolean; onClick: () => void }) {
  const formatAmount = () => {
    if (s.type === 'custom') return <span style={{ color: colors.text2, fontStyle: 'italic' }}>Customer chooses</span>;
    if (s.type === 'recurring' && s.amount) {
      return <span>₹{s.amount.toLocaleString('en-IN')}<span style={{ color: colors.text3, fontSize: '11px' }}> /{s.billingCycle?.slice(0, 2) || 'mo'}</span></span>;
    }
    return s.amount ? `₹${s.amount.toLocaleString('en-IN')}` : '—';
  };

  const statusTone =
    s.status === 'active'  ? 'teal' :
    s.status === 'paused'  ? 'outline' :
    s.status === 'expired' ? 'neutral' :
                             'outline';

  const typePill =
    s.type === 'fixed'     ? { tone: 'neutral',  label: 'Fixed' } :
    s.type === 'custom'    ? { tone: 'outline',  label: 'Open amount' } :
                             { tone: 'teal',     label: 'Recurring' };

  return (
    <div
      onClick={onClick}
      style={{
        display: 'grid', gridTemplateColumns: '2fr 0.9fr 1fr 0.9fr 1.1fr 0.9fr 0.3fr', gap: '16px',
        padding: '16px 24px',
        borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`,
        alignItems: 'center', fontSize: '13px', cursor: 'pointer', transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = colors.bg)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ color: colors.ink, fontWeight: 500, marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title}</div>
        <div style={{ fontSize: '11px', color: colors.text3, display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>{s.customer}</span>
          {s.channels.link?.shortCode && <span style={{ fontFamily: typography.family.mono, color: colors.text2 }}>· {s.channels.link.shortCode}</span>}
        </div>
      </div>
      <div><Pill tone={typePill.tone as any}>{typePill.label}</Pill></div>
      <div style={{ color: colors.ink, fontWeight: 600, fontFamily: typography.family.mono, fontSize: '12px' }}>{formatAmount()}</div>
      <ChannelChips channels={s.channels} />
      <div>
        <div style={{ color: colors.ink, fontWeight: 600, fontSize: '13px' }}>
          {s.analytics.payments} <span style={{ color: colors.text3, fontWeight: 400 }}>/ {s.analytics.views}</span>
        </div>
        <div style={{ fontSize: '11px', color: colors.text2, fontFamily: typography.family.mono }}>
          {s.analytics.conversionRate.toFixed(1)}% conv.
        </div>
      </div>
      <div><Pill tone={statusTone as any}>{s.status}</Pill></div>
      <div style={{ textAlign: 'right' }}>
        <Icons.IconArrowUpRight size={13} color={colors.text3} />
      </div>
    </div>
  );
}

function ChannelChips({ channels }: { channels: Surface['channels'] }) {
  const items = [
    { enabled: channels.link?.enabled,  label: 'Link',  Icon: Icons.IconLink },
    { enabled: channels.qr?.enabled,    label: 'QR',    Icon: Icons.IconQR   },
    { enabled: channels.embed?.enabled, label: 'Embed', Icon: Icons.IconDeveloper },
  ];
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {items.map(i => (
        <div key={i.label} title={`${i.label} · ${i.enabled ? 'enabled' : 'off'}`} style={{
          width: '22px', height: '22px', borderRadius: radius.sm,
          background: i.enabled ? colors.bg : 'transparent',
          border: `0.5px solid ${i.enabled ? colors.border : colors.borderHover}`,
          borderStyle: i.enabled ? 'solid' : 'dashed',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: i.enabled ? 1 : 0.45,
        }}>
          <i.Icon size={11} color={i.enabled ? colors.ink : colors.text3} />
        </div>
      ))}
    </div>
  );
}

// ── Detail drawer ────────────────────────────────────────────────────
function SurfaceDetailDrawer({ surface: s, embedTemplate, onClose }: { surface: Surface; embedTemplate: string; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '720px', maxWidth: '100%', height: '100%', background: colors.card,
        borderLeft: `0.5px solid ${colors.border}`, overflowY: 'auto',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ padding: '28px 32px 0 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <Kicker color={colors.teal} style={{ marginBottom: '4px' }}>Surface</Kicker>
              <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.01em', marginBottom: '4px' }}>{s.title}</div>
              <div style={{ fontSize: '12px', color: colors.text2 }}>{s.customer} · created {s.created}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
              <Icons.IconX size={18} />
            </button>
          </div>

          {/* Amount + type */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
            {s.type === 'custom' ? (
              <div style={{ fontSize: '26px', fontWeight: 500, color: colors.text2, letterSpacing: '-0.015em' }}>Customer chooses</div>
            ) : (
              <>
                <div style={{ fontSize: '36px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.025em', lineHeight: 1 }}>
                  ₹{s.amount?.toLocaleString('en-IN')}
                </div>
                {s.type === 'recurring' && (
                  <div style={{ fontSize: '14px', color: colors.text3 }}>
                    / {s.billingCycle}
                    {s.trialDays ? ` · ${s.trialDays}-day trial` : ''}
                  </div>
                )}
              </>
            )}
          </div>
          <div style={{ fontSize: '12px', color: colors.text2, marginBottom: '20px' }}>{s.description}</div>

          <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <Pill tone={s.status === 'active' ? 'teal' : s.status === 'draft' ? 'outline' : 'neutral'}>{s.status}</Pill>
            {s.expiresIn && <Pill tone="outline">{s.expiresIn}</Pill>}
            {(s as any).reuseMode === 'single_use' && <Pill tone="outline">Single use · expires after 1 payment</Pill>}
            {(s as any).reuseMode === 'reusable'   && <Pill tone="outline">Reusable · accepts repeat payments</Pill>}
          </div>
        </div>

        {/* Distribution channels — the core merge */}
        <div style={{ padding: '0 32px', marginBottom: '28px' }}>
          <Kicker style={{ marginBottom: '14px' }}>Distribution channels</Kicker>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <ChannelCard
              label="Link"
              Icon={Icons.IconLink}
              enabled={!!s.channels.link?.enabled}
              render={() => s.channels.link?.url && (
                <>
                  <div style={{ padding: '10px 12px', background: colors.bg, borderRadius: radius.sm, fontFamily: typography.family.mono, fontSize: '11px', color: colors.ink, wordBreak: 'break-all', marginBottom: '10px' }}>
                    {s.channels.link.url}
                  </div>
                  {s.channels.link.shortCode && (
                    <div style={{ fontSize: '10px', color: colors.text3, marginBottom: '10px' }}>
                      Short code · <span style={{ fontFamily: typography.family.mono, color: colors.ink }}>{s.channels.link.shortCode}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button variant="secondary" size="sm" icon={<Icons.IconCopy size={11} />} onClick={() => { navigator.clipboard.writeText(`https://${s.channels.link?.url}`); toast.success('Link copied'); }}>Copy</Button>
                    <Button variant="ghost" size="sm" icon={<Icons.IconArrowUpRight size={11} />} onClick={() => toast.success('Opened in new tab')}>Open</Button>
                  </div>
                </>
              )}
            />
            <ChannelCard
              label="QR code"
              Icon={Icons.IconQR}
              enabled={!!s.channels.qr?.enabled}
              render={() => (
                <>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px', padding: '8px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.sm }}>
                    <FakeQR text={s.id} size={140} />
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Button variant="secondary" size="sm" icon={<Icons.IconDownload size={11} />} onClick={() => toast.success('QR downloaded as PNG')}>PNG</Button>
                    <Button variant="ghost" size="sm" icon={<Icons.IconDownload size={11} />} onClick={() => toast.success('QR downloaded as SVG')}>SVG</Button>
                  </div>
                </>
              )}
            />
            <ChannelCard
              label="Embed"
              Icon={Icons.IconDeveloper}
              enabled={!!s.channels.embed?.enabled}
              render={() => {
                const snippet = embedTemplate.replace('{id}', s.id);
                return (
                  <>
                    <div style={{ padding: '10px 12px', background: '#1A1A1A', color: '#E6E6E4', borderRadius: radius.sm, fontFamily: typography.family.mono, fontSize: '10px', lineHeight: 1.5, marginBottom: '10px', wordBreak: 'break-all', maxHeight: '120px', overflow: 'auto' }}>
                      {snippet}
                    </div>
                    <Button variant="secondary" size="sm" icon={<Icons.IconCopy size={11} />} onClick={() => { navigator.clipboard.writeText(snippet); toast.success('Embed snippet copied'); }}>Copy snippet</Button>
                  </>
                );
              }}
            />
          </div>
        </div>

        {/* Analytics */}
        <div style={{ padding: '0 32px', marginBottom: '28px' }}>
          <Kicker style={{ marginBottom: '14px' }}>Performance</Kicker>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, overflow: 'hidden' }}>
            <AnalyticsCell label="Views"         value={s.analytics.views.toLocaleString('en-IN')} />
            <AnalyticsCell label="Payments"      value={s.analytics.payments.toLocaleString('en-IN')} />
            <AnalyticsCell label="Revenue"       value={`₹${s.analytics.revenue.toLocaleString('en-IN')}`} />
            <AnalyticsCell label="Conversion"    value={`${s.analytics.conversionRate.toFixed(1)}%`} isLast />
          </div>
        </div>

        {/* Payment history (P1.7) */}
        {(s as any).payments && (s as any).payments.length > 0 && (
          <div style={{ padding: '0 32px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
              <Kicker>Payment history · {(s as any).payments.length} {(s as any).payments.length === 1 ? 'payment' : 'payments'}</Kicker>
              {(s as any).analytics?.expectedPayments != null && (
                <span style={{ fontSize: '11px', color: colors.text2 }}>
                  Expected <span style={{ color: colors.ink, fontWeight: 600, fontFamily: typography.family.mono }}>{(s as any).analytics.expectedPayments}</span> ·
                  Outstanding <span style={{ color: colors.ink, fontWeight: 600, fontFamily: typography.family.mono }}>{(s as any).analytics.outstandingPayments}</span>
                </span>
              )}
            </div>
            <div style={{ background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1.4fr 0.9fr 0.7fr', gap: '12px', padding: '10px 14px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
                <div>Customer</div><div style={{ textAlign: 'right' }}>Amount</div><div>Method</div><div>Paid at</div><div style={{ textAlign: 'right' }}>Status</div>
              </div>
              {(s as any).payments.map((p: any, i: number, arr: any[]) => {
                const isLast = i === arr.length - 1;
                const failed = p.status === 'failed';
                return (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1.4fr 0.9fr 0.7fr', gap: '12px', padding: '10px 14px', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`, alignItems: 'center', fontSize: '11px', background: failed ? 'rgba(214,69,69,0.025)' : 'transparent' }}>
                    <div>
                      <div style={{ color: colors.ink, fontWeight: 500 }}>{p.customer}</div>
                      <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono, marginTop: '1px' }}>{p.phone || p.email}</div>
                    </div>
                    <div style={{ textAlign: 'right', color: colors.ink, fontWeight: 600, fontFamily: typography.family.mono, textDecoration: failed ? 'line-through' : 'none' }}>{p.amount}</div>
                    <div style={{ color: colors.text2 }}>{p.method}</div>
                    <div style={{ color: colors.text3, fontFamily: typography.family.mono, fontSize: '10px' }}>{p.paidAt}</div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '9px', padding: '2px 7px', borderRadius: radius.pill,
                        background: failed ? 'rgba(214,69,69,0.08)' : 'rgba(28,111,107,0.08)',
                        color: failed ? '#D64545' : colors.teal,
                        border: `0.5px solid ${failed ? 'rgba(214,69,69,0.25)' : 'rgba(28,111,107,0.25)'}`,
                        fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: typography.family.mono,
                      }}>{p.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
              <Button variant="ghost" size="sm" icon={<Icons.IconDownload size={11} />} onClick={() => toast.success('Payment history exported · CSV')}>Export CSV</Button>
              <Button variant="ghost" size="sm" icon={<Icons.IconMail size={11} />} onClick={() => toast.success('Reminder sent to outstanding payers')}>Email outstanding</Button>
            </div>
          </div>
        )}

        {/* Customer-facing preview */}
        <div style={{ padding: '0 32px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '14px' }}>
            <Kicker style={{ margin: 0 }}>Customer view · preview</Kicker>
            <a href="/app/pay" target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: colors.teal, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', fontWeight: 500 }}>
              Open live checkout <Icons.IconExternal size={10} />
            </a>
          </div>
          <CheckoutPreview surface={s} />
        </div>

        <div style={{ padding: '0 32px 32px 32px', display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: `0.5px solid ${colors.border}`, paddingTop: '20px' }}>
          <Button variant="primary" size="sm" onClick={() => toast.success('Edits saved')}>Edit</Button>
          {s.status === 'active' && <Button variant="secondary" size="sm" onClick={() => toast.success(`${s.title} paused`)}>Pause</Button>}
          {s.status === 'paused' && <Button variant="secondary" size="sm" onClick={() => toast.success(`${s.title} resumed`)}>Resume</Button>}
          <Button variant="ghost" size="sm" icon={<Icons.IconCopy size={11} />} onClick={() => { navigator.clipboard.writeText(s.id); toast.success('Surface ID copied'); }}>Copy ID</Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success('Archived — can restore from Archives')}>Archive</Button>
        </div>
      </div>
    </div>
  );
}

function ChannelCard({ label, Icon, enabled, render }: any) {
  return (
    <div style={{
      padding: '14px',
      background: enabled ? colors.card : colors.bg,
      border: `0.5px solid ${enabled ? colors.border : colors.borderHover}`,
      borderStyle: enabled ? 'solid' : 'dashed',
      borderRadius: radius.md,
      opacity: enabled ? 1 : 0.6,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
        <Icon size={13} color={enabled ? colors.ink : colors.text3} />
        <span style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
        <div style={{ marginLeft: 'auto', fontSize: '10px', color: enabled ? colors.teal : colors.text3, fontWeight: 500 }}>
          {enabled ? '✓ on' : 'off'}
        </div>
      </div>
      {enabled ? render() : (
        <div style={{ padding: '10px 0', fontSize: '11px', color: colors.text3, lineHeight: 1.5 }}>
          Turn this channel on to distribute via {label.toLowerCase()}.
        </div>
      )}
    </div>
  );
}

function AnalyticsCell({ label, value, isLast }: any) {
  return (
    <div style={{
      padding: '16px 18px',
      borderRight: isLast ? 'none' : `0.5px solid ${colors.border}`,
    }}>
      <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.015em', fontFamily: typography.family.mono }}>{value}</div>
    </div>
  );
}

function CheckoutPreview({ surface: s }: { surface: Surface }) {
  return (
    <div style={{
      padding: '20px',
      background: colors.bg,
      border: `0.5px solid ${colors.border}`,
      borderRadius: radius.md,
    }}>
      <div style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '12px' }}>
        What your customer sees
      </div>
      <div style={{
        padding: '24px 22px',
        background: colors.card, border: `0.5px solid ${colors.border}`,
        borderRadius: radius.md,
        maxWidth: '360px', margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: radius.sm, background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.PayzeMark size={16} color="#F6F6F2" />
          </div>
          <div style={{ fontSize: '12px', fontWeight: 500, color: colors.ink }}>{s.customer}</div>
        </div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: colors.ink, marginBottom: '4px' }}>{s.title}</div>
        <div style={{ fontSize: '11px', color: colors.text2, marginBottom: '18px', lineHeight: 1.5 }}>{s.description}</div>
        {s.type === 'custom' ? (
          <div style={{ padding: '12px', background: colors.bg, borderRadius: radius.sm, marginBottom: '14px', textAlign: 'center', fontSize: '11px', color: colors.text2 }}>
            Enter amount · {s.suggestedAmounts?.map(a => `₹${a}`).join(' · ') || 'any amount'}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', padding: '10px 0', borderTop: `0.5px solid ${colors.border}`, borderBottom: `0.5px solid ${colors.border}`, marginBottom: '14px', justifyContent: 'center' }}>
            <span style={{ fontSize: '14px', color: colors.text2 }}>₹</span>
            <span style={{ fontSize: '26px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.015em' }}>{s.amount?.toLocaleString('en-IN')}</span>
            {s.type === 'recurring' && <span style={{ fontSize: '12px', color: colors.text3 }}>/ {s.billingCycle}</span>}
          </div>
        )}
        <button style={{
          width: '100%', padding: '12px',
          background: colors.ink, color: '#fff', border: 'none', borderRadius: radius.sm,
          fontSize: '13px', fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
        }}>Pay with UPI, card, or bank</button>
        <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '9px', color: colors.text3, letterSpacing: '0.08em' }}>
          Secure · PCI-DSS · powered by Payze
        </div>
      </div>
    </div>
  );
}

// ── Create modal ─────────────────────────────────────────────────────
function CreateSurfaceModal({ defaults, onClose }: { defaults: any; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'fixed' | 'custom' | 'recurring'>('fixed');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [description, setDescription] = useState('');
  const [expiry, setExpiry] = useState(30);
  const [channels, setChannels] = useState<string[]>(defaults.enabledChannels);

  const toggle = (c: string) => setChannels(channels.includes(c) ? channels.filter(x => x !== c) : [...channels, c]);

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 20px', overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '640px', maxWidth: '100%', background: colors.card,
        border: `0.5px solid ${colors.border}`, borderRadius: radius.lg,
        padding: '32px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>New surface</Kicker>
            <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.015em' }}>Create once, distribute everywhere</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        {/* Type selector */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '10px', fontWeight: 500, color: colors.text2, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Payment model
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'fixed',     label: 'Fixed amount',      desc: 'Invoice, ticket, fixed price' },
              { id: 'custom',    label: 'Pay what you want', desc: 'Tips, donations, variable' },
              { id: 'recurring', label: 'Recurring',         desc: 'Subscription via mandate' },
            ].map(t => {
              const selected = type === t.id;
              return (
                <button key={t.id} onClick={() => setType(t.id as any)} style={{
                  textAlign: 'left', padding: '12px 14px',
                  background: selected ? colors.bg : colors.card,
                  border: `${selected ? '1.5px' : '0.5px'} solid ${selected ? colors.teal : colors.border}`,
                  borderRadius: radius.md, cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: colors.ink, marginBottom: '3px' }}>{t.label}</div>
                  <div style={{ fontSize: '10px', color: colors.text2, lineHeight: 1.4 }}>{t.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: type === 'recurring' ? '1fr 1fr' : '1fr', gap: '14px', marginBottom: '16px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <Label>Title</Label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Q3 Brand Engagement" style={inputStyle} />
          </div>
          {type !== 'custom' && (
            <div>
              <Label>Amount {type === 'recurring' && <span style={{ color: colors.text3, textTransform: 'none', letterSpacing: 0 }}> (per cycle)</span>}</Label>
              <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ 0" type="number" style={{ ...inputStyle, fontFamily: typography.family.mono }} />
            </div>
          )}
          {type === 'recurring' && (
            <div>
              <Label>Billing cycle</Label>
              <select value={billingCycle} onChange={e => setBillingCycle(e.target.value)} style={inputStyle}>
                {defaults.billingCycles.map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Label>Description</Label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What the customer is paying for" rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>

        {type !== 'recurring' && (
          <div style={{ marginBottom: '20px' }}>
            <Label>Expiry</Label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {defaults.expiryPresets.map((p: any) => {
                const selected = expiry === (p.days ?? -1);
                return (
                  <button key={p.label} onClick={() => setExpiry(p.days ?? -1)} style={{
                    padding: '8px 14px', fontFamily: 'inherit',
                    background: selected ? colors.ink : colors.card,
                    color: selected ? '#fff' : colors.ink,
                    border: `0.5px solid ${selected ? colors.ink : colors.border}`,
                    borderRadius: radius.pill, fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                  }}>{p.label}</button>
                );
              })}
            </div>
          </div>
        )}

        {/* Channels — all on by default */}
        <div style={{ marginBottom: '24px' }}>
          <Label>Distribution channels <span style={{ color: colors.text3, textTransform: 'none', letterSpacing: 0, fontSize: '10px' }}> — all enabled by default, toggle off if not needed</span></Label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {[
              { id: 'link',  Icon: Icons.IconLink,      label: 'Shareable link', desc: 'URL + short code' },
              { id: 'qr',    Icon: Icons.IconQR,        label: 'QR code',         desc: 'Print or display' },
              { id: 'embed', Icon: Icons.IconDeveloper, label: 'Embed',           desc: 'JS snippet' },
            ].map(c => {
              const on = channels.includes(c.id);
              return (
                <button key={c.id} onClick={() => toggle(c.id)} style={{
                  padding: '12px', textAlign: 'left', fontFamily: 'inherit',
                  background: on ? colors.bg : colors.card,
                  border: `${on ? '1.5px' : '0.5px'} ${on ? 'solid' : 'dashed'} ${on ? colors.teal : colors.borderHover}`,
                  borderRadius: radius.md, cursor: 'pointer',
                  opacity: on ? 1 : 0.6,
                }}>
                  <c.Icon size={14} color={on ? colors.teal : colors.text3} />
                  <div style={{ fontSize: '12px', fontWeight: 600, color: colors.ink, marginTop: '8px' }}>{c.label}</div>
                  <div style={{ fontSize: '10px', color: colors.text2, marginTop: '2px' }}>{c.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: `0.5px solid ${colors.border}` }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="secondary" onClick={() => { toast.success('Saved as draft'); onClose(); }}>Save draft</Button>
          <Button variant="primary" disabled={!title || (type !== 'custom' && !amount)} onClick={() => {
            toast.success(`Surface created · ${channels.length} channels ready to share`);
            onClose();
          }}>Create surface →</Button>
        </div>
      </div>
    </div>
  );
}

function Label({ children }: any) {
  return (
    <label style={{ display: 'block', fontSize: '10px', fontWeight: 500, color: colors.text2, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: colors.bg, border: `0.5px solid ${colors.border}`,
  borderRadius: radius.sm, fontSize: '13px', outline: 'none', color: colors.ink, fontFamily: 'inherit',
};

// ── Fake QR renderer (prototype) ─────────────────────────────────────
// Produces a QR-like SVG with three corner finder patterns and a
// deterministic pseudo-random fill based on the input text.
function FakeQR({ text, size = 160 }: { text: string; size?: number }) {
  const grid = 25;
  const cell = size / grid;

  const hash = (s: string, i: number) => {
    let h = i * 2654435761;
    for (let c = 0; c < s.length; c++) h = (((h << 5) - h) + s.charCodeAt(c)) | 0;
    return (Math.abs(h) % 3) !== 0;
  };

  const inFinder = (x: number, y: number) => {
    const fits = (cx: number, cy: number) => {
      const rx = x - cx, ry = y - cy;
      if (rx < 0 || rx > 6 || ry < 0 || ry > 6) return null as 'on' | 'off' | null;
      if (rx === 0 || rx === 6 || ry === 0 || ry === 6) return 'on';
      if (rx >= 2 && rx <= 4 && ry >= 2 && ry <= 4) return 'on';
      return 'off';
    };
    return fits(0, 0) || fits(grid - 7, 0) || fits(0, grid - 7);
  };

  const cells: React.ReactElement[] = [];
  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      const finder = inFinder(x, y);
      let fill: string | null = null;
      if (finder === 'on') fill = '#1A1A1A';
      else if (finder === 'off') fill = null;
      else if (hash(text, y * grid + x + 1)) fill = '#1A1A1A';

      if (fill) {
        cells.push(
          <rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell} height={cell} fill={fill} rx={cell * 0.15} />
        );
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={size} height={size} fill="#FFFFFF" />
      {cells}
    </svg>
  );
}
