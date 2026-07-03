# QUE-FALTA — Programador de Redes Sociales

> **Save State operativo.** Actualizar al inicio y al cierre de cada sesión de trabajo.

---

## Estado actual

- **Fase del Playbook:** `Regularización (revision-inicial → REGULARIZACION_REQUERIDA). Fase 1-2 GREEN (deps+vulns+types+lint+build+boot). En HARD STOP de VFH conducida (Fase 3).`
- **Clasificación de activo:** `04-Aplicaciones-web-empresariales` (+ 05/01) — estado `final` (ver `CLASIFICACION-ACTIVO.md`)
- **Tipo de cliente:** `ficticio` · **Modo:** `portafolio funcional sandbox-first`
- **Stack:** Next.js 15 + Supabase (schema `cat01s02_scheduler` en proyecto-a `vzhgrplpwpfcsrbckdkm`) + Vercel · conectores simulados
- **Repo:** https://github.com/Articrafter93/cat-01-s02-social-scheduler (private, branch `sync/auto/mock-data`)
- **Última sesión:** 2026-06-25
- **Próxima acción:** (1) Developer pega `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` (worker de cola / "Procesar ahora"). (2) VFH conducida 8 pruebas §6 (server vivo en localhost:3000). (3) inspeccion-visual. (4) GATE 7/8: secrets+audit(WF-011)+vuln. (5) GATE 9: revision-final → cliente-exigente B → reclutador-exigente → sellos.

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

_(ninguno — app funcional tras fix de 3 bugs de infra)_

## Hallazgos VFH (2026-07-03) — el build pasaba pero la app estaba rota

1. **[FIX runtime]** Entorno contaminado: shell del workspace hereda `NEXT_PUBLIC_SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` de otro proyecto (perfil de usuario) → pisaban `.env.local` → URL Supabase equivocada. Mitigado relanzando dev con `env -u`. **Pendiente persistir:** hygiene del perfil (super-asesor) o guard en el arranque.
2. **[FIX DB, falta persistir en seed]** `auth.users` sembrados con columnas de token en NULL → GoTrue 500 "converting NULL to string". Corregido en vivo (`coalesce(...,'')`). **Falta:** arreglar `supabase/seed.sql` / `create-demo-users.ts` para que no recurra al re-sembrar.
3. **[FIX DB config, falta persistir en migración]** Schema `cat01s02_scheduler` **no expuesto** en PostgREST (PGRST106) → todas las queries de datos fallaban silenciosas → "Sin organizaciones". Corregido: `alter role authenticator set pgrst.db_schemas=...` + `reload schema`. **Falta:** persistir en migración/setup + confirmar en Dashboard → API → Exposed schemas (durabilidad ante restart/deploy).
4. **[FIX DB + finding]** Seed con datos congelados en fecha de siembra (25 jun) → calendario abría vacío en mes actual. Re-anclado a `now()` (posts jul 2-6, métricas al día). Seed source ya usa `now()±interval`. **Falta:** freshness a largo plazo (re-anclar vía keep-alive) — enhancement, no bloqueante.
5. **[FIX DB, falta persistir en seed]** Admin estaba en 1 sola marca → el switch multi-marca (core del brief) no era demostrable. Añadida membresía admin→brand-nova. **Falta:** reflejar en `seed.sql`.

### Persistencia de fixes en source
- [x] Migración `003_expose_schema_to_postgrest.sql` (schema exposure, idempotente) — aplicada + versionada
- [x] `create-demo-users.ts` — ahora pasa `id: user.id` (admin API setea tokens `''`)
- [x] `seed.sql` — normalización de tokens `''` + membresía admin→brand-nova
- [x] `[GATE 8 fix]` login mock guard: `NEXT_PUBLIC_DEMO_MODE` como opt-in único (funciona en exhibición prod, off por defecto) — login/page.tsx + queue/process/route.ts
- [ ] Higiene de entorno del perfil (super-asesor) o guard de arranque — no bloqueante

