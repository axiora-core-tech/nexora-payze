import React, { useState } from 'react';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';
import { useAsync } from '../../hooks/useAsync';
import { configService } from '../../services';

const AMBER = '#B48C3C';
const RED   = '#D64545';

export function Customers() {
  const { data, loading, error, refetch } = useAsync(() => configService.getCustomers(), []);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);

  if (error) return <ErrorState message={`Couldn't load customers — ${error.message}`} onRetry={refetch} />;
  if (loading || !data) return <PageLoader label="Loading customers" />;

  const filtered = data.customers.filter((c: any) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search && !(c.name + c.email + c.phone + c.city).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>{data.header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{data.header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{data.header.subtitle}</div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => toast.success('Add customer form opened')}>Add customer</Button>
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

      <Card padded={false}>
        <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Search by name, email, phone, city…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: '260px', padding: '8px 14px', background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '12px', color: colors.ink, outline: 'none' }} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '8px 14px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '12px', color: colors.ink, cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
            {data.statusFilters.map((f: string) => <option key={f} value={f}>{f === 'all' ? 'All statuses' : f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
          </select>
          <Button variant="ghost" size="sm" icon={<Icons.IconDownload size={12} />} onClick={() => toast.success('CSV exported')}>Export</Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr 0.7fr 1fr 0.8fr 0.9fr', gap: '14px', padding: '12px 24px', borderBottom: `0.5px solid ${colors.border}`, fontSize: '10px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>
          <div>Customer</div><div>Contact</div><div style={{ textAlign: 'right' }}>Payments</div><div style={{ textAlign: 'right' }}>LTV</div><div>Preferred</div><div style={{ textAlign: 'right' }}>Last · Status</div>
        </div>

        {filtered.map((c: any, i: number) => (
          <div key={c.id} onClick={() => setSelected(c)} style={{
            display: 'grid', gridTemplateColumns: '1.6fr 1.2fr 0.7fr 1fr 0.8fr 0.9fr', gap: '14px',
            padding: '14px 24px', borderBottom: i < filtered.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            alignItems: 'center', fontSize: '12px', cursor: 'pointer', transition: 'background 0.15s',
          }} onMouseEnter={e => { e.currentTarget.style.background = colors.bg; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: colors.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, flexShrink: 0 }}>{initialsOf(c.name)}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: colors.ink, fontWeight: 500 }}>{c.name}</div>
                <div style={{ color: colors.text3, fontSize: '10px' }}>{c.city}</div>
              </div>
            </div>
            <div>
              <div style={{ color: colors.text2, fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</div>
              <div style={{ color: colors.text3, fontSize: '10px', fontFamily: typography.family.mono }}>{c.phone}</div>
            </div>
            <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 500 }}>{c.paymentsCount}</div>
            <div style={{ textAlign: 'right', color: colors.ink, fontFamily: typography.family.mono, fontWeight: 600 }}>{c.ltv}</div>
            <div style={{ color: colors.text2, fontSize: '11px' }}>{c.preferredMethod?.type}</div>
            <div style={{ textAlign: 'right' }}>
              <StatusBadge status={c.status} />
              <div style={{ color: colors.text3, fontSize: '10px', marginTop: '2px' }}>{c.lastPaymentAt}</div>
            </div>
          </div>
        ))}
      </Card>

      {selected && <CustomerDrawer customer={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    active:   { color: colors.teal,  bg: 'rgba(28,111,107,0.08)', label: 'Active' },
    new:      { color: colors.teal,  bg: 'rgba(28,111,107,0.08)', label: 'New' },
    dormant:  { color: AMBER,        bg: 'rgba(180,140,60,0.08)', label: 'Dormant' },
    churned:  { color: RED,          bg: 'rgba(214,69,69,0.08)',  label: 'Churned' },
  };
  const m = map[status] || map.active;
  return <span style={{ fontSize: '9px', padding: '2px 8px', borderRadius: radius.pill, background: m.bg, color: m.color, border: `0.5px solid ${m.color}40`, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: typography.family.mono }}>{m.label}</span>;
}

function CustomerDrawer({ customer, onClose }: any) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '600px', maxWidth: '100%', height: '100%', background: colors.card, borderLeft: `0.5px solid ${colors.border}`, padding: '28px 32px', overflowY: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center', minWidth: 0 }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: colors.ink, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 600, flexShrink: 0 }}>{initialsOf(customer.name)}</div>
            <div style={{ minWidth: 0 }}>
              <Kicker color={colors.teal} style={{ marginBottom: '4px' }}>Customer</Kicker>
              <div style={{ fontSize: '18px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.005em' }}>{customer.name}</div>
              <div style={{ fontSize: '11px', color: colors.text2, fontFamily: typography.family.mono, marginTop: '2px' }}>{customer.id}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <StatusBadge status={customer.status} />
          {customer.tags.map((t: string) => <Pill key={t} tone="outline">{t}</Pill>)}
        </div>

        {/* LTV hero */}
        <div style={{ padding: '16px 18px', background: colors.bg, borderRadius: radius.md, marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
          <Stat label="Lifetime value" value={customer.ltv} tone="ink" />
          <Stat label="Payments"       value={customer.paymentsCount.toString()} />
          <Stat label="Avg ticket"     value={customer.avgTicket} />
        </div>

        {/* Contact */}
        <Kicker style={{ marginBottom: '10px' }}>Contact</Kicker>
        <div style={{ padding: '14px 16px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px' }}>
          <DetailRow label="Email"        value={customer.email} mono />
          <DetailRow label="Phone"        value={customer.phone} mono />
          <DetailRow label="City"         value={customer.city} />
          <DetailRow label="Customer since" value={customer.createdAt} isLast />
        </div>

        {/* Payment methods */}
        <Kicker style={{ marginBottom: '10px' }}>Payment preferences</Kicker>
        <div style={{ marginBottom: '20px' }}>
          <MethodTile method={customer.preferredMethod} primary />
          {customer.secondaryMethod && <MethodTile method={customer.secondaryMethod} />}
        </div>

        {/* Consent */}
        <Kicker style={{ marginBottom: '10px' }}>Communication consent</Kicker>
        <div style={{ padding: '12px 14px', background: colors.bg, borderRadius: radius.md, marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
            <ConsentDot on={customer.consent.marketing} label="Marketing" />
            <ConsentDot on={customer.consent.transactional} label="Transactional" />
          </div>
          <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono, marginTop: '8px' }}>{customer.consent.consentedAt}</div>
        </div>

        {/* Recent payments */}
        <Kicker style={{ marginBottom: '10px' }}>Recent payments</Kicker>
        <div style={{ padding: '4px 0', marginBottom: '20px' }}>
          {customer.recentPayments.map((p: any, i: number) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.2fr 0.8fr 1.4fr', gap: '12px', padding: '10px 0', borderBottom: i < customer.recentPayments.length - 1 ? `0.5px solid ${colors.border}` : 'none', alignItems: 'center', fontSize: '11px' }}>
              <div style={{ color: colors.text3, fontFamily: typography.family.mono }}>{p.date}</div>
              <div style={{ color: colors.ink, fontWeight: 500 }}>{p.merchant}</div>
              <div style={{ color: colors.ink, fontFamily: typography.family.mono, fontWeight: 600, textAlign: 'right' }}>{p.amount}</div>
              <div style={{ color: colors.text2 }}>{p.method}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button variant="primary" size="sm" icon={<Icons.IconSend size={12} />} onClick={() => toast.success('Opening send flow', { description: `Will pre-fill ${customer.phone}` })}>Send payment request</Button>
          <Button variant="secondary" size="sm" icon={<Icons.IconMail size={12} />} onClick={() => toast.success('Email composer opened')}>Email</Button>
          <Button variant="ghost" size="sm" onClick={() => toast.success('Opening merge customers')}>Merge</Button>
          <Button variant="ghost" size="sm" icon={<Icons.IconDownload size={12} />} onClick={() => toast.success('Customer profile exported')}>Export</Button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: any) {
  return (
    <div>
      <div style={{ fontSize: '9px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '16px', fontWeight: 600, color: tone === 'ink' ? colors.ink : colors.ink, fontFamily: typography.family.mono }}>{value}</div>
    </div>
  );
}

function MethodTile({ method, primary }: any) {
  if (!method) return null;
  return (
    <div style={{ padding: '12px 14px', background: primary ? 'rgba(28,111,107,0.04)' : colors.bg, border: `0.5px solid ${primary ? 'rgba(28,111,107,0.2)' : colors.border}`, borderRadius: radius.md, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{ fontSize: '12px', color: colors.ink, fontWeight: 600 }}>{method.type}</span>
          {primary && <span style={{ fontSize: '9px', color: colors.teal, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>Preferred</span>}
        </div>
        <div style={{ fontSize: '11px', color: colors.text2, fontFamily: typography.family.mono }}>{method.detail}</div>
      </div>
      <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{method.usage}</div>
    </div>
  );
}

function ConsentDot({ on, label }: any) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: on ? colors.teal : colors.text3 }} />
      <span style={{ fontSize: '11px', color: colors.ink, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '10px', color: on ? colors.teal : colors.text3, fontFamily: typography.family.mono, letterSpacing: '0.06em', fontWeight: 600 }}>{on ? 'OPTED IN' : 'OPTED OUT'}</span>
    </div>
  );
}

function DetailRow({ label, value, mono, isLast }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '8px 0', borderBottom: isLast ? 'none' : `0.5px solid ${colors.border}`, fontSize: '12px', gap: '12px' }}>
      <span style={{ color: colors.text3, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, flexShrink: 0 }}>{label}</span>
      <span style={{ color: colors.ink, fontFamily: mono ? typography.family.mono : 'inherit', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
