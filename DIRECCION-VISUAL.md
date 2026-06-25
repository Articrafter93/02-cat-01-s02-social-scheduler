# Dirección Visual — Programador de Redes Sociales

> **Gate:** GATE 4 — Dirección Visual
> **Resultado: SI**
> **Materialización:** ruta free-first / code-first — skill `frontend-design` + gate `diseño` (`theme-factory`, `shadcn-ui`)
> **Figma:** `no-aplica` (API/Dev Mode de pago; descartado para free-tier)
> **Referencia:** contrato §2 · `MOTION-STRATEGY.md` · `CLASIFICACION-ACTIVO.md`
> **Fecha aprobación:** 2026-06-25

---

## Concepto rector

**"Sala de control editorial"** — calma operativa, densidad informativa legible, foco en estado y control.

La interfaz es una herramienta enterprise para operadores de agencia con uso intensivo diario. No es un producto de consumo: la densidad de información es deliberada y el color es semántico, no decorativo. El reclutador debe sentir que está mirando software real de producción, no un proyecto académico.

**Principios:**
1. **Estado siempre visible:** el sistema operativo de publicación (cola, reintentos, DLQ) es el corazón; el estado de cada post se lee en menos de 1 segundo.
2. **Color + icono + etiqueta** siempre juntos — nunca el color como único portador de significado (accesibilidad).
3. **Densidad con respiro:** paneles compactos pero con padding consistente; sin ruido visual; jerarquía clara.
4. **Dark enterprise:** base oscura fría (slate/navy) que reduce la fatiga en uso prolongado y proyecta seriedad.

---

## Paleta de colores

### Base (dark enterprise)

| Token CSS | Valor hex | Tailwind ref | Uso |
|---|---|---|---|
| `--bg-base` | `#0f172a` | `slate-900` | Fondo de página / sidebar |
| `--bg-panel` | `#1e293b` | `slate-800` | Tarjetas, paneles, modales |
| `--bg-elevated` | `#273344` | entre `slate-800`/`700` | Hover states, dropdowns |
| `--border` | `#334155` | `slate-700` | Bordes de panel y separadores |
| `--border-subtle` | `#1e293b` | `slate-800` | Bordes internos muy suaves |
| `--text-primary` | `#f1f5f9` | `slate-100` | Texto principal |
| `--text-secondary` | `#94a3b8` | `slate-400` | Labels, captions, metadatos |
| `--text-disabled` | `#475569` | `slate-600` | Placeholders, estados inactivos |

### Acento corporativo

| Token CSS | Valor hex | Tailwind ref | Uso |
|---|---|---|---|
| `--accent` | `#6366f1` | `indigo-500` | CTAs primarios, nav activo, links |
| `--accent-hover` | `#818cf8` | `indigo-400` | Hover de CTA |
| `--accent-subtle` | `rgba(99,102,241,0.12)` | — | Fondo de item activo en sidebar |
| `--accent-border` | `rgba(99,102,241,0.4)` | — | Borde de input enfocado |

### Colores semánticos de estado (sistema rector)

Cada estado usa: **fondo tenue (10-15% opacidad) + punto/borde de color sólido + etiqueta de texto en color**. Nunca solo color.

| Estado | Token CSS | Hex sólido | Tailwind | Icono |
|---|---|---|---|---|
| `published` | `--status-published` | `#10b981` | `emerald-500` | `CheckCircle` |
| `scheduled` | `--status-scheduled` | `#f59e0b` | `amber-500` | `Clock` |
| `retrying` | `--status-retrying` | `#f59e0b` | `amber-400` | `RefreshCw` (animado) |
| `publishing` | `--status-publishing` | `#60a5fa` | `blue-400` | `Loader2` (animado) |
| `failed` | `--status-failed` | `#f43f5e` | `rose-500` | `XCircle` |
| `dead` (DLQ) | `--status-dead` | `#ef4444` | `red-500` | `Skull`/`AlertOctagon` |
| `draft` | `--status-draft` | `#94a3b8` | `slate-400` | `FileText` |

