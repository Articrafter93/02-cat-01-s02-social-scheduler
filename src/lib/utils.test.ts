import { describe, it, expect } from 'vitest'
import { calcBackoff } from './utils'

// The queue's "never drop a post" guarantee relies on exponential backoff:
// a transient failure must not burn all retries at once, and a high attempt
// count must not schedule the next try absurdly far in the future.
describe('calcBackoff', () => {
  const secondsUntilNextTry = (attempts: number, base = 60) =>
    Math.round((calcBackoff(attempts, base).getTime() - Date.now()) / 1000)

  it('doubles the delay with each attempt (base * 2^(n-1))', () => {
    expect(secondsUntilNextTry(1)).toBe(60)
    expect(secondsUntilNextTry(2)).toBe(120)
    expect(secondsUntilNextTry(3)).toBe(240)
    expect(secondsUntilNextTry(4)).toBe(480)
  })

  it('caps the delay at 1 hour so retries never drift days away', () => {
    // 60 * 2^19 seconds would be ~364 days without the cap.
    expect(secondsUntilNextTry(20)).toBe(3600)
  })

  it('honors a custom base', () => {
    expect(secondsUntilNextTry(3, 30)).toBe(120) // 30 * 2^2
  })
})
