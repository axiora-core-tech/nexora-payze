import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { tenantService, Tenant } from '../../services';
import { toast } from 'sonner';

export function Tenants() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Pending' | 'Suspended'>('all');
  const navigate = useNavigate();

  useEffect(() => { tenantService.list().then(setTenants); }, []);

  if (!tenants) return <PageLoader label="Loading tenants" />;

  const filtered = tenants.filter(t => {
    if (query && !(t.name.toLowerCase().includes(query.toLowerCase()) || t.slug.includes(query.toLowerCase()))) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  const copyUrl = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/t/${slug}`);
    toast.success('Workspace URL copied');
  };

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.teal} style={{ marginBottom: '6px' }}>Clients</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>Tenants</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
            {tenants.length} merchant workspaces on the platform.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="secondary" icon={<Icons.IconDownload size={14} />} onClick={() => toast.success('Tenant roster exported')}>Export</Button>
          <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => navigate('/app/onboarding')}>
            Onboard new merchant
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Total merchants" value={tenants.length.toString()} sub="on the platform" />
        <StatCard label="Active" value={tenants.filter(t => t.status === 'Active').length.toString()} sub="processing live" />
        <StatCard label="Platform GMV, 30d" value={`₹${(tenants.reduce((a, t) => a + t.gmv30d, 0) / 1_00_000).toFixed(1)} L`} sub="combined" />
        <StatCard label="Avg per merchant" value={`₹${Math.round(tenants.reduce((a, t) => a + t.gmv30d, 0) / tenants.length / 1000)}k`} sub="monthly" />
      </div>

      <Card padded={false}>
        <div style={{ padding: '16px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Icons.IconSearch size={14} color={colors.text2} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search merchant name or slug…" style={{ background: colors.bg, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, padding: '8px 14px 8px 36px', fontSize: '12px', width: '320px', outline: 'none', color: colors.ink, fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'flex', gap: '4px', background: colors.bg, padding: '4px', borderRadius: radius.pill }}>
            {['all', 'Active', 'Pending', 'Suspended'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s as any)} style={{
                padding: '6px 12px', borderRadius: radius.pill, fontSize: '11px', fontWeight: 500,
                background: statusFilter === s ? colors.card : 'transparent',
                color: statusFilter === s ? colors.ink : colors.text2,
                border: statusFilter === s ? `0.5px solid ${colors.border}` : 'none',
                cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit',
              }}>{s}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '12px', color: colors.text2 }}>{filtered.length} results</div>
        </div>

        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 1fr 1fr 0.6fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Merchant</div><div>Workspace URL</div><div>30d GMV</div><div>Status</div><div></div>
        </div>

        {filtered.map((t, i) => (
          <div key={t.id} style={{
            display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 1fr 1fr 0.6fr', gap: '16px',
            padding: '16px 24px',
            borderBottom: i < filtered.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: radius.md, background: t.brandColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>{t.name.charAt(0)}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink }}>{t.name}</div>
                <div style={{ fontSize: '11px', color: colors.text3 }}>{t.industry} · {t.plan}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <code style={{ fontFamily: typography.family.mono, fontSize: '11px', background: colors.bg, padding: '4px 10px', borderRadius: radius.sm, color: colors.text2, border: `0.5px solid ${colors.border}` }}>/t/{t.slug}</code>
              <button onClick={() => copyUrl(t.slug)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: colors.text2 }}><Icons.IconCopy size={13} /></button>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>₹{t.gmv30d.toLocaleString('en-IN')}</div>
            <div><Pill tone={t.status === 'Active' ? 'teal' : t.status === 'Pending' ? 'outline' : 'neutral'}>{t.status}</Pill></div>
            <div style={{ textAlign: 'right' }}>
              <Link to={`/t/${t.slug}`} style={{ color: colors.text2 }}><Icons.IconArrowUpRight size={14} /></Link>
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
