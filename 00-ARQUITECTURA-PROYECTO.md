# 00 — Arquitectura del Proyecto · Programador de Redes Sociales

> Clasificación de activo (categorías, superficies, perfiles `revision-final`): ver [`CLASIFICACION-ACTIVO.md`](CLASIFICACION-ACTIVO.md). Este documento no duplica ese bloque.
> Contrato vinculante: [`comunicacion-cliente/2026-06-25-01-correo-corporativo-inicial.md`](comunicacion-cliente/2026-06-25-01-correo-corporativo-inicial.md).

## 1. Resumen

SaaS multi-tenant para una agencia que gestiona redes de **múltiples marcas**. Permite programar, publicar (simulado en sandbox) y monitorear posts en Instagram/LinkedIn/Facebook, con aislamiento estricto por marca, calendario editorial, cola de publicación confiable y métricas básicas. Dos invariantes rectores: **(1) las marcas jamás se mezclan; (2) no se pierde ninguna publicación programada.**

## 2. Stack (decidido en Plan Mode)

| Capa | Tecnología | Razón |
|---|---|---|
| App | Next.js 15 (App Router, TS) | Full-stack en un repo, deploy free en Vercel |
| UI | Tailwind CSS + shadcn/ui | Code-first, free, look enterprise sobrio |
| Calendario | react-big-calendar / FullCalendar (free) | Vista mes/semana editorial |
| DB + Auth | Supabase (Postgres + Auth + RLS) | Multi-tenant por RLS; free-tier |
| Cola | Tabla Postgres + worker `/api/queue/process` | Idempotencia, reintentos, DLQ |
| Cron | GitHub Action `*/5` + trigger manual | Free; reusa infra del keep-alive |
| Hosting | Vercel (free) | Auto-deploy desde GitHub |

## 3. Modelo de datos (schema dedicado Supabase)

```
organizations(id, name, slug, timezone, created_at)
profiles(id→auth.users, full_name, role_global)
memberships(id, user_id, org_id, role)            role ∈ {admin, member, client_readonly}
social_accounts(id, org_id, network, handle, display_name, status)  network ∈ {instagram, linkedin, facebook}
posts(id, org_id, author_id, body, media_url, networks[], created_at)
scheduled_posts(id, org_id, post_id, account_id, scheduled_at, timezone,
                status, attempts, max_attempts, next_attempt_at, locked_at, last_error, published_at)
   status ∈ {draft, scheduled, publishing, published, failed, retrying, dead}
metrics(id, org_id, account_id, date, reach, engagement)
audit_log(id, org_id, actor_id, action, target, detail, at)
```

