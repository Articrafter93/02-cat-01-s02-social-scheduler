import { InstagramConnector } from './instagram'
import { LinkedInConnector } from './linkedin'
import { FacebookConnector } from './facebook'
import type { SocialConnector } from './base'

const CONNECTORS: Record<string, SocialConnector> = {
  instagram: new InstagramConnector(),
  linkedin: new LinkedInConnector(),
  facebook: new FacebookConnector(),
}

export function getConnector(network: string): SocialConnector {
  const connector = CONNECTORS[network]
  if (!connector) throw new Error(`No connector registered for network: ${network}`)
  return connector
}

export type { SocialConnector, PublishPayload, PublishResult } from './base'
