# DESCRIPCION DE PORTAFOLIO

**Proyecto:** Social Scheduler — Editorial calendar for agencies
**URL:** https://cat-01-s02-social-scheduler.vercel.app
**Estado:** sello-final-vigente
**Fecha:** 2026-07-03

## Resumen
Plataforma multi-tenant de planificacion y publicacion en redes sociales para agencias de marketing. Cada agencia gestiona varias marcas, programa posts a Instagram/LinkedIn/Facebook y sigue su publicacion desde un calendario editorial y una cola con reintentos automaticos. Demo de exhibicion con datos ficticios y cuentas sandbox.

## Que hace
- **Calendario editorial** por marca con posts programados (texto + imagen + red + fecha/hora en zona horaria).
- **Cola de publicacion / DLQ**: worker que reclama jobs vencidos, simula publicacion por conector, reintenta con backoff exponencial y aisla los muertos en una Dead Letter Queue.
- **Metricas** por cuenta (alcance, impresiones, interacciones) con empty states honestos.
- **Roles**: admin de agencia, editor y cliente read-only, con aislamiento estricto entre marcas y permisos aplicados en UI, ruta y API (403 real).

## Como lo hace
Arquitectura full-stack en Next.js (App Router, Server Components + Route Handlers). Supabase provee Postgres + Auth + Storage, con RLS por organizacion y un schema dedicado (schema-pooling). El worker de cola se dispara por un cron (GitHub Actions) contra un endpoint protegido; los conectores de red son deterministas y sandbox (sin conexion a redes reales). Subida de imagenes a Supabase Storage con validacion de pertenencia org-scoped. Fechas fijadas a zona horaria para render SSR/CSR consistente.

## Herramientas y frameworks
- Next.js 15 (App Router, TypeScript) + Tailwind CSS
- Supabase (Postgres, Auth, Storage, RLS)
- Vitest (suite de tests: backoff, boundary multi-tenant, determinismo de conectores)
- GitHub Actions (cron del worker + keep-alive) · Vercel para despliegue y verificacion publica

## Evidencia
- Sello final: `SELLO DE APROBACION FINAL.md`
- Commit desplegado: `ead6926`
- Deployment: https://cat-01-s02-social-scheduler-qfy1poxwv-articrafter93s-projects.vercel.app
