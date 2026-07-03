/**
 * Creates 3 demo auth users with fixed UUIDs for the sandbox portfolio demo.
 * Run once after applying migrations: `npm run seed`
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'cat01s02_scheduler' },
})

const DEMO_PASSWORD = 'demo1234'

const DEMO_USERS = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    email: 'admin@demo.cat01s02',
    label: 'Administrador — Acme Corp',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    email: 'member@demo.cat01s02',
    label: 'Miembro del equipo — Acme Corp',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    email: 'client@demo.cat01s02',
    label: 'Cliente solo lectura — Brand Nova',
  },
]

async function main() {
  console.log('Creating demo users…')

  for (const user of DEMO_USERS) {
    // Check if user already exists
    const { data: existing } = await supabase.auth.admin.getUserById(user.id)
    if (existing?.user) {
      console.log(`  ✓ ${user.email} already exists`)
      continue
    }

    const { data, error } = await supabase.auth.admin.createUser({
      // Fixed UUID so seed.sql foreign keys resolve. The admin API (unlike a
      // raw INSERT into auth.users) also sets GoTrue's token columns to '',
      // avoiding the "converting NULL to string" 500 on sign-in.
      id: user.id,
      user_metadata: {},
      email: user.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
    })

    if (error) {
      // If user exists with different id, update
      if (error.message.includes('already')) {
        console.log(`  ~ ${user.email} exists (different id)`)
      } else {
        console.error(`  ✗ ${user.email}: ${error.message}`)
      }
      continue
    }

    if (data?.user && data.user.id !== user.id) {
      console.warn(`  ⚠ ${user.email} created with id ${data.user.id} (not ${user.id})`)
      console.warn('    Update seed.sql to use the actual id, or re-run with correct Supabase project.')
    } else {
      console.log(`  ✓ ${user.email} — ${user.label}`)
    }
  }

  console.log('\nDemo users ready.')
  console.log(`Password for all demo accounts: ${DEMO_PASSWORD}`)
  console.log('\nNext: run seed.sql in Supabase SQL Editor to insert org/account/post data.')
}

main().catch((e) => { console.error(e); process.exit(1) })
