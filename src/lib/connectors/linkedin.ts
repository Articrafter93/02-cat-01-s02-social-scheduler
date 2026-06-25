import type { SocialConnector, PublishPayload, PublishResult } from './base'

export class LinkedInConnector implements SocialConnector {
  network = 'linkedin'

  async publish(payload: PublishPayload): Promise<PublishResult> {
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 300))

    const hash = payload.scheduled_post_id
      .split('')
      .reduce((a, c) => a + c.charCodeAt(0), 0)

    if (hash % 100 < 8) {
      return { success: false, error: 'LinkedIn API: access token expired (sandbox simulation)' }
    }

    return {
      success: true,
      external_id: `li_${Date.now()}_${hash}`,
    }
  }
}
