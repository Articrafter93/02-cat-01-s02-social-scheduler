import { createWorkerClient } from '@/lib/supabase/server'
import { getConnector } from '@/lib/connectors'
import { calcBackoff } from '@/lib/utils'

const MAX_ATTEMPTS = parseInt(process.env.QUEUE_MAX_ATTEMPTS ?? '5')
const BACKOFF_BASE = parseInt(process.env.QUEUE_BACKOFF_BASE_SECONDS ?? '60')
const WORKER_ID = `worker-${process.env.VERCEL_REGION ?? 'local'}-${Date.now()}`

/**
 * Result of a worker run.
 *
 * `errors` counts JOB-level failures (a connector rejected a post). Those are
 * expected in normal operation — the sandbox connectors simulate rejections on
 * purpose — so they must NOT mark the run as failed.
 *
 * `fatal` is set only when the worker could not run at all (e.g. the claim RPC
 * failed). That is the infrastructure-level failure the cron must surface.
 *
 * Keeping them apart matters: conflating them either hides real outages behind a
 * green light (the bug that let `claim_next_jobs` fail unnoticed from 2026-07-20
 * to 2026-07-21) or turns the cron red on normal demo activity, which trains
 * everyone to ignore it.
 */
export type QueueRunResult = {
  processed: number
  errors: number
  fatal: string | null
}

export async function runQueueWorker(): Promise<QueueRunResult> {
  const supabase = await createWorkerClient()
  let processed = 0
  let errors = 0

  // Claim jobs using the stored function (FOR UPDATE SKIP LOCKED)
  const { data: jobs, error: claimError } = await supabase
    .rpc('claim_next_jobs', { p_worker_id: WORKER_ID, p_limit: 10 })

  if (claimError) {
    console.error('[queue] claim_next_jobs error:', claimError.message)
    return { processed: 0, errors: 0, fatal: `claim_next_jobs: ${claimError.message}` }
  }

  if (!jobs || jobs.length === 0) return { processed: 0, errors: 0, fatal: null }

  await Promise.all(
    jobs.map(async (job) => {
      try {
        const connector = getConnector(job.account_network)
        const result = await connector.publish({
          body: job.post_body,
          media_url: job.post_media_url,
          account_id: job.account_id,
          scheduled_post_id: job.id,
        })

        if (result.success) {
          await supabase
            .from('scheduled_posts')
            .update({
              status: 'published',
              published_at: new Date().toISOString(),
              locked_at: null,
              locked_by: null,
              last_error: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id)

          await supabase.from('audit_log').insert({
            organization_id: job.organization_id,
            action: 'post.published',
            target_type: 'scheduled_post',
            target_id: job.id,
            metadata: { external_id: result.external_id },
          })

          processed++
        } else {
          const isDead = job.attempts >= MAX_ATTEMPTS
          const nextStatus = isDead ? 'dead' : 'retrying'
          const nextAttempt = isDead ? null : calcBackoff(job.attempts, BACKOFF_BASE).toISOString()

          await supabase
            .from('scheduled_posts')
            .update({
              status: nextStatus,
              last_error: result.error ?? 'Unknown error',
              next_attempt_at: nextAttempt,
              locked_at: null,
              locked_by: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', job.id)

          await supabase.from('audit_log').insert({
            organization_id: job.organization_id,
            action: isDead ? 'post.dead' : 'post.failed',
            target_type: 'scheduled_post',
            target_id: job.id,
            metadata: { error: result.error, attempts: job.attempts },
          })

          errors++
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Internal error'
        await supabase
          .from('scheduled_posts')
          .update({
            status: job.attempts >= MAX_ATTEMPTS ? 'dead' : 'retrying',
            last_error: msg,
            next_attempt_at: calcBackoff(job.attempts, BACKOFF_BASE).toISOString(),
            locked_at: null,
            locked_by: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id)
        errors++
      }
    })
  )

  return { processed, errors, fatal: null }
}
