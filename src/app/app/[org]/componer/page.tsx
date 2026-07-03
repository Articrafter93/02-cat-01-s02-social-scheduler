import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ComposerForm } from '@/components/composer/ComposerForm'
import type { SocialAccount } from '@/types'

interface Props { params: Promise<{ org: string }> }

export default async function ComposePage({ params }: Props) {
  const { org: orgSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('id, timezone')
    .eq('slug', orgSlug)
    .single()
  if (!org) redirect('/app')

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', org.id)
    .single()
  if (!membership || membership.role === 'client_readonly') redirect(`/app/${orgSlug}/calendario`)

  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('organization_id', org.id)
    .eq('status', 'connected')
    .order('network')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center px-5 py-3 border-b border-edge bg-base flex-shrink-0 h-topbar">
        <h1 className="text-base font-semibold text-ink-primary">Compose post</h1>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <ComposerForm
          accounts={(accounts ?? []) as SocialAccount[]}
          orgId={org.id}
          orgSlug={orgSlug}
          orgTimezone={org.timezone}
        />
      </div>
    </div>
  )
}
