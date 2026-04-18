import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader, ErrorState } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { useAsync } from '../../hooks/useAsync';
import { tenantService, bookingService, configService, Tenant, Booking } from '../../services';

export function SuperAdmin() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const { data: cfg, loading: cfgLoading, error: cfgError, refetch } = useAsync(() => configService.getSuperAdmin(), []);
  const navigate = useNavigate();

  useEffect(() => {
    tenantService.list().then(setTenants).catch(e => setDataError(e.message));
    bookingService.list().then(setBookings).catch(e => setDataError(e.message));
  }, []);

  if (cfgError || dataError) return <ErrorState message={`Couldn't load super admin — ${cfgError?.message || dataError}`} onRetry={refetch} />;
  if (cfgLoading || !cfg || !tenants || !bookings) return <PageLoader label="Loading super admin" />;

  const { header, stats } = cfg;
  const statValues = [
    { ...stats[0], value: tenants.length.toString() },
    { ...stats[1], value: bookings.length.toString() },
    stats[2],
    stats[3],
  ];

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.amber} style={{ marginBottom: '6px' }}>{header.kicker}</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>{header.title}</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>{header.subtitle}</div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => navigate('/app/onboarding')}>
          Onboard new merchant
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {statValues.map((s: any) => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        <Card padded={false}>
          <div style={{ padding: '18px 24px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>All merchants</div>
            <Link to="/app/tenants" style={{ fontSize: '12px', color: colors.text2 }}>Manage →</Link>
          </div>
          {tenants.map((t, i) => (
            <div key={t.id} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.8fr', gap: '16px',
              padding: '14px 24px',
              borderBottom: i < tenants.length - 1 ? `0.5px solid ${colors.border}` : 'none',
              alignItems: 'center', fontSize: '13px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: radius.sm, background: t.brandColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>{t.name.charAt(0)}</div>
                <div>
                  <div style={{ color: colors.ink, fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontFamily: typography.family.mono, fontSize: '10px', color: colors.text3 }}>/t/{t.slug}</div>
                </div>
              </div>
              <div style={{ color: colors.ink, fontWeight: 600 }}>₹{t.gmv30d.toLocaleString('en-IN')}</div>
              <div><Pill tone={t.status === 'Active' ? 'teal' : 'outline'}>{t.status}</Pill></div>
            </div>
          ))}
        </Card>

        <Card padded={false}>
          <div style={{ padding: '18px 24px', borderBottom: `0.5px solid ${colors.border}` }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: colors.ink }}>Demo bookings</div>
            <div style={{ fontSize: '12px', color: colors.text2, marginTop: '2px' }}>Prospects who booked a call</div>
          </div>
          {bookings.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center', color: colors.text3, fontSize: '13px' }}>
              No bookings yet. Prospects can book at <code style={{ fontFamily: typography.family.mono, fontSize: '11px' }}>/book-demo</code>.
            </div>
          ) : (
            bookings.map((b, i) => (
              <div key={b.id} style={{
                padding: '14px 24px',
                borderBottom: i < bookings.length - 1 ? `0.5px solid ${colors.border}` : 'none',
              }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink }}>{b.name}</div>
                <div style={{ fontSize: '11px', color: colors.text3, marginBottom: '4px' }}>{b.email} · {b.company}</div>
                <div style={{ fontSize: '11px', color: colors.text2, fontFamily: typography.family.mono }}>{b.slot}</div>
              </div>
            ))
          )}
        </Card>
      </div>
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
