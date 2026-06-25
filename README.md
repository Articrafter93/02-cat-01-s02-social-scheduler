# Programador de Redes Sociales

> **Estado actual:** `EN CONSTRUCCION` | **Fase:** Paso 3 — Arquitectura (GATE 3)

## Descripción ejecutiva

SaaS multi-tenant para una agencia de marketing que gestiona las redes sociales de **múltiples marcas**. Permite programar, publicar y monitorear publicaciones en Instagram, LinkedIn y Facebook desde un calendario editorial, con cada marca estrictamente aislada, una cola de publicación confiable (no se pierde ningún post programado) y métricas básicas por cuenta.

## Cliente

- **Tipo:** `Ficticio`
- **Modo ficticio:** `Portafolio funcional sandbox-first`
- **Nombre:** Agencia de Marketing Digital (cliente hipotético: "Andrés")
- **Industria:** Marketing digital / gestión de redes sociales

## Clasificación de activo

> Detalle y ciclo de vida en [`CLASIFICACION-ACTIVO.md`](./CLASIFICACION-ACTIVO.md).

- **Categoría primaria:** `04 — Aplicaciones web empresariales`
- **Secundarias:** `05 — Integraciones APIs`, `01 — Automatizaciones operativas`
- **Estado:** `final`

## Stack tecnológico

Next.js 15 (App Router, TypeScript) · Tailwind CSS + shadcn/ui · Supabase (Postgres + Auth + RLS) · cola Postgres + worker + GitHub Action cron · Vercel. Conectores a redes **simulados/sandbox deterministas** (sin OAuth real). Detalle: [`00-ARQUITECTURA-PROYECTO.md`](./00-ARQUITECTURA-PROYECTO.md).

## URLs del proyecto

- **Producción:** — (se define en deploy, GATE 9)
- **Preview:** —
- **Repositorio:** — (repo `private` nuevo via `ghnew`, Gate de Versionado Inicial)

## Documentación clave

- [`BRIEF.md`](./BRIEF.md) — Brief inicial del cliente
- [`comunicacion-cliente/2026-06-25-01-correo-corporativo-inicial.md`](./comunicacion-cliente/2026-06-25-01-correo-corporativo-inicial.md) — Contrato vinculante (fuente de verdad del cliente)
- [`CLASIFICACION-ACTIVO.md`](./CLASIFICACION-ACTIVO.md) — Clasificación del activo y protocolos de seguridad
- [`00-ARQUITECTURA-PROYECTO.md`](./00-ARQUITECTURA-PROYECTO.md) · [`02-ARQUITECTURA-SITIO.md`](./02-ARQUITECTURA-SITIO.md) — Arquitectura y rutas
- [`PLAN.md`](./PLAN.md) — Plan ejecutivo + Matriz Producción Full-Stack
- [`MATRIZ-BACKEND.md`](./MATRIZ-BACKEND.md) · [`HERRAMIENTAS-EXTERNAS.md`](./HERRAMIENTAS-EXTERNAS.md) — Backend por rubro y herramientas
- [`QUE-FALTA.md`](./QUE-FALTA.md) — Save State y punto de retoma

## Notas

Proyecto de portafolio: el cierre (`revision-final` + Cliente Exigente Modo B + reclutador-exigente + VFH) valida exhibición pública con datos ficticios y cuentas sandbox; no habilita producción real ni claims de compliance. X/Twitter quedó fuera del MVP (API de pago).
