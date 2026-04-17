import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router';
import { colors, radius, typography } from '../design/tokens';
import * as Icons from '../design/icons';
import { useTenant } from './components/TenantContext';

/**
 * AppLayout — the shell wrapping every authenticated page.
 * - Left floating dock: 64px resting, 220px on hover (with labels)
 * - Top header: page title area left, search + currency + notifications + avatar right
 * - Content fills the remaining space
 */

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

  // Base path: /app or /t/{slug}
  const basePath = params.slug ? `/t/${params.slug}` : '/app';
  const subpath = location.pathname.startsWith(basePath)
    ? location.pathname.slice(basePath.length) || '/'
    : location.pathname;

  const isActive = (p: string) => subpath === p || (p !== '/' && subpath.startsWith(p));

  const mainItems: NavItem[] = [
    { to: '', label: 'Dashboard', Icon: Icons.IconHome, matches: (p) => p === '/' || p === '' },
    { to: '/transactions', label: 'Transactions', Icon: Icons.IconLedger, matches: (p) => p.startsWith('/transactions') },
    { to: '/tenants', label: 'Tenants', Icon: Icons.IconTenants, matches: (p) => p.startsWith('/tenants') },
    { to: '/risk', label: 'Risk', Icon: Icons.IconShield, matches: (p) => p.startsWith('/risk') },
    { to: '/settlements', label: 'Settlements', Icon: Icons.IconSettlements, matches: (p) => p.startsWith('/settlements') },
    { to: '/analytics', label: 'Analytics', Icon: Icons.IconChart, matches: (p) => p.startsWith('/analytics') },
    { to: '/invoices', label: 'Invoices', Icon: Icons.IconInvoice, matches: (p) => p.startsWith('/invoices') },
    { to: '/links', label: 'Payment links', Icon: Icons.IconLink, matches: (p) => p.startsWith('/links') },
    { to: '/subscriptions', label: 'Subscriptions', Icon: Icons.IconRecurring, matches: (p) => p.startsWith('/subscriptions') },
    { to: '/developer', label: 'Developer', Icon: Icons.IconDeveloper, matches: (p) => p.startsWith('/developer') },
    { to: '/admin', label: 'Team & admin', Icon: Icons.IconUser, matches: (p) => p.startsWith('/admin') },
  ];

  // Super admin only in the default /app workspace, not inside tenant scope
  const superAdminItem: NavItem | null = !tenant
    ? { to: '/super-admin', label: 'Super admin', Icon: Icons.IconCrown, matches: (p) => p.startsWith('/super-admin'), superAdmin: true }
    : null;

  // Global ⌘K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
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
      {/* Subtle dot grid texture */}
      <div
        style={{
          position: 'fixed', inset: 0, pointerEvents: 'none',
          backgroundImage: `radial-gradient(circle, rgba(30,30,30,0.04) 1px, transparent 1px)`,
          backgroundSize: '26px 26px',
          zIndex: 0,
        }}
      />

      {/* LEFT DOCK */}
      <Dock
        mainItems={mainItems}
        superAdminItem={superAdminItem}
        basePath={basePath}
        isActive={isActive}
        dockOpen={dockOpen}
        setDockOpen={setDockOpen}
        navigate={navigate}
      />

      {/* MAIN COLUMN */}
      <div style={{ flex: 1, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <Header
          tenant={tenant}
          currency={currency}
          setCurrency={setCurrency}
          currencyOpen={currencyOpen}
          setCurrencyOpen={setCurrencyOpen}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
          onSignOut={() => navigate('/')}
        />

        {/* Page content */}
        <main style={{ flex: 1, padding: '24px 40px 48px 24px', minWidth: 0 }}>
          <Outlet />
        </main>
      </div>

      {/* Search modal */}
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}

      {/* Click-out overlay for popovers */}
      {(profileOpen || notifOpen || currencyOpen) && (
        <div
          onClick={() => {
            setProfileOpen(false);
            setNotifOpen(false);
            setCurrencyOpen(false);
          }}
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
        />
      )}
    </div>
  );
}

