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
    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    console.error('[queue/process] error:', error)
    return NextResponse.json({ error: 'Queue processing failed' }, { status: 500 })
  }
}
