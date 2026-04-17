/**
 * Payze design system tokens.
 * Single source of truth for colors, type, and spacing.
 * Warm off-white, ink, one teal accent. Nothing else.
 */

export const colors = {
  // Surfaces
  bg: '#F6F6F2',          // Warm off-white — page background
  card: '#FFFFFF',         // Card/surface
  cardSoft: '#F6F6F2',     // Secondary card (same as bg)

  // Ink hierarchy
  ink: '#1A1A1A',          // Primary text & strong UI
  text2: '#4A4A48',        // Secondary text
  text3: '#8A8A88',        // Tertiary text / hints

  // Borders (soft; use rgba for consistency)
  border: 'rgba(26,26,26,0.06)',
  borderHover: 'rgba(26,26,26,0.12)',
  borderStrong: 'rgba(26,26,26,0.15)',

  // The single accent
  teal: '#1C6F6B',
  tealHover: '#25807B',
  tealTint: 'rgba(28,111,107,0.08)',
  tealTintStrong: 'rgba(28,111,107,0.15)',

  // Amber — reserved exclusively for the Super Admin crown
  amber: '#B48C3C',
  amberTint: 'rgba(180,140,60,0.08)',

  // Functional tones (used sparingly — prefer ink + weight for semantics)
  shadow: '0 2px 8px -4px rgba(26,18,10,0.04)',
  shadowMd: '0 4px 16px -6px rgba(26,18,10,0.06)',
};

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  pill: '999px',
};

export const typography = {
  family: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', Monaco, monospace",
  },
  // Use in inline styles as { fontSize, fontWeight, letterSpacing, lineHeight }
  heroNum: { fontSize: '84px', fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 0.9 },
  pageTitle: { fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.1 },
  sectionTitle: { fontSize: '15px', fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1.2 },
  body: { fontSize: '13px', fontWeight: 400, lineHeight: 1.5 },
  bodySmall: { fontSize: '12px', fontWeight: 400, lineHeight: 1.4 },
  kicker: { fontSize: '11px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase' as const },
  kickerSmall: { fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const },
  mono: { fontFamily: "'JetBrains Mono', 'SF Mono', Monaco, monospace" },
};
