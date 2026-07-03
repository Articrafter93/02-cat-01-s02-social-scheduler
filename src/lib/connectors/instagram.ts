import type { SocialConnector, PublishPayload, PublishResult } from './base'

// Deterministic sandbox: succeeds ~85% of the time based on post ID hash.
// Simulates real failure rates without external API calls.
export class InstagramConnector implements SocialConnector {
  network = 'instagram'

  async publish(payload: PublishPayload): Promise<PublishResult> {
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 400))

    const hash = payload.scheduled_post_id
      .split('')
      .reduce((a, c) => a + c.charCodeAt(0), 0)

    if (hash % 100 < 15) {
      return { success: false, error: 'Instagram API: rate limit exceeded (sandbox simulation)' }
    }

    return {
      success: true,
      external_id: `ig_${Date.now()}_${hash}`,
    }
  }
}
