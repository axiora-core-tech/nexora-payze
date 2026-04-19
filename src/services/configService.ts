import { mockFetch } from './api';
import dashboardData from '../assets/data/dashboard.json';
import transactionsData from '../assets/data/transactions.json';
import riskData from '../assets/data/risk.json';
import settlementsData from '../assets/data/settlements.json';
import subscriptionsData from '../assets/data/subscriptions.json';
import invoicesData from '../assets/data/invoices.json';
import collectData from '../assets/data/collect.json';
import analyticsData from '../assets/data/analytics.json';
import adminData from '../assets/data/admin.json';
import developerData from '../assets/data/developer.json';
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
import refundsData from '../assets/data/refunds.json';
import webhooksData from '../assets/data/webhooks.json';
import customersData from '../assets/data/customers.json';
import sendData from '../assets/data/send.json';
import paymentPagesData from '../assets/data/paymentPages.json';
import receiptTemplatesData from '../assets/data/receiptTemplates.json';
import dunningData from '../assets/data/dunning.json';
import checkoutStudioData from '../assets/data/checkoutStudio.json';
import payoutsData from '../assets/data/payouts.json';
import smartCollectData from '../assets/data/smartCollect.json';
import b2bWorkflowsData from '../assets/data/b2bWorkflows.json';
import enterpriseData from '../assets/data/enterprise.json';
import taxRulesData from '../assets/data/taxRules.json';
import testScenariosData from '../assets/data/testScenarios.json';
import timelineData from '../assets/data/timeline.json';
import collaborationData from '../assets/data/collaboration.json';
import publicPagesData from '../assets/data/publicPages.json';
import complianceData from '../assets/data/compliance.json';

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
  getCollect: () => mockFetch(collectData),
  getCompliance: () => mockFetch(complianceData),
  getAnalytics: () => mockFetch(analyticsData),
  getAdmin: () => mockFetch(adminData),
  getDeveloper: () => mockFetch(developerData),
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
  getRefunds: () => mockFetch(refundsData),
  getWebhooks: () => mockFetch(webhooksData),
  getCustomers: () => mockFetch(customersData),
  getSend: () => mockFetch(sendData),
  getPaymentPages: () => mockFetch(paymentPagesData),
  getReceiptTemplates: () => mockFetch(receiptTemplatesData),
  getDunning: () => mockFetch(dunningData),
  getCheckoutStudio: () => mockFetch(checkoutStudioData),
  getPayouts: () => mockFetch(payoutsData),
  getSmartCollect: () => mockFetch(smartCollectData),
  getB2BWorkflows: () => mockFetch(b2bWorkflowsData),
  getEnterprise: () => mockFetch(enterpriseData),
  getTaxRules: () => mockFetch(taxRulesData),
  getTestScenarios: () => mockFetch(testScenariosData),
  getTimeline: () => mockFetch(timelineData),
  getCollaboration: () => mockFetch(collaborationData),
  getPublicPages: () => mockFetch(publicPagesData),
};

// Also export types for TypeScript consumers
export type DashboardData = typeof dashboardData;
export type TransactionsData = typeof transactionsData;
export type RiskData = typeof riskData;
export type SettlementsData = typeof settlementsData;
export type SubscriptionsData = typeof subscriptionsData;
export type InvoicesData = typeof invoicesData;
export type CollectData = typeof collectData;
export type AnalyticsData = typeof analyticsData;
export type AdminData = typeof adminData;
export type DeveloperData = typeof developerData;
export type PayData = typeof payData;
export type OnboardingData = typeof onboardingData;
export type SuperAdminData = typeof superAdminData;
export type TenantsPageData = typeof tenantsData;
export type HomeData = typeof homeData;
