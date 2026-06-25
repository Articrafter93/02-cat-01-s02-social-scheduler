# VERIFICACION-FUNCIONAL-HUMANA — [NOMBRE-PROYECTO]

> **Gate VFH (hard blocker de `SELLO PARCIAL` y `SELLO FINAL`).** Registra la confirmacion humana, expresa y directa del developer de que el activo funciona correctamente en la practica — no solo que pasan lint/build/tests/gates.
>
> El agente NO puede autoemitir, inferir ni dar por dada esta confirmacion a partir de tests verdes, gates aprobados, screenshots, logs ni output. Solo cuenta un mensaje directo del developer en el chat. Sin este archivo con confirmacion `SI`, los sellos quedan bloqueados.

---

## Verificacion para SELLO PARCIAL (comportamiento real local)

- **Fecha:** [YYYY-MM-DD]
- **Estado:** `PENDIENTE | CONFIRMADO | RECHAZADO`
- **Alcance verificado:** [local / `localhost:PUERTO`]
- **SEGOP (solo si `renderizable: NO`):** `OBTENIDA | NO_DISPONIBLE | N/A-renderizable` → ver `SEGOP.md`. Insumo que refuerza esta firma, no la reemplaza.

### Lista de Aceptacion del Tester Humano ejercida en vivo (del §6 del correo corporativo)

> Estas filas son la **lista de Pruebas de Aceptacion del Tester Humano del §6**, copiada verbatim (entre 5 y 10 acciones). Es el checklist que el agente **presenta al developer en el momento de la VFH**, antes de pedir su confirmacion. **Criterio de aprobacion: el developer confirma que las 5-10 acciones pueden completarse en la practica.** Una sola accion no completable bloquea el sello. Las filas 6-10 son opcionales hasta el maximo de 10.

| # | Accion del tester (§6) | Accion ejecutada en vivo | Resultado observado | Evidencia | ¿Completable? (SI/NO) |
|---|---|---|---|---|---|
| 1 | [accion] | [ejecucion] | [resultado real, no "tests pasan"] | [screenshot/log] | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |
| 6 | | | | | |
| 7 | | | | | |
| 8 | | | | | |
| 9 | | | | | |
| 10 | | | | | |

### Confirmacion del developer

- **Frase literal del developer (copiada del chat):** "[...]"
- **Confirmado por:** [developer]
- **Resultado VFH local:** `SI | NO`

---

## Verificacion para SELLO FINAL (URL desplegada — la emite `vrc`)

- **Fecha:** [YYYY-MM-DD]
- **Estado:** `PENDIENTE | CONFIRMADO | RECHAZADO`
- **URL desplegada verificada:** [https://...]

### Pruebas ejercidas sobre el activo publicado

| # | Prueba | Resultado observado en la URL desplegada | Evidencia |
|---|---|---|---|
| 1 | | | |
| 2 | | | |

### Confirmacion del developer

- **Frase literal del developer (copiada del chat):** "[...]"
- **Confirmado por:** [developer]
- **Resultado VFH desplegado:** `SI | NO`

---

## Notas

- Si la verificacion revela fallos funcionales, el sello correspondiente queda bloqueado hasta corregir y re-verificar con nueva confirmacion humana.
- Una confirmacion `NO` invalida el sello asociado; si ya existia, debe eliminarse fisicamente por cascada segun la regla canonica de sellos.
