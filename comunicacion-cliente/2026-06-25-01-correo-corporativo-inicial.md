# Correo Corporativo Inicial — Programador de Redes Sociales

> **Generado por:** Skill `/cliente-exigente` Modo A
> **Fecha:** 2026-06-25
> **Tipo de cliente:** `ficticio`
> **Modo ficticio:** `portafolio funcional sandbox-first`
> **Estado:** `CONTRATO VINCULANTE — fuente de verdad del cliente`

---

Estimado equipo de desarrollo:

He revisado con detenimiento el brief de Andrés (agencia de marketing que gestiona redes de múltiples marcas). El problema de negocio es claro y serio: hoy dependen de herramientas de terceros caras y rígidas, y necesitan una **plataforma propia, multi-marca, en la que no se pierda ni una sola publicación programada y en la que las marcas jamás se mezclen entre sí**. Asumo la voz del cliente y elevo el brief a requisitos verificables. Lo que sigue es vinculante: cualquier desviación se registra como nota de cambio numerada en `comunicacion-cliente/` antes de implementarse.

---

## §1. Objetivos y Requisitos

### Objetivo de negocio
Plataforma SaaS multi-tenant donde una agencia y su equipo **programan, publican y monitorean** publicaciones en redes sociales para **múltiples marcas/clientes**, cada una aislada, con su propio calendario, cuentas conectadas y acceso de solo lectura para el cliente final.

### Requisitos funcionales (no negociables)
1. **Gestión multi-marca (workspaces/tenants):** crear y administrar varias marcas. Toda la data (posts, cuentas, métricas, miembros) está **estrictamente segmentada por marca**. Cambiar de marca cambia todo el contexto visible.
2. **Calendario visual editorial:** vistas mes y semana con todas las publicaciones programadas/publicadas/fallidas, diferenciadas por estado y por red. Es la pantalla central del producto.
3. **Editor/compositor de posts:** texto + imagen, con **previsualización por red**, conteo de caracteres y validación de límites por red (Instagram/LinkedIn/Facebook).
4. **Programación por fecha, hora y zona horaria** definida por marca. La hora mostrada y la de ejecución deben ser coherentes y explícitas (evitar el clásico bug de timezone).
5. **Motor de cola de publicación confiable:** idempotencia, reintentos con backoff y **dead-letter** para fallos persistentes. *"No se pierde ninguna publicación programada"* es el requisito rector del proyecto y se valida funcionalmente.
6. **Estados de publicación visibles:** `borrador → programado → publicando → publicado | fallido | reintentando`. Cada transición es visible en UI.
7. **Alertas de fallo/retraso:** cuando una publicación falla o se retrasa, el sistema lo señala de forma visible (y registra el motivo).
8. **Gestión de cuentas conectadas por marca:** conectar/desconectar cuentas de Instagram, LinkedIn y Facebook (en **modo desarrollo/sandbox** para esta demo de portafolio).
9. **Panel de métricas básicas por cuenta:** alcance/engagement básicos por cuenta y por marca, con estado vacío honesto cuando no hay datos.
10. **Roles y accesos:** mínimo tres roles — **Administrador de agencia**, **Miembro del equipo** y **Cliente (solo lectura)** acotado a su propia marca.

### Requisitos no funcionales
- **Aislamiento multi-tenant** garantizado a nivel de datos (no solo de UI).
- **Confiabilidad** de la cola por encima de todo lo demás.
- **Observabilidad mínima:** log/auditoría de intentos de publicación consultable.
- **Coste cero de operación** (portafolio): solo free-tier / sandbox; sin dependencias de pago obligatorio.
- **Login bloqueado en producción** salvo el acceso demo no productivo (ver §5).

### Suficiencia del Brief por Categoría

**Resultado:** `COMPLETADO_POR_CLIENTE_EXIGENTE`

El brief define con solvencia objetivo, audiencia, propuesta de valor, funcionalidad mínima, tono visual, integraciones y el criterio de éxito rector. Como Cliente Exigente, completo los siguientes **vacíos críticos** y los declaro requisitos vinculantes del contrato y del `PLAN.md` (por ser `tipo_cliente: ficticio`):

