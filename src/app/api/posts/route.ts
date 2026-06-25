import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { body: text, account_ids, scheduled_at, timezone } = body

  if (!text?.trim()) return NextResponse.json({ error: 'El texto del post no puede estar vacío.' }, { status: 400 })
  if (!Array.isArray(account_ids) || account_ids.length === 0)
    return NextResponse.json({ error: 'Debes seleccionar al menos una cuenta.' }, { status: 400 })
  if (!scheduled_at) return NextResponse.json({ error: 'Fecha de publicación requerida.' }, { status: 400 })
  if (new Date(scheduled_at) <= new Date())
    return NextResponse.json({ error: 'La fecha debe ser en el futuro.' }, { status: 400 })

  // Verify accounts belong to an org the user has write access to
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('id, organization_id, network')
    .in('id', account_ids)

  if (!accounts || accounts.length !== account_ids.length)
    return NextResponse.json({ error: 'Una o más cuentas no existen.' }, { status: 400 })

  const orgIds = [...new Set(accounts.map((a) => a.organization_id))]
  if (orgIds.length > 1)
    return NextResponse.json({ error: 'Las cuentas deben pertenecer a la misma organización.' }, { status: 400 })

  const orgId = orgIds[0]

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', orgId)
    .single()

  if (!membership || membership.role === 'client_readonly')
    return NextResponse.json({ error: 'Sin permisos de escritura en esta organización.' }, { status: 403 })

  const networks = [...new Set(accounts.map((a) => a.network))] as string[]

  // Create post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({ organization_id: orgId, author_id: user.id, body: text.trim(), networks })
    .select('id')
    .single()

  if (postError || !post)
    return NextResponse.json({ error: 'Error al crear el post.' }, { status: 500 })

  // Schedule one entry per account
  const schedules = accounts.map((acc) => ({
    post_id: post.id,
    account_id: acc.id,
    organization_id: orgId,
    scheduled_at,
    timezone: timezone ?? 'America/Bogota',
    status: 'scheduled' as const,
    next_attempt_at: scheduled_at,
  }))

  const { error: scheduleError } = await supabase.from('scheduled_posts').insert(schedules)
  if (scheduleError)
    return NextResponse.json({ error: 'Error al programar el post.' }, { status: 500 })

  await supabase.from('audit_log').insert({
    organization_id: orgId,
    actor_id: user.id,
    action: 'post.scheduled',
    target_type: 'post',
    target_id: post.id,
    metadata: { account_ids, scheduled_at },
  })

  return NextResponse.json({ ok: true, post_id: post.id }, { status: 201 })
}
