# Herramientas Externas — Programador de Redes Sociales

> Manifiesto **editable** de herramientas externas. PROVISIONAL en Plan Mode/Paso 3, CONFIRMADO en GATE 3, vivo durante construcción.
> **Seguridad:** sin secretos; solo metadata no sensible (nombres, rubro, estado, variables sin valores). Estado determinado presence/availability-only, nunca leyendo `.env*`.

## Fuentes que referencia (no duplica)
- Registro global: `doctrina/REGISTRO-HERRAMIENTAS-EXTERNAS.md`.
- Proveedores backend por rubro: `MATRIZ-BACKEND.md`.
- MCPs/connectors = entorno, no proyecto.

## Leyenda de estado
`disponible` · `requiere-auth` · `no-integrado` · `faltante` · `bloqueado` · `no-aplica`

## Manifiesto

| Herramienta | Rubro | Propósito en el proyecto | Fase/Gate | Estado | Superficie sensible | Fallback | Recurso (no secreto) |
|---|---|---|---|---|---|---|---|
| Supabase | db/auth/storage | Postgres + Auth + RLS multi-tenant + Storage de media; schema dedicado `cat01s02_scheduler` + keep-alive | Paso 5 / GATE 5 | requiere-auth | PII sandbox, RLS, tokens | Postgres local en dev | MCP supabase / dashboard |
| Vercel | hosting/deploy | Deploy del Next.js + CDN + cron (eval); auto-deploy desde GitHub | Paso 9 / GATE 9 | requiere-auth | env vars de prod | build local | MCP vercel |
| GitHub | repo/CI | Repo `private` (via `ghnew`) + GitHub Action cron `*/5` (sweep cola + keep-alive Supabase) | Paso 3 / GATE 3 | disponible | secrets de repo | — | `gh` CLI autenticado (Articrafter93) |
| frontend-design (+ theme-factory, shadcn-ui) | diseño | Materializar la dirección visual "sala de control editorial" (Paso 4), code-first y gratis | Paso 4 / GATE 4 | disponible | — | — | skills del workspace |
| Figma | diseño | — | — | no-aplica | — | `frontend-design` (code-first) | descartado: API/Dev Mode de pago, no aplica a free-tier |
| Playwright | testing | e2e del flujo crítico programar→procesar→publicado/fallido + inspección visual | Paso 7 / GATE 7 | requiere-install | — | — | MCP playwright / Install Mode |
| Conectores IG/LI/FB | integraciones | **Simulados/sandbox deterministas** (sin OAuth real) | Paso 6 / GATE 6 | no-aplica (real) | — | son el fallback (mock) | código propio |

## Gate de disponibilidad (checklist re-ejecutable)
- [x] Toda herramienta del plan está listada con su `Estado`.
- [ ] Supabase/Vercel/Playwright pasan de `requiere-auth`/`requiere-install` a `disponible` en su gate (abrir `asesor` + Install Mode/Zero-Knowledge cuando toque; sin leer secretos).
- [x] Capa visual: `frontend-design` + `diseño` (code-first, gratis) disponible; Figma descartado (pago).
- [ ] Ninguna herramienta requerida queda `faltante`/`bloqueado` sin entrada en `QUE-FALTA.md`.
- [x] Conectores reales descartados explícitamente (`no-aplica`): la demo usa simulados (decisión de Plan Mode).
