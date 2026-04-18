import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { colors, radius, typography } from '../design/tokens';
import * as Icons from '../design/icons';
import { useTenant } from './components/TenantContext';
import { Nexora } from './components/Nexora';
import { AmbientTicker } from './components/AmbientTicker';

type NavItem = { to: string; label: string; Icon: React.FC<any>; matches: (path: string) => boolean; superAdmin?: boolean };

export function AppLayout() {
  const location = useLocation();
  const params = useParams<{ slug?: string }>();
  const tenant = useTenant();
  const navigate = useNavigate();
  const [dockOpen, setDockOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currency, setCurrency] = useState('INR');

  const basePath = params.slug ? `/t/${params.slug}` : '/app';
  const subpath = location.pathname.startsWith(basePath) ? location.pathname.slice(basePath.length) || '/' : location.pathname;
  const isActive = (p: string) => subpath === p || (p !== '/' && subpath.startsWith(p));

  const mainItems: NavItem[] = [
    { to: '', label: 'Dashboard', Icon: Icons.IconHome, matches: (p) => p === '/' || p === '' },
    { to: '/transactions', label: 'Transactions', Icon: Icons.IconLedger, matches: (p) => p.startsWith('/transactions') },
    { to: '/tenants', label: 'Tenants', Icon: Icons.IconTenants, matches: (p) => p.startsWith('/tenants') },
    { to: '/risk', label: 'Risk', Icon: Icons.IconShield, matches: (p) => p.startsWith('/risk') },
    { to: '/settlements', label: 'Settlements', Icon: Icons.IconSettlements, matches: (p) => p.startsWith('/settlements') },
    { to: '/analytics', label: 'Analytics', Icon: Icons.IconChart, matches: (p) => p.startsWith('/analytics') },
    { to: '/invoices', label: 'Invoices', Icon: Icons.IconInvoice, matches: (p) => p.startsWith('/invoices') },
    { to: '/collect', label: 'Collect', Icon: Icons.IconPay, matches: (p) => p.startsWith('/collect') },
    { to: '/subscriptions', label: 'Subscriptions', Icon: Icons.IconRecurring, matches: (p) => p.startsWith('/subscriptions') },
    { to: '/developer', label: 'Developer', Icon: Icons.IconDeveloper, matches: (p) => p.startsWith('/developer') },
    { to: '/admin', label: 'Team & admin', Icon: Icons.IconUser, matches: (p) => p.startsWith('/admin') },
  ];

  const superAdminItem: NavItem | null = !tenant
    ? { to: '/super-admin', label: 'Super admin', Icon: Icons.IconCrown, matches: (p) => p.startsWith('/super-admin'), superAdmin: true }
    : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setProfileOpen(false);
        setNotifOpen(false);
        setCurrencyOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg, position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: `radial-gradient(circle, rgba(30,30,30,0.04) 1px, transparent 1px)`, backgroundSize: '26px 26px', zIndex: 0 }} />

      <Dock mainItems={mainItems} superAdminItem={superAdminItem} basePath={basePath} isActive={isActive} dockOpen={dockOpen} setDockOpen={setDockOpen} />

      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header
          tenant={tenant}
          currency={currency} setCurrency={setCurrency} currencyOpen={currencyOpen} setCurrencyOpen={setCurrencyOpen}
          setSearchOpen={setSearchOpen}
          profileOpen={profileOpen} setProfileOpen={setProfileOpen}
          notifOpen={notifOpen} setNotifOpen={setNotifOpen}
          onSignOut={() => navigate('/signin')}
        />
        <main style={{ flex: 1, padding: '24px 40px 64px 24px', minWidth: 0 }}>
          <Outlet />
        </main>
      </div>

      <AmbientTicker />

      <Nexora
        open={searchOpen}
        onOpen={() => setSearchOpen(true)}
        onClose={() => setSearchOpen(false)}
      />
      {(profileOpen || notifOpen || currencyOpen) && (
        <div onClick={() => { setProfileOpen(false); setNotifOpen(false); setCurrencyOpen(false); }} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
      )}
    </div>
  );
}

