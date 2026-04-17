# Payze — Pay with Ease

Multi-tenant payments SaaS with a public marketing site, demo booking flow, and per-client isolated workspaces.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173

## The three entry points

| URL | What it is | Who uses it |
|---|---|---|
| `/` | Public marketing home page | Prospects |
| `/book-demo` | Calendar + form + Zoom scheduling | Prospects |
| `/app` | Default merchant workspace (contains Super Admin) | You, the platform operator |
| `/t/{slug}` | Client-specific workspace (e.g. `/t/acme-corp`) | Each onboarded client |
| `/app/super-admin` | Tenant management console | You |

## Try the full flow

1. **Visit `/`** — the marketing home. Scroll through benefits, AI, numbers, tech sections.
2. **Click "Book a demo"** — pick a date, pick a time, fill the form. Confirmation screen shows a realistic email preview with Zoom link.
3. **Visit `/app/super-admin`** — you'll see your booking appear under "Demo Requests" tab. Also 4 seeded tenants under "Client Workspaces".
4. **Click "Onboard new client"** — fill the form. Pick a URL slug like `nova-corp`. Watch the banner appear with the new workspace URL.
5. **Click "Open workspace"** — you're now at `/t/nova-corp`. Header shows the tenant name + color pill. Navigate around — it's the full merchant experience, scoped to that tenant.
6. **Navigate to `/t/acme-corp`** — Acme's workspace. Everything is tenant-aware.

## Architecture

### Marketing + Booking

- **HomePage** (`src/app/pages/Home.tsx`) — single-page marketing site with parallax hero, animated counters, benefits grid, dark AI section, numbers strip, tech showcase, testimonial, CTA.
- **BookDemoPage** (`src/app/pages/BookDemo.tsx`) — 3-step flow (pick slot → details → confirmed). Generates real Zoom-style URLs and meeting IDs. Email preview shown post-booking.

### Multi-tenancy

Every route under `/t/{slug}` wraps the app in `<TenantWorkspace>`, which:
- Looks up the tenant by slug
- Provides the tenant via `useTenant()` hook to any child
- Shows a not-found redirect if the slug is invalid
- The `Layout` reads the slug from params to build `basePath = /t/{slug}` and all nav/links respect it
- The header shows the tenant's name + brand color when scoped
- The Super Admin nav item is hidden inside tenant workspaces (only visible in `/app`)

### Data persistence

- **Tenants and demo bookings** persist in `localStorage` (keys: `payze.tenants`, `payze.demoBookings`). Seeded on first load with 4 example tenants.
- **Everything else** uses the same `mockFetch` latency-simulation pattern as before.

### Where to plug in real backend

- **`src/services/api.ts`** — swap `mockFetch` for real `fetch()` calls.
- **`src/services/tenants.ts`** — `bookingService.create()` has a `TODO` comment pointing at the exact spot where the real Zoom API call should go (`POST https://api.zoom.us/v2/users/me/meetings`). Email sending via SendGrid/Resend happens right after.
- **For real multi-tenancy**, back `tenantService` with a DB table instead of localStorage. The service interface stays identical.

## Navigation dock

Service-backed pages (Dashboard, Admin, Analytics, Subscriptions, Risk, Settlements, Payment Links, PaymentUI, Invoice, QRCode, Onboarding, Developer) all work identically in both `/app` and `/t/{slug}` contexts.

The Super Admin button (crown icon, amber accent) appears only in the default `/app` workspace.
