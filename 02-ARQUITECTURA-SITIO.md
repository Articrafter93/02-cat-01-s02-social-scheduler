# 02 — Arquitectura del Sitio · Rutas y navegación

> App Next.js (App Router). Todo lo autenticado vive bajo `/app/[org]`, donde `[org]` es el slug de la marca activa (multi-tenant en la URL). Chrome compartido con selector de marca + logout persistente en todas las vistas autenticadas.

## Mapa de rutas

| Ruta | Acceso | Propósito |
|---|---|---|
| `/` | público | Redirige a `/login` (o a la marca activa si hay sesión) |
| `/login` | público | **Login mock**: selector de cuentas demo (admin / member / client_readonly), contraseña demo prellenada. Bloqueado en producción. |
| `/app` | autenticado | Redirige a la última marca o a un selector si el usuario tiene varias |
| `/app/[org]/calendario` | admin, member, client_readonly | Calendario mes/semana con posts por estado (color+icono+etiqueta). Pantalla central. |
| `/app/[org]/componer` | admin, member | Compositor: texto + imagen, preview por red, validación de límites, programar (fecha/hora/zona). |
| `/app/[org]/cuentas` | admin, member | Gestión de cuentas conectadas (IG/LI/FB sandbox): conectar/desconectar, estado. |
| `/app/[org]/metricas` | admin, member, client_readonly | Panel de métricas básicas por cuenta + empty state. |
| `/app/[org]/cola` | admin, member | Estado de la cola + **DLQ**: posts fallidos con motivo y reintento manual; acción "Procesar cola ahora". |
| `/app/[org]/ajustes` | admin | Marca, timezone, miembros, roles. |

## Navegación

- **Selector de marca** en el chrome: cambia `[org]` y recarga el contexto. Nunca muestra datos de otra marca (RLS).
- **Back-to-home:** logo enlaza a `/app/[org]/calendario` desde cualquier subvista.
- **Logout** visible y persistente en el chrome → termina sesión → `/login` (permite re-ingreso multi-rol sin limpiar cookies).
- **Cliente (solo lectura):** ve `calendario` y `metricas` de su marca; controles de mutación ocultos/deshabilitados; sin acceso a `componer`/`cuentas`/`cola`/`ajustes`.

## API routes (internas)

| Endpoint | Método | Propósito |
|---|---|---|
| `/api/queue/process` | POST | Worker idempotente: reclama jobs vencidos, publica (conector), reintenta/DLQ. Lo invoca el cron y el botón "Procesar cola ahora". Rate-limited + token de cron. |
| `/api/posts` | POST | Crear post + programar (valida límites por red, fecha futura). |
| `/api/scheduled/[id]/retry` | POST | Reintento manual de un job en DLQ. |
| `/api/accounts` | POST/DELETE | Conectar/desconectar cuenta sandbox. |

## SEO / metadata
App privada autenticada → `noindex` salvo `/login`. Sin sitemap público (no aplica para SaaS interno).
