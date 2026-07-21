import { NextRequest, NextResponse } from 'next/server'
import { runQueueWorker } from '@/lib/queue/worker'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  // Allow demo mode without secret (for the "Procesar ahora" button)
  const secret = req.headers.get('x-queue-secret') ?? ''
  const expectedSecret = process.env.QUEUE_CRON_SECRET ?? ''
  // Demo opt-in (build-time flag), so the exhibition deploy (NODE_ENV=production)
  // can trigger the worker from the "Procesar ahora" button without a secret.
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

  if (!isDemoMode && secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await runQueueWorker()

    // A worker-level failure must surface as 5xx: the cron checks the HTTP
    // status, so returning 200 here would keep the light green while the queue
    // silently stops draining (exactly what happened 2026-07-20 -> 2026-07-21,
    // when claim_next_jobs returned 400 on every run and the cron stayed green).
    // Job-level failures (result.errors) are NOT fatal — the sandbox connectors
    // reject posts on purpose, so a red light on those would be a false alarm.
    if (result.fatal) {
      console.error('[queue/process] fatal:', result.fatal)
      return NextResponse.json({ ok: false, error: result.fatal, ...result }, { status: 500 })
    }

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[queue/process] error:', error)
    return NextResponse.json({ error: 'Queue processing failed' }, { status: 500 })
  }
}
