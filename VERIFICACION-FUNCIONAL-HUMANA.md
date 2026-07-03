# VERIFICACION-FUNCIONAL-HUMANA — Programador de Redes Sociales

> **Gate VFH (hard blocker de `SELLO PARCIAL`).** El agente conduce la verificación en navegador y produce evidencia; **solo la frase literal del developer aprueba**. No autoemitida.

---

## Verificacion para SELLO PARCIAL (comportamiento real local)

- **Fecha de conducción:** 2026-07-03
- **Estado:** `APROBADO` (conducido por el agente; firmado por el developer 2026-07-03)
- **Alcance verificado:** local / `localhost:3000` (Next.js 15.5.19, Supabase `vzhgrplpwpfcsrbckdkm`, schema `cat01s02_scheduler`)
- **SEGOP:** `N/A-renderizable`
- **renderizable:** SI → VFH conducida con Playwright (clic real + aserción + screenshot por ítem)

### Re-verificación sobre UI en inglés (2026-07-03)
Tras la remediación de portafolio (traducción integral a inglés + suite de tests), la app se re-verificó en el navegador: las 8 pruebas §6 se sostienen (la lógica no cambió, solo los textos), la UI renderiza correctamente en inglés en todas las pantallas, `anySpanishLeak: false` en calendar/queue/metrics. Evidencia inglés: `reports/vfh/en-01-calendar-admin.png`, `en-02-composer.png`, `en-03-queue.png`, `en-04-metrics.png`. Build final `next build` 0/0; `npm run test` 12/12.

### Re-verificación post-rotación de secreto + fix de error de consola (2026-07-03)
Tras el incidente de seguridad (rotación del `service_role` de Supabase a la llave nueva `sb_secret_` en `.env.local`), la app se re-verificó en vivo sobre `localhost:3000` con la llave rotada: lecturas de datos OK (calendario Acme Corp poblado), y **`POST /api/queue/process → 200`** (único uso del `service_role`) confirmado dos veces, incluyendo tras eliminar la llave `default` comprometida — la rotación no rompió funcionalidad. RBAC re-ejercido en vivo: Cliente read-only con payload válido → **403** en `POST /api/posts`; `/componer` redirige; UI oculta Compose. Evidencia: `reports/vfh/vfh-live-01..05`. Además, aplicando la regla global nueva *"Errores sin tolerancia"*, se resolvió el `favicon.ico 404` de consola (antes descartado como "cosmético") creando `src/app/icon.svg`; consola final **0 errores / 0 warnings**.

### Contexto: bugs de infra corregidos durante la VFH
Build/lint/type-check verdes, pero la app no servía datos. La VFH destapó y corrigió: (1) entorno con URL Supabase de otro proyecto; (2) `auth.users` tokens NULL → login 500; (3) schema no expuesto en PostgREST → queries vacías; (4) demo congelada en junio (re-anclada a `now()`); (5) admin en 1 sola marca (añadida 2.ª). Detalle en `QUE-FALTA.md`.

### Lista de Aceptacion del Tester Humano ejercida en vivo (del §6 del correo corporativo)

| # | Accion del tester (§6) | Accion ejecutada en vivo | Resultado observado | Evidencia | ¿Completable? |
|---|---|---|---|---|---|
| 1 | Login demo Admin (selector, pass prellenada) | Selector demo → "Administrador de agencia" → Ingresar | Entra sin fricción → dashboard Acme Corp, calendario poblado, logout visible | `reports/vfh/01a-c` | SI |
| 2 | Conmutar de marca | Selector de marca Acme Corp → Brand Nova | Cambia URL/calendario/cuentas; Brand Nova muestra solo su post, **cero fuga** de Acme | `reports/vfh/02a-b` | SI |
| 3 | Componer post (texto+**imagen**+IG+fecha/hora/zona) → programar | Compositor: texto, **imagen subida a Storage**, IG, fecha/hora Bogotá | Queda "Programado"; tz correcto (Bogotá→UTC); imagen sube a Supabase Storage (path org-scoped, RLS) y **se muestra en el detalle**; visible en calendario/cola | `reports/vfh/03,03b,03c` | SI |
| 4 | Post fallido → alerta con motivo + reintentar | Cola/DLQ: post "Fallido" → botón Reintentar | Muestra motivo "Instagram API: rate limit (sandbox)"; retry → `Fallido→Programado`, `2/5→0/5`, error→— | `reports/vfh/04a-b` | SI |
| 5 | Cliente solo-lectura no puede editar/programar | Login como Cliente → intentar componer (UI + URL directa + API) | **3 capas**: UI oculta controles; compositor redirige; `POST /api/posts` → **403** | `reports/vfh/05` | SI |
| 6 | Panel de métricas (con y sin datos) | Métricas de Acme Corp (3 cuentas) | IG/LI: alcance/impresiones/interacciones + últimas 7; FB sin datos → **empty state honesto** | `reports/vfh/06` | SI |
| 7 | Accion invalida (pasado / vacío) | Compositor: texto vacío; luego fecha pasada | `required` bloquea vacío; fecha pasada → "La fecha... debe ser posterior a ahora" | `reports/vfh/07` | SI |
| 8 | Logout persistente + re-ingreso multi-rol | Cerrar sesión → re-login como otro rol | Logout → `/login`; re-login como Cliente sin limpiar cookies → aterriza en su marca | (flujo #5) | SI |

**Extra (riesgo #2 "no perder posts"):** "Procesar cola ahora" → `/api/queue/process` **200** (service_role válido); worker claima jobs vencidos; conectores deterministas (~85% éxito); fallos re-encolados con backoff (no se pierden).

### Confirmacion del developer

- **Frase literal del developer (copiada del chat):** "Excelente, hazlo todo y he aprobado la verificación final humana."
- **Confirmado por:** Fabian Cubillos (developer)
- **Resultado VFH local:** `APROBADO`

---

## Verificacion para SELLO FINAL (URL desplegada — la emite `vrc`)

- **Estado:** `PENDIENTE` (fuera de alcance del sello parcial)

---

## Notas
- Si la verificacion revela fallos funcionales, el sello queda bloqueado hasta corregir y re-verificar con nueva confirmación humana.
- Una confirmación `NO` invalida el sello asociado.