function Dock({ mainItems, superAdminItem, basePath, isActive, dockOpen, setDockOpen }: any) {
  return (
    <nav
      onMouseEnter={() => setDockOpen(true)}
      onMouseLeave={() => setDockOpen(false)}
      style={{
        position: 'sticky', top: 0, alignSelf: 'flex-start',
        width: dockOpen ? '220px' : '64px',
        flexShrink: 0, height: '100vh',
        padding: '20px 12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
        transition: 'width 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        zIndex: 20,
      }}
    >
      <Link to={basePath} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexShrink: 0, textDecoration: 'none', width: '100%', justifyContent: dockOpen ? 'flex-start' : 'center', paddingLeft: dockOpen ? '4px' : 0 }}>
        <div style={{ width: '40px', height: '40px', borderRadius: radius.md, background: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icons.PayzeMark size={20} color="#F6F6F2" />
        </div>
        {dockOpen && (
          <span style={{
            fontSize: '17px', fontWeight: 600, color: colors.ink,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            animation: 'payze-fadein 0.25s ease-out',
          }}>Payze</span>
        )}
      </Link>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%', alignItems: dockOpen ? 'stretch' : 'center' }}>
        {mainItems.map((item: NavItem) => (
          <DockItem key={item.to} item={item} basePath={basePath} isActive={isActive} dockOpen={dockOpen} />
        ))}
      </div>

      {superAdminItem && (
        <>
          <div style={{ width: dockOpen ? '100%' : '24px', height: '0.5px', background: colors.borderHover, margin: '8px 0' }} />
          <div style={{ width: '100%' }}>
            <DockItem item={superAdminItem} basePath={basePath} isActive={isActive} dockOpen={dockOpen} />
          </div>
        </>
      )}

      <div style={{ flex: 1 }} />
    </nav>
  );
}

function DockItem({ item, basePath, isActive, dockOpen }: { item: NavItem; basePath: string; isActive: (p: string) => boolean; dockOpen: boolean }) {
  const active = isActive(item.to || '/');
  const accent = item.superAdmin ? colors.amber : colors.teal;

  return (
    <Link
      to={`${basePath}${item.to}`}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: dockOpen ? '10px 12px' : '0',
        width: dockOpen ? '100%' : '40px', height: '40px',
        justifyContent: dockOpen ? 'flex-start' : 'center',
        borderRadius: radius.md,
        background: active ? colors.card : 'transparent',
        border: active ? `0.5px solid ${colors.border}` : '0.5px solid transparent',
        boxShadow: active ? '0 2px 6px -2px rgba(26,18,10,0.06)' : 'none',
        position: 'relative', transition: 'background 0.15s, border-color 0.15s',
        textDecoration: 'none', color: active ? colors.ink : colors.text2,
        flexShrink: 0, overflow: 'hidden',
      }}
    >
      {active && <span style={{ position: 'absolute', left: '-3px', top: '50%', transform: 'translateY(-50%)', width: '3px', height: '18px', background: accent, borderRadius: '2px' }} />}
      <div style={{ width: '17px', height: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <item.Icon size={17} color={active ? accent : colors.text2} strokeWidth={1.8} />
      </div>
      {dockOpen && (
        <span style={{ fontSize: '13px', fontWeight: active ? 500 : 400, color: active ? colors.ink : colors.text2, whiteSpace: 'nowrap' }}>
          {item.label}
        </span>
      )}
    </Link>
  );
}