### Gates hacia SELLO PARCIAL
- [x] `secrets` (GATE 8) → **Proyecto Seguro** (0 secretos reales, .gitignore OK, mock legítimo)
- [~] `vuln` (04/05/01) → **NO PASA**: BAC/aislamiento/SCA/secrets/cola OK, pero 3 hallazgos:
  - `<HIGH>` compositor sin imagen (brief §1.3/§6#3 la exigen) → bloquea EXITO TOTAL. **Decisión: implementar Supabase Storage + upload.**
  - `<WARN>` `storage` declarado no implementado → se cubre con lo anterior.
  - `<WARN>` `rate_limiting` declarado no implementado → **Decisión: reconciliar matriz (honesto), no implementar** (endpoints auth-gated).
- [x] **Feature imagen:** migración `004` (bucket + RLS por org) → upload en composer (preview) → validación `media_url` en api/posts → display en modal calendario. **VFH re-probada: upload→Storage→display OK** (`03b-c`). build 0 / type 0.
- [x] Reconciliado `CLASIFICACION-ACTIVO.md` + `MATRIZ-BACKEND.md` (rate_limiting = diseño/no-MVP honesto; storage = implementado)
- [x] **MATRIZ PRODUCCION FULL-STACK creada** (`00-ARQUITECTURA §9`) → **WF-011 PASS** (8 cubierta, 3 no_aplica c/razón, 0 bloqueada)
- [x] `revision-final` (core/04/05/01) → **PR_APPROVED** (`docs/GATE9_Revision_Reporte.md`)
- [x] `cliente-exigente` Modo B → **EXITO TOTAL** (`comunicacion-cliente/2026-07-03-02`) + valor de mercado
- [x] **Feature preview por red** (M4 gap) — vista previa por red con imagen+texto+límite (`03d`)
- [x] `reclutador-exigente` → **NO_APTO_PORTAFOLIO** (`REVISION-RECLUTADOR.md`) — **GATE BLOQUEADO**
- [ ] `inspeccion-visual` → INSPECCION-VISUAL.md (pendiente; no desbloquea por sí solo)
- [ ] **build final limpio** (reiniciar dev, `next build` 0) antes del sello
- [ ] Firma VFH developer → **SELLO PARCIAL** (bloqueado por reclutador)

## REMEDIACIÓN COMPLETA (2026-07-03) — reclutador ahora APTO_PORTAFOLIO
- [x] **Idioma → inglés** integral: README reescrito, UI/copy (login, sidebar, calendar, composer, queue, metrics, accounts, settings, badges), comentarios/identificadores (6 page functions renombradas), datos demo (post bodies en DB viva + `seed.sql`), `lang="en"`, locales `en-US`. Route folders quedan español (URLs).
- [x] **Meta-etiquetas removidas** (README + ajustes); divulgación honesta sandbox conservada en inglés.
- [x] **Suite de tests Vitest**: 12 tests (backoff exponencial, boundary multi-tenant de `media_url` extraído a `lib/media.ts`, determinismo de conectores). `npm run test` verde. README §Tests honesto.
- [x] `reclutador-exigente` → **APTO_PORTAFOLIO** (`REVISION-RECLUTADOR.md`)
- [x] type-check 0 / lint 0 tras remediación

## ⚠️ INCIDENTE DE SEGURIDAD (2026-07-03) — service_role expuesto en contexto
El linter del harness mostró `.env.local` (incl. valor `SUPABASE_SERVICE_ROLE_KEY`) en el contexto del agente. Tratado como comprometido.
- [ ] **Rotar service_role** de `portafolio-45-project-a` (Dashboard → Settings → API → Reset) → actualizar `.env.local:13` + GitHub secret del cron keep-alive. Sandbox/bajo impacto, pero es la acción correcta.

## Residuo a limpiar (rm bloqueado por guardia)
- [ ] Eliminar `C:\Users\g-cub\Antigravity projects\programa-portafolio-60-placeholder-REVISION-RECLUTADOR.md.tmp` (placeholder creado por error).

## Pendiente hacia el sello
- [x] `next build` final limpio (0/0) + dev en puerto libre (principio del puerto libre aplicado, sin friccion)
- [x] `INSPECCION-VISUAL.md` = **SI** (Playwright, UI en inglés, cero fugas)
- [x] Re-VFH sobre UI en inglés (8 §6 se sostienen; evidencia `reports/vfh/en-01..04`)
- [ ] **Firma VFH del developer** (HARD STOP — única condición restante del sello) → luego se emite `SELLO DE APROBACION PARCIAL.md`

### 6 condiciones del SELLO PARCIAL
- [x] revision-final PR_APPROVED + WF-011 PASS · [x] cliente-exigente EXITO TOTAL · [x] DIRECCION-VISUAL SI · [x] reclutador APTO_PORTAFOLIO · [x] INSPECCION-VISUAL SI · [ ] **VFH firma developer**

## GATE BLOQUEADO (2026-07-03, RESUELTO) — reclutador-exigente NO_APTO_PORTAFOLIO

El proyecto es funcionalmente completo (VFH 8/8, revision-final PR_APPROVED + WF-011 PASS, cliente-exigente EXITO TOTAL) pero **no apto para exhibición de portafolio**. Sello parcial **bloqueado**. Remediación (excede la sesión, decisión del developer):

1. **Idioma → inglés** en toda la superficie recruiter-facing: README, UI/copy, comentarios de código, mensajes de commit, datos demo visibles, nombre. (Andamiaje interno queda en español.) Tensión con el correo (que fijó UI en español); resolver `idioma_render` para portafolio (`en` piso o `toggle`).
2. **Quitar meta-etiqueta** "Proyecto ficticio de portafolio" del README (conservar divulgación honesta sandbox en inglés).
3. **Suite de tests real** (o quitar el claim del README): idempotencia de cola (SKIP LOCKED/backoff/DLQ), no-fuga cruzada RLS, validación `media_url`. El README ya los vende → escribirlos.

**Nota:** no había `SELLO DE APROBACION PARCIAL.md` previo → sin cascada de invalidación.

**Lección:** no correr `npm run build` durante `next dev` vivo (clobberea `.next` compartido → ENOENT). Usar `tsc --noEmit` + `next lint` para re-validar en caliente, o reiniciar dev tras build.
- [ ] `inspeccion-visual` → `INSPECCION-VISUAL.md` (hard blocker visual)
- [ ] `revision-final` (core/04/05/01) → PR_APPROVED
- [ ] `cliente-exigente` Modo B → EXITO TOTAL
- [ ] `reclutador-exigente` → APTO_PORTAFOLIO
- [ ] Firma VFH developer → **SELLO PARCIAL**

### Progreso VFH conducida (2026-07-03) — 8/8 §6 PASS (falta firma developer)
- [x] #1 Login sin fricción (Admin) → dashboard · `reports/vfh/01a-c`
- [x] #2 Conmutar marca + aislamiento total · `02a-b`
- [x] #3 Componer post → Programado, timezone correcto · `03`
- [x] #4 Fallido + motivo + retry (estado cambia) · `04a-b`
- [x] #5 Cliente solo-lectura (UI + redirect + API 403) · `05`
- [x] #6 Métricas + empty state honesto · `06`
- [x] #7 Validación fecha pasada/vacío · `07`
- [x] #8 Logout + re-ingreso multi-rol
- [x] Extra: worker de cola `/api/queue/process` 200 (service_role válido)
- [ ] **Firma VFH del developer** (HARD STOP) → `VERIFICACION-FUNCIONAL-HUMANA.md`

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
- [x] Deps instaladas + remediación vulns a 0 (next 15.5.19, override postcss, ssr 0.12.0, dotenv) ✅ 2026-06-29
- [x] type-check 0 · lint 0 · build 0 (9 rutas) · dev server arranca (localhost:3000, HTTP 200) ✅ 2026-06-29
- [ ] Developer pega `SUPABASE_SERVICE_ROLE_KEY` en `.env.local` (worker de cola)
- [ ] **VFH conducida** 8 pruebas §6 + firma del developer → `VERIFICACION-FUNCIONAL-HUMANA.md`
- [ ] Paso 7-8 — QA técnico + seguridad (GATE 7/8)
- [ ] GATE 9 — `revision-final` + Cliente Exigente Modo B + reclutador-exigente + VFH → sellos → deploy Vercel

## Historial de sesiones

| Fecha | Lo que se hizo | Lo que quedó pendiente |
|---|---|---|
| 2026-06-25 | Reinicio desde cero tras borrado. Detach de origin fantasma (`3-social-media-scheduler`, 404). Scaffold Paso 0.5. `tipo_cliente: ficticio`. | Paso 1.0 |
| 2026-06-25 | GATE 1.0 (correo corporativo). Plan Mode aprobado (stack Next.js+Supabase+Vercel, conectores simulados). Paso 3 completo (arquitectura, clasificación final, matrices, .env.example, motion). Fresh git init + `ghnew` → repo `private` `cat-01-s02-social-scheduler` (default `main`). Higiene de residuos. | — |
| 2026-06-25 | Paso 4 — GATE 4: `DIRECCION-VISUAL.md` (Resultado: SI). Sistema visual "sala de control editorial": paleta slate-900/indigo-500, colores semánticos de estado (emerald/amber/rose/slate), tipografía Inter tabular-nums, tokens Tailwind + CSS variables, layout sidebar-240px + main, spec de componentes (badges, brand selector, cards, DLQ table, metrics). | Paso 5 — scaffold |
| 2026-06-29 | `revision-inicial` → `REGULARIZACION_REQUERIDA` + Plan Mode aprobado. Fase 1-2: `.env.local` (service_role placeholder), deps instaladas en Install Mode, remediación vulns a **0** (next 15.1.8→15.5.19 por CVE-2025-66478, override postcss `$postcss`, ssr 0.5.2→0.12.0 alineado con supabase-js 2.108, +dotenv). Fix tipado raíz: schema generic + `Relationships`/`Views`/`Enums`/`CompositeTypes` en `Database`, `target ES2017`, eslint `next/typescript`. **type-check 0 / lint 0 / build 0 (9 rutas) / dev server HTTP 200.** | Pegar service_role → VFH conducida 8§6 → inspeccion-visual → GATE 7/8/9 → sellos |
| 2026-06-25 | Paso 5+6 completos: scaffold Next.js 15 + Tailwind + Supabase SSR; migraciones 001+002 aplicadas en proyecto-a (vzhgrplpwpfcsrbckdkm); 3 usuarios demo + seed (2 orgs, 5 cuentas, 9 posts en 6 estados, 60 métricas); layout chrome (sidebar/brandSelector/logout), CalendarView mes+semana+modal, ComposerForm con validación, QueueTable con filtros+retry, MetricsPanel, 5 API routes, 3 conectores simulados deterministas, queue worker idempotente (FOR UPDATE SKIP LOCKED), GitHub Action cron */5 + keep-alive. | npm install + npm run dev + .env.local (manual) → VFH → GATE 9 |
