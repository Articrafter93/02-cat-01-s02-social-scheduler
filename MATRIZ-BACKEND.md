# MATRIZ-BACKEND · Programador de Redes Sociales

> Decisión de backend por rubro. API desde inicio: **SÍ** (route handlers Next.js + worker de cola). Proveedor por rubro afirmativo; los rubros que no aplican se justifican.

| Rubro | Aplica | Proveedor / Decisión | Notas |
|---|---|---|---|
| **api** | SÍ | Next.js route handlers (`/api/*`) | Compositor, programar, worker de cola, reintento, cuentas. Auth + membresía + rol + RLS en cada ruta. |
| **rate_limiting** | NO (MVP) | — | Diseño lo contempla, pero NO implementado en el MVP sandbox. Riesgo bajo: todas las rutas mutantes son auth-gated (login + membresía). En `get-real` se añadiría (ej. Upstash) antes de exponer a tráfico real. |
| **auth** | SÍ | Supabase Auth + RLS + login mock | Roles admin/member/client_readonly; mock no productivo bloqueado en prod. |
| **db** | SÍ | Supabase Postgres (schema dedicado `cat01s02_scheduler`) | RLS por `org_id`; schema-pooling + keep-alive obligatorio. |
| **storage** | SÍ | Supabase Storage | Media de posts (imagen), políticas por org. |
| **automatización** | SÍ | Tabla `scheduled_posts` + worker + GitHub Action cron `*/5` | Idempotencia, backoff, DLQ. Núcleo "no perder posts". |
| **integraciones** | SÍ (simulado) | Conectores `SocialConnector` IG/LI/FB sandbox deterministas | Sin OAuth real; diseño listo para `get-real`. |
| **pagos** | NO | — | El producto no cobra ni procesa pagos. |
| **email** | NO (MVP) | — | Notificación por email de fallos = `SHOULD` diferido; no en MVP. |
| **crm** | NO | — | Fuera del dominio. |
| **cms** | NO | — | Contenido = posts del usuario, no CMS editorial. |
| **analítica** | SÍ (básica) | Tabla `metrics` + panel por cuenta | Métricas seed (reach/engagement); empty state honesto. |
| **observabilidad** | SÍ | `audit_log` + logs de cola | Consultable; soporta la trazabilidad de publicaciones. |
| **otros** | — | — | — |

**Decisión de API:** `sí` (no queda en "por confirmar"). El backend es central (cola + multi-tenant), no opcional.
