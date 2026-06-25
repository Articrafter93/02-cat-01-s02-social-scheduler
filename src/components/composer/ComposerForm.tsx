'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Loader2 } from 'lucide-react'
import { NetworkBadge } from '@/components/ui/NetworkBadge'
import type { SocialAccount, SocialNetwork } from '@/types'

const CHAR_LIMITS: Record<SocialNetwork, number> = {
  instagram: 2200,
  linkedin: 3000,
  facebook: 63206,
}

interface Props {
  accounts: SocialAccount[]
  orgSlug: string
  orgTimezone: string
}

export function ComposerForm({ accounts, orgSlug, orgTimezone }: Props) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([])
  const [scheduledAt, setScheduledAt] = useState('')
  const [timezone, setTimezone] = useState(orgTimezone)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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

    if (!body.trim()) { setError('El texto del post no puede estar vacío.'); return }
    if (selectedAccountIds.length === 0) { setError('Selecciona al menos una cuenta.'); return }
    if (!scheduledAt) { setError('Debes elegir una fecha y hora de publicación.'); return }
    if (!scheduledInFuture) { setError('La fecha de publicación debe ser en el futuro.'); return }
    if (!bodyLengthOk) { setError('El texto supera el límite de caracteres para una de las redes seleccionadas.'); return }

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
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Error al programar el post')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/app/${orgSlug}/calendario`)
        router.refresh()
      }, 1200)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <div className="w-12 h-12 rounded-full bg-status-published/20 flex items-center justify-center">
          <Send className="w-6 h-6 text-status-published" />
        </div>
        <p className="text-ink-primary font-medium">Post programado</p>
        <p className="text-sm text-ink-secondary">Redirigiendo al calendario…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xl">
      {/* Body */}
      <div>
        <label className="block text-xs font-medium text-ink-secondary mb-1.5" htmlFor="body">
          Texto del post
        </label>
        <textarea
          id="body"
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 bg-base-panel border border-edge rounded-lg text-sm text-ink-primary placeholder:text-ink-disabled focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/40 transition-colors resize-none"
          placeholder="¿Qué quieres publicar?"
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

      {/* Account selection */}
      <div>
        <p className="text-xs font-medium text-ink-secondary mb-1.5">
          Cuentas de destino
        </p>
        {accounts.length === 0 ? (
          <p className="text-sm text-ink-disabled">No hay cuentas conectadas en esta marca.</p>
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
            Fecha y hora
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
            Zona horaria
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

      {/* Validation preview */}
      {scheduledAt && !scheduledInFuture && (
        <p className="text-xs text-status-failed bg-status-failed/10 px-3 py-2 rounded-lg">
          La fecha y hora de publicación debe ser posterior a ahora.
        </p>
      )}

      {error && (
        <p className="text-sm text-status-failed bg-status-failed/10 border border-status-failed/20 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || accounts.length === 0}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        {loading ? 'Programando…' : 'Programar publicación'}
      </button>
    </form>
  )
}
