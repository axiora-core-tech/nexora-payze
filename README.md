# Payze — Pay with Ease

A payments SaaS app prototype with full service-layer architecture, realistic loading states, and simulated API latency.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for production

```bash
npm run build
npm run preview
```

## Architecture

### Mock data → services → UI
```
src/assets/mock-data/*.json  →  src/services/*  →  useAsync hook  →  Pages
```

All data lives in 13 JSON files under `src/assets/mock-data/`. Services in `src/services/index.ts` wrap the JSON with `mockFetch()`, which simulates realistic network latency (300–900ms for GETs, 500–1200ms for mutations). The `useAsync` hook handles loading, error, and data states uniformly across every page.

**To connect to a real backend**, replace the internals of `src/services/api.ts` with real `fetch()` calls. The service interfaces and UI code remain unchanged.

### Files

- `src/assets/mock-data/` — 13 JSON files (dashboard, admin, analytics, settlements, subscriptions, risk, payment-links, payment-methods, invoice, developer, onboarding, notifications, qr)
- `src/services/api.ts` — `mockFetch()` + `mockMutate()` with configurable latency and optional failure-rate simulation
- `src/services/index.ts` — 13 typed domain services
- `src/hooks/useAsync.ts` — generic async-data hook with refetch
- `src/app/components/Loaders.tsx` — Skeleton, Spinner, CardSkeleton, RowSkeleton, PageLoader, ErrorState (with retry)

### Service-wired pages (load via useAsync + show skeletons)

- Dashboard (`/`)
- Admin (`/admin`)
- Analytics (`/analytics`)
- Subscriptions (`/subscriptions`)
- Risk (`/risk`)
- Settlements (`/settlements`)
- Payment Links (`/payment-links`)

### Pages using inline data

These still work and compile, but use hardcoded arrays. JSON and services already exist for each — extending them follows the Dashboard.tsx pattern exactly.

- PaymentUI (`/pay`)
- Invoice (`/invoice`)
- QRCode (`/qr`)
- Onboarding (`/onboarding`)
- Developer (`/developer`)

## Key behaviors

### Brand
- Animated favicon (SVG SMIL with Safari JS-PNG-swap fallback)
- Clickable Payze wordmark linking to `/` with animated teal → blue → indigo gradient
- Branded loading spinner used throughout

### Navigation
- Home icon centered in the floating dock with brand gradient
- Left of Home: Onboarding · Admin · Developer · Risk · Settlements
- Right of Home: Pay · Invoice · Links · QR · Subs · Analytics

### Feedback
- All actions fire sonner toast notifications (success, error, or info variants based on context)
- Notification bell shows live unread count with brand-gradient badge
- "Mark all read" and individual notification clicks work

### Loading simulation
Tweak `src/services/api.ts` to adjust latency or inject failures:

```typescript
mockFetch(data, { minLatency: 500, maxLatency: 2000, failureRate: 0.1 })
```

## Known warnings

- JS bundle is 974 KB (274 KB gzipped). Not a functionality issue. To reduce, add `manualChunks` to `vite.config.ts` or use `React.lazy()` on routes.
