import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { colors, radius, typography } from '../../design/tokens';
import { Card, Button } from '../../design/primitives';
import * as Icons from '../../design/icons';
import { toast } from 'sonner';

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    // Simulate auth latency
    await new Promise(r => setTimeout(r, 800));
    toast.success('Signed in');
    navigate('/app');
  };

  const handleSSO = (provider: string) => {
    toast.success(`Redirecting to ${provider}…`);
    setTimeout(() => navigate('/app'), 600);
  };

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', position: 'relative', display: 'flex' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(30,30,30,0.04) 1px, transparent 1px)', backgroundSize: '26px 26px', zIndex: 0 }} />

      {/* Left panel — form */}
      <div style={{ flex: '0 0 52%', display: 'flex', flexDirection: 'column', padding: '24px 40px', position: 'relative', zIndex: 1 }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '56px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.PayzeMark size={22} />
            <span style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.01em', color: colors.ink }}>Payze</span>
          </Link>
          <Link to="/book-demo" style={{ fontSize: '13px', color: colors.text2 }}>
            Don't have an account? <span style={{ color: colors.ink, fontWeight: 500 }}>Book a demo →</span>
          </Link>
        </nav>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '420px' }}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '36px', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: '10px', color: colors.ink }}>
                Welcome back.
              </div>
              <div style={{ fontSize: '14px', color: colors.text2 }}>
                Sign in to continue to your Payze workspace.
              </div>
            </div>

            {/* SSO options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              <button onClick={() => handleSSO('Google')} style={ssoBtn}>
                <GoogleG />
                <span style={{ flex: 1, textAlign: 'left' }}>Continue with Google</span>
              </button>
              <button onClick={() => handleSSO('Microsoft')} style={ssoBtn}>
                <MicrosoftMark />
                <span style={{ flex: 1, textAlign: 'left' }}>Continue with Microsoft</span>
              </button>
              <button onClick={() => handleSSO('SAML SSO')} style={ssoBtn}>
                <Icons.IconShield size={16} color={colors.ink} />
                <span style={{ flex: 1, textAlign: 'left' }}>Continue with SAML SSO</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '24px 0' }}>
              <div style={{ flex: 1, height: '0.5px', background: colors.border }} />
              <span style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>or</span>
              <div style={{ flex: 1, height: '0.5px', background: colors.border }} />
            </div>

            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Work email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={inputStyle}
                  required
                  autoFocus
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  <a href="#" onClick={(e) => { e.preventDefault(); toast.success('Password reset link sent'); }} style={{ fontSize: '11px', color: colors.ink, textDecoration: 'none' }}>
                    Forgot password?
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ ...inputStyle, paddingRight: '42px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute', right: '10px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none', border: 'none',
                      padding: '6px', cursor: 'pointer', color: colors.text2,
                      display: 'flex', alignItems: 'center',
                    }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Icons.IconEye size={14} />
                  </button>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: colors.text2, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  style={{ accentColor: colors.teal }}
                />
                Remember me on this device
              </label>

              <Button type="submit" variant="primary" fullWidth disabled={submitting || !email || !password} size="lg">
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <div style={{ marginTop: '32px', padding: '16px', background: colors.card, border: `0.5px solid ${colors.border}`, borderRadius: radius.md }}>
              <div style={{ fontSize: '11px', color: colors.text3, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: '6px' }}>
                Demo credentials
              </div>
              <div style={{ fontSize: '12px', color: colors.text2, fontFamily: typography.family.mono }}>
                Any email · any password. This is a prototype.
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: '11px', color: colors.text3, textAlign: 'center' }}>
          Protected by enterprise-grade security · <a href="#" style={{ color: colors.text2 }}>Privacy</a> · <a href="#" style={{ color: colors.text2 }}>Terms</a>
        </div>
      </div>

      {/* Right panel — quiet visual */}
      <div style={{ flex: 1, background: colors.ink, color: '#F6F6F2', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#8A9E9C', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.teal, animation: 'payze-pulse-dot 2s ease-in-out infinite' }} />
          <span>Live routing</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '32px', fontWeight: 500, lineHeight: 1.3, letterSpacing: '-0.015em', marginBottom: '28px', color: '#F6F6F2', maxWidth: '440px' }}>
            <span style={{ color: colors.teal, marginRight: '6px' }}>"</span>
            Before Payze, 14% of our checkouts failed silently. Three months in, that number's under 3%. Routing paid for itself.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: colors.teal, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600 }}>VK</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#F6F6F2' }}>Vikram Kothari</div>
              <div style={{ fontSize: '12px', color: '#8A9E9C' }}>Head of Payments, Zomato Foods</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8A9E9C' }}>
          <div>© 2026 Payze</div>
          <div>Made in Bengaluru</div>
        </div>

        {/* Faint background grid */}
        <svg
          style={{ position: 'absolute', right: '-120px', bottom: '-120px', opacity: 0.08, pointerEvents: 'none' }}
          width="520" height="520" viewBox="0 0 520 520" aria-hidden
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#F6F6F2" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="520" height="520" fill="url(#grid)" />
          <circle cx="260" cy="260" r="180" fill="none" stroke={colors.teal} strokeWidth="0.5" />
          <circle cx="260" cy="260" r="120" fill="none" stroke={colors.teal} strokeWidth="0.5" />
          <circle cx="260" cy="260" r="60" fill={colors.teal} opacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#4285f4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
      <path fill="#34a853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7A21.99 21.99 0 0 0 24 46z"/>
      <path fill="#fbbc04" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
      <path fill="#ea4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.92 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
    </svg>
  );
}

function MicrosoftMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 23 23" aria-hidden>
      <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
      <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
      <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
      <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
    </svg>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '11px', fontWeight: 500, color: colors.text2,
  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  background: colors.card, border: `0.5px solid ${colors.border}`,
  borderRadius: radius.sm, fontSize: '14px',
  outline: 'none', color: colors.ink, fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const ssoBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '12px',
  width: '100%', padding: '12px 16px',
  background: colors.card, border: `0.5px solid ${colors.border}`,
  borderRadius: radius.sm, fontSize: '13px', fontWeight: 500, color: colors.ink,
  cursor: 'pointer', fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};
