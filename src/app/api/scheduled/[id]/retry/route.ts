import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext { params: Promise<{ id: string }> }

export async function POST(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: sp } = await supabase
    .from('scheduled_posts')
    .select('status, organization_id')
    .eq('id', id)
    .single()

  if (!sp) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (!['failed', 'dead'].includes(sp.status))
    return NextResponse.json({ error: 'Only failed or dead posts can be retried' }, { status: 400 })

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', sp.organization_id)
    .single()
  if (!membership || membership.role === 'client_readonly')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { error } = await supabase
    .from('scheduled_posts')
    .update({
      status: 'scheduled',
      next_attempt_at: new Date().toISOString(),
      last_error: null,
      attempts: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: 'Failed to retry' }, { status: 500 })

  await supabase.from('audit_log').insert({
    organization_id: sp.organization_id,
    actor_id: user.id,
    action: 'post.retry_requested',
    target_type: 'scheduled_post',
    target_id: id,
    metadata: {},
  })

  return NextResponse.json({ ok: true })
}
