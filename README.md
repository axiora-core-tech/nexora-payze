# Payze

Payments infrastructure platform in the IRON/RH design language. **All UI content is configurable via JSON files.**

## Run

```
unzip payze-final.zip
cd payze-stage
npm install
npm run dev
```

Open http://localhost:5173

## How the configuration works

**Every page reads its content from JSON** in `src/assets/data/`:

| File | Drives |
|---|---|
| `home.json` | Marketing homepage — nav, hero, trust logos, features, pricing tiers, testimonial, footer |
| `dashboard.json` | Dashboard stats, trend bars, activity feed, acceptance bars, top merchants |
| `transactions.json` | 35 transaction rows, filters, FX rates, event timelines |
| `risk.json` | Risk gauge, metrics, 5 anomalies, 10 scored attempts, 8 rules, 6 disputes |
| `settlements.json` | 15 settlement batches, filters, reconciliation breakdowns |
| `subscriptions.json` | 15 mandates, filters, row actions |
| `invoices.json` | 10 invoices with line items, row actions |
| `paymentLinks.json` | 8 links with stats, actions |
| `analytics.json` | 4 metrics, volume chart, methods, geography, 7-month cohort retention, 5-stage funnel |
| `admin.json` | Team, audit log, security cards, invite roles |
| `developer.json` | API keys (test + live), webhooks, code sample, SDK commands |
| `qr.json` | QR merchants, expiries, formats, 7 recent scans |
| `pay.json` | Checkout amount, 6 methods, banks, wallets |
| `onboarding.json` | 6 steps, industries, plans, webhook events, brand colors |
| `tenants.json` | Page headers + status filter list |
| `superAdmin.json` | Platform stats labels |

**Want to change anything?** Edit the JSON, hit save — the app picks it up on next page load. Adding a new transaction, changing a pricing tier, renaming a filter, swapping testimonials — no code changes.

## How the loading behaviour works

Every page uses `useAsync(() => configService.getXxx())`:

1. **On mount** — shows `<PageLoader>` with a spinning indicator and a label like "Loading risk posture"
2. **Fetch** — `configService` wraps each JSON import in `mockFetch()` with a random 300–900ms delay (configurable in `src/services/api.ts`)
3. **Success** — renders the page from `data.xxx`
4. **Error** — shows `<ErrorState>` with retry button that re-invokes the fetch

To swap to real API calls later: change `configService` to `fetch()` from your backend. The pages don't know the difference.

## Simulated failure injection

`src/services/api.ts` → `mockFetch()` accepts `{ failureRate: 0-1 }`. Set any getter to fail 20% of the time to test error states:
```ts
getDashboard: () => mockFetch(dashboardData, { failureRate: 0.2 })
```

## Routes

**Marketing** `/`, `/book-demo`

**Operator** `/app`, `/app/transactions`, `/app/tenants`, `/app/risk`, `/app/settlements`, `/app/analytics`, `/app/invoices`, `/app/links`, `/app/qr`, `/app/pay`, `/app/subscriptions`, `/app/developer`, `/app/admin`, `/app/super-admin`, `/app/onboarding`

**Per-tenant** `/t/:slug/*` for each seeded merchant: `zomato-foods`, `razorpay-technologies`, `nykaa-beauty`, `cred-club`, `urban-company`, `bookmyshow`

## Design language

Warm off-white `#F6F6F2`, ink `#1A1A1A`, single teal `#1C6F6B`, amber `#B48C3C` reserved for Super Admin crown. Inter sans + JetBrains Mono. 37+ custom line icons. Left floating dock (64px → 220px on hover). Top header with ⌘K search, currency switcher, notifications, avatar menu.

## Made in Bengaluru
