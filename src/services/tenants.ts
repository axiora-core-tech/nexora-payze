import { mockFetch, mockMutate } from './api';

export type Tenant = {
  id: string;
  slug: string;
  name: string;
  brandColor: string;
  industry: string;
  plan: 'Starter' | 'Growth' | 'Scale';
  status: 'Active' | 'Pending' | 'Suspended';
  gmv30d: number;
  createdAt: string;
};

export type DemoBooking = {
  id: string;
  name: string;
  email: string;
  company: string;
  interest?: string;
  slot: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: string;
};

const SEED_TENANTS: Tenant[] = [
  { id: 't_acme', slug: 'acme-corp', name: 'Acme Corporation', brandColor: '#1C6F6B', industry: 'E-commerce', plan: 'Growth', status: 'Active', gmv30d: 1240000, createdAt: '2026-01-15T10:00:00Z' },
  { id: 't_nova', slug: 'nova-fintech', name: 'Nova Fintech', brandColor: '#1A1A1A', industry: 'FinTech', plan: 'Scale', status: 'Active', gmv30d: 980000, createdAt: '2026-02-03T14:30:00Z' },
  { id: 't_meridian', slug: 'meridian-travel', name: 'Meridian Travel', brandColor: '#4A4A48', industry: 'Travel', plan: 'Growth', status: 'Active', gmv30d: 620000, createdAt: '2026-03-10T09:00:00Z' },
  { id: 't_luminary', slug: 'luminary-studio', name: 'Luminary Studio', brandColor: '#1C6F6B', industry: 'Creative', plan: 'Starter', status: 'Active', gmv30d: 410000, createdAt: '2026-04-01T11:15:00Z' },
];

const TENANTS_KEY = 'payze.tenants';
const BOOKINGS_KEY = 'payze.demoBookings';

function getStoredTenants(): Tenant[] {
  try {
    const raw = localStorage.getItem(TENANTS_KEY);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(TENANTS_KEY, JSON.stringify(SEED_TENANTS));
    return SEED_TENANTS;
  } catch { return SEED_TENANTS; }
}
function saveStoredTenants(t: Tenant[]) { try { localStorage.setItem(TENANTS_KEY, JSON.stringify(t)); } catch {} }

function getStoredBookings(): DemoBooking[] {
  try { const r = localStorage.getItem(BOOKINGS_KEY); return r ? JSON.parse(r) : []; } catch { return []; }
}
function saveStoredBookings(b: DemoBooking[]) { try { localStorage.setItem(BOOKINGS_KEY, JSON.stringify(b)); } catch {} }

export const tenantService = {
  list: () => mockFetch(getStoredTenants()),
  getBySlug: async (slug: string): Promise<Tenant | null> => {
    const all = await mockFetch(getStoredTenants());
    return all.find(t => t.slug === slug) ?? null;
  },
  create: async (input: Omit<Tenant, 'id' | 'createdAt'>) => {
    const all = getStoredTenants();
    const tenant: Tenant = { ...input, id: `t_${Date.now()}`, createdAt: new Date().toISOString() };
    saveStoredTenants([...all, tenant]);
    return mockMutate(tenant);
  },
};

export const bookingService = {
  list: () => mockFetch(getStoredBookings()),
  create: async (input: Omit<DemoBooking, 'id' | 'createdAt' | 'status'>) => {
    const booking: DemoBooking = {
      ...input,
      id: `bk_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Scheduled',
    };
    const all = getStoredBookings();
    saveStoredBookings([booking, ...all]);
    return mockMutate(booking);
  },
};
