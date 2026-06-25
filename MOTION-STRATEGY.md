# MOTION-STRATEGY · Programador de Redes Sociales

> Peso comercial del movimiento: **low–medium**. Es una herramienta enterprise de uso diario: el movimiento sirve a la claridad operativa y al feedback de estado, **nunca** decora ni distrae. Respeta `prefers-reduced-motion` siempre.

## Principios
- **Funcional, no decorativo.** Cada animación comunica estado o transición real (publicación, fallo, carga).
- **Rápido y discreto:** 120–200 ms, easing estándar; sin rebotes llamativos.
- **Accesible:** con `prefers-reduced-motion: reduce`, se desactivan transiciones no esenciales y se mantiene el cambio de estado instantáneo.

## Inventario de motion
| Elemento | Movimiento | Peso |
|---|---|---|
| Transición de estado de post (programado→publicando→publicado/fallido) | Cambio de color de badge + fade corto del icono | medium |
| "Procesar cola ahora" | Spinner discreto + actualización optimista de filas | medium |
| Cambio de marca | Fade rápido del contenido (no del chrome) | low |
| Toasts de alerta de fallo | Slide-in sutil desde el borde + auto-dismiss | low |
| Hover en tarjetas/celdas de calendario | Elevación mínima (shadow) | low |
| Empty states | Sin animación (estático, honesto) | — |

## Fuera de alcance
Animaciones de entrada elaboradas, parallax, partículas o transiciones de página largas: no aplican a una herramienta de control operativo.
