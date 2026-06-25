# comunicacion-cliente — Convención de nombrado

Esta carpeta contiene el historial cronológico de toda la correspondencia con el Cliente Exigente y/o con el cliente real del proyecto.

## Convención de nombres

```
[YYYY-MM-DD]-[NN]-[tipo]-[descripcion-breve].md
```

**Tipos de archivo:**

| Tipo | Descripción |
|---|---|
| `correo-corporativo-inicial` | Correo de arranque generado por `/cliente-exigente` Modo A |
| `nota-de-cambio` | Cambio de alcance aprobado durante la construcción |
| `consulta-cliente` | Pregunta o aclaración enviada al cliente real |
| `respuesta-cliente` | Respuesta del cliente real transcrita literalmente |
| `acta-reunion` | Resumen de reunión con decisiones tomadas |

## Ejemplo

```
2026-05-12-01-correo-corporativo-inicial.md
2026-05-15-02-nota-de-cambio-agregar-modulo-pagos.md
2026-05-20-03-consulta-cliente-flujo-de-cancelacion.md
```

## Regla

El archivo `[YYYY-MM-DD]-01-correo-corporativo-inicial.md` es el **contrato vinculante** del proyecto. Ningún agente puede planificar ni construir sin que este archivo exista y esté firmado.
