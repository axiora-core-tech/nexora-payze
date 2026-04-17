import { createBrowserRouter, Outlet } from "react-router";
import { Layout } from "./components/Layout";
import { TenantWorkspace } from "./components/TenantContext";
import { HomePage } from "./pages/Home";
import { BookDemoPage } from "./pages/BookDemo";
import { TenantsPage } from "./pages/Tenants";
import { Dashboard } from "./pages/Dashboard";
import { PaymentUI } from "./pages/PaymentUI";
import { AdminDashboard } from "./pages/Admin";
import { DeveloperPage } from "./pages/Developer";
import { InvoicePage } from "./pages/Invoice";
import { RiskPage } from "./pages/Risk";
import { QRCodePage } from "./pages/QRCode";
import { SubscriptionsPage } from "./pages/Subscriptions";
import { AnalyticsPage } from "./pages/Analytics";
import { SettlementsPage } from "./pages/Settlements";
import { OnboardingPage } from "./pages/Onboarding";
import { PaymentLinks } from "./pages/PaymentLinks";

// All the merchant workspace routes — shared between /app and /t/:slug
const workspaceRoutes = [
  { index: true, Component: Dashboard },
  { path: "pay", Component: PaymentUI },
  { path: "pay/:id", Component: PaymentUI },
  { path: "payment-links", Component: PaymentLinks },
  { path: "admin", Component: AdminDashboard },
  { path: "developer", Component: DeveloperPage },
  { path: "invoice", Component: InvoicePage },
  { path: "risk", Component: RiskPage },
  { path: "qr", Component: QRCodePage },
  { path: "subscriptions", Component: SubscriptionsPage },
  { path: "analytics", Component: AnalyticsPage },
  { path: "settlements", Component: SettlementsPage },
  { path: "onboarding", Component: OnboardingPage },
  { path: "super-admin", Component: TenantsPage },
];

export const router = createBrowserRouter([
  // ── Public marketing ──
  { path: "/", Component: HomePage },
  { path: "/book-demo", Component: BookDemoPage },

  // ── Default merchant workspace (no tenant scope, for demo/legacy) ──
  {
    path: "/app",
    Component: Layout,
    children: workspaceRoutes,
  },

  // ── Tenant-scoped workspace ──
  {
    path: "/t/:slug",
    Component: () => (
      <TenantWorkspace>
        <Layout />
      </TenantWorkspace>
    ),
    children: workspaceRoutes,
  },
]);
