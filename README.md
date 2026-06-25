# Social Media Scheduler — Programador de Redes Sociales

SaaS multi-tenant para agencias de marketing que gestionan múltiples marcas. Programa, publica y monitorea posts en Instagram, LinkedIn y Facebook con aislamiento total por marca, cola de publicación con reintentos automáticos y dead-letter queue visible.

**Demo en vivo:** _pendiente deploy Vercel (GATE 9)_  
**Repositorio:** https://github.com/Articrafter93/cat-01-s02-social-scheduler

---

## Acceso demo rápido

> Login sin fricción diseñado para reclutadores: selector de rol + contraseña prellenada.

| Rol | Email | Contraseña | Acceso |
|---|---|---|---|
| Administrador | `admin@demo.cat01s02` | `demo1234` | Acme Corp — todo |
| Miembro del equipo | `member@demo.cat01s02` | `demo1234` | Acme Corp — editor |
| Cliente (solo lectura) | `client@demo.cat01s02` | `demo1234` | Brand Nova — solo lectura |

Logout visible en el sidebar → permite cambiar de rol sin cerrar el navegador.

---

## Por qué este proyecto

Demuestra la combinación de habilidades que más valoran los clientes de agencias:

- **Multi-tenancy real con RLS:** cada marca vive en su propio schema-scope de Postgres. El admin de Acme Corp no puede ver ni tocar datos de Brand Nova — no es solo filtro en UI, es aislamiento estructural a nivel de base de datos.
- **Cola confiable con machine de estados:** `draft → scheduled → publishing → published | failed → retrying → dead`. El worker usa `FOR UPDATE SKIP LOCKED` para que múltiples instancias no dupliquen trabajos. Posts fallidos van a DLQ con contador de intentos y último error visible; el botón "Reintentar" los devuelve a la cola.
- **Sin perder posts:** la decisión de diseño más importante del proyecto (requisito explícito del cliente: "no podemos perder ninguna publicación programada"). El exponential backoff asegura que un fallo temporal no queme los reintentos de golpe.
- **Tres roles con RLS:** `admin` (CRUD), `member` (editor), `client_readonly` (solo lectura). El cliente no ve el botón "Nuevo post" ni puede llamar a la API — el bloqueo es en servidor, no en CSS.

---

## Stack y decisiones técnicas

| Capa | Decisión | Por qué |
|---|---|---|
| App | Next.js 15 (App Router, TypeScript) | SSR + API Routes en un solo repo; deploy gratuito en Vercel |
| Styling | Tailwind CSS, diseño propio | Free-first, control total de tokens; sin dependencia de Figma |
| Auth | Supabase Auth + middleware SSR | Sesión SSR sin JWT en cliente; redirección en edge |
| DB | Supabase Postgres + RLS | Schema-pooling (free tier); RLS como segunda capa de seguridad |
| Cola | Tabla Postgres + stored function | `FOR UPDATE SKIP LOCKED` = worker idempotente; sin Redis |
| Conectores | Simulados deterministas (IG/LI/FB) | Demo sin OAuth real; reemplazables 1:1 con `get-real` |
| Deploy | Vercel + GitHub Actions cron `*/5` | Gratuito; el cron dispara el worker y hace keep-alive de Supabase |

**Por qué Postgres como cola y no una queue externa:** para una agencia SMB con < 1000 posts/día, Postgres con `SKIP LOCKED` elimina una dependencia de infraestructura, mantiene el historial en la misma BD que los datos del negocio y simplifica el debugging (el DLQ es una query SELECT). Es la elección correcta para este alcance.

---

## Estructura del código

```
src/
├── app/
│   ├── login/              # Mock login con selector de roles
│   ├── app/[org]/
│   │   ├── calendario/     # Vista mes/semana con modal de detalle
│   │   ├── componer/       # Formulario multi-cuenta con validación
│   │   ├── cola/           # Tabla de cola con filtros y DLQ
│   │   ├── metricas/       # Panel por cuenta con empty state honesto
│   │   ├── cuentas/        # Cuentas conectadas + indicador sandbox
│   │   └── ajustes/        # Config de org (admin only)
│   └── api/
│       ├── posts/          # CRUD de posts con validación de permisos
│       ├── scheduled/[id]/retry/   # Retry de posts fallidos/muertos
│       ├── accounts/       # Listado de cuentas por org
│       └── queue/process/  # Worker endpoint (cron + demo manual)
├── components/
│   ├── layout/             # Sidebar, BrandSelector (con aria)
│   ├── calendar/           # CalendarView mes/semana
│   ├── composer/           # ComposerForm con char limits por red
│   ├── queue/              # QueueTable con filtros
│   └── ui/                 # StatusBadge, NetworkBadge
├── lib/
│   ├── supabase/           # client, server (SSR), worker clients + types
│   ├── connectors/         # base interface + IG/LI/FB sandbox
│   └── queue/              # worker.ts (claim_next_jobs + backoff)
└── middleware.ts            # Auth redirect + queue bypass
```

---

## Ejecutar en local

```bash
# 1. Clonar y entrar
git clone https://github.com/Articrafter93/cat-01-s02-social-scheduler
cd cat-01-s02-social-scheduler

# 2. Crear .env.local con valores de Supabase (ver QUE-FALTA.md)

# 3. Instalar y arrancar
npm install
npm run dev
# → http://localhost:3000
```

La BD ya tiene datos demo (migraciones aplicadas en Supabase). No hace falta ejecutar seeds manualmente para la demo.

---

## Tests

```bash
npm run type-check   # TypeScript strict — 0 errores
npm run lint         # ESLint next/core-web-vitals
npm run build        # Build de producción
```

Los tests de integración del worker de cola (idempotencia, backoff, transiciones de estado) son la pieza más crítica del proyecto: verifican el invariante "no se pierde ningún post".

---

## Lo que no está (y por qué)

- **OAuth real con Instagram/LinkedIn/Facebook:** requiere app reviews de las plataformas y tokens que caducan. Los conectores simulados demuestran la misma arquitectura; la sustitución es una implementación de interfaz, no un rediseño.
- **X/Twitter:** API de pago desde 2023. Fuera del alcance explícito del cliente.
- **Flujo de aprobación cliente:** funcionalidad COULD del contrato; no bloqueante para el MVP.

---

_Proyecto ficticio de portafolio — sandbox-first. Los datos son ficticios; las cuentas demo son de prueba; no habilita producción real._
