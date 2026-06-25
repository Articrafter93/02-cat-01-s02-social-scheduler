import type { SocialConnector, PublishPayload, PublishResult } from './base'

export class FacebookConnector implements SocialConnector {
  network = 'facebook'

  async publish(payload: PublishPayload): Promise<PublishResult> {
    await new Promise((r) => setTimeout(r, 150 + Math.random() * 250))

    const hash = payload.scheduled_post_id
      .split('')
      .reduce((a, c) => a + c.charCodeAt(0), 0)

    if (hash % 100 < 10) {
      return { success: false, error: 'Facebook API: page permissions revoked (sandbox simulation)' }
    }

    return {
      success: true,
      external_id: `fb_${Date.now()}_${hash}`,
    }
  }
}