**Aislamiento (invariante #1):** toda tabla con `org_id` lleva **RLS** que exige `org_id ∈` las membresías del usuario autenticado. `client_readonly` solo `SELECT` sobre su org. La capa de UI nunca es el único guardia; el aislamiento es estructural en la DB.

## 4. Flujo de la cola de publicación (invariante #2)

```
componer post → programar (scheduled_at, timezone) → scheduled_posts.status=scheduled
        │
   cron */5  ó  "Procesar cola ahora"
        ▼
/api/queue/process:
  1. claim: UPDATE ... SET status=publishing, locked_at=now()
     WHERE status IN (scheduled,retrying) AND next_attempt_at<=now()
     ... FOR UPDATE SKIP LOCKED   (idempotente, sin doble publicación)
  2. connector.publish(account, post)   (simulado determinista)
  3a. éxito → status=published, published_at=now()
  3b. fallo → attempts++; si attempts<max → status=retrying,
       next_attempt_at=now()+backoff(attempts); last_error=motivo
       si attempts>=max → status=dead  (DLQ visible en UI con motivo + reintento manual)
```

Backoff exponencial acotado. `max_attempts` configurable. El DLQ es consultable y permite reintento manual.

## 5. Conectores (simulados/sandbox)

Interfaz común `SocialConnector { publish(account, post): Result }`. Implementaciones deterministas para IG/LI/FB que permiten forzar éxito/fallo/latencia para exhibir la máquina de estados y el DLQ **sin API keys ni OAuth**. Diseño desacoplado del dominio para que un futuro `get-real` sustituya la implementación por OAuth real sin reescribir la cola.

## 6. Rutas (detalle en `02-ARQUITECTURA-SITIO.md`)

`/login` (mock) · `/app/[org]/calendario` · `/app/[org]/componer` · `/app/[org]/cuentas` · `/app/[org]/metricas` · `/app/[org]/cola` (DLQ) · vista read-only del cliente. Chrome compartido con selector de marca + logout persistente.

## 7. Seguridad

Ver superficies y controles en `CLASIFICACION-ACTIVO.md §Implicaciones`. Claves: RLS multi-tenant + prueba de no-fuga, zero-knowledge secrets, login mock bloqueado en prod (opt-in `NEXT_PUBLIC_DEMO_MODE`), endpoints protegidos por auth + membresía + rol + RLS. **Rate limiting: NO implementado en el MVP sandbox** (diseño lo contempla; endpoints auth-gated → riesgo bajo; se añade en `get-real`). Los conectores respetan rate limits del lado de las redes (simulado en sandbox). Media de posts en Supabase Storage con RLS por org.

## 8. Deploy y operación

GitHub (repo private nuevo) → Vercel auto-deploy. GitHub Action cron `*/5` para (a) sweep de la cola y (b) keep-alive de Supabase (un solo workflow, dos jobs). Variables en Vercel env (no en repo); `.env.example` documenta las claves sin valores.

## 9. MATRIZ PRODUCCION FULL-STACK (control WF-011)

> Control universal de GATE 9. Fuente canónica de la matriz. Estados: `APLICA`/`NO APLICA`/`BLOQUEADO`. Cobertura: `cubierta`/`no_aplica`/`bloqueada`. `tipo_cliente: ficticio` → exhibición sandbox-first; `PR_APPROVED` no autoriza producción real, datos reales ni claims de compliance.

| Capa | Estado | Cobertura | Decisión / Riesgo | Evidencia | Dueño | Gate |
|---|---|---|---|---|---|---|
| **Auth & Access Control** | APLICA | cubierta | Supabase Auth + RLS por `org_id` + roles (admin/member/client_readonly) + login mock opt-in. Riesgo: fuga cruzada → mitigado por RLS estructural. | VFH #1/#5 (403 en 3 capas), RLS simulada por rol, `002_rls.sql` | BUILDER | GATE 8/9 |
| **Data / DB** | APLICA | cubierta | Supabase Postgres, schema dedicado `cat01s02_scheduler`, migraciones 001-004, RLS en todas las tablas. | `list_tables` (RLS on), migraciones aplicadas | BUILDER | GATE 5 |
| **Storage** | APLICA | cubierta | Bucket `cat01s02-post-media` público-lectura + RLS write por org (path `{org_id}/…`). Media de posts. | `004_post_media_storage.sql`, VFH #3 (upload+display) | BUILDER | GATE 9 |
| **API / Public API** | APLICA | cubierta | Route handlers `/api/*`; cada mutación valida auth+membresía+rol+RLS; validación de `media_url` por bucket/org. | `posts`, `posts/[id]`, `accounts`, `scheduled/retry`, `queue/process` | BUILDER | GATE 9 |
| **Rate Limiting** | NO APLICA | no_aplica | **No implementado en MVP sandbox.** Razón: endpoints auth-gated (login+membresía) → superficie de abuso anónimo nula; se añade (ej. Upstash) en `get-real` antes de tráfico real. | `MATRIZ-BACKEND.md`, `CLASIFICACION-ACTIVO.md` | STRATEGIST | GATE 9 |
| **Automation** | APLICA | cubierta | Cola `scheduled_posts` + worker idempotente (`FOR UPDATE SKIP LOCKED`) + backoff + DLQ + cron `*/5`. Invariante #2 "no perder posts". | VFH #4, `worker.ts`, `claim_next_jobs`, `queue-cron.yml` | AUTOMATIZADOR | GATE 9 |
| **Observability** | APLICA | cubierta | `audit_log` (publish/fail/dead/retry) + logs de cola + estados visibles en UI/DLQ con motivo. | `audit_log` escrito por worker, VFH #4 (motivo visible) | BUILDER | GATE 9 |
| **Error Tracking & Alerting** | NO APLICA | no_aplica | Fallos se superficializan **in-app** (estado + motivo + DLQ + reintento). APM externo (Sentry) y alerta por email (SHOULD S2) **diferidos** a `get-real`; no requeridos en demo sandbox. | VFH #4, correo §S2 (diferido) | STRATEGIST | GATE 9 |
| **Availability & Recovery** | APLICA | cubierta | Keep-alive cron evita pausa de Supabase free; cola idempotente + reintentos/DLQ = recuperación ante fallo de publicación. | `queue-cron.yml` (keep-alive), backoff/DLQ | AUTOMATIZADOR | GATE 9 |
| **Cost Management** | APLICA | cubierta | Free-tier estricto: Supabase schema-pooling + keep-alive, Vercel free, sin dependencias de pago obligatorio (X/Twitter fuera de scope). | `BRIEF.md` (nota X), `db-ficticio` regla | STRATEGIST | GATE 9 |
| **Compliance & Data Privacy** | NO APLICA | no_aplica | `tipo_cliente: ficticio`: sin PII/datos reales; emails `@demo.cat01s02` ficticios, contraseña demo sandbox. Ley 1581/GDPR no aplican a datos ficticios. `PR_APPROVED` no autoriza datos reales. | `secrets` PASS, datos seed ficticios | ASESOR | GATE 8 |
| **Security & Permissions** | APLICA | cubierta | RLS multi-tenant, secrets zero-knowledge (`.env.local` gitignored, service_role no commiteado), login mock bloqueado en prod salvo opt-in. | `secrets` PASS, `.gitignore`, guard `NEXT_PUBLIC_DEMO_MODE` | ASESOR | GATE 8 |

**WF-011: `PASS`** — 8 capas `cubierta`, 3 capas `no_aplica` con razón específica por tipo de activo (Rate Limiting, Error Tracking externo, Compliance), 0 capas `bloqueada`. Ninguna capa `PENDIENTE`.
