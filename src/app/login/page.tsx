'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, LogIn } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const DEMO_ACCOUNTS = [
  {
    email: 'admin@demo.cat01s02',
    label: 'Agency admin',
    description: 'Full access · Acme Corp',
  },
  {
    email: 'member@demo.cat01s02',
    label: 'Team member',
    description: 'Editor · Acme Corp',
  },
  {
    email: 'client@demo.cat01s02',
    label: 'Client (read-only)',
    description: 'Read-only · Brand Nova',
  },
] as const

// Demo login mock: OFF by default; enabled only via the explicit build-time
// opt-in NEXT_PUBLIC_DEMO_MODE=true, which is set on the portfolio exhibition
// deploy (itself NODE_ENV=production). A real production deploy that does NOT
// set the flag has no mock auth — so the guard stays intact while the recruiter
// demo remains reachable while a real production deploy without the flag has no mock auth.
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

const DEMO_PASSWORD = isDemoMode
  ? (process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? 'demo1234')
  : ''

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState(isDemoMode ? DEMO_ACCOUNTS[0].email : '')
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleDemoSelect = (acc: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(acc.email)
    setPassword(DEMO_PASSWORD)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('Incorrect credentials. Please check and try again.')
      setLoading(false)
      return
    }

    router.push('/app')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logotipo */}
        <div className="mb-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-bold text-lg leading-none">S</span>
          </div>
          <h1 className="text-xl font-bold text-ink-primary">Social Scheduler</h1>
          <p className="text-ink-secondary text-sm mt-1">Editorial calendar for agencies</p>
        </div>

        {/* Selector de cuentas demo */}
        {isDemoMode && (
          <div className="mb-4 p-3 rounded-lg border border-edge bg-base-panel">
            <p className="text-xs font-semibold text-ink-disabled uppercase tracking-widest mb-2">
              Demo accounts
            </p>
            <div className="space-y-1">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleDemoSelect(acc)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    email === acc.email
                      ? 'bg-brand/20 text-brand-hover border border-brand/30'
                      : 'text-ink-secondary hover:bg-base-elevated hover:text-ink-primary'
                  }`}
                >
                  <span className="font-medium block text-inherit">{acc.label}</span>
                  <span className="text-xs text-ink-disabled">{acc.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-base-panel border border-edge rounded-lg text-sm text-ink-primary placeholder:text-ink-disabled focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/40 transition-colors"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary mb-1" htmlFor="password">
              Password
              {isDemoMode && (
                <span className="ml-1 text-ink-disabled font-normal">(pre-filled for demo)</span>
              )}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-base-panel border border-edge rounded-lg text-sm text-ink-primary placeholder:text-ink-disabled focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/40 transition-colors"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-status-failed bg-status-failed/10 border border-status-failed/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        {isDemoMode && (
          <p className="text-center text-xs text-ink-disabled mt-5">
            Demo environment · fictional data · no connection to real networks
          </p>
        )}
      </div>
    </div>
  )
}
