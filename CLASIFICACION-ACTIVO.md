# CLASIFICACIÓN DE ACTIVO — Programador de Redes Sociales

> **Fuente oficial:** `doctrina/neuronas/00-TAXONOMIA-ACTIVOS-DIGITALES.md` (20 categorías oficiales).
> **Para qué sirve:** la categoría del activo determina los perfiles `revision-final`, los controles de GATE 9 y los protocolos de seguridad que aplican a TODO el proyecto.
> **Este es el hogar canónico** del bloque de metadata de clasificación. `00-ARQUITECTURA-PROYECTO.md` solo lo referencia; no lo duplica.

---

## Ciclo de vida del artefacto

| Etapa | Paso del Playbook | `estado_clasificacion` | Confianza esperada |
|---|---|---|---|
| Provisional | Paso 0.5 (Scaffold) | `provisional` | `baja` |
| Confirmada | Paso 1 — GATE 1 | `confirmada` | `media` o `alta` |
| Final | Paso 3 — GATE 3 | `final` | `alta` |

**Regla bloqueante:** no se autoriza cierre, deploy, publicación ni entrega con `estado_clasificacion` distinto de `final` o con `confianza_clasificacion: baja`.

---

## Estado de la clasificación

- **Estado:** `final`
- **Última actualización:** 2026-06-25 — Paso 3 (Arquitectura, GATE 3)

---

## Metadata oficial (bloque obligatorio)

```yaml
categoria_activo_primaria: "04-Aplicaciones-web-empresariales"
categorias_activo_secundarias: ["05-Integraciones-APIs", "01-Automatizaciones-operativas"]
renderizable: "SI"   # UI web (dashboard SaaS) → VFH via rend + inspeccion visual
superficies_detectadas:
  - "ui_web"
  - "auth"
  - "db"
  - "api"
  - "public_api"
  - "rate_limiting"
  - "automation"
  - "storage"
  - "observability"
  - "error_tracking"
  - "availability_recovery"
  - "cost_sensitive"
confianza_clasificacion: "alta"
evidencia_clasificacion: ["BRIEF.md", "comunicacion-cliente/2026-06-25-01-correo-corporativo-inicial.md"]
revision_final_perfiles_requeridos: ["core", "04", "05", "01"]
estado_clasificacion: "final"
```

---

## Justificación de la clasificación

**Primaria `04 — Aplicaciones web empresariales`:** SaaS multi-tenant con autenticación, roles, dashboard operativo y persistencia. El corazón del producto (gestión multi-marca, calendario editorial, panel de métricas) es una aplicación web empresarial de uso diario por un equipo. Evidencia: BRIEF.md y correo corporativo §1/§5.

**Secundaria `05 — Integraciones APIs`:** el producto se define por su conexión a redes (Instagram/LinkedIn/Facebook) vía conectores. En esta demo los conectores son **simulados/sandbox deterministas** (decisión de Plan Mode), pero la superficie de integración (interfaz común, manejo de credenciales, rate limits) es real en el diseño.

**Secundaria `01 — Automatizaciones operativas`:** la cola de publicación programada con reintentos, backoff y dead-letter es una automatización: jobs disparados por cron que se ejecutan sin intervención humana. Es el requisito rector ("no perder publicaciones").

---

## Implicaciones de seguridad y protocolos

- **`auth` + multi-tenant:** RLS por `organization_id` en Postgres (Supabase). Aislamiento estructural, no solo de UI. Prueba de no-fuga cruzada obligatoria en GATE 9. Login mock no productivo bloqueado en producción.
- **`api`/`public_api`:** endpoints de mutación y de procesamiento de cola protegidos por auth + membresía + rol + RLS. **`rate_limiting` NO implementado en el MVP sandbox** (diseño lo contempla; riesgo bajo por ser todo auth-gated); se añadiría en `get-real` antes de tráfico real. Los conectores respetan rate limits del lado de las redes (simulado en sandbox).
- **`automation`:** cola con idempotencia, reintentos con backoff y DLQ; el worker reclama jobs con lock por fila (sin doble publicación).
- **`storage`:** media de posts en Supabase Storage con políticas por org.
- **`cost_sensitive`:** free-tier estricto; Supabase con schema-pooling + keep-alive obligatorio (regla de portafolio) para evitar pausa por inactividad.
- **Secretos:** zero-knowledge; tokens/keys nunca en cliente ni hardcodeados; contraseña demo es dato sandbox (excepción legítima), login bloqueado en prod.

---

## Historial de cambios de clasificación

| Fecha | Paso | Cambio | Motivo |
|---|---|---|---|
| 2026-06-25 | Paso 0.5 | Clasificación provisional creada | Derivada del brief inicial |
| 2026-06-25 | Paso 3 | Finalizada: `04` primaria + `05`/`01` secundarias, `final`/`alta` | Contrato firmado + stack decidido en Plan Mode |
