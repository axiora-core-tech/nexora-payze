import React from 'react';
import { createBrowserRouter } from 'react-router';
import { AppLayout } from './AppLayout';
import { TenantWorkspace } from './components/TenantContext';

import { Home } from './pages/Home';
import { BookDemo } from './pages/BookDemo';
import { SignIn } from './pages/SignIn';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Tenants } from './pages/Tenants';
import { Risk } from './pages/Risk';
import { Settlements } from './pages/Settlements';
import { Analytics } from './pages/Analytics';
import { Invoices } from './pages/Invoices';
import { Collect } from './pages/Collect';
import { Pay } from './pages/Pay';
import { Subscriptions } from './pages/Subscriptions';
import { Developer } from './pages/Developer';
import { Admin } from './pages/Admin';
import { SuperAdmin } from './pages/SuperAdmin';
import { Onboarding } from './pages/Onboarding';
import { PublicMerchant } from './pages/PublicMerchant';

const appChildren = [
  { index: true, element: <Dashboard /> },
  { path: 'transactions', element: <Transactions /> },
  { path: 'tenants', element: <Tenants /> },
  { path: 'risk', element: <Risk /> },
  { path: 'settlements', element: <Settlements /> },
  { path: 'analytics', element: <Analytics /> },
  { path: 'invoices', element: <Invoices /> },
  { path: 'collect', element: <Collect /> },
  { path: 'pay', element: <Pay /> },
  { path: 'subscriptions', element: <Subscriptions /> },
  { path: 'developer', element: <Developer /> },
  { path: 'admin', element: <Admin /> },
  { path: 'super-admin', element: <SuperAdmin /> },
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