/* ── Left floating dock ─────────────────────────────────────── */

function Dock({
  mainItems, superAdminItem, basePath, isActive, dockOpen, setDockOpen, navigate,
}: {
  mainItems: NavItem[];
  superAdminItem: NavItem | null;
  basePath: string;
  isActive: (p: string) => boolean;
  dockOpen: boolean;
  setDockOpen: (v: boolean) => void;
  navigate: (p: string) => void;
}) {
  return (
    <nav
      onMouseEnter={() => setDockOpen(true)}
      onMouseLeave={() => setDockOpen(false)}
      style={{
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        width: dockOpen ? '220px' : '64px',
        flexShrink: 0,
        height: '100vh',
        padding: '20px 12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        transition: 'width 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
        zIndex: 20,
      }}
    >
      {/* Brand */}
      <Link
        to={basePath}
        style={{
          width: '40px', height: '40px',
          borderRadius: radius.md,
          background: colors.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '12px',
          flexShrink: 0,
          textDecoration: 'none',
        }}
      >
        <Icons.PayzeMark size={20} color="#F6F6F2" />
      </Link>

      {/* Main items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%', alignItems: dockOpen ? 'stretch' : 'center' }}>
        {mainItems.map((item) => (
          <DockItem key={item.to} item={item} basePath={basePath} isActive={isActive} dockOpen={dockOpen} />
        ))}
      </div>

      {/* Divider + Super Admin */}
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
  const accentTint = item.superAdmin ? colors.amberTint : colors.tealTint;

  return (
    <Link
      to={`${basePath}${item.to}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: dockOpen ? '10px 12px' : '0',
        width: dockOpen ? '100%' : '40px',
        height: '40px',
        justifyContent: dockOpen ? 'flex-start' : 'center',
        borderRadius: radius.md,
        background: active ? colors.card : 'transparent',
        border: active ? `0.5px solid ${colors.border}` : '0.5px solid transparent',
        boxShadow: active ? '0 2px 6px -2px rgba(26,18,10,0.06)' : 'none',
        position: 'relative',
        transition: 'background 0.15s, border-color 0.15s',
        textDecoration: 'none',
        color: active ? colors.ink : colors.text2,
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      {/* Active indicator */}
      {active && (
        <span
          style={{
            position: 'absolute',
            left: '-3px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '3px',
            height: '18px',
            background: accent,
            borderRadius: '2px',
          }}
        />
      )}
      <div style={{ width: '17px', height: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <item.Icon size={17} color={active ? accent : colors.text2} strokeWidth={1.8} />
      </div>
      {dockOpen && (
        <span
          style={{
            fontSize: '13px',
            fontWeight: active ? 500 : 400,
            color: active ? colors.ink : colors.text2,
            whiteSpace: 'nowrap',
            opacity: dockOpen ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
        >
          {item.label}
        </span>
      )}
      {!!item.superAdmin && !dockOpen && active && (
        <span style={{ position: 'absolute', inset: 0, background: accentTint, borderRadius: radius.md, zIndex: -1 }} />
      )}
    </Link>
  );
}

/* ── Top header ─────────────────────────────────────────────── */

function Header({
  tenant,
  currency, setCurrency, currencyOpen, setCurrencyOpen,
  searchOpen, setSearchOpen,
  profileOpen, setProfileOpen,
  notifOpen, setNotifOpen,
  onSignOut,
}: any) {
  return (
    <header
      style={{
        padding: '20px 40px 20px 8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        position: 'sticky',
        top: 0,
        background: colors.bg,
        zIndex: 30,
      }}
    >
      {/* Left: tenant identity (if in tenant workspace) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
        {tenant && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 12px 6px 6px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.pill }}>
            <div style={{ width: '24px', height: '24px', borderRadius: radius.sm, background: tenant.brandColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>
              {tenant.name.charAt(0)}
            </div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: colors.ink }}>{tenant.name}</div>
            <div style={{ fontSize: '10px', color: colors.text3, fontFamily: typography.family.mono }}>/t/{tenant.slug}</div>
          </div>
        )}
      </div>

      {/* Right: search, currency, notifications, avatar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
        {/* Search trigger */}
        <button
          onClick={() => setSearchOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px 8px 12px',
            background: colors.card,
            border: `0.5px solid ${colors.border}`,
            borderRadius: radius.pill,
            color: colors.text2,
            fontSize: '13px',
            cursor: 'pointer',
            minWidth: '220px',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.IconSearch size={14} color={colors.text2} />
            Search or jump to…
          </span>
          <span style={{ fontFamily: typography.family.mono, fontSize: '10px', color: colors.text3, padding: '2px 6px', border: `0.5px solid ${colors.border}`, borderRadius: '4px' }}>⌘K</span>
        </button>

        {/* Currency */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setCurrencyOpen(!currencyOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px',
              background: colors.card, border: `0.5px solid ${colors.border}`,
              borderRadius: radius.pill,
              fontSize: '13px', fontWeight: 500, color: colors.ink, cursor: 'pointer',
            }}
          >
            <span style={{ fontFamily: typography.family.mono, fontSize: '11px', letterSpacing: '0.05em' }}>{currency}</span>
            <Icons.IconChevronDown size={12} color={colors.text2} />
          </button>
          {currencyOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '6px',
              background: colors.card, border: `0.5px solid ${colors.border}`,
              borderRadius: radius.md, boxShadow: colors.shadowMd,
              padding: '6px', minWidth: '140px', zIndex: 50,
            }}>
              {['INR', 'USD', 'EUR', 'GBP', 'AED'].map((c) => (
                <button
                  key={c}
                  onClick={() => { setCurrency(c); setCurrencyOpen(false); }}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    width: '100%', padding: '8px 10px',
                    background: c === currency ? colors.bg : 'transparent',
                    border: 'none', borderRadius: radius.sm,
                    fontSize: '12px', color: colors.ink, cursor: 'pointer', textAlign: 'left',
                    fontFamily: typography.family.sans,
                  }}
                >
                  <span style={{ fontFamily: typography.family.mono, fontWeight: 500 }}>{c}</span>
                  {c === currency && <Icons.IconCheck size={12} color={colors.teal} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: colors.card, border: `0.5px solid ${colors.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative',
            }}
          >
            <Icons.IconBell size={15} color={colors.ink} />
            <span style={{
              position: 'absolute', top: '7px', right: '7px',
              width: '7px', height: '7px', borderRadius: '50%',
              background: colors.teal, border: `1.5px solid ${colors.card}`,
            }} />
          </button>
          {notifOpen && (
            <NotificationsPanel onClose={() => setNotifOpen(false)} />
          )}
        </div>

        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: colors.ink, color: '#fff',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              fontFamily: typography.family.sans,
            }}
          >
            KV
          </button>
          {profileOpen && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: '6px',
              background: colors.card, border: `0.5px solid ${colors.border}`,
              borderRadius: radius.md, boxShadow: colors.shadowMd,
              padding: '12px', minWidth: '240px', zIndex: 50,
            }}>
              <div style={{ padding: '4px 8px 10px 8px', borderBottom: `0.5px solid ${colors.border}`, marginBottom: '6px' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: colors.ink }}>Kavya Venkatesh</div>
                <div style={{ fontSize: '12px', color: colors.text3 }}>kavya@payze.com</div>
              </div>
              {[
                { label: 'Profile', Icon: Icons.IconUser },
                { label: 'Settings', Icon: Icons.IconSettings },
                { label: 'Help & docs', Icon: Icons.IconExternal },
              ].map((m) => (
                <button
                  key={m.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '8px 8px',
                    background: 'transparent', border: 'none', borderRadius: radius.sm,
                    fontSize: '12px', color: colors.ink, cursor: 'pointer', textAlign: 'left',
                    fontFamily: typography.family.sans,
                  }}
                >
                  <m.Icon size={14} color={colors.text2} />
                  {m.label}
                </button>
              ))}
              <div style={{ height: '0.5px', background: colors.border, margin: '6px 0' }} />
              <button
                onClick={onSignOut}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '8px 8px',
                  background: 'transparent', border: 'none', borderRadius: radius.sm,
                  fontSize: '12px', color: colors.ink, cursor: 'pointer', textAlign: 'left',
                  fontFamily: typography.family.sans,
                }}
              >
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

