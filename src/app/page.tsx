import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data } = await supabase
      .from('memberships')
      .select('organizations(slug)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    const org = data?.organizations as { slug: string } | null
    if (org?.slug) redirect(`/app/${org.slug}/calendario`)
  }

  redirect('/login')
}