**Regla de badge (CSS pattern):**
```css
.badge-published  { background: rgba(16,185,129,0.12); color: #10b981; }
.badge-scheduled  { background: rgba(245,158,11,0.12); color: #f59e0b; }
.badge-retrying   { background: rgba(245,158,11,0.10); color: #fbbf24; }
.badge-publishing { background: rgba(96,165,250,0.12); color: #60a5fa; }
.badge-failed     { background: rgba(244,63,94,0.12);  color: #f43f5e; }
.badge-dead       { background: rgba(239,68,68,0.12);  color: #ef4444; }
.badge-draft      { background: rgba(148,163,184,0.10); color: #94a3b8; }
```

---

## Tipografía

**Familia principal:** `Inter` (Google Fonts) · fallback `ui-sans-serif, system-ui, -apple-system, sans-serif`
**Alternativa válida:** `Geist` (Vercel) — igualmente legible y técnica; usar la que esté disponible en el setup del proyecto.

### Escala tipográfica

| Rol | Tamaño | Peso | Line-height | Uso concreto |
|---|---|---|---|---|
| `display` | 20px / 1.25rem | 700 | 1.3 | Títulos de página (ej. "Calendario — Marca Acme") |
| `heading-lg` | 16px / 1rem | 600 | 1.4 | Encabezados de sección, modal titles |
| `heading-sm` | 14px / 0.875rem | 600 | 1.4 | Encabezados de card, sidebar sections |
| `body` | 14px / 0.875rem | 400 | 1.5 | Contenido general, copy de posts |
| `body-sm` | 13px / 0.8125rem | 400 | 1.5 | Metadatos secundarios |
| `caption` | 12px / 0.75rem | 500 | 1.4 | Labels de badge, timestamps inline |
| `mono-tabular` | 13px / 0.8125rem | 400 | 1.4 | Horas, métricas numéricas — **`font-variant-numeric: tabular-nums`** |

**Decisión crítica:** todos los timestamps (`14:30`, `23 jun`, duración) y métricas (`1.234`, `98%`) usan `tabular-nums` para que los números estén alineados en listas/tablas sin saltos ópticos.

```css
.tabular { font-variant-numeric: tabular-nums; }
```

---

## Layout y composición

### Grid principal (desktop-first, >1024px)

```
┌──────────────────────────────────────────────────────┐
│  SIDEBAR (240px fijo)  │  MAIN CONTENT (fluid)       │
│                        │                             │
│  [Logo + Brand Switch] │  [Topbar 56px]              │
│  ─────────────────     │  ─────────────────────────  │
│  Nav items             │  [Vista activa:             │
│    Calendario          │    Calendario / Componer /  │
│    Componer            │    Cola / Métricas /        │
│    Cuentas             │    Cuentas / Ajustes]       │
│    Métricas            │                             │
│    Cola                │                             │
│    Ajustes             │                             │
│  ─────────────────     │                             │
│  [Logout visible]      │                             │
└──────────────────────────────────────────────────────┘
```

### Sidebar (240px)

- **Brand Selector** — siempre en la cabecera del sidebar, sticky. Muestra la marca activa con un dot de color único por marca. Click abre un dropdown con todas las marcas del usuario. Cambiar marca recarga el contexto global sin navegar.
- **Navegación principal** — items con icono + label, estado activo con `--accent-subtle` + borde izquierdo `--accent` 2px.
- **Logout** — anclado al fondo del sidebar, siempre visible. No oculto en scroll ni en mobile. Ver `MOTION-STRATEGY.md` para hover.
- **Rol actual** — chip pequeño debajo del avatar/nombre del usuario: `Admin` / `Miembro` / `Solo lectura` (colores: `--accent`, `slate-400`, `slate-400`).

### Topbar (56px)

- Nombre de la vista activa (izquierda)
- Acciones contextuales (derecha): botón `+ Nuevo post` (CTA primario `--accent`) y controles de vista (mes/semana en calendario).

### Calendario (pieza central)