/* ── Search modal (⌘K) ─────────────────────────────────────── */

function SearchModal({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = [
    { type: 'Page', label: 'Dashboard', to: '/app' },
    { type: 'Page', label: 'Transactions', to: '/app/transactions' },
    { type: 'Page', label: 'Risk', to: '/app/risk' },
    { type: 'Page', label: 'Tenants', to: '/app/tenants' },
    { type: 'Merchant', label: 'Acme Corporation', to: '/t/acme-corp' },
    { type: 'Merchant', label: 'Nova Fintech', to: '/t/nova-fintech' },
    { type: 'Invoice', label: 'INV-0228 · Meridian Atelier', to: '/app/invoices' },
  ].filter(r => !q || r.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.35)',
        backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '120px', zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '600px', maxWidth: '92vw',
          background: colors.card, border: `0.5px solid ${colors.border}`,
          borderRadius: radius.lg, boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Icons.IconSearch size={16} color={colors.text2} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search transactions, merchants, invoices…"
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: '15px', background: 'transparent', color: colors.ink,
              fontFamily: typography.family.sans,
            }}
          />
          <span style={{ fontFamily: typography.family.mono, fontSize: '10px', color: colors.text3, padding: '2px 6px', border: `0.5px solid ${colors.border}`, borderRadius: '4px' }}>ESC</span>
        </div>
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '6px' }}>
          {results.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: colors.text3, fontSize: '13px' }}>No results</div>
          ) : (
            results.map((r, i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: radius.sm, cursor: 'pointer',
                  fontSize: '13px', color: colors.ink,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.bg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span>{r.label}</span>
                <span style={{ fontSize: '10px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{r.type}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Notifications panel ───────────────────────────────────── */

function NotificationsPanel({ onClose: _onClose }: { onClose: () => void }) {
  const notifications = [
    { title: 'Settlement completed', desc: 'Batch STL-9824 · ₹45,20,000', time: '2m', unread: true },
    { title: 'HDFC Visa anomaly resolved', desc: 'Fallback routing recovered 20 txns', time: '15m', unread: true },
    { title: 'New merchant activated', desc: 'Luminary Studio is now live', time: '1h', unread: false },
  ];
  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0, marginTop: '6px',
      background: colors.card, border: `0.5px solid ${colors.border}`,
      borderRadius: radius.md, boxShadow: colors.shadowMd,
      width: '360px', zIndex: 50, overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px', borderBottom: `0.5px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.ink }}>Notifications</div>
        <button style={{ background: 'none', border: 'none', fontSize: '11px', color: colors.text2, cursor: 'pointer' }}>Mark all read</button>
      </div>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {notifications.map((n, i) => (
          <div key={i} style={{
            padding: '14px 16px', borderBottom: i < notifications.length - 1 ? `0.5px solid ${colors.border}` : 'none',
            display: 'flex', alignItems: 'flex-start', gap: '10px',
            cursor: 'pointer',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: n.unread ? colors.teal : colors.borderHover,
              marginTop: '6px', flexShrink: 0,
            }} />
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
