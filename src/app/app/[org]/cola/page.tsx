import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QueueTable } from '@/components/queue/QueueTable'
import type { ScheduledPostWithDetails } from '@/types'

interface Props { params: Promise<{ org: string }> }

export default async function QueuePage({ params }: Props) {
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

  const { data: posts } = await supabase
    .from('scheduled_posts')
    .select(`
      *,
      posts(body, media_url, networks),
      social_accounts(network, display_name, handle)
    `)
    .eq('organization_id', org.id)
    .order('updated_at', { ascending: false })
    .limit(100)

  const isReadOnly = membership.role === 'client_readonly'

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-edge bg-base flex-shrink-0 h-topbar">
        <h1 className="text-base font-semibold text-ink-primary">Publishing queue</h1>
        <span className="text-xs text-ink-disabled bg-base-panel border border-edge px-2 py-1 rounded tabular">
          {posts?.length ?? 0} posts
        </span>
      </div>
      <div className="flex-1 overflow-auto p-5">
        <QueueTable
          posts={(posts ?? []) as unknown as ScheduledPostWithDetails[]}
          isReadOnly={isReadOnly}
        />
      </div>
    </div>
  )
}