| Vacío en el brief | Requisito vinculante incorporado |
|---|---|
| No especifica mecanismo de aislamiento | Aislamiento por tenant a nivel de datos (scoping obligatorio en cada consulta; sin fuga cruzada) |
| No define autenticación ni acceso demo | Auth con roles + **login mock sin fricción para reclutadores** (ver §5/§6): selector de cuentas demo, contraseña demo prellenada, logout visible y persistente |
| No define estrategia de datos | Datos **ficticios/seed** representativos (varias marcas, posts en distintos estados, métricas de ejemplo) |
| No detalla manejo de timezone | Zona horaria por marca, con hora local y hora de ejecución explícitas |
| No menciona estados vacíos/errores | Empty states y validaciones guiadas obligatorias (calendario vacío, sin métricas, entrada inválida) |
| No define "publicación" en sandbox | En esta demo, "publicar" simula el envío vía conectores en modo desarrollo; el ciclo de estados y la cola son reales aunque la entrega sea sandbox |

### Gap de Producto por Categoría

Categoría primaria **04 (Aplicaciones web empresariales)** + secundarias **05 (Integraciones APIs)** y **01 (Automatizaciones operativas)**. Por ser proyecto ficticio, **todo `MUST` entra automáticamente al contrato y al `PLAN.md`** (no requiere confirmación testimonial):

**MUST (vinculantes):**
- M1. Autenticación + control de acceso por rol (admin / miembro / cliente-solo-lectura) con login mock de portafolio.
- M2. Aislamiento multi-marca a nivel de datos, con prueba de no-fuga cruzada.
- M3. Calendario visual (mes/semana) con estados por color+icono+etiqueta.
- M4. Compositor de posts con preview por red y validación de límites.
- M5. Programación con timezone por marca + cola con idempotencia y reintentos (no perder posts).
- M6. Estados de publicación + alertas de fallo/retraso con motivo.
- M7. Gestión de cuentas conectadas por marca (sandbox IG/LI/FB).
- M8. Panel de métricas básicas por cuenta con estado vacío.
- M9. Empty states + manejo de entrada inválida (fool-proof mínimo).
- M10. Logout visible y persistente + re-ingreso multi-rol.

**SHOULD (fuerte mejora, diferible con razón):**
- S1. Biblioteca de medios por marca.
- S2. Notificación por email ante fallo de publicación.
- S3. Vista de auditoría/DLQ de intentos fallidos.

**COULD (fuera de alcance base salvo aprobación posterior):**
- C1. Flujo de aprobación del cliente antes de publicar.
- C2. Programación masiva / importación de calendario.
- C3. Sugerencias de copy asistidas (queda fuera: la categoría no contempla IA en MVP).

---

## §2. Experiencia de Usuario (UX)

**Audiencia:** operadores de agencia (uso intensivo diario) + clientes finales (consulta ocasional, solo lectura). La interfaz debe sentirse de **herramienta enterprise seria y confiable**, ordenada y clara, sin ruido.

**Flujos críticos:**
1. Login demo → dashboard de la marca activa.
2. Conmutar marca → todo el contexto cambia, sin contaminación.
3. Componer post → previsualizar por red → programar (fecha/hora/zona) → verlo en calendario.
4. Monitorear estados → detectar un fallo → ver motivo → reintentar.
5. Cliente entra en solo lectura → ve estado de sus publicaciones, no puede editar.

