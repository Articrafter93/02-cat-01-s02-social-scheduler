-- Seed: demo data for cat01s02_scheduler
-- Run AFTER create-demo-users.ts to have auth.users in place.
-- Demo UUIDs match those in scripts/create-demo-users.ts

-- ──────────────────────────────────────────────────────────────────
-- Normalize GoTrue token columns for demo users.
-- When auth.users are seeded via raw SQL, these columns default to NULL,
-- and GoTrue's /token endpoint then 500s with
-- "converting NULL to string is unsupported". They MUST be '' (empty string).
-- ──────────────────────────────────────────────────────────────────
UPDATE auth.users SET
  confirmation_token         = coalesce(confirmation_token, ''),
  recovery_token             = coalesce(recovery_token, ''),
  email_change               = coalesce(email_change, ''),
  email_change_token_new     = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change               = coalesce(phone_change, ''),
  phone_change_token         = coalesce(phone_change_token, ''),
  reauthentication_token     = coalesce(reauthentication_token, '')
WHERE id IN (
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000003'
);

-- ──────────────────────────────────────────────────────────────────
-- Organizations
-- ──────────────────────────────────────────────────────────────────
INSERT INTO cat01s02_scheduler.organizations (id, name, slug, color, timezone) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Acme Corp', 'acme-corp', '#6366f1', 'America/Bogota'),
  ('10000000-0000-0000-0000-000000000002', 'Brand Nova', 'brand-nova', '#ec4899', 'America/Bogota')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────
-- Memberships  (users created by create-demo-users.ts)
-- admin@demo.cat01s02    → 20000000-0000-0000-0000-000000000001
-- member@demo.cat01s02   → 20000000-0000-0000-0000-000000000002
-- client@demo.cat01s02   → 20000000-0000-0000-0000-000000000003
-- ──────────────────────────────────────────────────────────────────
-- Agency admin manages BOTH brands (core of the brief: an agency handling
-- several clients). This makes the multi-brand switch demonstrable.
INSERT INTO cat01s02_scheduler.memberships (user_id, organization_id, role) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'admin'),
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'admin'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'member'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'client_readonly')
ON CONFLICT (user_id, organization_id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────
-- Social accounts
-- ──────────────────────────────────────────────────────────────────
INSERT INTO cat01s02_scheduler.social_accounts (id, organization_id, network, display_name, handle, status) VALUES
  -- Acme Corp
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'instagram', 'Acme Corp Instagram', '@acme_corp_ig', 'connected'),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'linkedin',  'Acme Corp LinkedIn',  'Acme Corp',     'connected'),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'facebook',  'Acme Corp Page',     'AcmeCorpPage',  'connected'),
  -- Brand Nova
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'instagram', 'Brand Nova IG',      '@brandnova',    'connected'),
  ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'linkedin',  'Brand Nova LI',      'Brand Nova',    'disconnected')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────
-- Posts + scheduled_posts  (covering all 7 states for demo)
-- ──────────────────────────────────────────────────────────────────

