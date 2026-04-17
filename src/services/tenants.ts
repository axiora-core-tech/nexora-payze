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
  { id: 't_zomato', slug: 'zomato-foods', name: 'Zomato Foods', brandColor: '#E23744', industry: 'Food & Delivery', plan: 'Scale', status: 'Active', gmv30d: 12400000, createdAt: '2026-01-15T10:00:00Z' },
  { id: 't_razorpay', slug: 'razorpay-technologies', name: 'Razorpay Technologies', brandColor: '#0B1F3A', industry: 'FinTech', plan: 'Scale', status: 'Active', gmv30d: 9800000, createdAt: '2026-02-03T14:30:00Z' },
  { id: 't_nykaa', slug: 'nykaa-beauty', name: 'Nykaa Beauty', brandColor: '#FC2779', industry: 'Beauty & E-commerce', plan: 'Growth', status: 'Active', gmv30d: 6200000, createdAt: '2026-03-10T09:00:00Z' },
  { id: 't_cred', slug: 'cred-club', name: 'Cred Club', brandColor: '#1A1A1A', industry: 'FinTech', plan: 'Growth', status: 'Active', gmv30d: 4100000, createdAt: '2026-04-01T11:15:00Z' },
  { id: 't_urbanco', slug: 'urban-company', name: 'Urban Company', brandColor: '#1C6F6B', industry: 'Services', plan: 'Growth', status: 'Active', gmv30d: 3700000, createdAt: '2026-02-20T08:45:00Z' },
  { id: 't_bms', slug: 'bookmyshow', name: 'BookMyShow', brandColor: '#C4242C', industry: 'Entertainment', plan: 'Scale', status: 'Active', gmv30d: 5200000, createdAt: '2026-01-28T12:00:00Z' },
];

const TENANTS_KEY = 'payze.tenants.v2';
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
