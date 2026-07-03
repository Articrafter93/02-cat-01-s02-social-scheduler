import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isPostMediaUrlForOrg } from '@/lib/media'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { body: text, account_ids, scheduled_at, timezone, media_url: mediaUrlRaw } = body

  if (!text?.trim()) return NextResponse.json({ error: 'Post text cannot be empty.' }, { status: 400 })
  if (!Array.isArray(account_ids) || account_ids.length === 0)
    return NextResponse.json({ error: 'Select at least one account.' }, { status: 400 })
  if (!scheduled_at) return NextResponse.json({ error: 'A publish date is required.' }, { status: 400 })
  if (new Date(scheduled_at) <= new Date())
    return NextResponse.json({ error: 'The date must be in the future.' }, { status: 400 })

  // Verify accounts belong to an org the user has write access to
  const { data: accounts } = await supabase
    .from('social_accounts')
    .select('id, organization_id, network')
    .in('id', account_ids)

  if (!accounts || accounts.length !== account_ids.length)
    return NextResponse.json({ error: 'One or more accounts do not exist.' }, { status: 400 })

  const orgIds = [...new Set(accounts.map((a) => a.organization_id))]
  if (orgIds.length > 1)
    return NextResponse.json({ error: 'Accounts must belong to the same organization.' }, { status: 400 })

  const orgId = orgIds[0]

  // Validate media_url (optional): must belong to our bucket AND this org's path,
  // so a caller can't attach another org's image or an arbitrary external URL.
  const mediaUrl: string | null =
    typeof mediaUrlRaw === 'string' && mediaUrlRaw.length > 0 ? mediaUrlRaw : null
  if (mediaUrl && !isPostMediaUrlForOrg(mediaUrl, orgId, process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    return NextResponse.json({ error: 'Invalid image.' }, { status: 400 })
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('organization_id', orgId)
    .single()

  if (!membership || membership.role === 'client_readonly')
    return NextResponse.json({ error: 'No write permission in this organization.' }, { status: 403 })

  const networks = [...new Set(accounts.map((a) => a.network))]

  // Create post
  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({ organization_id: orgId, author_id: user.id, body: text.trim(), networks, media_url: mediaUrl })
    .select('id')
    .single()

  if (postError || !post)
    return NextResponse.json({ error: 'Failed to create post.' }, { status: 500 })

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
    return NextResponse.json({ error: 'Failed to schedule post.' }, { status: 500 })

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
