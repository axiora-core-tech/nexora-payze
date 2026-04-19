import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from './AppLayout';
import { TenantWorkspace } from './components/TenantContext';

import { Home } from './pages/Home';
import { BookDemo } from './pages/BookDemo';
import { SignIn } from './pages/SignIn';
import { Dashboard } from './pages/Dashboard';
import { Tenants } from './pages/Tenants';
import { Customers } from './pages/Customers';
import { Risk } from './pages/Risk';
import { Analytics } from './pages/Analytics';
import { Collect } from './pages/Collect';
import { Pay } from './pages/Pay';
import { Money } from './pages/Money';
import { Settings } from './pages/Settings';
import { Compliance } from './pages/Compliance';
import { SuperAdmin } from './pages/SuperAdmin';
import { Onboarding } from './pages/Onboarding';
import { PublicMerchant } from './pages/PublicMerchant';

const appChildren = [
  { index: true, element: <Dashboard /> },
  { path: 'money', element: <Money /> },
  { path: 'tenants', element: <Tenants /> },
  { path: 'customers', element: <Customers /> },
  { path: 'collect', element: <Collect /> },
  { path: 'risk', element: <Risk /> },
  { path: 'analytics', element: <Analytics /> },
  { path: 'compliance', element: <Compliance /> },
  { path: 'settings', element: <Settings /> },
  { path: 'pay', element: <Pay /> },
  { path: 'super-admin', element: <SuperAdmin /> },

  // Legacy routes · preserved as redirects into the consolidated pages
  { path: 'transactions',  element: <Navigate to="/app/money" replace /> },
  { path: 'settlements',   element: <Navigate to="/app/money?tab=settlements" replace /> },
  { path: 'payouts',       element: <Navigate to="/app/money?tab=payouts" replace /> },
  { path: 'invoices',      element: <Navigate to="/app/collect?section=invoices" replace /> },
  { path: 'subscriptions', element: <Navigate to="/app/collect?section=subscriptions" replace /> },
  { path: 'admin',         element: <Navigate to="/app/settings" replace /> },
  { path: 'developer',     element: <Navigate to="/app/settings?tab=developer" replace /> },
];

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/signin', element: <SignIn /> },
  { path: '/book-demo', element: <BookDemo /> },
  { path: '/@:handle', element: <PublicMerchant /> },
  { path: '/app/onboarding', element: <Onboarding /> },
  { path: '/app', element: <AppLayout />, children: appChildren },
  {
    path: '/t/:slug',
    element: <TenantWorkspace><AppLayout /></TenantWorkspace>,
    children: appChildren.filter(c => c.path !== 'super-admin'),
  },
]);
