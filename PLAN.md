# PLAN — Programador de Redes Sociales (SaaS multi-tenant)

> **Estado:** `APROBADO en Plan Mode (2026-06-25)` · `tipo_cliente: ficticio (portafolio)`
> Fuente de verdad del cliente: [`comunicacion-cliente/2026-06-25-01-correo-corporativo-inicial.md`](comunicacion-cliente/2026-06-25-01-correo-corporativo-inicial.md).

---

## Gate de desbloqueo

- [x] `BRIEF.md` completo con input literal del cliente
- [x] Skill `/cliente-exigente` Modo A ejecutada → correo corporativo inicial en `comunicacion-cliente/`
- [x] GATE 1.0 cerrado con aprobación humana
- [x] Plan Mode activado y `PLAN.md` aprobado por el developer

---

## Plan ejecutivo

**Producto:** SaaS multi-tenant para agencia que gestiona redes de múltiples marcas. Programar, publicar (sandbox) y monitorear posts en Instagram/LinkedIn/Facebook. Invariantes: las marcas no se mezclan; no se pierde ninguna publicación programada.

**Stack:** Next.js 15 + Tailwind + shadcn/ui · Supabase (Postgres + Auth + RLS, schema dedicado + keep-alive) · Vercel free · cola Postgres + worker + cron GitHub Action `*/5`. Conectores simulados/sandbox deterministas.

**Alcance MVP (10 MUST del contrato):** auth + roles + login mock; aislamiento multi-marca con prueba de no-fuga; calendario mes/semana con estados; compositor con preview/validación por red; programación con timezone + cola idempotente con reintentos/DLQ; estados de publicación + alertas de fallo; gestión de cuentas conectadas; métricas básicas con empty state; manejo de entrada inválida; logout persistente + re-ingreso multi-rol.

**Secuencia (Playbook):** Paso 3 arquitectura (GATE 3) → Versionado inicial (`ghnew`) → Paso 4 dirección visual (GATE 4) → Paso 5 scaffold + Supabase + seed (GATE 5) → Paso 6 dev B5-B8 (GATE 6) → Paso 7 QA (GATE 7) → Paso 8 seguridad (GATE 8) → Paso 9 cierre + sellos + deploy (GATE 9).

**Out of scope:** X/Twitter (API de pago), OAuth real, aprobación de cliente, programación masiva, IA de copy.

Detalle de arquitectura: [`00-ARQUITECTURA-PROYECTO.md`](00-ARQUITECTURA-PROYECTO.md). Rutas: [`02-ARQUITECTURA-SITIO.md`](02-ARQUITECTURA-SITIO.md).

---

## Matriz Produccion Full-Stack

> Estados: `APLICA`, `NO APLICA`, `BLOQUEADO`. Coberturas: `cubierta`, `no_aplica`, `bloqueada`. `NO APLICA` justificado por tipo de activo.

| Capa | Estado | Cobertura | Decision | Riesgo | Evidencia | Dueno | Gate |
|---|---|---|---|---|---|---|---|
| Frontend | `APLICA` | `cubierta` | Next.js 15 + Tailwind + shadcn/ui | UI inconsistente | `00-ARQUITECTURA` §2 | BUILDER | GATE 3 |
| APIs y logica backend | `APLICA` | `cubierta` | Route handlers + worker de cola | Doble publicación | `00-ARQUITECTURA` §4 | BUILDER | GATE 3 |
| Database y storage | `APLICA` | `cubierta` | Supabase Postgres (schema dedicado) + Storage | Fuga entre orgs | `00-ARQUITECTURA` §3 | STRATEGIST | GATE 3 |
| Auth y access control | `APLICA` | `cubierta` | Supabase Auth + RLS + roles + login mock | Bypass de rol | `CLASIFICACION` §seg | STRATEGIST | GATE 3 |
| Hosting y deployment | `APLICA` | `cubierta` | Vercel free + auto-deploy GitHub | — | `00-ARQUITECTURA` §8 | EXECUTOR | GATE 3 |
| Cloud y compute | `NO APLICA` | `no_aplica` | Serverless de Vercel cubre compute; sin compute dedicado | N/A justificado | decisión Plan Mode | STRATEGIST | GATE 3 |
| CI/CD pipeline | `APLICA` | `cubierta` | GitHub→Vercel + lint/build en CI | Deploy roto | `.github/workflows` | EXECUTOR | GATE 3 |
| Version control | `APLICA` | `cubierta` | Repo `private` nuevo via `ghnew` | Historia contaminada | Gate Versionado | EXECUTOR | GATE 3 |
| Security y permissions | `APLICA` | `cubierta` | RLS multi-tenant + zero-knowledge secrets | Fuga de tokens | `CLASIFICACION` §seg | ASESOR | GATE 8 |
| Rate limiting | `APLICA` | `cubierta` | Límite en `/api/queue/process` y mutaciones | Abuso/coste | `00-ARQUITECTURA` §7 | BUILDER | GATE 3 |
| Caching y CDN | `APLICA` | `cubierta` | CDN Vercel + revalidación de vistas | Datos stale | config Next | BUILDER | GATE 3 |
| Load balancing y scaling | `NO APLICA` | `no_aplica` | Escala serverless de Vercel suficiente para demo | N/A justificado | decisión Plan Mode | STRATEGIST | GATE 3 |
| Testing strategy | `APLICA` | `cubierta` | Unit (cola/estados) + e2e Playwright crítico | Regresión de cola | `tests/` | BUILDER | GATE 7 |
| Observability | `APLICA` | `cubierta` | `audit_log` + logs de cola consultables | Fallo silencioso | `00-ARQUITECTURA` §4 | BUILDER | GATE 9 |
| Error tracking y alerting | `APLICA` | `cubierta` | Captura de errores de publicación + DLQ visible | Post perdido | UI `/cola` | BUILDER | GATE 9 |
| Cost management | `APLICA` | `cubierta` | Free-tier estricto + keep-alive Supabase | Pausa por inactividad | GitHub Action | EXECUTOR | GATE 3 |
| Compliance y data privacy | `APLICA` | `cubierta` | Datos ficticios; sin PII real; sin claims productivos | Claim falso | seed sandbox | ASESOR | GATE 8 |
| Availability y recovery | `APLICA` | `cubierta` | Reintentos/backoff/DLQ + seed reproducible | Pérdida de jobs | `00-ARQUITECTURA` §4 | BUILDER | GATE 9 |

---

## Notas de cambio posteriores al plan

> Registrar aquí cualquier cambio de alcance aprobado tras el plan inicial, con fecha y referencia al archivo de nota de cambio en `comunicacion-cliente/`.

_(ninguna a la fecha)_
