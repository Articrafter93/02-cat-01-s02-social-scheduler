import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AppIndexPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('memberships')
    .select('organizations(slug)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const org = data?.organizations as { slug: string } | null
  if (org?.slug) redirect(`/app/${org.slug}/calendario`)

  return (
    <div className="flex items-center justify-center h-screen bg-base">
      <div className="text-center">
        <h1 className="text-lg font-semibold text-ink-primary mb-2">Sin organizaciones</h1>
        <p className="text-sm text-ink-secondary">
          Tu cuenta no tiene organizaciones asignadas. Contacta al administrador.
        </p>
      </div>
    </div>
  )
}
