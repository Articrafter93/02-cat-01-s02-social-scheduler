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
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: 'memberships_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'social_accounts_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'posts_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'scheduled_posts_post_id_fkey'
            columns: ['post_id']
            isOneToOne: false
            referencedRelation: 'posts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'scheduled_posts_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'social_accounts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'scheduled_posts_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'metrics_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'social_accounts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'metrics_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'audit_log_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_next_jobs: {
        Args: { p_worker_id: string; p_limit?: number }
        // Mantener alineado con el RETURNS TABLE de la funcion en la migracion
        // 005 (10 columnas). Antes declaraba `timezone` y `account_display_name`,
        // que la funcion nunca devolvio: ningun consumidor los leia, pero el
        // drift ocultaba que tipo y SQL habian dejado de coincidir.
        Returns: {
          id: string
          post_id: string
          account_id: string
          organization_id: string
          post_body: string
          post_media_url: string | null
          account_network: string
          scheduled_at: string
          attempts: number
          max_attempts: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
