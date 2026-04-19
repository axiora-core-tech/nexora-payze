// Session service — handles auth state persistence.
// Design: first-ever visit auto-creates a demo session (frictionless landing).
// After an explicit sign-out, the user must sign back in — no auto-restore.

const SESSION_KEY = 'payze.session.v1';
const FIRST_VISIT_KEY = 'payze.firstVisitDone.v1';

export type Session = {
  name: string;
  email: string;
  initials: string;
  signedInAt: string;
};

const DEFAULT_SESSION: Session = {
  name: 'Kavya Venkatesh',
  email: 'kavya@payze.com',
  initials: 'KV',
  signedInAt: new Date().toISOString(),
};

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function signIn(session: Partial<Session> & { email: string }): Session {
  const name = session.name || deriveName(session.email);
  const initials = session.initials || deriveInitials(name);
  const full: Session = {
    name,
    email: session.email,
    initials,
    signedInAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(full));
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
  } catch {}
  return full;
}

export function signOut(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    // Keep FIRST_VISIT_KEY so we don't auto-restore after an explicit sign-out.
  } catch {}
}

// Call once on AppLayout mount. Creates a default session only on the very
// first visit to the app — after any explicit sign-out, returns null and the
// user must go through SignIn.
export function initializeOrRestoreSession(): Session | null {
  const existing = getSession();
  if (existing) return existing;

  const firstVisitDone = (() => { try { return localStorage.getItem(FIRST_VISIT_KEY) === 'true'; } catch { return false; } })();
  if (firstVisitDone) return null; // user has been here before and is signed out

  // First ever visit — seed default demo session
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(DEFAULT_SESSION));
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
  } catch {}
  return DEFAULT_SESSION;
}

// ── helpers ──────────────────────────────────────────────────────────
function deriveName(email: string): string {
  const local = (email.split('@')[0] || 'User').replace(/[._-]+/g, ' ');
  return local
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ') || 'User';
}

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
