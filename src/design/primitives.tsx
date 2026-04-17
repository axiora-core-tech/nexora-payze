import React from 'react';
import { colors, radius, typography } from './tokens';

/**
 * Shared UI primitives. Every page uses these.
 * Rule: if a pattern appears on 2+ pages, it's here.
 */

/* ── Card ─────────────────────────────────────────────────────── */

export function Card({
  children,
  padded = true,
  className = '',
  style = {},
  onClick,
}: {
  children: React.ReactNode;
  padded?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        background: colors.card,
        border: `0.5px solid ${colors.border}`,
        borderRadius: radius.xl,
        boxShadow: colors.shadow,
        padding: padded ? '22px 24px' : 0,
        cursor: onClick ? 'pointer' : undefined,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Kicker (small uppercase label) ──────────────────────────── */

export function Kicker({
  children,
  color = colors.text2,
  style = {},
}: {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        fontSize: '11px',
        fontWeight: 500,
        letterSpacing: '0.18em',
        color,
        textTransform: 'uppercase',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Button ───────────────────────────────────────────────────── */

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  type = 'button',
  icon,
  iconRight,
  style = {},
  fullWidth,
}: {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: React.CSSProperties;
  fullWidth?: boolean;
}) {
  const sizes = {
    sm: { padding: '8px 14px', fontSize: '12px' },
    md: { padding: '10px 18px', fontSize: '13px' },
    lg: { padding: '14px 24px', fontSize: '14px' },
  };

  const variants = {
    primary: { bg: colors.teal, color: '#fff', border: 'none', hoverBg: colors.tealHover },
    dark: { bg: colors.ink, color: '#fff', border: 'none', hoverBg: '#000' },
    secondary: { bg: colors.card, color: colors.ink, border: `0.5px solid ${colors.borderStrong}`, hoverBg: colors.bg },
    ghost: { bg: 'transparent', color: colors.ink, border: `0.5px solid ${colors.border}`, hoverBg: colors.bg },
  };

  const v = variants[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: v.bg,
        color: v.color,
        border: v.border,
        borderRadius: radius.pill,
        fontFamily: typography.family.sans,
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'background 0.15s',
        width: fullWidth ? '100%' : undefined,
        ...sizes[size],
        ...style,
      }}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

/* ── Pill (tag / badge) ──────────────────────────────────────── */

export function Pill({
  children,
  tone = 'neutral',
  style = {},
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'teal' | 'ink' | 'outline';
  style?: React.CSSProperties;
}) {
  const tones = {
    neutral: { bg: colors.bg, color: colors.text2, border: 'none' },
    teal: { bg: colors.tealTint, color: colors.teal, border: 'none' },
    ink: { bg: colors.ink, color: '#fff', border: 'none' },
    outline: { bg: 'transparent', color: colors.ink, border: `0.5px solid ${colors.borderStrong}` },
  };
  const t = tones[tone];
  return (
    <span
      style={{
        background: t.bg,
        color: t.color,
        border: t.border,
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '0.08em',
        padding: '3px 8px',
        borderRadius: radius.pill,
        textTransform: 'uppercase',
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ── Skeleton (loading placeholder) ──────────────────────────── */

export function Skeleton({ w = '100%', h = 14, style = {} }: { w?: string | number; h?: number; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        width: typeof w === 'number' ? `${w}px` : w,
        height: `${h}px`,
        background: 'linear-gradient(90deg, rgba(26,26,26,0.04), rgba(26,26,26,0.08), rgba(26,26,26,0.04))',
        backgroundSize: '200% 100%',
        animation: 'payze-pulse 1.4s ease-in-out infinite',
        borderRadius: radius.sm,
        ...style,
      }}
    />
  );
}

export function PageLoader({ label = 'Loading' }: { label?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: '12px' }}>
      <div
        style={{
          width: 24, height: 24, borderRadius: '50%',
          border: `2px solid ${colors.border}`,
          borderTopColor: colors.teal,
          animation: 'payze-spin 0.8s linear infinite',
        }}
      />
      <div style={{ ...typography.kickerSmall, color: colors.text3 }}>{label}</div>
    </div>
  );
}

/* ── Error state ─────────────────────────────────────────────── */

export function ErrorState({
  message = 'Something went wrong',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', gap: '16px' }}>
      <div style={{ fontSize: '14px', color: colors.text2 }}>{message}</div>
      {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

/* ── Section (region divider w/ kicker + title) ──────────────── */

export function Section({
  kicker,
  title,
  action,
  children,
  style = {},
}: {
  kicker?: string;
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ marginBottom: '28px', ...style }}>
      {(kicker || title || action) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
          <div>
            {kicker && <Kicker style={{ marginBottom: '6px' }}>{kicker}</Kicker>}
            {title && <div style={{ ...typography.pageTitle, color: colors.ink }}>{title}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────────── */

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{ padding: '56px 24px', textAlign: 'center' }}>
      {icon && <div style={{ marginBottom: '16px', color: colors.text3, display: 'inline-flex' }}>{icon}</div>}
      <div style={{ fontSize: '15px', fontWeight: 500, color: colors.ink, marginBottom: '6px' }}>{title}</div>
      {description && <div style={{ fontSize: '13px', color: colors.text2, marginBottom: '20px', maxWidth: '380px', margin: '0 auto 20px auto' }}>{description}</div>}
      {action}
    </div>
  );
}

/* ── Global keyframes ───────────────────────────────────────── */

export function GlobalStyles() {
  return (
    <style>{`
      @keyframes payze-pulse {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
      @keyframes payze-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes payze-fadein {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes payze-pulse-dot {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }
      body, html, #root {
        background: ${colors.bg};
        color: ${colors.ink};
        font-family: ${typography.family.sans};
        font-size: 14px;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      * { box-sizing: border-box; }
      button { font-family: inherit; }
      input, select, textarea { font-family: inherit; }
      a { color: inherit; text-decoration: none; }
      ::selection { background: ${colors.tealTint}; }
    `}</style>
  );
}
