export interface PublishPayload {
  body: string
  media_url: string | null
  account_id: string
  scheduled_post_id: string
}

export interface PublishResult {
  success: boolean
  external_id?: string
  error?: string
}

export interface SocialConnector {
  network: string
  publish(payload: PublishPayload): Promise<PublishResult>
}
