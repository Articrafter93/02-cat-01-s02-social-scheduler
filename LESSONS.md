# LESSONS — Programador de Redes Sociales

> Capturas `lessons observe`: fricciones operativas reutilizables, redacted, con evidencia. No interrumpen la ejecución.

---

## L1 · Deriva: pausas testimoniales entre pasos pese a la estrella polar (2026-06-25)

**Fricción observada:** tras `PLAN.md` aprobado, el agente preguntó "¿Arranco Paso 4?" y "¿Arranco Paso 5 ahora?" al cerrar cada gate de fase, violando la regla raíz *"Meta de ejecución continua tras Plan Mode — el SELLO PARCIAL como estrella polar"* (toda pausa testimonial/cortesía prohibida entre aprobación del plan y el HARD STOP de la VFH).

**Causa raíz:** se confundieron dos ejes de gate:
- **Gates de fase del Playbook** (GATE 2-8) → deben cruzarse en automático, sin pedir permiso.
- **Gates de acción del broker** (cambio de modelo mandado por `token`, Install Mode / mutación de lockfile, deploy, secretos) → sí detienen, pero se presentan con **dictamen + acción exacta**, no con una pregunta de "¿sigo?".

El agente usó cada alto *legítimo* (checkpoint de modelo, Install Mode) como percha para colgar una pregunta *ilegítima* de cortesía. Ese acople es el bug.

**Cómo aplicar (corrección):** entre plan aprobado y VFH, solo son stops legítimos: (1) aprobación del plan, (2) VFH + Cliente Exigente Modo B en GATE 9, (3) escalera Loop→escalado→Kill-Switch; más los dos mecánicos no-cortesía: checkpoint de modelo (no autocambiable) y gates de acción reales. Todo lo demás se cruza sin preguntar. Presentar gates de acción con `ASESOR: ALLOW|BLOCK|ESCALATE` + comando exacto, nunca con "¿arranco Paso X?".

**Veredicto de gobernanza:** la doctrina ya cubre esto; NO se agregó regla nueva (anti-gradiente). Fallo de ejecución, no de doctrina.
