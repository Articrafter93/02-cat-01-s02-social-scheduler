# PORTFOLIO DESCRIPTION

**Project:** Social Scheduler — Editorial Calendar for Agencies
**Status:** Final approval seal in force
**Category:** CAT-01 — Operational Automations
**Version:** commit `ead6926`
**Public URL:** https://cat-01-s02-social-scheduler.vercel.app
**Repository:** https://github.com/Articrafter93/cat-01-s02-social-scheduler

## Executive summary
A multi-tenant social-media scheduling platform for marketing agencies. One agency manages several brands, schedules posts to Instagram / LinkedIn / Facebook, and tracks their publication from an editorial calendar and a resilient queue with automatic retries. Exhibition demo with fictional data and sandbox accounts — no real network connections.

## Purpose and goals
Show a production-shaped, full-stack operational backbone: role-gated multi-brand access, a publishing pipeline that survives failures without losing posts, and honest observability — the kind of scheduling/queue automation a real agency would run.

## What it can do
- **Editorial calendar** per brand with scheduled posts (text + image + network + timezone).
- **Publishing queue / DLQ**: a worker claims due jobs, simulates delivery through per-network connectors, retries with exponential backoff, and isolates dead jobs in a Dead Letter Queue.
- **Metrics** per account (reach, impressions, engagement) with honest empty states.
- **Roles**: agency admin, editor, and read-only client, with strict cross-brand isolation and permissions enforced in the UI, the route, and the API (a real 403 on write attempts).

## Architecture and framework
Full-stack Next.js (App Router, Server Components + Route Handlers). Supabase provides Postgres + Auth + Storage, with Row Level Security per organization and a dedicated schema (schema-pooling). The queue worker is driven by a scheduled GitHub Action against a protected endpoint; network connectors are deterministic and sandboxed (no real posting). Image uploads land in Supabase Storage with org-scoped ownership validation. Dates are pinned to a fixed timezone for consistent SSR/CSR rendering.

## Tools involved
- Next.js 15 + TypeScript — `GRATIS_INDEFINIDO` (Vercel hobby)
- Supabase (Postgres / Auth / Storage / RLS) — `GRATIS_CON_LIMITE` (free tier + weekly keep-alive to prevent idle pause)
- Vitest (unit tests: backoff, multi-tenant boundary, connector determinism) — `GRATIS_INDEFINIDO`
- GitHub Actions (queue + keep-alive cron) — `GRATIS_CON_LIMITE` (within free minutes at 6h cadence)
- Vercel — `GRATIS_INDEFINIDO` (deployment + public verification)

## Integrations and external services
Supabase (managed Postgres, Auth, Storage). Social networks (Instagram / LinkedIn / Facebook) are represented by deterministic sandbox connectors — the demo does not post to real accounts. Keep-alive is automated via a scheduled GitHub Action.

## Evidence of final approval
- `SELLO DE APROBACION FINAL.md` in force (2026-07-03)
- Vercel deploy `READY` + HTTP 200 on the canonical URL
- Second human functional verification on the live URL (login, data, queue worker 200, RBAC 403, clean console)
- Deployed commit `ead6926`

## Guide for recruiter or client
Open the public URL and sign in with the pre-filled demo selector (three roles). As **Agency admin** you get the full editorial calendar, composer with image upload, queue/DLQ with retries, and metrics. Switch brands to see strict isolation. Sign in as **Client (read-only)** to confirm that write actions are blocked at every layer. Use **"Process queue now"** to watch the worker claim and process due posts. All data is fictional; no real social networks are contacted.
