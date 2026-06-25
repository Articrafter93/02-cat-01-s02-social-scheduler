import { NextRequest, NextResponse } from 'next/server'
import { runQueueWorker } from '@/lib/queue/worker'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  // Allow demo mode without secret (for the "Procesar ahora" button)
  const secret = req.headers.get('x-queue-secret') ?? ''
  const expectedSecret = process.env.QUEUE_CRON_SECRET ?? ''
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && process.env.NODE_ENV !== 'production'

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