function Header({ tenant, currency, setCurrency, currencyOpen, setCurrencyOpen, setSearchOpen, profileOpen, setProfileOpen, notifOpen, setNotifOpen, onSignOut }: any) {
  return (
    <header style={{ padding: '20px 40px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', position: 'sticky', top: 0, background: colors.bg, zIndex: 30 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        <Link to={tenant ? `/t/${tenant.slug}` : '/app'} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
          <Icons.PayzeMark size={18} color={colors.ink} />
          <span style={{ fontSize: '16px', fontWeight: 600, color: colors.ink, letterSpacing: '-0.01em' }}>Payze</span>
        </Link>
        {tenant && (
          <>
            <span style={{ color: colors.borderHover, fontSize: '14px', fontWeight: 300 }}>/</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px 6px 6px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill }}>
              <div style={{ width: '24px', height: '24px', borderRadius: radius.sm, background: tenant.brandColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>
                {tenant.name.charAt(0)}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: colors.ink }}>{tenant.name}</div>
              <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>/t/{tenant.slug}</div>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setCurrencyOpen(!currencyOpen)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill, fontSize: '13px', fontWeight: 500, color: colors.ink, cursor: 'pointer', fontFamily: 'inherit' }}>
            <span style={{ fontFamily: typography.family.mono, fontSize: '11px', letterSpacing: '0.05em' }}>{currency}</span>
            <Icons.IconChevronDown size={12} color={colors.text2} />
          </button>
          {currencyOpen && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, boxShadow: colors.shadowMd, padding: '6px', minWidth: '140px', zIndex: 50 }}>
              {['INR', 'USD', 'EUR', 'GBP', 'AED'].map(c => (
                <button key={c} onClick={() => { setCurrency(c); setCurrencyOpen(false); }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '8px 10px', background: c === currency ? colors.bg : 'transparent', border: 'none', borderRadius: radius.sm, fontSize: '12px', color: colors.ink, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                  <span style={{ fontFamily: typography.family.mono, fontWeight: 500 }}>{c}</span>
                  {c === currency && <Icons.IconCheck size={12} color={colors.teal} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={() => setNotifOpen(!notifOpen)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: colors.card, border: `0.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
            <Icons.IconBell size={15} color={colors.ink} />
            <span style={{ position: 'absolute', top: '7px', right: '7px', width: '7px', height: '7px', borderRadius: '50%', background: colors.teal, border: `1.5px solid ${colors.card}` }} />
          </button>
          {notifOpen && <NotificationsPanel />}
        </div>

        <div style={{ position: 'relative' }}>
          <button onClick={() => setProfileOpen(!profileOpen)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: colors.ink, color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            KV
          </button>
          {profileOpen && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, boxShadow: colors.shadowMd, padding: '12px', minWidth: '240px', zIndex: 50 }}>
              <div style={{ padding: '4px 8px 10px 8px', borderBottom: `0.5px solid ${colors.border}`, marginBottom: '6px' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink }}>Kavya Venkatesh</div>
                <div style={{ fontSize: '12px', color: colors.text3 }}>kavya@payze.com</div>
              </div>
              {[
                { label: 'Profile', Icon: Icons.IconUser },
                { label: 'Settings', Icon: Icons.IconSettings },
                { label: 'Help & docs', Icon: Icons.IconExternal },
              ].map(m => (
                <button key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 8px', background: 'transparent', border: 'none', borderRadius: radius.sm, fontSize: '12px', color: colors.ink, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                  <m.Icon size={14} color={colors.text2} />
                  {m.label}
                </button>
              ))}
              <div style={{ height: '0.5px', background: colors.border, margin: '6px 0' }} />
              <button onClick={onSignOut} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '8px 8px', background: 'transparent', border: 'none', borderRadius: radius.sm, fontSize: '12px', color: colors.ink, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
                <Icons.IconLogout size={14} color={colors.text2} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NotificationsPanel() {
  const notifications = [
    { title: 'Settlement completed', desc: 'Batch STL-9824 · ₹45,20,000', time: '2m', unread: true },
    { title: 'HDFC Visa anomaly resolved', desc: 'Fallback routing recovered 20 txns', time: '15m', unread: true },
    { title: 'New merchant activated', desc: 'BookMyShow is now live', time: '1h', unread: false },
  ];
  return (
    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '6px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.md, boxShadow: colors.shadowMd, width: '360px', zIndex: 50, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>Notifications</div>
        <button style={{ background: 'none', border: 'none', fontSize: '11px', color: colors.text2, cursor: 'pointer' }}>Mark all read</button>
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {notifications.map((n, i) => (
          <div key={i} style={{ padding: '14px 16px', borderBottom: i < notifications.length - 1 ? `0.5px solid ${colors.border}` : 'none', display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: n.unread ? colors.teal : colors.borderHover, marginTop: '6px', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink, marginBottom: '2px' }}>{n.title}</div>
              <div style={{ fontSize: '12px', color: colors.text2 }}>{n.desc}</div>
            </div>
            <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>{n.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
