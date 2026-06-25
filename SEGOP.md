# SEGOP — Segunda Opinion (verificacion independiente) — [NOMBRE-PROYECTO]

> **Solo para activos no renderizables (`renderizable: NO`).** Insumo de evidencia previo a la VFH:
> una segunda opinion de un modelo/IDE capaz **distinto del que construyo el activo**, enfocada en
> correctitud de codigo, cobertura del §6 y cumplimiento del contrato.
>
> **La SEGOP NO reemplaza la firma humana de la VFH** — la fortalece. El developer sigue firmando.
> **Limite honesto:** el verificador puede no ejecutar el codigo ni leerlo completo; su veredicto es
> segunda opinion, nunca aprobacion automatica del sello.
>
> **Anti-loop de disponibilidad:** si no hay un segundo verificador capaz disponible, registrar
> `Estado: NO_DISPONIBLE` con la razon; la VFH procede igual con la auto-ejecucion §6 + firma humana.
> La SEGOP no puede convertirse en un hard blocker que frene el cierre.

---

## Estado

- **Estado:** `PENDIENTE | OBTENIDA | NO_DISPONIBLE`
- **Fecha:** [YYYY-MM-DD]
- **Renderizable del activo:** `NO` (si fuera `SI`, este artefacto no aplica)

---

## Verificador usado

- **Modelo / IDE:** [p.ej. Perplexity / GPT-5.x en otro IDE / Claude en otra instancia]
- **Distinto del constructor:** `SI | NO`  *(debe ser `SI`)*
- **Acceso del verificador:** [¿leyo el repo? ¿ejecuto el codigo? ¿solo descripcion? — declarar honestamente]

---

## Alcance revisado

- [Que se le pidio revisar: §6, funciones requeridas, manejo de errores, seguridad, README, etc.]

---

## Hallazgos

| # | Hallazgo | Severidad | ¿Confirmado contra el codigo real? | Accion |
|---|---|---|---|---|
| 1 | | | | |

> **Nota anti-falso-positivo:** todo hallazgo de la SEGOP se confronta contra el codigo/ejecucion real
> antes de actuar. Un verificador externo puede equivocarse (afirmar defectos por no haber leido/ejecutado);
> registrar aqui si un hallazgo resulto incorrecto.

---

## Veredicto de la segunda opinion

- **Veredicto:** [resumen del verificador]
- **Calificacion / nivel (si la dio):** [...]

---

## Como alimenta la VFH

[Resumen de una linea de como esta segunda opinion respalda la decision humana que se registrara en
`VERIFICACION-FUNCIONAL-HUMANA.md`. La firma final sigue siendo del developer.]
