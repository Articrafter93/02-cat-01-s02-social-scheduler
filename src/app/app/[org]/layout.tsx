import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import type { Organization, MemberRole } from '@/types'

interface Props {
  children: React.ReactNode
  params: Promise<{ org: string }>
}

export default async function OrgLayout({ children, params }: Props) {
  const { org: orgSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch target org
  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, slug, color, timezone')
    .eq('slug', orgSlug)
    .single()

  if (!org) redirect('/app')

  // Check membership in this org
  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', org.id)
    .single()

  if (!membership) redirect('/app')

  // Fetch all user orgs for the brand selector
  const { data: allMemberships } = await supabase
    .from('memberships')
    .select('organizations(id, name, slug, color, timezone)')
    .eq('user_id', user.id)

  const allOrgs: Organization[] = (allMemberships ?? [])
    .map((m) => m.organizations as Organization)
    .filter(Boolean)

  return (
    <div className="flex h-screen overflow-hidden bg-base">
      <Sidebar
        currentOrg={org as Organization}
        allOrgs={allOrgs}
        currentOrgSlug={orgSlug}
        userRole={membership.role as MemberRole}
        userEmail={user.email ?? ''}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
