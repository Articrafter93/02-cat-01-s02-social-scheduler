export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'retrying' | 'dead'
export type SocialNetwork = 'instagram' | 'linkedin' | 'facebook'
export type MemberRole = 'admin' | 'member' | 'client_readonly'
export type AccountStatus = 'connected' | 'disconnected' | 'error'

export interface Database {
  cat01s02_scheduler: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          timezone: string
          color: string
          created_at: string
        }
        Insert: Partial<Pick<Database['cat01s02_scheduler']['Tables']['organizations']['Row'], 'id' | 'timezone' | 'color' | 'created_at'>> & Pick<Database['cat01s02_scheduler']['Tables']['organizations']['Row'], 'name' | 'slug'>
        Update: Partial<Database['cat01s02_scheduler']['Tables']['organizations']['Row']>
      }
      memberships: {
        Row: {
          id: string
          user_id: string
          organization_id: string
          role: MemberRole
          created_at: string
        }
        Insert: Partial<Pick<Database['cat01s02_scheduler']['Tables']['memberships']['Row'], 'id' | 'created_at'>> & Pick<Database['cat01s02_scheduler']['Tables']['memberships']['Row'], 'user_id' | 'organization_id' | 'role'>
        Update: Partial<Database['cat01s02_scheduler']['Tables']['memberships']['Row']>
      }
      social_accounts: {
        Row: {
          id: string
          organization_id: string
          network: SocialNetwork
          display_name: string
          handle: string
          status: AccountStatus
          created_at: string
        }
        Insert: Partial<Pick<Database['cat01s02_scheduler']['Tables']['social_accounts']['Row'], 'id' | 'status' | 'created_at'>> & Pick<Database['cat01s02_scheduler']['Tables']['social_accounts']['Row'], 'organization_id' | 'network' | 'display_name' | 'handle'>
        Update: Partial<Database['cat01s02_scheduler']['Tables']['social_accounts']['Row']>
      }
      posts: {
        Row: {
          id: string
          organization_id: string
          author_id: string | null
          body: string
          media_url: string | null
          networks: SocialNetwork[]
          created_at: string
          updated_at: string
        }
        Insert: Partial<Pick<Database['cat01s02_scheduler']['Tables']['posts']['Row'], 'id' | 'author_id' | 'media_url' | 'created_at' | 'updated_at'>> & Pick<Database['cat01s02_scheduler']['Tables']['posts']['Row'], 'organization_id' | 'body' | 'networks'>
        Update: Partial<Database['cat01s02_scheduler']['Tables']['posts']['Row']>
      }
      scheduled_posts: {
        Row: {
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
        Insert: Partial<Pick<Database['cat01s02_scheduler']['Tables']['scheduled_posts']['Row'], 'id' | 'status' | 'attempts' | 'max_attempts' | 'next_attempt_at' | 'locked_at' | 'locked_by' | 'last_error' | 'published_at' | 'created_at' | 'updated_at'>> & Pick<Database['cat01s02_scheduler']['Tables']['scheduled_posts']['Row'], 'post_id' | 'account_id' | 'organization_id' | 'scheduled_at' | 'timezone'>
        Update: Partial<Database['cat01s02_scheduler']['Tables']['scheduled_posts']['Row']>
      }
      metrics: {
        Row: {
          id: string
          account_id: string
          organization_id: string
          date: string
          reach: number
          impressions: number
          engagement: number
          created_at: string
        }
        Insert: Partial<Pick<Database['cat01s02_scheduler']['Tables']['metrics']['Row'], 'id' | 'reach' | 'impressions' | 'engagement' | 'created_at'>> & Pick<Database['cat01s02_scheduler']['Tables']['metrics']['Row'], 'account_id' | 'organization_id' | 'date'>
        Update: Partial<Database['cat01s02_scheduler']['Tables']['metrics']['Row']>
      }
      audit_log: {
        Row: {
          id: string
          organization_id: string
          actor_id: string | null
          action: string
          target_type: string | null
          target_id: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: Partial<Pick<Database['cat01s02_scheduler']['Tables']['audit_log']['Row'], 'id' | 'actor_id' | 'target_type' | 'target_id' | 'metadata' | 'created_at'>> & Pick<Database['cat01s02_scheduler']['Tables']['audit_log']['Row'], 'organization_id' | 'action'>
        Update: Partial<Database['cat01s02_scheduler']['Tables']['audit_log']['Row']>
      }
    }
    Functions: {
      claim_next_jobs: {
        Args: { p_worker_id: string; p_limit?: number }
        Returns: {
          id: string
          post_id: string
          account_id: string
          organization_id: string
          scheduled_at: string
          timezone: string
          attempts: number
          max_attempts: number
          post_body: string
          post_media_url: string | null
          account_network: string
          account_display_name: string
        }[]
      }
    }
  }
}