**Dirección visual propuesta** (el brief pide "serio, profesional, enterprise, confiable", sin más detalle → la concreto):
- **Concepto rector:** *"Sala de control editorial"* — calma operativa, densidad informativa legible, foco en estado y control.
- **Paleta orientativa:** base neutra fría (slate/navy profundo + blancos/grises), un acento corporativo sobrio (índigo/azul) y **colores semánticos de estado**: verde=publicado, ámbar=programado/reintentando, rojo=fallido, gris=borrador. El color nunca es el único portador de significado (siempre color+icono+etiqueta, por accesibilidad).
- **Tipografía:** grotesca sans legible y técnica (p. ej. Inter/Geist); jerarquía clara; números tabulares para horarios/métricas.
- **Composición:** layout de paneles/tarjetas; calendario como pieza central; barra de marca activa siempre visible; densidad alta pero con respiro.
- **Tono de interfaz y microcopy:** preciso, sobrio, confiable; mensajes de error guiados y accionables.
- **Materialización:** la dirección visual aprobada debe concretarse vía **Figma MCP** durante el desarrollo visual, sujeto a `asesor`, permisos reales del entorno y reglas free/pago según tipo de cliente. Hard blockers `DIRECCION-VISUAL.md` e `INSPECCION-VISUAL.md` aplican (renderizable: SÍ).

---

## §3. Arquitectura y Stack

El cliente **no definió stack**. Conforme a la doctrina, los `9-agentes` deciden el stack más eficiente en Plan Mode/Paso 3 con justificación; aquí dejo **restricciones de arquitectura vinculantes**, no la elección final:

- **Multi-tenant primero:** el modelo de datos debe imponer el scoping por marca de forma estructural (no confiar solo en filtros de UI). Si se usa Postgres/Supabase, RLS por tenant.
- **Cola/scheduler real:** debe existir un componente de programación con reintentos e idempotencia (no un `setTimeout` ingenuo). Persistencia del estado de cada job.
- **Conectores aislados por red** (IG/LI/FB) tras una interfaz común, en **modo desarrollo/sandbox**; tokens vía zero-knowledge (nunca en cliente, nunca hardcodeados).
- **Base de datos para ficticio:** si se usa Supabase free, aplica la regla de **schema-pooling + keep-alive obligatorio** (cron que evita la pausa por inactividad), requisito de admisión a portafolio.
- **Free-tier estricto:** sin dependencias de pago obligatorio. X/Twitter queda **fuera de alcance** (API de pago; documentado en el brief).
- **Login demo bloqueado en producción** (`NODE_ENV`/equivalente); contraseña demo es dato sandbox, excepción legítima a "sin credenciales hardcodeadas".

La `MATRIZ PRODUCCION FULL-STACK` debe cerrarse en GATE 3 declarando cada capa (`auth`, `db`, `storage`, `api/public_api`, `automation`, `rate_limiting`, `observability`, `error_tracking`, `availability_recovery`, `cost_sensitive`) como `APLICA`/`NO APLICA`/`BLOQUEADO` con razón.

---

## §4. Calidad, Riesgos y Entregables

**Criterios de calidad (cero tolerancia):** cero errores de build/lint/test, cero warnings activos, cero `TODO/FIXME` sin ticket, cero textos de muestra (`mock`, `placeholder`, `lorem`, notas de desarrollador) visibles al usuario final.

