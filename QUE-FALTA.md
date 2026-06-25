# QUE-FALTA — Programador de Redes Sociales

> **Save State operativo.** Actualizar al inicio y al cierre de cada sesión de trabajo.

---

## Estado actual

- **Fase del Playbook:** `GATE 5 / GATE 6 en curso → Paso 6 (desarrollo B5-B8) casi completo → pendiente npm install + npm run dev + VFH`
- **Clasificación de activo:** `04-Aplicaciones-web-empresariales` (+ 05/01) — estado `final` (ver `CLASIFICACION-ACTIVO.md`)
- **Tipo de cliente:** `ficticio` · **Modo:** `portafolio funcional sandbox-first`
- **Stack:** Next.js 15 + Supabase (schema `cat01s02_scheduler` en proyecto-a `vzhgrplpwpfcsrbckdkm`) + Vercel · conectores simulados
- **Repo:** https://github.com/Articrafter93/cat-01-s02-social-scheduler (private, branch `sync/auto/mock-data`)
- **Última sesión:** 2026-06-25
- **Próxima acción:** (1) Developer crea `.env.local` con valores de Supabase (ver abajo). (2) `npm install`. (3) `npm run dev` + `rend` → VFH. (4) GATE 9 → revision-final → sellos → deploy Vercel.

### Valores para `.env.local` (developer crea manualmente)
```
NEXT_PUBLIC_SUPABASE_URL=https://vzhgrplpwpfcsrbckdkm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6aGdycGxwd3BmY3NyYmNrZGttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMjEzMzQsImV4cCI6MjA5Nzg5NzMzNH0.pwa1xgVDG8_bNyp-q9jgmZBUYLtu5d3HfCgwjQVp-us
NEXT_PUBLIC_SUPABASE_DB_SCHEMA=cat01s02_scheduler
SUPABASE_URL=https://vzhgrplpwpfcsrbckdkm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<Supabase Dashboard → Settings → API → service_role>
QUEUE_CRON_SECRET=demo-queue-secret-local
QUEUE_MAX_ATTEMPTS=5
QUEUE_BACKOFF_BASE_SECONDS=60
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DEMO_PASSWORD=demo1234
APP_URL=http://localhost:3000
```

---

## Bloqueantes activos

_(ninguno)_

## Tareas pendientes

- [x] Paso 1.0 — Cliente Exigente Modo A → correo corporativo inicial (GATE 1.0) ✅ 2026-06-25
- [x] Plan Mode → `PLAN.md` aprobado por developer ✅ 2026-06-25
- [x] Decidir stack (9-agentes) ✅ Next.js + Supabase + Vercel
- [x] Confirmar/finalizar clasificación de activo ✅ `final`/`alta`
- [x] `MATRIZ PRODUCCION FULL-STACK` completa (GATE 3) ✅
- [x] Gate de Versionado Inicial → `/ghnew` (repo privado nuevo) ✅
- [x] Paso 4 — Dirección visual (`DIRECCION-VISUAL.md`, GATE 4) ✅ 2026-06-25
- [x] Paso 5 — Scaffold Next.js 15 + Supabase + RLS + seed (GATE 5) ✅ 2026-06-25
  - [x] package.json, tsconfig, next.config, tailwind.config, postcss, eslintrc
  - [x] src/lib/supabase/{types,client,server}.ts + src/lib/utils.ts + src/types/index.ts
  - [x] src/middleware.ts (auth redirect, queue worker bypass)
  - [x] supabase/migrations/001_schema.sql + 002_rls.sql → aplicadas en proyecto-a
  - [x] supabase/seed.sql + scripts/create-demo-users.ts → ejecutados vía MCP
  - [x] .github/workflows/queue-cron.yml (cron */5 + keep-alive)
  - [ ] `.env.local` — PENDIENTE: developer crea manualmente (ASESOR bloquea escritura agente)
- [x] Paso 6 — Desarrollo B5-B8 ✅ 2026-06-25
  - [x] B5: layout chrome — Sidebar, BrandSelector, StatusBadge, NetworkBadge
  - [x] B6: login mock (selector 3 roles + pass prellenada + sandbox disclaimer), app/page, app/[org]/layout
  - [x] B7: CalendarView (mes/semana/modal detalle/retry), composer, cola/DLQ, métricas, cuentas, ajustes
  - [x] B8: API routes (/api/posts, /api/posts/[id], /api/scheduled/[id]/retry, /api/accounts, /api/queue/process)
  - [x] Conectores simulados (IG/LI/FB deterministas) + queue worker
- [ ] `npm install` + `npm run dev` → validar UI local (`rend`) → **VFH developer**
- [ ] Paso 7-8 — QA técnico + seguridad (GATE 7/8)
- [ ] GATE 9 — `revision-final` + Cliente Exigente Modo B + reclutador-exigente + VFH → sellos → deploy Vercel

## Historial de sesiones

| Fecha | Lo que se hizo | Lo que quedó pendiente |
|---|---|---|
| 2026-06-25 | Reinicio desde cero tras borrado. Detach de origin fantasma (`3-social-media-scheduler`, 404). Scaffold Paso 0.5. `tipo_cliente: ficticio`. | Paso 1.0 |
| 2026-06-25 | GATE 1.0 (correo corporativo). Plan Mode aprobado (stack Next.js+Supabase+Vercel, conectores simulados). Paso 3 completo (arquitectura, clasificación final, matrices, .env.example, motion). Fresh git init + `ghnew` → repo `private` `cat-01-s02-social-scheduler` (default `main`). Higiene de residuos. | — |
| 2026-06-25 | Paso 4 — GATE 4: `DIRECCION-VISUAL.md` (Resultado: SI). Sistema visual "sala de control editorial": paleta slate-900/indigo-500, colores semánticos de estado (emerald/amber/rose/slate), tipografía Inter tabular-nums, tokens Tailwind + CSS variables, layout sidebar-240px + main, spec de componentes (badges, brand selector, cards, DLQ table, metrics). | Paso 5 — scaffold |
| 2026-06-25 | Paso 5+6 completos: scaffold Next.js 15 + Tailwind + Supabase SSR; migraciones 001+002 aplicadas en proyecto-a (vzhgrplpwpfcsrbckdkm); 3 usuarios demo + seed (2 orgs, 5 cuentas, 9 posts en 6 estados, 60 métricas); layout chrome (sidebar/brandSelector/logout), CalendarView mes+semana+modal, ComposerForm con validación, QueueTable con filtros+retry, MetricsPanel, 5 API routes, 3 conectores simulados deterministas, queue worker idempotente (FOR UPDATE SKIP LOCKED), GitHub Action cron */5 + keep-alive. | npm install + npm run dev + .env.local (manual) → VFH → GATE 9 |
