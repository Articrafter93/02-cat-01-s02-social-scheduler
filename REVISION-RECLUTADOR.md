# REVISION-RECLUTADOR — Programador de Redes Sociales

**Fecha:** 2026-07-03 (re-evaluación tras remediación)
**Aplicabilidad:** APLICA (portafolio: `tipo_cliente: ficticio` bajo `programa-portafolio-60`)
**Resultado:** `APTO_PORTAFOLIO`

> Homólogo técnico de `cliente-exigente`. Mide destreza demostrable ante un reclutador. La primera evaluación devolvió `NO_APTO_PORTAFOLIO` por 4 cabos sueltos; todos remediados en esta sesión.

## Checklist por capa

### Capa 1 — Primera impresión (README recruiter-facing)
- [x] Abre con el dominio/problema (agencia multi-marca), no con el stack ni con setup.
- [x] Stack con *por qué* por tecnología (tabla + "Why Postgres as the queue").
- [x] Quick start ≤2 comandos ejecutables (`npm install` / `npm run dev`).
- [x] Credenciales demo visibles y usables (tabla de roles).
- [x] Login mock sin fricción: selector de roles + contraseña prellenada + logout persistente (VFH #1/#8).
- [x] Sin jerga interna ni meta-etiqueta de "proyecto de portafolio" (removidas de README y `ajustes`). Divulgación honesta de sandbox conservada, reformulada en inglés.
- [x] Coherencia nombre↔contenido: el README scope-a con honestidad las capas simuladas (conectores sandbox, OAuth diferido, rate limiting diferido).
- [x] **Idioma inglés** en toda la superficie recruiter-facing: README, UI/copy, comentarios e identificadores de código, datos demo visibles, nombre. (Route folders `calendario`/`componer` quedan en español como paths de URL, documentado en el README; los 2 commits iniciales son en español — commits siguientes en inglés.)
- [x] ≥2-3 decisiones técnicas no obvias explicadas (Postgres-as-queue, RLS estructural, backoff, conectores desacoplados).

### Capa 2 — Honestidad de los tests
- [x] Asserts verifican reglas del negocio/servicio, no valores del mock (backoff exponencial, boundary multi-tenant de media, determinismo de conectores).
- [x] Nombres de tests describen comportamiento.
- [x] Existe test que fallaría si la lógica se rompe (backoff lineal, cross-tenant image, conector no determinista).
- [x] Los tests capturan lo que el servicio calcula.

### Capa 3 — Profundidad y comentarios
- [x] Decisiones no obvias con comentario del *por qué* (media boundary, guard de demo, backoff, RLS).
- [x] Afirmaciones del README implementadas y verificables (RBAC/RLS, idempotencia, audit trail, **tests reales**).
- [x] Control de acceso en frontera real (middleware/servidor + RLS), verificado (API 403 VFH #5).
- [x] Dependencias justificadas (sin bloat).

### Capa 4 — Red flags
- [x] Sin `console.log`/debug en producción · sin secretos hardcodeados · sin `.env` versionado · rutas protegidas realmente bloqueadas (VFH #5) · sin 500 en flujo principal · sin TODO/FIXME/HACK.

## Remediación aplicada (vs. NO_APTO previo)
1. **Idioma → inglés** en README, UI/copy, comentarios/identificadores, datos demo, nombre.
2. **Meta-etiquetas** "Proyecto ficticio de portafolio" / "Portafolio demo" removidas.
3. **Tests reales**: suite Vitest de 12 tests (backoff, boundary de media multi-tenant, determinismo de conectores) — `npm run test` verde.
4. **README §Tests** ahora honesto (los tests existen y describen qué cubren).

## Veredicto

`APTO_PORTAFOLIO` — satisface la 6.ª condición del `SELLO DE APROBACION PARCIAL` para portafolio.