**Riesgos principales y controles exigidos:**
- **Fuga entre marcas (riesgo #1):** prueba explícita de no-fuga cruzada en GATE 9. Un solo dato de otra marca visible = bloqueo.
- **Pérdida de publicaciones (riesgo #2):** prueba funcional de la cola (programar → ejecutar → estado final correcto; fallo → reintento/DLQ visible).
- **Manejo de tokens de redes:** sandbox/dev-mode, almacenamiento seguro, nunca expuestos.
- **Timezone:** prueba de coherencia hora local vs ejecución.

**Entregables:** aplicación funcional renderizable + datos seed + `revision-final` aprobado + Cliente Exigente Modo B `EXITO TOTAL` + (portafolio) `reclutador-exigente` `APTO_PORTAFOLIO` + VFH humana sobre la lista §6.

**Auditoría final:** este activo es renderizable; la VFH se ejercerá vía `rend` (localhost + navegador) e inspección visual, contra la lista §6.

---

## §5. Clasificación de Activo e Implicaciones de Seguridad

- **Categoría primaria:** `04 — Aplicaciones web empresariales`.
- **Secundarias:** `05 — Integraciones APIs`, `01 — Automatizaciones operativas`.
- **Renderizable:** `SI` → VFH vía `rend` + inspección visual.
- **Superficies:** `ui_web`, `auth`, `db`, `api`, `public_api`, `rate_limiting`, `automation`, `storage`, `observability`, `error_tracking`, `availability_recovery`, `cost_sensitive`.
- **Perfiles `revision-final`:** `core`, `04`, `05`, `01`.

**Implicaciones de seguridad activadas:**
- Aislamiento multi-tenant (RLS/scoping) + prueba de no-fuga.
- Tokens OAuth de redes en sandbox, zero-knowledge.
- Confiabilidad de cola (idempotencia/reintentos/DLQ).
- Respeto de rate limits de las APIs sociales.
- **Login mock no productivo** (regla de portafolio): selector de cuentas demo desplegable, contraseña demo prellenada, **logout visible y persistente** para re-ingresar con otro rol; bloqueado en producción.

Cualquier ajuste de categoría al formalizar este contrato se refleja en `CLASIFICACION-ACTIVO.md`.

---

## §6. Pruebas de Aceptación del Tester Humano (lista VFH)

Estas 8 acciones son la **fuente única del checklist de la VFH** y deben poder completarse en el activo terminado para aprobar el `SELLO DE APROBACION PARCIAL.md`. Evidencia: `sandbox`/`mock`/`demo visual`.

| # | Acción del tester | Resultado observable | Dato/condición inicial | Aprueba / Falla |
|---|---|---|---|---|
| 1 | Abrir `/login`, desplegar el selector de cuentas demo, elegir **"Administrador de agencia"** (contraseña prellenada) y entrar | Aterriza en el dashboard de la marca activa | Acceso demo habilitado (no productivo) | Aprueba si entra sin fricción; falla si exige credenciales manuales |
| 2 | Conmutar de marca (seleccionar otra marca) | Calendario, cuentas y métricas cambian; **no** aparece ningún post/cuenta de otra marca | ≥2 marcas con datos seed distintos | Aprueba si el aislamiento es total; falla ante cualquier dato cruzado |
| 3 | Crear un post: texto + imagen, elegir Instagram, fecha/hora en una zona horaria, y **programar** | El post aparece en el calendario en estado **"Programado"**, en la fecha/hora correctas | Marca activa con una cuenta IG sandbox conectada | Aprueba si queda programado y visible; falla si no persiste o la hora es inconsistente |
| 4 | Abrir un post en estado **"Fallido"** y revisar la alerta | Se ve la alerta de fallo con **motivo** y opción de **reintentar** | Seed con ≥1 publicación fallida | Aprueba si el motivo y el reintento están presentes; falla si el fallo es silencioso |
| 5 | Cerrar sesión y entrar como **"Cliente (solo lectura)"** de una marca | Puede **ver** calendario/estado de su marca; **no** puede editar/programar (controles ocultos o deshabilitados) | Cuenta demo de cliente acotada a una marca | Aprueba si es estrictamente solo lectura; falla si puede mutar algo |
| 6 | Abrir el **panel de métricas** de una cuenta | Se ven métricas básicas; con una cuenta sin datos, se ve un **estado vacío** honesto | Una cuenta con métricas seed y otra sin datos | Aprueba si muestra métricas y empty state; falla si rompe o muestra datos falsos sin marcar |
| 7 | Intentar una acción inválida: programar en el **pasado** o con **texto vacío** | Validación guiada impide la acción y explica por qué | Compositor abierto | Aprueba si previene el error con mensaje claro; falla si lo permite o rompe |
| 8 | Usar el **logout** persistente y re-ingresar con un **rol distinto** | La sesión termina, vuelve a `/login` y permite entrar con otro rol sin limpiar cookies | Sesión activa | Aprueba si el re-ingreso multi-rol es fluido; falla si no hay logout visible |

---

**Firmado y aceptado como contrato vinculante:** `Sí`

Atentamente,
**Cliente Exigente — Antigravity Projects**
2026-06-25
