import type { PostStatus } from '@/types'

const CONFIG: Record<PostStatus, { label: string; dot: string; bg: string; color: string; pulse?: boolean }> = {
  draft:      { label: 'Borrador',        dot: '#94a3b8', bg: 'rgba(148,163,184,0.10)', color: '#94a3b8' },
  scheduled:  { label: 'Programado',      dot: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },
  publishing: { label: 'Publicando…',     dot: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  color: '#60a5fa', pulse: true },
  published:  { label: 'Publicado',       dot: '#10b981', bg: 'rgba(16,185,129,0.12)',  color: '#10b981' },
  failed:     { label: 'Fallido',         dot: '#f43f5e', bg: 'rgba(244,63,94,0.12)',   color: '#f43f5e' },
  retrying:   { label: 'Reintentando',    dot: '#fbbf24', bg: 'rgba(251,191,36,0.10)',  color: '#fbbf24', pulse: true },
  dead:       { label: 'Sin reintentos',  dot: '#ef4444', bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
}

interface Props {
  status: PostStatus
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const c = CONFIG[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${
        size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-xs'
      }`}
      style={{ background: c.bg, color: c.color }}
      aria-label={c.label}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.pulse ? 'animate-pulse' : ''}`}
        style={{ background: c.dot }}
        aria-hidden="true"
      />
      {c.label}
    </span>
  )
}
