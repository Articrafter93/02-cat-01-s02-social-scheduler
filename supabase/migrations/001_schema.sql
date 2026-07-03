-- Migration 001: Initial schema for cat01s02_scheduler
-- Schema-pooling: dedicated schema for this project (free-tier Supabase)

CREATE SCHEMA IF NOT EXISTS cat01s02_scheduler;

-- ──────────────────────────────────────────────────────────────────
-- 1. organizations
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE cat01s02_scheduler.organizations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  color       TEXT NOT NULL DEFAULT '#6366f1',
  timezone    TEXT NOT NULL DEFAULT 'America/Bogota',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────
-- 2. memberships  (roles: admin | member | client_readonly)
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE cat01s02_scheduler.memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES cat01s02_scheduler.organizations(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('admin', 'member', 'client_readonly')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, organization_id)
);

-- ──────────────────────────────────────────────────────────────────
-- 3. social_accounts  (networks: instagram | linkedin | facebook)
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE cat01s02_scheduler.social_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES cat01s02_scheduler.organizations(id) ON DELETE CASCADE,
  network         TEXT NOT NULL CHECK (network IN ('instagram', 'linkedin', 'facebook')),
  display_name    TEXT NOT NULL,
  handle          TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'error')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────
-- 4. posts
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE cat01s02_scheduler.posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES cat01s02_scheduler.organizations(id) ON DELETE CASCADE,
  author_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  body            TEXT NOT NULL,
  media_url       TEXT,
  networks        TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────
-- 5. scheduled_posts  (one row per post+account pair; queue machine)
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE cat01s02_scheduler.scheduled_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES cat01s02_scheduler.posts(id) ON DELETE CASCADE,
  account_id      UUID NOT NULL REFERENCES cat01s02_scheduler.social_accounts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES cat01s02_scheduler.organizations(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','scheduled','publishing','published','failed','retrying','dead')),
  scheduled_at    TIMESTAMPTZ NOT NULL,
  timezone        TEXT NOT NULL DEFAULT 'America/Bogota',
  attempts        INT NOT NULL DEFAULT 0,
  max_attempts    INT NOT NULL DEFAULT 5,
  next_attempt_at TIMESTAMPTZ,
  locked_at       TIMESTAMPTZ,
  locked_by       TEXT,
  published_at    TIMESTAMPTZ,
  last_error      TEXT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────
-- 6. metrics
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE cat01s02_scheduler.metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id      UUID NOT NULL REFERENCES cat01s02_scheduler.social_accounts(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES cat01s02_scheduler.organizations(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  reach           INT NOT NULL DEFAULT 0,
  impressions     INT NOT NULL DEFAULT 0,
  engagement      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, date)
);

-- ──────────────────────────────────────────────────────────────────
-- 7. audit_log
-- ──────────────────────────────────────────────────────────────────
CREATE TABLE cat01s02_scheduler.audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES cat01s02_scheduler.organizations(id) ON DELETE SET NULL,
  actor_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  target_type     TEXT,
  target_id       UUID,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────
-- Indexes
-- ──────────────────────────────────────────────────────────────────
CREATE INDEX ON cat01s02_scheduler.scheduled_posts (status, next_attempt_at)
  WHERE status IN ('scheduled', 'retrying');
CREATE INDEX ON cat01s02_scheduler.scheduled_posts (organization_id, updated_at DESC);
CREATE INDEX ON cat01s02_scheduler.scheduled_posts (account_id);
CREATE INDEX ON cat01s02_scheduler.memberships (user_id);
CREATE INDEX ON cat01s02_scheduler.metrics (organization_id, date DESC);
CREATE INDEX ON cat01s02_scheduler.audit_log (organization_id, created_at DESC);

-- ──────────────────────────────────────────────────────────────────
-- claim_next_jobs — idempotent queue worker function
-- Uses FOR UPDATE SKIP LOCKED to prevent concurrent double-claiming
-- ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cat01s02_scheduler.claim_next_jobs(
  p_worker_id TEXT,
  p_limit     INT DEFAULT 10
)
RETURNS TABLE (
  id              UUID,
  post_id         UUID,
  account_id      UUID,
  organization_id UUID,
  post_body       TEXT,
  post_media_url  TEXT,
  account_network TEXT,
  scheduled_at    TIMESTAMPTZ,
  attempts        INT,
  max_attempts    INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT sp.id
    FROM cat01s02_scheduler.scheduled_posts sp
    WHERE sp.status IN ('scheduled', 'retrying')
      AND sp.next_attempt_at <= now()
      AND sp.locked_at IS NULL
    ORDER BY sp.next_attempt_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  ),
  claimed AS (
    UPDATE cat01s02_scheduler.scheduled_posts sp
    SET
      status      = 'publishing',
      locked_at   = now(),
      locked_by   = p_worker_id,
      attempts    = attempts + 1,
      updated_at  = now()
    FROM candidates c
    WHERE sp.id = c.id
    RETURNING sp.id, sp.post_id, sp.account_id, sp.organization_id,
              sp.scheduled_at, sp.attempts, sp.max_attempts
  )
  SELECT
    c.id,
    c.post_id,
    c.account_id,
    c.organization_id,
    p.body            AS post_body,
    p.media_url       AS post_media_url,
    sa.network        AS account_network,
    c.scheduled_at,
    c.attempts,
    c.max_attempts
  FROM claimed c
  JOIN cat01s02_scheduler.posts p ON p.id = c.post_id
  JOIN cat01s02_scheduler.social_accounts sa ON sa.id = c.account_id;
END;
$$;
