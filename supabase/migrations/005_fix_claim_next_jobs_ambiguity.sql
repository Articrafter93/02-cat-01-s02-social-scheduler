-- Migration 005: fix "column reference \"attempts\" is ambiguous" en claim_next_jobs
--
-- BUG (presente desde 001, nunca funciono): el UPDATE del CTE `claimed` hacia
--   attempts = attempts + 1
-- con el `attempts` del lado derecho SIN calificar. Como la funcion declara
-- RETURNS TABLE (... attempts INT, max_attempts INT), esas columnas son
-- VARIABLES PL/pgSQL en alcance, asi que `attempts` es ambiguo entre la variable
-- y la columna scheduled_posts.attempts. Postgres se niega a resolverlo y lanza
--   ERROR: column reference "attempts" is ambiguous
-- que PostgREST devuelve como HTTP 400.
--
-- SINTOMA OBSERVADO: POST /rest/v1/rpc/claim_next_jobs -> 400 en cada corrida del
-- cron (cada 6 h), con la cola sin drenar y jobs vencidos acumulandose. El cron
-- reportaba verde porque /api/queue/process responde 200 aunque el worker falle.
--
-- FIX: calificar la referencia como sp.attempts. El lado izquierdo del SET no
-- necesita calificacion (siempre es la columna destino).
--
-- Diagnosticado 2026-07-21. Evidencia: log de runtime de Vercel
-- "[queue] claim_next_jobs error: column reference \"attempts\" is ambiguous"
-- en la corrida manual #76 del workflow queue-cron.

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
      attempts    = sp.attempts + 1,   -- FIX 005: calificado (antes: attempts + 1)
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
