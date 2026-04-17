import React from 'react';
import { createBrowserRouter } from 'react-router';
import { AppLayout } from './AppLayout';
import { TenantWorkspace } from './components/TenantContext';

import { Home } from './pages/Home';
import { BookDemo } from './pages/BookDemo';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Tenants } from './pages/Tenants';
import { Risk } from './pages/Risk';
import { Settlements } from './pages/Settlements';
import { Analytics } from './pages/Analytics';
import { Invoices } from './pages/Invoices';
import { PaymentLinks } from './pages/PaymentLinks';
import { Subscriptions } from './pages/Subscriptions';
import { Developer } from './pages/Developer';
import { Admin } from './pages/Admin';
import { SuperAdmin } from './pages/SuperAdmin';
import { Onboarding } from './pages/Onboarding';

const appChildren = [
  { index: true, element: <Dashboard /> },
  { path: 'transactions', element: <Transactions /> },
  { path: 'tenants', element: <Tenants /> },
  { path: 'risk', element: <Risk /> },
  { path: 'settlements', element: <Settlements /> },
  { path: 'analytics', element: <Analytics /> },
  { path: 'invoices', element: <Invoices /> },
  { path: 'links', element: <PaymentLinks /> },
  { path: 'subscriptions', element: <Subscriptions /> },
  { path: 'developer', element: <Developer /> },
  { path: 'admin', element: <Admin /> },
  { path: 'super-admin', element: <SuperAdmin /> },
  { path: 'onboarding', element: <Onboarding /> },
];

export const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/book-demo', element: <BookDemo /> },
  { path: '/app', element: <AppLayout />, children: appChildren },
  {
    path: '/t/:slug',
    element: <TenantWorkspace><AppLayout /></TenantWorkspace>,
    children: appChildren.filter(c => c.path !== 'super-admin'),
  },
]);
