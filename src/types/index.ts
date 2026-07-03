import type { PostStatus, SocialNetwork, MemberRole, AccountStatus } from '@/lib/supabase/types'

export type { PostStatus, SocialNetwork, MemberRole, AccountStatus }

export interface Organization {
  id: string
  name: string
  slug: string
  timezone: string
  color: string
}

export interface Membership {
  id: string
  user_id: string
  organization_id: string
  role: MemberRole
}

export interface SocialAccount {
  id: string
  organization_id: string
  network: SocialNetwork
  display_name: string
  handle: string
  status: AccountStatus
}

export interface Post {
  id: string
  organization_id: string
  author_id: string | null
  body: string
  media_url: string | null
  networks: SocialNetwork[]
  created_at: string
  updated_at: string
}

export interface ScheduledPost {
  id: string
  post_id: string
  account_id: string
  organization_id: string
  scheduled_at: string
  timezone: string
  status: PostStatus
  attempts: number
  max_attempts: number
  next_attempt_at: string | null
  locked_at: string | null
  locked_by: string | null
  last_error: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface ScheduledPostWithDetails extends ScheduledPost {
  posts: Pick<Post, 'body' | 'media_url' | 'networks'>
  social_accounts: Pick<SocialAccount, 'network' | 'display_name' | 'handle'>
}

export interface Metrics {
  id: string
  account_id: string
  organization_id: string
  date: string
  reach: number
  impressions: number
  engagement: number
}