-- 1. PUBLISHED — yesterday
INSERT INTO cat01s02_scheduler.posts (id, organization_id, author_id, body, networks) VALUES
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001',
   '🚀 We just launched our new product line. Visit our site to discover what''s new!',
   ARRAY['instagram','linkedin'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO cat01s02_scheduler.scheduled_posts
  (id, post_id, account_id, organization_id, status, scheduled_at, timezone, attempts, published_at, next_attempt_at) VALUES
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001',
   '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'published', now() - interval '1 day', 'America/Bogota', 1, now() - interval '23 hours', null),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001',
   '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   'published', now() - interval '1 day', 'America/Bogota', 1, now() - interval '23 hours', null)
ON CONFLICT (id) DO NOTHING;

-- 2. SCHEDULED — tomorrow
INSERT INTO cat01s02_scheduler.posts (id, organization_id, author_id, body, networks) VALUES
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002',
   'Live event this Wednesday. Remember to register early — seats are limited.',
   ARRAY['facebook','linkedin'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO cat01s02_scheduler.scheduled_posts
  (id, post_id, account_id, organization_id, status, scheduled_at, timezone, attempts, next_attempt_at) VALUES
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002',
   '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
   'scheduled', now() + interval '1 day', 'America/Bogota', 0, now() + interval '1 day'),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000002',
   '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   'scheduled', now() + interval '1 day', 'America/Bogota', 0, now() + interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- 3. FAILED — attempts < max_attempts
INSERT INTO cat01s02_scheduler.posts (id, organization_id, author_id, body, networks) VALUES
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001',
   'Behind the scenes: a day of work at Acme Corp. #teamwork',
   ARRAY['instagram'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO cat01s02_scheduler.scheduled_posts
  (id, post_id, account_id, organization_id, status, scheduled_at, timezone, attempts, max_attempts, last_error, next_attempt_at) VALUES
  ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000003',
   '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'failed', now() - interval '2 hours', 'America/Bogota', 2, 5,
   'Instagram API: rate limit exceeded (sandbox simulation)',
   now() + interval '5 minutes')
ON CONFLICT (id) DO NOTHING;

-- 4. DEAD (DLQ) — max_attempts reached
INSERT INTO cat01s02_scheduler.posts (id, organization_id, author_id, body, networks) VALUES
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001',
   'Our annual report is out. Results that speak for themselves.',
   ARRAY['linkedin'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO cat01s02_scheduler.scheduled_posts
  (id, post_id, account_id, organization_id, status, scheduled_at, timezone, attempts, max_attempts, last_error, next_attempt_at) VALUES
  ('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000004',
   '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001',
   'dead', now() - interval '6 hours', 'America/Bogota', 5, 5,
   'LinkedIn API: access token expired (sandbox simulation)',
   null)
ON CONFLICT (id) DO NOTHING;

-- 5. DRAFT
INSERT INTO cat01s02_scheduler.posts (id, organization_id, author_id, body, networks) VALUES
  ('40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002',
   'Draft: ideas for the upcoming summer campaign. What''s your favorite color?',
   ARRAY['instagram','facebook'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO cat01s02_scheduler.scheduled_posts
  (id, post_id, account_id, organization_id, status, scheduled_at, timezone, attempts, next_attempt_at) VALUES
  ('50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000005',
   '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'draft', now() + interval '3 days', 'America/Bogota', 0, now() + interval '3 days')
ON CONFLICT (id) DO NOTHING;

-- 6. RETRYING
INSERT INTO cat01s02_scheduler.posts (id, organization_id, author_id, body, networks) VALUES
  ('40000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001',
   'Big news coming soon. Stay tuned to our channels. 👀',
   ARRAY['facebook'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO cat01s02_scheduler.scheduled_posts
  (id, post_id, account_id, organization_id, status, scheduled_at, timezone, attempts, max_attempts, last_error, next_attempt_at) VALUES
  ('50000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000006',
   '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001',
   'retrying', now() - interval '30 minutes', 'America/Bogota', 1, 5,
   'Facebook API: temporary service unavailable (sandbox simulation)',
   now() + interval '2 minutes')
ON CONFLICT (id) DO NOTHING;

-- 7. Brand Nova — scheduled post (for client_readonly demo)
INSERT INTO cat01s02_scheduler.posts (id, organization_id, author_id, body, networks) VALUES
  ('40000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000002',
   '20000000-0000-0000-0000-000000000001',
   'Brand Nova: new collection available. Design that inspires, quality that lasts.',
   ARRAY['instagram'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO cat01s02_scheduler.scheduled_posts
  (id, post_id, account_id, organization_id, status, scheduled_at, timezone, attempts, next_attempt_at) VALUES
  ('50000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000007',
   '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002',
   'scheduled', now() + interval '2 days', 'America/Bogota', 0, now() + interval '2 days')
ON CONFLICT (id) DO NOTHING;

-- ──────────────────────────────────────────────────────────────────
-- Metrics (30 days of sample data for Acme Corp Instagram)
-- ──────────────────────────────────────────────────────────────────
INSERT INTO cat01s02_scheduler.metrics (account_id, organization_id, date, reach, impressions, engagement)
SELECT
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  (CURRENT_DATE - (n || ' days')::INTERVAL)::DATE,
  (500 + (random() * 1500)::INT),
  (800 + (random() * 2500)::INT),
  (20 + (random() * 200)::INT)
FROM generate_series(1, 30) AS n
ON CONFLICT (account_id, date) DO NOTHING;

-- LinkedIn metrics
INSERT INTO cat01s02_scheduler.metrics (account_id, organization_id, date, reach, impressions, engagement)
SELECT
  '30000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  (CURRENT_DATE - (n || ' days')::INTERVAL)::DATE,
  (200 + (random() * 800)::INT),
  (300 + (random() * 1200)::INT),
  (10 + (random() * 80)::INT)
FROM generate_series(1, 30) AS n
ON CONFLICT (account_id, date) DO NOTHING;
