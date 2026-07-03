import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CalendarView } from '@/components/calendar/CalendarView'
import type { ScheduledPostWithDetails } from '@/types'

interface Props { params: Promise<{ org: string }> }

export default async function CalendarPage({ params }: Props) {
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

  const { data: scheduledPosts } = await supabase
    .from('scheduled_posts')
    .select(`
      *,
      posts(body, media_url, networks),
      social_accounts(network, display_name, handle)
    `)
    .eq('organization_id', org.id)
    .order('scheduled_at', { ascending: true })

  const isReadOnly = membership.role === 'client_readonly'

  return (
    <div className="flex flex-col h-full">
      {/* Topbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-edge bg-base flex-shrink-0 h-topbar">
        <h1 className="text-base font-semibold text-ink-primary">Calendar</h1>
        {!isReadOnly && (
          <Link
            href={`/app/${orgSlug}/componer`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-brand hover:bg-brand-hover text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            New post
          </Link>
        )}
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-hidden">
        <CalendarView
          scheduledPosts={(scheduledPosts ?? []) as unknown as ScheduledPostWithDetails[]}
          orgSlug={orgSlug}
        />
      </div>
    </div>
  )
}