- Vista mes: grid 7 columnas, celda mínima 80px altura. Posts como píldoras compactas: `[red-network-icon] texto truncado`.
- Vista semana: columnas por día, scroll vertical, slots de 30min.
- Post card en calendario: `bg-panel` + borde izquierdo 3px del color de estado + icono de red + texto truncado + badge de estado.
- Celda vacía: fondo base, hover `--bg-elevated` — nunca un `+` prominente, solo un indicador sutil.

### Panel lateral del compositor (split view)

- Compositor ocupa max 600px centrado, o en split con la previsualización por red (side-by-side en >1400px).
- Previsualización: mockup de feed de cada red seleccionada, actualización en tiempo real.

---

## Componentes clave — especificación

### Badge de estado
```
[● Publicado]   → dot emerald + label "Publicado" + fondo tenue
[● Programado]  → dot amber + label "Programado 14:30" + fondo tenue
[⟳ Reintentando] → dot amber + icono RefreshCw animado + label
[◌ Publicando]  → dot blue + Loader2 animado + label
[✕ Fallido]     → dot rose + label "Fallido" + fondo tenue
[☠ En cola DLQ] → dot red + label "Sin reintentos" + fondo tenue
[○ Borrador]    → dot slate + label "Borrador" + fondo tenue
```
Tamaño: `h-5 px-2 rounded-full text-xs font-medium` (shadcn `Badge` variant custom).

### Brand Selector
```
[● Acme Corp  ▾]   ← siempre visible en sidebar header
```
- Dot con color único por marca (generado de forma determinista desde el `org_id` — no configurable por usuario en MVP).
- Dropdown: lista de marcas con dot + nombre + rol del usuario en esa marca.
- Transición al cambiar: fade rápido 150ms en el contenido principal (ver `MOTION-STRATEGY.md`).

### Post card (en calendario)
```
┌──────────────────────────┐
│▌ [IG] Texto del post...  │  ← borde izq = color estado
│  [● Programado]  14:30   │
└──────────────────────────┘
```
- `rounded-md` · `bg-panel` · padding `px-2 py-1` · texto `caption` truncado a 1 línea.
- Click abre drawer/modal de detalle del post.

### Alerta de fallo (inline + toast)
- En la card del post: borde izq `--status-failed` + motivo truncado + botón `Reintentar`.
- Toast global (esquina inf-derecha): destructivo, auto-dismiss 8s, con acción `Ver en cola`.

### Tabla de cola / DLQ
- Columnas: `Estado` | `Post` (truncado) | `Red` | `Intentos` | `Próximo intento` | `Último error` | `Acción`
- Filas DLQ: fondo `rgba(239,68,68,0.06)`, badge `dead`, botón `Reiniciar` destructivo secundario.
- Empty state: ilustración mínima (SVG inline) + copy "La cola está vacía. No hay publicaciones pendientes." — nunca en blanco.

### Panel de métricas
- Cards numéricas: número grande `display` + label `caption` + indicador de tendencia (↑↓ coloreado).
- Gráfica: línea simple (recharts) con `--accent` para la serie principal, grid lines `--border`.
- Empty state: "Sin datos todavía" + copy explicativo de qué genera métricas.

---

## Tokens de diseño — `tailwind.config.ts`

Bloque listo para copiar en el config del proyecto:

```ts
// tailwind.config.ts — extensión del tema
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Base
        base:    { DEFAULT: '#0f172a', panel: '#1e293b', elevated: '#273344' },
        // Texto
        ink:     { primary: '#f1f5f9', secondary: '#94a3b8', disabled: '#475569' },
        // Borde
        edge:    { DEFAULT: '#334155', subtle: '#1e293b' },
        // Acento
        brand:   { DEFAULT: '#6366f1', hover: '#818cf8' },
        // Estados semánticos
        status: {
          published:  '#10b981',
          scheduled:  '#f59e0b',
          retrying:   '#fbbf24',
          publishing: '#60a5fa',
          failed:     '#f43f5e',
          dead:       '#ef4444',
          draft:      '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display':    ['1.25rem', { lineHeight: '1.3', fontWeight: '700' }],
        'heading-lg': ['1rem',    { lineHeight: '1.4', fontWeight: '600' }],
        'heading-sm': ['0.875rem',{ lineHeight: '1.4', fontWeight: '600' }],
        'body':       ['0.875rem',{ lineHeight: '1.5', fontWeight: '400' }],
        'body-sm':    ['0.8125rem',{lineHeight: '1.5', fontWeight: '400' }],
        'caption':    ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
        'mono-tab':   ['0.8125rem',{lineHeight: '1.4', fontWeight: '400' }],
      },
      width:  { sidebar: '240px' },
      height: { topbar:  '56px'  },
    },
  },
  plugins: [],
}

export default config
```

