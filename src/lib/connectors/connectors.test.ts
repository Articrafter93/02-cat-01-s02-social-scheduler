import { describe, it, expect } from 'vitest'
import { getConnector } from './index'

const payload = (id: string) => ({
  body: 'hello',
  media_url: null,
  account_id: 'acc-1',
  scheduled_post_id: id,
})

// The sandbox connectors stand in for real OAuth publishing. They must be
// DETERMINISTIC (so the demo's post states are stable and the worker is
// idempotent) and must expose a real failure path (so the DLQ/retry flow is
// reachable, not decorative).
describe('social connectors (deterministic sandbox)', () => {
  it('returns the same result for the same scheduled_post_id', async () => {
    const c = getConnector('instagram')
    const a = await c.publish(payload('stable-id-abc'))
    const b = await c.publish(payload('stable-id-abc'))
    expect(a.success).toBe(b.success)
  })

  it('throws for an unregistered network', () => {
    expect(() => getConnector('tiktok')).toThrow(/tiktok/)
  })

  it('reaches BOTH the success and failure branches across many ids', async () => {
    const c = getConnector('linkedin')
    const results = await Promise.all(
      Array.from({ length: 80 }, (_, i) => c.publish(payload(`id-${i}`)))
    )
    const successes = results.filter((r) => r.success).length
    const failures = results.length - successes
    expect(successes).toBeGreaterThan(0)
    expect(failures).toBeGreaterThan(0)
  })

  it('emits an external_id on success and an error message on failure', async () => {
    const c = getConnector('facebook')
    const results = await Promise.all(
      Array.from({ length: 40 }, (_, i) => c.publish(payload(`fb-${i}`)))
    )
    for (const r of results) {
      if (r.success) expect(r.external_id).toBeTruthy()
      else expect(r.error).toBeTruthy()
    }
  })
})
