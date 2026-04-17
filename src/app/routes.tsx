import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "pay", Component: PaymentUI },
      { path: "pay/:id", Component: PaymentUI },
      { path: "admin", Component: AdminDashboard },
      { path: "developer", Component: DeveloperPage },
      { path: "invoice", Component: InvoicePage },
      { path: "risk", Component: RiskPage },
      { path: "qr", Component: QRCodePage },
      { path: "subscriptions", Component: SubscriptionsPage },
      { path: "analytics", Component: AnalyticsPage },
      { path: "settlements", Component: SettlementsPage },
      { path: "onboarding", Component: OnboardingPage },
    ],
  },
]);
