import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { tenantService, Tenant } from '../../services';
import { toast } from 'sonner';

export function Tenants() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    tenantService.list().then(setTenants);
  }, []);

  if (!tenants) return <PageLoader label="Loading tenants" />;

  const filtered = tenants.filter(t =>
    !query || t.name.toLowerCase().includes(query.toLowerCase()) || t.slug.includes(query.toLowerCase())
  );

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
        <Link to="/app/super-admin">
          <Button variant="primary" icon={<Icons.IconPlus size={14} />}>Onboard new merchant</Button>
        </Link>
      </div>

      <Card padded={false}>
        <div style={{ padding: '16px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Icons.IconSearch size={14} color={colors.text2} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search merchant name or slug…"
              style={{
                background: colors.bg, border: `0.5px solid ${colors.border}`,
                borderRadius: radius.pill, padding: '8px 14px 8px 36px',
                fontSize: '12px', width: '320px', outline: 'none',
                color: colors.ink, fontFamily: typography.family.sans,
              }}
            />
          </div>
          <div style={{ fontSize: '12px', color: colors.text2 }}>{filtered.length} results</div>
        </div>

        <div style={{ padding: '12px 24px', display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 1fr 1fr 0.6fr', gap: '16px', background: colors.bg, fontSize: '10px', fontWeight: 500, color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <div>Merchant</div>
          <div>Workspace URL</div>
          <div>30d GMV</div>
          <div>Status</div>
          <div></div>
        </div>

        {filtered.map((t, i) => (
          <div key={t.id} style={{
            display: 'grid', gridTemplateColumns: '1.6fr 1.4fr 1fr 1fr 0.6fr', gap: '16px',
            padding: '16px 24px',
            borderBottom: i < filtered.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: radius.md, background: t.brandColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600 }}>
                {t.name.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink }}>{t.name}</div>
                <div style={{ fontSize: '11px', color: colors.text3 }}>{t.industry} · {t.plan}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <code style={{ fontFamily: typography.family.mono, fontSize: '11px', background: colors.bg, padding: '4px 10px', borderRadius: radius.sm, color: colors.text2, border: `0.5px solid ${colors.border}` }}>
                /t/{t.slug}
              </code>
              <button onClick={() => copyUrl(t.slug)} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: colors.text2 }}>
                <Icons.IconCopy size={13} />
              </button>
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>₹{t.gmv30d.toLocaleString('en-IN')}</div>
            <div>
              <Pill tone={t.status === 'Active' ? 'teal' : 'outline'}>
                {t.status}
              </Pill>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Link to={`/t/${t.slug}`} style={{ color: colors.text2 }}>
                <Icons.IconArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