### Variables CSS globales (`globals.css`)

```css
:root {
  /* Base */
  --bg-base:          #0f172a;
  --bg-panel:         #1e293b;
  --bg-elevated:      #273344;
  --border:           #334155;
  --border-subtle:    #1e293b;

  /* Texto */
  --text-primary:     #f1f5f9;
  --text-secondary:   #94a3b8;
  --text-disabled:    #475569;

  /* Acento */
  --accent:           #6366f1;
  --accent-hover:     #818cf8;
  --accent-subtle:    rgba(99,102,241,0.12);
  --accent-border:    rgba(99,102,241,0.40);

  /* Estados */
  --status-published:  #10b981;
  --status-scheduled:  #f59e0b;
  --status-retrying:   #fbbf24;
  --status-publishing: #60a5fa;
  --status-failed:     #f43f5e;
  --status-dead:       #ef4444;
  --status-draft:      #94a3b8;
}

body {
  background-color: var(--bg-base);
  color: var(--text-primary);
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
}

.tabular { font-variant-numeric: tabular-nums; }
```

---

## Accesibilidad

| Requisito | Implementación |
|---|---|
| Color no es único portador | Estado siempre en trío: color + icono + etiqueta texto |
| Contraste WCAG AA | `slate-100` (#f1f5f9) sobre `slate-900` (#0f172a) → ratio ~14:1 ✓ |
| Contraste captions | `slate-400` (#94a3b8) sobre `slate-800` (#1e293b) → ratio ~4.6:1 ✓ |
| Contraste `--accent` | `indigo-400` (#818cf8) sobre `slate-900` → ratio ~5.1:1 ✓ |
| Focus visible | `ring-2 ring-[--accent-border] ring-offset-1 ring-offset-[--bg-base]` en todos los interactivos |
| Reduced motion | Respetar `prefers-reduced-motion: reduce` — ver `MOTION-STRATEGY.md` |
| Iconos decorativos | `aria-hidden="true"` · labels textuales siempre presentes |

---

## Motion (referencia)

Ver [`MOTION-STRATEGY.md`](./MOTION-STRATEGY.md) para las reglas completas.

Resumen de las animaciones vinculadas a este sistema visual:
- **Badge de estado** → transición de color `150ms ease` al cambiar estado.
- **Brand switch** → fade-out/in `120ms` del contenido principal.
- **Loader de cola** → `Loader2` con `animate-spin`, `RefreshCw` con `animate-pulse`.
- **Toast de fallo** → slide-in desde abajo `200ms ease-out`.
- **Hover de sidebar** → `bg-elevated` con `100ms ease`.

---

## Registro de decisiones

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| Dark enterprise (slate-900 base) | Light mode | Uso intensivo diario; reduce fatiga; proyecta seriedad enterprise |
| Indigo como acento | Azul puro `blue-500` | Índigo es menos genérico, más "herramienta SaaS de agencia"; distingue de apps corp azules |
| Amber para scheduled+retrying | Naranja puro | Amber en oscuro es más legible; diferencia clara de rojo (failed) |
| Tabular-nums en horas/métricas | Monospace para números | Tabular-nums con Inter es visualmente consistente; mono rompe la textura |
| Sidebar fijo 240px | Colapsable por defecto | Demo para reclutadores: el layout visible y completo es más impresionante |
| Figma | — | API/Dev Mode de pago; no aplica a free-tier; `frontend-design` + `shadcn-ui` cubre todo lo necesario |

---

**Resultado: SI** — Dirección visual aprobada. Listo para iniciar Paso 5 (scaffold Next.js + Supabase + seed) con este sistema como referencia.
