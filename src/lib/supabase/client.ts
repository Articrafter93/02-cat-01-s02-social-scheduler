import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

export function createClient() {
  return createBrowserClient<Database, 'cat01s02_scheduler'>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: (process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA ?? 'cat01s02_scheduler') as 'cat01s02_scheduler' },
    }
  )
}
