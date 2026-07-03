-- Migration 002: Row Level Security for cat01s02_scheduler
-- Principle: service_role bypasses all RLS; authenticated users scoped to their orgs

-- ──────────────────────────────────────────────────────────────────
-- Helper: resolve user's memberships quickly
-- ──────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cat01s02_scheduler.user_org_ids()
RETURNS UUID[]
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT ARRAY(
    SELECT organization_id
    FROM cat01s02_scheduler.memberships
    WHERE user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION cat01s02_scheduler.user_role_in_org(p_org_id UUID)
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT role
  FROM cat01s02_scheduler.memberships
  WHERE user_id = auth.uid() AND organization_id = p_org_id
  LIMIT 1;
$$;

-- ──────────────────────────────────────────────────────────────────
-- organizations
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE cat01s02_scheduler.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orgs_select_members" ON cat01s02_scheduler.organizations
  FOR SELECT USING (
    id = ANY(cat01s02_scheduler.user_org_ids())
  );

CREATE POLICY "orgs_update_admin" ON cat01s02_scheduler.organizations
  FOR UPDATE USING (
    cat01s02_scheduler.user_role_in_org(id) = 'admin'
  );

-- ──────────────────────────────────────────────────────────────────
-- memberships
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE cat01s02_scheduler.memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "memberships_select_own" ON cat01s02_scheduler.memberships
  FOR SELECT USING (
    user_id = auth.uid()
    OR organization_id = ANY(cat01s02_scheduler.user_org_ids())
  );

CREATE POLICY "memberships_insert_admin" ON cat01s02_scheduler.memberships
  FOR INSERT WITH CHECK (
    cat01s02_scheduler.user_role_in_org(organization_id) = 'admin'
  );

CREATE POLICY "memberships_delete_admin" ON cat01s02_scheduler.memberships
  FOR DELETE USING (
    cat01s02_scheduler.user_role_in_org(organization_id) = 'admin'
  );

-- ──────────────────────────────────────────────────────────────────
-- social_accounts
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE cat01s02_scheduler.social_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accounts_select_members" ON cat01s02_scheduler.social_accounts
  FOR SELECT USING (
    organization_id = ANY(cat01s02_scheduler.user_org_ids())
  );

CREATE POLICY "accounts_write_admin" ON cat01s02_scheduler.social_accounts
  FOR ALL USING (
    cat01s02_scheduler.user_role_in_org(organization_id) = 'admin'
  );

-- ──────────────────────────────────────────────────────────────────
-- posts
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE cat01s02_scheduler.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts_select_members" ON cat01s02_scheduler.posts
  FOR SELECT USING (
    organization_id = ANY(cat01s02_scheduler.user_org_ids())
  );

CREATE POLICY "posts_insert_writers" ON cat01s02_scheduler.posts
  FOR INSERT WITH CHECK (
    cat01s02_scheduler.user_role_in_org(organization_id) IN ('admin', 'member')
  );

CREATE POLICY "posts_update_writers" ON cat01s02_scheduler.posts
  FOR UPDATE USING (
    cat01s02_scheduler.user_role_in_org(organization_id) IN ('admin', 'member')
  );

CREATE POLICY "posts_delete_admin" ON cat01s02_scheduler.posts
  FOR DELETE USING (
    cat01s02_scheduler.user_role_in_org(organization_id) = 'admin'
  );

-- ──────────────────────────────────────────────────────────────────
-- scheduled_posts
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE cat01s02_scheduler.scheduled_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scheduled_select_members" ON cat01s02_scheduler.scheduled_posts
  FOR SELECT USING (
    organization_id = ANY(cat01s02_scheduler.user_org_ids())
  );

CREATE POLICY "scheduled_insert_writers" ON cat01s02_scheduler.scheduled_posts
  FOR INSERT WITH CHECK (
    cat01s02_scheduler.user_role_in_org(organization_id) IN ('admin', 'member')
  );

CREATE POLICY "scheduled_update_writers" ON cat01s02_scheduler.scheduled_posts
  FOR UPDATE USING (
    cat01s02_scheduler.user_role_in_org(organization_id) IN ('admin', 'member')
  );

CREATE POLICY "scheduled_delete_admin" ON cat01s02_scheduler.scheduled_posts
  FOR DELETE USING (
    cat01s02_scheduler.user_role_in_org(organization_id) = 'admin'
  );

-- ──────────────────────────────────────────────────────────────────
-- metrics
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE cat01s02_scheduler.metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "metrics_select_members" ON cat01s02_scheduler.metrics
  FOR SELECT USING (
    organization_id = ANY(cat01s02_scheduler.user_org_ids())
  );

CREATE POLICY "metrics_write_admin" ON cat01s02_scheduler.metrics
  FOR ALL USING (
    cat01s02_scheduler.user_role_in_org(organization_id) = 'admin'
  );

-- ──────────────────────────────────────────────────────────────────
-- audit_log (read-only for members, service_role writes)
-- ──────────────────────────────────────────────────────────────────
ALTER TABLE cat01s02_scheduler.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_select_admin" ON cat01s02_scheduler.audit_log
  FOR SELECT USING (
    cat01s02_scheduler.user_role_in_org(organization_id) = 'admin'
  );

-- Service role (used by worker) bypasses RLS by design; no explicit policy needed.

-- ──────────────────────────────────────────────────────────────────
-- Expose schema to PostgREST
-- ──────────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA cat01s02_scheduler TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA cat01s02_scheduler TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA cat01s02_scheduler TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA cat01s02_scheduler TO authenticated, service_role;
