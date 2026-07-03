'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Send, Loader2, ImagePlus, X } from 'lucide-react'
import { NetworkBadge } from '@/components/ui/NetworkBadge'
import { createClient } from '@/lib/supabase/client'
import type { SocialAccount, SocialNetwork } from '@/types'

const MEDIA_BUCKET = 'cat01s02-post-media'

const CHAR_LIMITS: Record<SocialNetwork, number> = {
  instagram: 2200,
  linkedin: 3000,
  facebook: 63206,
}

interface Props {
  accounts: SocialAccount[]
  orgId: string
  orgSlug: string
  orgTimezone: string
}

export function ComposerForm({ accounts, orgId, orgSlug, orgTimezone }: Props) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([])
  const [scheduledAt, setScheduledAt] = useState('')
  const [timezone, setTimezone] = useState(orgTimezone)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaUploading, setMediaUploading] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMediaError(null)
    setMediaUploading(true)
    try {
      const supabase = createClient()
      const ext = (file.name.split('.').pop() || 'png').toLowerCase()
      const path = `${orgId}/${crypto.randomUUID()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, { upsert: false, contentType: file.type })
      if (upErr) throw upErr
      const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
      setMediaUrl(data.publicUrl)
    } catch {
      setMediaError('Could not upload the image. Use PNG/JPG/WebP/GIF up to 5 MB.')
    } finally {
      setMediaUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const removeImage = () => {
    setMediaUrl(null)
    setMediaError(null)
  }

  const now = new Date()
  const minDatetime = new Date(now.getTime() + 60_000).toISOString().slice(0, 16)

  const toggleAccount = (id: string) => {
    setSelectedAccountIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const selectedAccounts = accounts.filter((a) => selectedAccountIds.includes(a.id))
  const networksForSelectedAccounts = [...new Set(selectedAccounts.map((a) => a.network))]

  const bodyLengthOk = networksForSelectedAccounts.every(
    (net) => body.length <= CHAR_LIMITS[net]
  )
  const scheduledInFuture = scheduledAt ? new Date(scheduledAt) > now : false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!body.trim()) { setError('Post text cannot be empty.'); return }
    if (selectedAccountIds.length === 0) { setError('Select at least one account.'); return }
    if (!scheduledAt) { setError('Choose a date and time to publish.'); return }
    if (!scheduledInFuture) { setError('The publish date must be in the future.'); return }
    if (!bodyLengthOk) { setError('The text exceeds the character limit for one of the selected networks.'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: body.trim(),
          account_ids: selectedAccountIds,
          scheduled_at: new Date(scheduledAt).toISOString(),
          timezone,
          media_url: mediaUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to schedule the post')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/app/${orgSlug}/calendario`)
        router.refresh()
      }, 1200)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-12 h-12 rounded-full bg-status-published/20 flex items-center justify-center">
          <Send className="w-6 h-6 text-status-published" />
        </div>
        <p className="text-ink-primary font-medium">Post scheduled</p>
        <p className="text-sm text-ink-secondary">Redirecting to the calendar…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">
      {/* Body */}
      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1.5" htmlFor="body">
          Post text
        </label>
        <textarea
          id="body"
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 bg-base-panel border border-edge rounded-lg text-sm text-ink-primary placeholder:text-ink-disabled focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/40 transition-colors resize-none"
          placeholder="What do you want to publish?"
        />
        {/* Char counters per network */}
        {networksForSelectedAccounts.length > 0 && (
          <div className="mt-1 flex gap-3 flex-wrap">
            {networksForSelectedAccounts.map((net) => {
              const limit = CHAR_LIMITS[net]
              const over = body.length > limit
              return (
                <span
                  key={net}
                  className={`text-xs tabular ${over ? 'text-status-failed' : 'text-ink-disabled'}`}
                >
                  {net.slice(0, 2).toUpperCase()} {body.length}/{limit}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Image (optional) */}
      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1.5">
          Image <span className="text-ink-disabled font-normal">(optional)</span>
        </label>
        <input
          ref={fileInputRef}
          id="media-input"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="sr-only"
          onChange={handleImageSelect}
        />
        {mediaUrl ? (
          <div className="relative inline-block">
            <Image
              src={mediaUrl}
              alt="Post image preview"
              width={160}
              height={160}
              unoptimized
              className="rounded-lg border border-edge object-cover w-40 h-40"
            />
            <button
              type="button"
              onClick={removeImage}
              aria-label="Remove image"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-base-panel border border-edge flex items-center justify-center text-ink-secondary hover:text-status-failed transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="media-input"
            className="flex items-center gap-2 w-fit px-3 py-2 rounded-lg border border-dashed border-edge text-sm text-ink-secondary hover:bg-base-elevated cursor-pointer transition-colors"
          >
            {mediaUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
            {mediaUploading ? 'Uploading…' : 'Add image'}
          </label>
        )}
        {mediaError && <p className="mt-1 text-xs text-status-failed">{mediaError}</p>}
      </div>

      {/* Account selection */}
      <div>
        <p className="text-xs font-medium text-ink-secondary mb-1.5">
          Target accounts
        </p>
        {accounts.length === 0 ? (
          <p className="text-sm text-ink-disabled">No connected accounts for this brand.</p>
        ) : (
          <div className="space-y-1">
            {accounts.map((acc) => {
              const checked = selectedAccountIds.includes(acc.id)
              return (
                <label
                  key={acc.id}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    checked
                      ? 'border-brand/40 bg-brand/10'
                      : 'border-edge bg-base-panel hover:bg-base-elevated'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => toggleAccount(acc.id)}
                  />
                  <span
                    className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
                      checked ? 'bg-brand border-brand' : 'border-edge bg-transparent'
                    }`}
                    aria-hidden="true"
                  >
                    {checked && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 10">
                        <path d="M1.5 5l2.5 2.5L8.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
                  <NetworkBadge network={acc.network} />
                  <span className="text-sm text-ink-primary flex-1">{acc.display_name}</span>
                  <span className="text-xs text-ink-disabled">{acc.handle}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Date, time, timezone */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-ink-secondary mb-1.5" htmlFor="scheduled_at">
            Date and time
          </label>
          <input
            id="scheduled_at"
            type="datetime-local"
            required
            min={minDatetime}
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full px-3 py-2 bg-base-panel border border-edge rounded-lg text-sm text-ink-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/40 transition-colors tabular"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-secondary mb-1.5" htmlFor="timezone">
            Timezone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3 py-2 bg-base-panel border border-edge rounded-lg text-sm text-ink-primary focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/40 transition-colors"
          >
            <option value="America/Bogota">Bogotá (UTC-5)</option>
            <option value="America/Mexico_City">CDMX (UTC-6)</option>
            <option value="America/Lima">Lima (UTC-5)</option>
            <option value="America/Buenos_Aires">Buenos Aires (UTC-3)</option>
            <option value="America/Santiago">Santiago (UTC-4)</option>
            <option value="America/New_York">New York (UTC-5/-4)</option>
            <option value="Europe/Madrid">Madrid (UTC+1/+2)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
      </div>

      {/* Preview per network */}
      {networksForSelectedAccounts.length > 0 && body.trim() && (
        <div>
          <p className="text-xs font-medium text-ink-secondary mb-1.5">Preview by network</p>
          <div className="flex gap-3 flex-wrap">
            {networksForSelectedAccounts.map((net) => {
              const acc = selectedAccounts.find((a) => a.network === net)
              const over = body.length > CHAR_LIMITS[net]
              return (
                <div key={net} className="w-64 rounded-lg border border-edge bg-base-panel overflow-hidden">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-edge">
                    <NetworkBadge network={net} />
                    <span className="text-xs text-ink-secondary truncate">{acc?.handle ?? acc?.display_name}</span>
                  </div>
                  {mediaUrl && (
                    <Image
                      src={mediaUrl}
                      alt={`Preview on ${net}`}
                      width={256}
                      height={144}
                      unoptimized
                      className="w-full h-36 object-cover"
                    />
                  )}
                  <div className="px-3 py-2">
                    <p className="text-xs text-ink-primary whitespace-pre-wrap line-clamp-4">{body}</p>
                    <p className={`mt-1 text-xs tabular ${over ? 'text-status-failed' : 'text-ink-disabled'}`}>
                      {body.length}/{CHAR_LIMITS[net]}{over ? ' — over limit' : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Validation preview */}
      {scheduledAt && !scheduledInFuture && (
        <p className="text-xs text-status-failed bg-status-failed/10 px-3 py-2 rounded-lg">
          The publish date and time must be later than now.
        </p>
      )}

      {error && (
        <p className="text-sm text-status-failed bg-status-failed/10 border border-status-failed/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || mediaUploading || accounts.length === 0}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {loading ? 'Scheduling…' : 'Schedule post'}
      </button>
    </form>
  )
}
