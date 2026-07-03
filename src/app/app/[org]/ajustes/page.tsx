import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface Props { params: Promise<{ org: string }> }

export default async function SettingsPage({ params }: Props) {
  const { org: orgSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, timezone, color')
    .eq('slug', orgSlug)
    .single()
  if (!org) redirect('/app')

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', org.id)
    .single()
  if (!membership || membership.role !== 'admin') redirect(`/app/${orgSlug}/calendario`)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 py-3 border-b border-edge bg-base flex-shrink-0 h-topbar">
        <h1 className="text-base font-semibold text-ink-primary">Settings</h1>
      </div>
      <div className="flex-1 overflow-auto p-5 max-w-lg">
        <div className="space-y-5">
          <div className="p-4 rounded-lg border border-edge bg-base-panel space-y-3">
            <h2 className="text-sm font-semibold text-ink-primary">Organization info</h2>
            <div>
              <p className="text-xs text-ink-secondary mb-1">Name</p>
              <p className="text-sm text-ink-primary">{org.name}</p>
            </div>
            <div>
              <p className="text-xs text-ink-secondary mb-1">Timezone</p>
              <p className="text-sm text-ink-primary">{org.timezone}</p>
            </div>
            <div>
              <p className="text-xs text-ink-secondary mb-1">Brand color</p>
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full border border-edge"
                  style={{ background: org.color }}
                  aria-hidden="true"
                />
                <p className="text-sm text-ink-primary tabular">{org.color}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-edge/50 bg-base-panel/50">
            <p className="text-xs text-ink-secondary">
              <strong className="text-ink-primary">Sandbox build:</strong> organization settings are
              read-only here. Full editing is available in production.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
