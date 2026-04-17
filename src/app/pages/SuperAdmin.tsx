import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Kicker, Button, Pill, PageLoader } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { tenantService, bookingService, Tenant, Booking } from '../../services';
import { toast } from 'sonner';

export function SuperAdmin() {
  const [tenants, setTenants] = useState<Tenant[] | null>(null);
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    tenantService.list().then(setTenants);
    bookingService.list().then(setBookings);
  }, []);

  if (!tenants || !bookings) return <PageLoader label="Loading super admin" />;

  const refresh = () => {
    tenantService.list().then(setTenants);
    bookingService.list().then(setBookings);
  };

  return (
    <div style={{ animation: 'payze-fadein 0.4s ease-out' }}>
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <Kicker color={colors.amber} style={{ marginBottom: '6px' }}>Platform</Kicker>
          <div style={{ ...typography.pageTitle, color: colors.ink }}>Super admin</div>
          <div style={{ fontSize: '13px', color: colors.text2, marginTop: '2px' }}>
            Platform-level controls. Operator-only.
          </div>
        </div>
        <Button variant="primary" icon={<Icons.IconPlus size={14} />} onClick={() => setModalOpen(true)}>
          Onboard new merchant
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <StatCard label="Total merchants" value={tenants.length.toString()} sub="on the platform" />
        <StatCard label="Demo bookings" value={bookings.length.toString()} sub="awaiting response" />
        <StatCard label="Pending KYC" value="3" sub="action required" />
        <StatCard label="Platform MRR" value="₹18.4 L" sub="+12.4% MoM" />
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
                <div style={{ width: '28px', height: '28px', borderRadius: radius.sm, background: t.brandColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div style={{ color: colors.ink, fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontFamily: typography.family.mono, fontSize: '10px', color: colors.text3 }}>/t/{t.slug}</div>
                </div>
              </div>
              <div style={{ color: colors.ink, fontWeight: 600 }}>₹{t.gmv30d.toLocaleString('en-IN')}</div>
              <div>
                <Pill tone={t.status === 'Active' ? 'teal' : 'outline'}>{t.status}</Pill>
              </div>
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
              No bookings yet
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

      {modalOpen && <OnboardModal onClose={() => { setModalOpen(false); refresh(); }} />}
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

function OnboardModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [industry, setIndustry] = useState('SaaS');
  const [brandColor, setBrandColor] = useState('#1C6F6B');
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name || !slug) return;
    setCreating(true);
    try {
      await tenantService.create({ name, slug, industry, brandColor, plan: 'Growth', status: 'Active', gmv30d: 0 });
      toast.success(`Merchant ${name} onboarded`);
      onClose();
    } catch {
      toast.error('Failed to onboard');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)',
      backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '480px', maxWidth: '100%', background: colors.card,
        border: `0.5px solid ${colors.border}`, borderRadius: radius.lg,
        padding: '28px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <Kicker color={colors.amber} style={{ marginBottom: '6px' }}>New merchant</Kicker>
            <div style={{ fontSize: '20px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.015em' }}>Onboard a merchant</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.text2, padding: '4px' }}>
            <Icons.IconX size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Field label="Merchant name">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corporation"
              style={inputStyle} />
          </Field>
          <Field label="Workspace slug" helper={`payze.app/t/${slug || 'acme-corp'}`}>
            <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="acme-corp"
              style={{ ...inputStyle, fontFamily: typography.family.mono }} />
          </Field>
          <Field label="Industry">
            <select value={industry} onChange={(e) => setIndustry(e.target.value)} style={inputStyle}>
              <option>SaaS</option>
              <option>FinTech</option>
              <option>E-commerce</option>
              <option>Travel</option>
              <option>Studio</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Brand color">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['#1C6F6B', '#1A1A1A', '#8B5CF6', '#F59E0B', '#EF4444', '#3B82F6'].map(c => (
                <button key={c} onClick={() => setBrandColor(c)} style={{
                  width: '32px', height: '32px', borderRadius: radius.sm,
                  background: c, border: brandColor === c ? `2px solid ${colors.ink}` : `0.5px solid ${colors.border}`,
                  cursor: 'pointer',
                }} />
              ))}
            </div>
          </Field>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" onClick={handleCreate} disabled={creating || !name || !slug}>
            {creating ? 'Onboarding…' : 'Onboard merchant'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: colors.text2, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</label>
      {children}
      {helper && <div style={{ fontSize: '11px', color: colors.text3, marginTop: '4px', fontFamily: typography.family.mono }}>{helper}</div>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  background: colors.bg, border: `0.5px solid ${colors.border}`,
  borderRadius: radius.sm, fontSize: '13px',
  outline: 'none', color: colors.ink,
  fontFamily: 'inherit',
};
