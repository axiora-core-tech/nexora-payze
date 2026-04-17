# Payze

A payments infrastructure platform, rebuilt end-to-end in a quiet studio-grade language.

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
- `/` — home (animated infrastructure)
- `/book-demo` — calendar + confirmation

**Platform operator (you running Payze)**
- `/app` — dashboard
- `/app/transactions` — full ledger
- `/app/tenants` — merchant list
- `/app/risk` — scored attempts, watch
- `/app/settlements` — batches
- `/app/analytics` — charts
- `/app/invoices` — invoice list
- `/app/links` — payment links
- `/app/subscriptions` — recurring mandates
- `/app/developer` — keys, webhooks, code sample
- `/app/admin` — team, roles
- `/app/super-admin` — platform controls + tenant onboarding (crown icon, operator-only)
- `/app/onboarding` — KYC walkthrough

**Per-tenant merchant workspace**
- `/t/:slug` — same app chrome, tenant-scoped
- Try `/t/acme-corp`, `/t/nova-fintech`, `/t/meridian-travel`, `/t/luminary-studio`

## Design language

- Warm off-white `#F6F6F2`, ink `#1A1A1A`, one teal accent `#1C6F6B`, one amber `#B48C3C` reserved for the Super Admin crown
- Inter sans throughout, JetBrains Mono for IDs / timestamps / API keys
- Custom line icons (35+), 1.6px stroke, rounded caps
- Left floating dock, 64px → 220px on hover
- Top header with search (⌘K), currency switcher (INR / USD / EUR / GBP / AED), notifications, avatar menu

## Data

- Mocked via `services/tenants.ts` with `localStorage` persistence
- Seeded with 4 merchants and an empty bookings list
- Create a new merchant from Super Admin → appears in Tenants list + unlocks `/t/:slug`
- Book a demo at `/book-demo` → appears in Super Admin bookings panel
