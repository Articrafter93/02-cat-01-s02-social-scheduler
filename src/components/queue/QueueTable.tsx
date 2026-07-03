'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, List } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { NetworkBadge } from '@/components/ui/NetworkBadge'
import type { ScheduledPostWithDetails, PostStatus } from '@/types'

const STATUS_FILTERS: { label: string; value: PostStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Failed', value: 'failed' },
  { label: 'DLQ', value: 'dead' },
  { label: 'Published', value: 'published' },
  { label: 'Drafts', value: 'draft' },
]

interface Props {
  posts: ScheduledPostWithDetails[]
  isReadOnly: boolean
}

export function QueueTable({ posts, isReadOnly }: Props) {
  const [filter, setFilter] = useState<PostStatus | 'all'>('all')
  const [retrying, setRetrying] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const router = useRouter()

  const filtered = filter === 'all' ? posts : posts.filter((p) => p.status === filter)

  const handleRetry = async (id: string) => {
    setRetrying(id)
    try {
      const res = await fetch(`/api/scheduled/${id}/retry`, { method: 'POST' })
      if (res.ok) router.refresh()
    } finally {
      setRetrying(null)
    }
  }

  const handleProcessNow = async () => {
    setProcessing(true)
    try {
      await fetch('/api/queue/process', {
        method: 'POST',
        headers: { 'x-queue-secret': process.env.NEXT_PUBLIC_DEMO_MODE === 'true' ? 'demo' : '' },
      })
      setTimeout(() => { router.refresh(); setProcessing(false) }, 1500)
    } catch {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters + action */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-base-panel border border-edge rounded-lg p-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                filter === f.value
                  ? 'bg-base-elevated text-ink-primary font-medium'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {!isReadOnly && (
          <button
            onClick={handleProcessNow}
            disabled={processing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-edge text-ink-secondary hover:text-ink-primary hover:bg-base-elevated rounded-lg transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${processing ? 'animate-spin' : ''}`} />
            {processing ? 'Processing…' : 'Process queue now'}
          </button>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-10 h-10 rounded-full bg-base-panel flex items-center justify-center">
            <List className="w-5 h-5 text-ink-disabled" />
          </div>
          <p className="text-sm text-ink-secondary">No posts in this view.</p>
          <p className="text-xs text-ink-disabled">
            {filter === 'all' ? 'The queue is empty.' : `No posts with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-edge overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-edge bg-base">
                <th className="text-left text-xs font-semibold text-ink-disabled px-4 py-2.5">Status</th>
                <th className="text-left text-xs font-semibold text-ink-disabled px-4 py-2.5">Post</th>
                <th className="text-left text-xs font-semibold text-ink-disabled px-4 py-2.5">Network</th>
                <th className="text-left text-xs font-semibold text-ink-disabled px-4 py-2.5 tabular">Scheduled</th>
                <th className="text-left text-xs font-semibold text-ink-disabled px-4 py-2.5 tabular">Attempts</th>
                <th className="text-left text-xs font-semibold text-ink-disabled px-4 py-2.5">Last error</th>
                {!isReadOnly && <th className="px-4 py-2.5" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {filtered.map((post) => {
                const isDead = post.status === 'dead'
                const isFailed = post.status === 'failed'
                return (
                  <tr
                    key={post.id}
                    className={`transition-colors ${
                      isDead ? 'bg-status-dead/5' : isFailed ? 'bg-status-failed/5' : 'bg-base-panel hover:bg-base-elevated'
                    }`}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={post.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="text-ink-primary truncate text-xs">{post.posts.body}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <NetworkBadge network={post.social_accounts.network} />
                        <span className="text-xs text-ink-secondary">{post.social_accounts.handle}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-ink-secondary tabular">
                      {new Date(post.scheduled_at).toLocaleString('en-US', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-secondary tabular text-center">
                      {post.attempts} / {post.max_attempts}
                    </td>
                    <td className="px-4 py-3 max-w-[160px]">
                      {post.last_error ? (
                        <span className="text-xs text-status-failed truncate block">{post.last_error}</span>
                      ) : (
                        <span className="text-xs text-ink-disabled">—</span>
                      )}
                    </td>
                    {!isReadOnly && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        {(isFailed || isDead) && (
                          <button
                            onClick={() => handleRetry(post.id)}
                            disabled={retrying === post.id}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs border border-edge text-ink-secondary hover:text-ink-primary hover:bg-base-elevated rounded transition-colors disabled:opacity-60"
                          >
                            <RefreshCw className={`w-3 h-3 ${retrying === post.id ? 'animate-spin' : ''}`} />
                            Retry
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
