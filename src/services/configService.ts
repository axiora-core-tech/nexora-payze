import { mockFetch } from './api';
import dashboardData from '../assets/data/dashboard.json';
import transactionsData from '../assets/data/transactions.json';
import riskData from '../assets/data/risk.json';
import settlementsData from '../assets/data/settlements.json';
import subscriptionsData from '../assets/data/subscriptions.json';
import invoicesData from '../assets/data/invoices.json';
import paymentLinksData from '../assets/data/paymentLinks.json';
import analyticsData from '../assets/data/analytics.json';
import adminData from '../assets/data/admin.json';
import developerData from '../assets/data/developer.json';
import qrData from '../assets/data/qr.json';
import payData from '../assets/data/pay.json';
import onboardingData from '../assets/data/onboarding.json';
import superAdminData from '../assets/data/superAdmin.json';
import tenantsData from '../assets/data/tenants.json';
import homeData from '../assets/data/home.json';
import tickerData from '../assets/data/ticker.json';
import copilotData from '../assets/data/copilot.json';
import reconciliationData from '../assets/data/reconciliation.json';
import forecastData from '../assets/data/forecast.json';
import failureCodesData from '../assets/data/failureCodes.json';
import healthData from '../assets/data/health.json';
import txnSearchData from '../assets/data/txnSearch.json';
import disputeEvidenceData from '../assets/data/disputeEvidence.json';
import subIntelligenceData from '../assets/data/subIntelligence.json';
import taxRulesData from '../assets/data/taxRules.json';
import testScenariosData from '../assets/data/testScenarios.json';

/**
 * configService — loads config/data JSON files with simulated network latency
 * to feel like real API fetches. Every page goes through this layer.
 *
 * To change UI content, edit the JSON files in src/assets/data/.
 * No code changes needed.
 */
export const configService = {
  getDashboard: () => mockFetch(dashboardData),
  getTransactions: () => mockFetch(transactionsData),
  getRisk: () => mockFetch(riskData),
  getSettlements: () => mockFetch(settlementsData),
  getSubscriptions: () => mockFetch(subscriptionsData),
  getInvoices: () => mockFetch(invoicesData),
  getPaymentLinks: () => mockFetch(paymentLinksData),
  getAnalytics: () => mockFetch(analyticsData),
  getAdmin: () => mockFetch(adminData),
  getDeveloper: () => mockFetch(developerData),
  getQR: () => mockFetch(qrData),
  getPay: () => mockFetch(payData),
  getOnboarding: () => mockFetch(onboardingData),
  getSuperAdmin: () => mockFetch(superAdminData),
  getTenantsPage: () => mockFetch(tenantsData),
  getHome: () => mockFetch(homeData),
  getTicker: () => mockFetch(tickerData),
  getCopilot: () => mockFetch(copilotData),
  getReconciliation: () => mockFetch(reconciliationData),
  getForecast: () => mockFetch(forecastData),
  getFailureCodes: () => mockFetch(failureCodesData),
  getHealth: () => mockFetch(healthData),
  getTxnSearch: () => mockFetch(txnSearchData),
  getDisputeEvidence: () => mockFetch(disputeEvidenceData),
  getSubIntelligence: () => mockFetch(subIntelligenceData),
  getTaxRules: () => mockFetch(taxRulesData),
  getTestScenarios: () => mockFetch(testScenariosData),
};

// Also export types for TypeScript consumers
export type DashboardData = typeof dashboardData;
export type TransactionsData = typeof transactionsData;
export type RiskData = typeof riskData;
export type SettlementsData = typeof settlementsData;
export type SubscriptionsData = typeof subscriptionsData;
export type InvoicesData = typeof invoicesData;
export type PaymentLinksData = typeof paymentLinksData;
export type AnalyticsData = typeof analyticsData;
export type AdminData = typeof adminData;
export type DeveloperData = typeof developerData;
export type QRData = typeof qrData;
export type PayData = typeof payData;
export type OnboardingData = typeof onboardingData;
export type SuperAdminData = typeof superAdminData;
export type TenantsPageData = typeof tenantsData;
export type HomeData = typeof homeData;
