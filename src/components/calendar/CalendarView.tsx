'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { NetworkBadge } from '@/components/ui/NetworkBadge'
import { formatTime } from '@/lib/utils'
import type { ScheduledPostWithDetails } from '@/types'

interface Props {
  scheduledPosts: ScheduledPostWithDetails[]
  orgSlug: string
}

type ViewMode = 'month' | 'week'

function getDaysInMonth(year: number, month: number) {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1 // Mon-based
  const days: (Date | null)[] = Array(startDay).fill(null)
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d))
  while (days.length % 7 !== 0) days.push(null)
  return days
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function getWeekDays(anchor: Date) {
  const day = anchor.getDay() === 0 ? 6 : anchor.getDay() - 1
  const monday = new Date(anchor)
  monday.setDate(anchor.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']
const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export function CalendarView({ scheduledPosts }: Props) {
  const today = new Date()
  const [current, setCurrent] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [view, setView] = useState<ViewMode>('month')
  const [weekAnchor, setWeekAnchor] = useState(today)
  const [selected, setSelected] = useState<ScheduledPostWithDetails | null>(null)

  const postsByDay = useMemo(() => {
    const map = new Map<string, ScheduledPostWithDetails[]>()
    for (const sp of scheduledPosts) {
      const key = sp.scheduled_at.slice(0, 10)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(sp)
    }
    return map
  }, [scheduledPosts])

  const toKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

  const handlePrev = () => {
    if (view === 'month') {
      setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1))
    } else {
      const d = new Date(weekAnchor); d.setDate(d.getDate() - 7); setWeekAnchor(d)
    }
  }
  const handleNext = () => {
    if (view === 'month') {
      setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1))
    } else {
      const d = new Date(weekAnchor); d.setDate(d.getDate() + 7); setWeekAnchor(d)
    }
  }

  const days = view === 'month'
    ? getDaysInMonth(current.getFullYear(), current.getMonth())
    : getWeekDays(weekAnchor)

  const title = view === 'month'
    ? `${MONTH_NAMES[current.getMonth()]} ${current.getFullYear()}`
    : (() => {
        const week = getWeekDays(weekAnchor)
        return `${week[0].getDate()} – ${week[6].getDate()} ${MONTH_NAMES[week[6].getMonth()]} ${week[6].getFullYear()}`
      })()

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-edge bg-base flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-ink-primary tabular">{title}</h1>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded hover:bg-base-elevated transition-colors text-ink-secondary hover:text-ink-primary"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded hover:bg-base-elevated transition-colors text-ink-secondary hover:text-ink-primary"
              aria-label="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-base-panel rounded-md p-0.5 border border-edge">
          {(['month', 'week'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                view === v
                  ? 'bg-base-elevated text-ink-primary font-medium'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {v === 'month' ? 'Month' : 'Week'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-4">
        {/* Day headers */}
        <div className={`grid gap-1 mb-1 ${view === 'month' ? 'grid-cols-7' : 'grid-cols-7'}`}>
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-xs font-semibold text-ink-disabled text-center py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        {view === 'month' ? (
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              if (!day) return <div key={`empty-${i}`} className="min-h-[80px]" />
              const key = toKey(day)
              const posts = postsByDay.get(key) ?? []
              const isToday = isSameDay(day, today)
              return (
                <div
                  key={key}
                  className={`min-h-[80px] p-1.5 rounded border transition-colors ${
                    isToday ? 'border-brand/50 bg-brand/5' : 'border-edge bg-base hover:border-edge'
                  }`}
                >
                  <span className={`text-xs tabular block mb-1 ${isToday ? 'text-brand-hover font-bold' : 'text-ink-disabled'}`}>
                    {day.getDate()}
                  </span>
                  <div className="space-y-0.5">
                    {posts.slice(0, 3).map((sp) => (
                      <button
                        key={sp.id}
                        onClick={() => setSelected(sp)}
                        className={`w-full text-left flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border-l-2 transition-colors truncate ${
                          sp.status === 'published'  ? 'bg-status-published/10 border-status-published' :
                          sp.status === 'failed' || sp.status === 'dead' ? 'bg-status-failed/10 border-status-failed' :
                          sp.status === 'scheduled' || sp.status === 'retrying' ? 'bg-status-scheduled/10 border-status-scheduled' :
                          'bg-base-elevated border-edge'
                        }`}
                      >
                        <NetworkBadge network={sp.social_accounts.network} />
                        <span className="truncate text-ink-secondary">{sp.posts.body.slice(0, 30)}</span>
                      </button>
                    ))}
                    {posts.length > 3 && (
                      <p className="text-xs text-ink-disabled pl-1">+{posts.length - 3} more</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Week view */
          <div className="grid grid-cols-7 gap-1">
            {(days as Date[]).map((day) => {
              const key = toKey(day)
              const posts = postsByDay.get(key) ?? []
              const isToday = isSameDay(day, today)
              return (
                <div
                  key={key}
                  className={`min-h-[400px] p-2 rounded border ${
                    isToday ? 'border-brand/50 bg-brand/5' : 'border-edge bg-base'
                  }`}
                >
                  <span className={`text-xs tabular block mb-2 font-medium ${isToday ? 'text-brand-hover' : 'text-ink-disabled'}`}>
                    {day.getDate()}
                  </span>
                  <div className="space-y-1">
                    {posts.map((sp) => (
                      <button
                        key={sp.id}
                        onClick={() => setSelected(sp)}
                        className={`w-full text-left p-2 rounded border-l-2 text-xs space-y-1 ${
                          sp.status === 'published'  ? 'bg-status-published/10 border-status-published' :
                          sp.status === 'failed' || sp.status === 'dead' ? 'bg-status-failed/10 border-status-failed' :
                          sp.status === 'scheduled' || sp.status === 'retrying' ? 'bg-status-scheduled/10 border-status-scheduled' :
                          'bg-base-elevated border-edge'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <NetworkBadge network={sp.social_accounts.network} />
                          <span className="tabular text-ink-secondary">{formatTime(sp.scheduled_at, sp.timezone)}</span>
                        </div>
                        <p className="text-ink-primary line-clamp-2">{sp.posts.body}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Post detail drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-30 flex items-end sm:items-center justify-center p-4 bg-black/60"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-md bg-base-panel border border-edge rounded-xl p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <NetworkBadge network={selected.social_accounts.network} />
                <span className="text-sm text-ink-secondary">{selected.social_accounts.display_name}</span>
              </div>
              <StatusBadge status={selected.status} />
            </div>
            <p className="text-sm text-ink-primary whitespace-pre-wrap">{selected.posts.body}</p>
            {selected.posts.media_url && (
              <Image
                src={selected.posts.media_url}
                alt="Imagen del post"
                width={400}
                height={300}
                unoptimized
                className="w-full max-h-64 object-cover rounded-lg border border-edge"
              />
            )}
            <div className="text-xs text-ink-disabled tabular space-y-1">
              <p>Scheduled: {new Date(selected.scheduled_at).toLocaleString('en-US', { timeZone: selected.timezone })}</p>
              <p>Timezone: {selected.timezone}</p>
              <p>Attempts: {selected.attempts} / {selected.max_attempts}</p>
              {selected.last_error && (
                <p className="text-status-failed">Error: {selected.last_error}</p>
              )}
            </div>
            {(selected.status === 'failed' || selected.status === 'dead') && (
              <RetryButton scheduledPostId={selected.id} onDone={() => setSelected(null)} />
            )}
            <button
              onClick={() => setSelected(null)}
              className="w-full text-sm text-ink-secondary hover:text-ink-primary transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function RetryButton({ scheduledPostId, onDone }: { scheduledPostId: string; onDone: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRetry = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/scheduled/${scheduledPostId}/retry`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Retry failed')
      }
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <p className="text-xs text-status-failed mb-2">{error}</p>}
      <button
        onClick={handleRetry}
        disabled={loading}
        className="w-full py-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover disabled:opacity-60 rounded-lg transition-colors"
      >
        {loading ? 'Retrying…' : 'Retry publication'}
      </button>
    </div>
  )
}
