# Social Media Scheduler

Multi-tenant SaaS for marketing agencies that manage several brands at once. Schedule, publish, and monitor posts across Instagram, LinkedIn, and Facebook with strict per-brand isolation, a reliable publishing queue with automatic retries, and a visible dead-letter queue.

**Live demo:** https://social-media-scheduler-app.vercel.app
**Repository:** https://github.com/Articrafter93/02-cat-01-s02-social-scheduler

---

## Quick demo access

> Friction-free login built for reviewers: role selector + pre-filled password.

| Role | Email | Password | Access |
|---|---|---|---|
| Agency admin | `admin@demo.cat01s02` | `demo1234` | Acme Corp + Brand Nova — full |
| Team member | `member@demo.cat01s02` | `demo1234` | Acme Corp — editor |
| Client (read-only) | `client@demo.cat01s02` | `demo1234` | Brand Nova — read-only |

A visible logout in the sidebar lets you switch roles without closing the browser.

---

## Why this project

It demonstrates the mix of skills agencies care about most:

- **Real multi-tenancy with RLS:** every brand lives in its own Postgres schema-scope. The Acme Corp admin cannot see or touch Brand Nova's data — it is not a UI filter, it is structural isolation at the database level (Row-Level Security).
- **Reliable queue with a state machine:** `draft → scheduled → publishing → published | failed → retrying → dead`. The worker uses `FOR UPDATE SKIP LOCKED` so multiple instances never duplicate jobs. Failed posts land in a DLQ with an attempt counter and the last error visible; the "Retry" button sends them back to the queue.
- **Never drop a post:** the most important design decision (an explicit client requirement: "we cannot lose a single scheduled post"). Exponential backoff ensures a transient failure does not burn all retries at once.
- **Three roles with RLS:** `admin` (CRUD), `member` (editor), `client_readonly` (read-only). The client never sees the "New post" button and cannot call the API — the block is server-side, not CSS.

---

## Stack and technical decisions

| Layer | Decision | Why |
|---|---|---|
| App | Next.js 15 (App Router, TypeScript) | SSR + API routes in one repo; free Vercel deploy |
| Styling | Tailwind CSS, custom design | Free-first, full token control; no Figma dependency |
| Auth | Supabase Auth + SSR middleware | SSR session without a client-side JWT; redirect at the edge |
| DB | Supabase Postgres + RLS | Schema-pooling (free tier); RLS as a second security layer |
| Queue | Postgres table + stored function | `FOR UPDATE SKIP LOCKED` = idempotent worker; no Redis |
| Storage | Supabase Storage + per-org RLS | Post images; writes scoped to org membership by path |
| Connectors | Deterministic simulators (IG/LI/FB) | Demo without real OAuth; swappable 1:1 for `get-real` |
| Deploy | Vercel + GitHub Actions cron `*/5` | Free; the cron fires the worker and keeps Supabase awake |

**Why Postgres as the queue instead of an external one:** for an SMB agency with < 1000 posts/day, Postgres with `SKIP LOCKED` removes an infrastructure dependency, keeps the history in the same DB as the business data, and simplifies debugging (the DLQ is a plain `SELECT`). It is the right call for this scope.

---

## Code layout

```
src/
├── app/
│   ├── login/              # Mock login with role selector
│   ├── app/[org]/
│   │   ├── calendario/     # Month/week calendar with detail modal
│   │   ├── componer/       # Multi-account composer with validation + image
│   │   ├── cola/           # Queue table with filters and DLQ
│   │   ├── metricas/       # Per-account panel with honest empty state
│   │   ├── cuentas/        # Connected accounts + sandbox indicator
│   │   └── ajustes/        # Org settings (admin only)
│   └── api/
│       ├── posts/          # Post CRUD with permission checks + media validation
│       ├── scheduled/[id]/retry/   # Retry failed/dead posts
│       ├── accounts/       # Accounts per org
│       └── queue/process/  # Worker endpoint (cron + manual demo)
├── components/
│   ├── layout/             # Sidebar, BrandSelector (with aria)
│   ├── calendar/           # CalendarView month/week
│   ├── composer/           # ComposerForm with per-network char limits + preview
│   ├── queue/              # QueueTable with filters
│   └── ui/                 # StatusBadge, NetworkBadge
├── lib/
│   ├── supabase/           # client, server (SSR), worker clients + types
│   ├── connectors/         # base interface + IG/LI/FB sandbox
│   └── queue/              # worker.ts (claim_next_jobs + backoff)
└── middleware.ts           # Auth redirect + queue bypass
```

> Note: route folder names are kept in Spanish (`calendario`, `componer`…) because they are the deployed URL paths; renaming them is a cosmetic change deferred to avoid churn. All user-facing copy is English.

---

## Run locally

```bash
git clone https://github.com/Articrafter93/02-cat-01-s02-social-scheduler
cd cat-01-s02-social-scheduler
npm install
npm run dev        # → http://localhost:3000
```

You will need a `.env.local` with your Supabase project values (URL, anon key, service role, schema). See `.env.example` for the keys.

---

## Tests

```bash
npm run test         # Vitest unit suite
npm run type-check   # TypeScript strict — 0 errors
npm run lint         # ESLint
npm run build        # Production build
```

The unit suite covers the non-obvious critical logic: exponential backoff bounds, the deterministic connectors, per-network character limits, and the `media_url` ownership validation that prevents attaching another org's image. These are the pieces that guard the "never drop a post" invariant and the multi-tenant boundary.

---

## What is not here (and why)

- **Real OAuth with Instagram/LinkedIn/Facebook:** requires platform app reviews and tokens that expire. The simulated connectors demonstrate the same architecture; swapping them in is an interface implementation, not a redesign.
- **X/Twitter:** paid API since 2023, and out of the client's explicit scope.
- **Rate limiting on the internal API:** the endpoints are auth-gated (login + membership), so the abuse surface is minimal for the demo; a limiter (e.g. Upstash) would be added before real traffic.
- **Client approval flow before publishing:** a COULD-level feature, not required for the MVP.

---

_Sandbox build: the data is fictional, the demo accounts are for testing, and the social connectors run in simulation mode — no posts reach real networks. In production, the connector layer is replaced with real OAuth without touching the queue._
