# Payze

Payments infrastructure platform in the IRON/RH design language — warm off-white, single teal accent, geometric sans, custom line icons.

## Run

```
unzip payze-final.zip
cd payze-stage
npm install
npm run dev
```

Open http://localhost:5173

## Routes

**Marketing**
- `/` — home (animated infrastructure diagram, authentic Indian brand trust strip)
- `/book-demo` — calendar + confirmation

**Operator (`/app/*`)**
- `/app` — Dashboard: balance hero, live activity feed with Zomato/Razorpay/Nykaa/Cred/Urban Co., acceptance by method
- `/app/transactions` — Ledger. Clickable rows open detail drawer with event timeline. Unified INR column with source currency shown below for cross-border
- `/app/tenants` — Merchant list with search, status filter, "Onboard new merchant" button → Onboarding
- `/app/risk` — Risk posture (analog-watch gauge) + Signals/Rules/Disputes tabs
- `/app/settlements` — Batches with filters (status/merchant/date). Clickable rows open reconciliation report drawer (gross volume / refunds / chargebacks / fees / GST / net settled) with PDF/CSV/email actions
- `/app/analytics` — Overview / Cohorts (retention heatmap) / Funnels tabs
- `/app/invoices` — List with per-row actions menu. "New invoice" opens builder modal (line items, GST auto-calc). Click row → invoice preview drawer
- `/app/links` — Payment links with QR / Copy / Open / Menu icon actions. QR button opens modal with rendered QR code
- `/app/qr` — Dynamic + Static QR generation, live preview, printable formats, recent scans log
- `/app/pay` — Branded checkout (UPI/Card/NetBanking/Wallet/SEPA/EMI) with method-specific forms + processing → success
- `/app/subscriptions` — UPI Autopay / NACH / International tabs. Status + date range filters. Per-row actions menu
- `/app/developer` — Test/Live toggle, API keys, SDK code sample, webhooks
- `/app/admin` — Team / Audit log / Security tabs. Invite member modal
- `/app/super-admin` — Platform controls (crown icon, operator-only)
- `/app/onboarding` — 6-step merchant KYC (Business / Identity / Banking / Webhooks / Branding / Review). Creates a live tenant on activation

**Per-tenant workspace** (`/t/:slug/*`)
Same chrome, scoped to one merchant. Seeded tenants:
- `/t/zomato-foods`
- `/t/razorpay-technologies`
- `/t/nykaa-beauty`
- `/t/cred-club`
- `/t/urban-company`
- `/t/bookmyshow`

## Design language

- Warm off-white `#F6F6F2`, ink `#1A1A1A`, single teal `#1C6F6B`, amber `#B48C3C` reserved for Super Admin crown
- Inter sans throughout, JetBrains Mono for IDs / timestamps / API keys / UTRs
- 37+ custom line icons (1.6px stroke, rounded caps)
- Left floating dock, 64px → 220px on hover
- Top header with ⌘K search, currency switcher (INR/USD/EUR/GBP/AED), notifications, avatar dropdown
- No green/red semantics — status communicated through position, weight, underline, and strike-through instead
