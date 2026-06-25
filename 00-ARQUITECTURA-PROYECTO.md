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
posts(id, org_id, author_id, body, media_path, networks[], created_at)
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

Ver superficies y controles en `CLASIFICACION-ACTIVO.md §Implicaciones`. Claves: RLS multi-tenant + prueba de no-fuga, zero-knowledge secrets, login mock bloqueado en prod, rate limiting en endpoints de cola/mutación, respeto de rate limits de conectores.

## 8. Deploy y operación

GitHub (repo private nuevo) → Vercel auto-deploy. GitHub Action cron `*/5` para (a) sweep de la cola y (b) keep-alive de Supabase (un solo workflow, dos jobs). Variables en Vercel env (no en repo); `.env.example` documenta las claves sin valores.
