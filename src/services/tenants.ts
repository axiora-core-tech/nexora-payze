import { mockFetch, mockMutate } from './api';

export type Tenant = {
  id: string;
  slug: string; // e.g. "acme-corp" — becomes payze.com/t/acme-corp
  name: string;
  logo?: string;
  brandColor: string;
  industry: string;
  createdAt: string;
  plan: 'Starter' | 'Growth' | 'Scale';
  status: 'Active' | 'Pending' | 'Suspended';
  mrr: number;
  gmv30d: number;
  contactName: string;
  contactEmail: string;
};

export type DemoBooking = {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  role?: string;
  teamSize?: string;
  date: string; // ISO date
  time: string; // "10:00 AM"
  timezone: string;
  zoomJoinUrl: string;
  zoomMeetingId: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: string;
};

// ── Seeded tenants so Super Admin isn't empty on first run ──
const SEED_TENANTS: Tenant[] = [
  {
    id: 't_acme', slug: 'acme-corp', name: 'Acme Corporation', brandColor: '#00A3FF',
    industry: 'E-commerce', createdAt: '2026-01-15T10:00:00Z', plan: 'Growth', status: 'Active',
    mrr: 2499, gmv30d: 284500, contactName: 'Sarah Connor', contactEmail: 'sarah@acme.com',
  },
  {
    id: 't_nova', slug: 'nova-fintech', name: 'Nova Fintech', brandColor: '#7F77DD',
    industry: 'Financial Services', createdAt: '2026-02-03T14:30:00Z', plan: 'Scale', status: 'Active',
    mrr: 9999, gmv30d: 1240000, contactName: 'Raj Patel', contactEmail: 'raj@novafintech.io',
  },
  {
    id: 't_meridian', slug: 'meridian-travel', name: 'Meridian Travel Co.', brandColor: '#00D4AA',
    industry: 'Travel & Hospitality', createdAt: '2026-03-10T09:00:00Z', plan: 'Growth', status: 'Active',
    mrr: 2499, gmv30d: 512000, contactName: 'Emma Dawson', contactEmail: 'emma@meridiantravel.com',
  },
  {
    id: 't_luminary', slug: 'luminary-studio', name: 'Luminary Studio', brandColor: '#F59E0B',
    industry: 'Creative Agency', createdAt: '2026-04-01T11:15:00Z', plan: 'Starter', status: 'Pending',
    mrr: 499, gmv30d: 18500, contactName: 'Alex Chen', contactEmail: 'alex@luminarystudio.com',
  },
];

const TENANTS_KEY = 'payze.tenants';
const BOOKINGS_KEY = 'payze.demoBookings';

// ── localStorage helpers ──
function getStoredTenants(): Tenant[] {
  try {
    const raw = localStorage.getItem(TENANTS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(TENANTS_KEY, JSON.stringify(SEED_TENANTS));
    return SEED_TENANTS;
  } catch {
    return SEED_TENANTS;
  }
}

function saveStoredTenants(tenants: Tenant[]) {
  try { localStorage.setItem(TENANTS_KEY, JSON.stringify(tenants)); } catch {}
}

function getStoredBookings(): DemoBooking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveStoredBookings(bookings: DemoBooking[]) {
  try { localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings)); } catch {}
}

// ── Tenant service ──
export const tenantService = {
  list: () => mockFetch(getStoredTenants()),

  getBySlug: async (slug: string): Promise<Tenant | null> => {
    const all = await mockFetch(getStoredTenants());
    return all.find(t => t.slug === slug) ?? null;
  },

  create: async (input: Omit<Tenant, 'id' | 'createdAt' | 'status' | 'mrr' | 'gmv30d'>) => {
    const all = getStoredTenants();
    const newTenant: Tenant = {
      ...input,
      id: `t_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      mrr: input.plan === 'Starter' ? 499 : input.plan === 'Growth' ? 2499 : 9999,
      gmv30d: 0,
    };
    const updated = [...all, newTenant];
    saveStoredTenants(updated);
    return mockMutate(newTenant);
  },

  activate: async (id: string) => {
    const all = getStoredTenants();
    const updated = all.map(t => t.id === id ? { ...t, status: 'Active' as const } : t);
    saveStoredTenants(updated);
    return mockMutate({ ok: true });
  },

  suspend: async (id: string) => {
    const all = getStoredTenants();
    const updated = all.map(t => t.id === id ? { ...t, status: 'Suspended' as const } : t);
    saveStoredTenants(updated);
    return mockMutate({ ok: true });
  },
};

// ── Demo booking service ──
export const bookingService = {
  list: () => mockFetch(getStoredBookings()),

  create: async (input: Omit<DemoBooking, 'id' | 'createdAt' | 'status' | 'zoomJoinUrl' | 'zoomMeetingId'>) => {
    // TODO: When wiring real Zoom, call Zoom REST API here:
    //   POST https://api.zoom.us/v2/users/me/meetings
    //   Returns: { id, join_url, start_url, password }
    // Then send email via SendGrid/Resend with ICS attachment.
    const meetingId = Math.floor(100_000_000 + Math.random() * 900_000_000).toString();
    const zoomJoinUrl = `https://us02web.zoom.us/j/${meetingId}?pwd=${Math.random().toString(36).slice(2, 12)}`;

    const booking: DemoBooking = {
      ...input,
      id: `bk_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Scheduled',
      zoomJoinUrl,
      zoomMeetingId: meetingId,
    };
    const all = getStoredBookings();
    saveStoredBookings([booking, ...all]);
    return mockMutate(booking);
  },

  // Generates the next 14 weekdays with 6 slots each (10am-5pm)
  getAvailability: async () => {
    const slots: Array<{ date: string; times: string[] }> = [];
    const now = new Date();
    let added = 0;
    let offset = 1;
    while (added < 14) {
      const d = new Date(now);
      d.setDate(now.getDate() + offset);
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) {
        slots.push({
          date: d.toISOString().slice(0, 10),
          times: ['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
        });
        added++;
      }
      offset++;
    }
    return mockFetch(slots, { minLatency: 200, maxLatency: 500 });
  },
};
