import { redirect } from 'next/navigation'
import { Share2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NetworkBadge } from '@/components/ui/NetworkBadge'
import type { SocialAccount } from '@/types'

interface Props { params: Promise<{ org: string }> }

const STATUS_LABEL: Record<string, string> = {
  connected: 'Connected',
  disconnected: 'Disconnected',
  error: 'Error',
}
const STATUS_COLOR: Record<string, string> = {
  connected: '#10b981',
  disconnected: '#94a3b8',
  error: '#f43f5e',
}

export default async function AccountsPage({ params }: Props) {
  const { org: orgSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()
  if (!org) redirect('/app')

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', org.id)
    .single()
  if (!membership) redirect('/app')

  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('organization_id', org.id)
    .order('network')

  const isReadOnly = membership.role === 'client_readonly'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 py-3 border-b border-edge bg-base flex-shrink-0 h-topbar">
        <h1 className="text-base font-semibold text-ink-primary">Connected accounts</h1>
      </div>
      <div className="flex-1 overflow-auto p-5">
        {(accounts ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Share2 className="w-10 h-10 text-ink-disabled" />
            <p className="text-sm text-ink-secondary">No connected accounts</p>
            <p className="text-xs text-ink-disabled">Connected social accounts will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-3 max-w-2xl">
            {(accounts as SocialAccount[]).map((acc) => (
              <div
                key={acc.id}
                className="flex items-center gap-4 p-4 rounded-lg border border-edge bg-base-panel"
              >
                <NetworkBadge network={acc.network} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-primary">{acc.display_name}</p>
                  <p className="text-xs text-ink-disabled">{acc.handle}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: STATUS_COLOR[acc.status] }}
                    aria-hidden="true"
                  />
                  <span className="text-xs" style={{ color: STATUS_COLOR[acc.status] }}>
                    {STATUS_LABEL[acc.status]}
                  </span>
                </div>
                {!isReadOnly && (
                  <span className="text-xs text-ink-disabled border border-edge px-2 py-1 rounded">
                    Sandbox
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {!isReadOnly && (
          <div className="mt-6 p-4 rounded-lg border border-edge/50 bg-base-panel/50 max-w-2xl">
            <p className="text-xs text-ink-secondary">
              <strong className="text-ink-primary">Sandbox mode:</strong> accounts use simulated connectors.
              Connecting real accounts is a matter of swapping in OAuth — the queue and data model stay the same.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
