-- ============================================================
-- Discount System — Safety Constraints & Rate Limiting Table
-- Run after discount_codes.sql
-- ============================================================

-- Prevent orders from being stored with negative totals or discounts
DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT orders_total_nonnegative CHECK (total_amount >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE orders ADD CONSTRAINT orders_discount_nonneg CHECK (discount_amount >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Rate limiting table for validate-discount edge function
-- Tracks validation attempts per user/IP to prevent code enumeration
CREATE TABLE IF NOT EXISTS discount_rate_limits (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  rate_key     TEXT        NOT NULL,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drl_rate_key_time
  ON discount_rate_limits (rate_key, attempted_at);

-- Service role only — edge function uses service role key
ALTER TABLE discount_rate_limits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service role rate limits" ON discount_rate_limits;
CREATE POLICY "service role rate limits"
  ON discount_rate_limits FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Cleanup function to remove stale rate limit rows (call periodically or via cron)
CREATE OR REPLACE FUNCTION cleanup_discount_rate_limits()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  DELETE FROM discount_rate_limits WHERE attempted_at < now() - INTERVAL '5 minutes';
$$;
