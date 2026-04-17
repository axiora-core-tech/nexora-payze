import { mockFetch } from './api';
import dashboardData from '../assets/mock-data/dashboard.json';
import adminData from '../assets/mock-data/admin.json';
import analyticsData from '../assets/mock-data/analytics.json';
import settlementsData from '../assets/mock-data/settlements.json';
import subscriptionsData from '../assets/mock-data/subscriptions.json';
import riskData from '../assets/mock-data/risk.json';
import paymentLinksData from '../assets/mock-data/payment-links.json';
import paymentMethodsData from '../assets/mock-data/payment-methods.json';
import invoiceData from '../assets/mock-data/invoice.json';
import developerData from '../assets/mock-data/developer.json';
import onboardingData from '../assets/mock-data/onboarding.json';
import notificationsData from '../assets/mock-data/notifications.json';
import qrData from '../assets/mock-data/qr.json';

// ── Types ──
export type Transaction = {
  id: number;
  name: string;
  amount: number;
  direction: 'credit' | 'debit';
  date: string;
  category: string;
};

export type Mandate = {
  name: string;
  id: string;
  amt: string;
  freq: string;
  next: string;
  status: string;
  color: string;
  type: 'upi' | 'nach';
};

export type SettlementBatch = {
  id: string;
  date: string;
  txns: number;
  gross: string;
  fees: string;
  net: string;
  status: string;
  utr: string;
};

export type PaymentLink = {
  id: number;
  title: string;
  amount: string;
  created: string;
  usage: string;
  collected: string;
  status: string;
};

export type NotificationItem = {
  id: number;
  icon: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
};

// ── Services ──

export const dashboardService = {
  getOverview: () => mockFetch(dashboardData),
};

export const adminService = {
  getDashboard: () => mockFetch(adminData),
};

export const analyticsService = {
  getAll: () => mockFetch(analyticsData),
};

export const settlementsService = {
  getAll: () => mockFetch(settlementsData),
};

export const subscriptionsService = {
  getMandates: () => mockFetch(subscriptionsData),
  getByType: async (type: 'upi' | 'nach') => {
    const data = await mockFetch(subscriptionsData);
    return {
      ...data,
      mandates: data.mandates.filter((m: Mandate) => m.type === type),
    };
  },
};

export const riskService = {
  getAll: () => mockFetch(riskData),
};

export const paymentLinksService = {
  getAll: () => mockFetch(paymentLinksData),
};

export const paymentMethodsService = {
  getMethods: () => mockFetch(paymentMethodsData),
};

export const invoiceService = {
  getDefaults: () => mockFetch(invoiceData),
};

export const developerService = {
  getKeys: (isTestMode: boolean) => {
    return mockFetch({
      ...developerData,
      active_keys: isTestMode ? developerData.test_keys : developerData.live_keys,
    });
  },
};

export const onboardingService = {
  getSteps: () => mockFetch(onboardingData, { minLatency: 100, maxLatency: 300 }),
};

export const notificationsService = {
  getAll: () => mockFetch(notificationsData, { minLatency: 150, maxLatency: 400 }),
};

export const qrService = {
  getAll: () => mockFetch(qrData),
};

// Multi-tenant + demo booking services
export { tenantService, bookingService } from './tenants';
export type { Tenant, DemoBooking } from './tenants';
