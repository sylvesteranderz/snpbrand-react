-- ============================================================
-- SNP Brand — Discount Code System Migration
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Enum
DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. discount_codes table
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type discount_type NOT NULL,
  value NUMERIC(10,2) NOT NULL CHECK (value > 0),
  min_order_value NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_uses INT,
  uses_count INT NOT NULL DEFAULT 0,
  per_user_limit INT NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. discount_uses table
CREATE TABLE IF NOT EXISTS discount_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  order_id TEXT NOT NULL,
  used_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Add discount columns to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;

-- 5. RLS
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_uses ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read active codes
DROP POLICY IF EXISTS "users can read active codes" ON discount_codes;
CREATE POLICY "users can read active codes"
  ON discount_codes FOR SELECT TO authenticated
  USING (is_active = true);

-- Admins (user_profiles.role = 'admin') can manage all codes
DROP POLICY IF EXISTS "admins can manage discount_codes" ON discount_codes;
CREATE POLICY "admins can manage discount_codes"
  ON discount_codes FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin'));

-- Service role full access (Edge Functions)
DROP POLICY IF EXISTS "service role discount_codes" ON discount_codes;
CREATE POLICY "service role discount_codes"
  ON discount_codes FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service role discount_uses" ON discount_uses;
CREATE POLICY "service role discount_uses"
  ON discount_uses FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Users can see their own discount uses
DROP POLICY IF EXISTS "users read own discount uses" ON discount_uses;
CREATE POLICY "users read own discount uses"
  ON discount_uses FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 6. Atomic RPC — validates with row lock, records use, increments count
CREATE OR REPLACE FUNCTION record_discount_use(
  p_code_id UUID,
  p_user_id UUID,
  p_order_number TEXT,
  p_cart_total NUMERIC
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_code discount_codes;
  v_user_uses INT;
  v_discount_amount NUMERIC;
  v_caller_id UUID;
BEGIN
  -- Verify the caller is who they claim to be (auth.uid() reads from verified JWT)
  v_caller_id := auth.uid();
  IF p_user_id IS DISTINCT FROM v_caller_id THEN
    RAISE EXCEPTION 'USER_MISMATCH';
  END IF;

  -- Verify the order exists and belongs to the calling user
  -- This prevents attackers calling this RPC with fake order numbers to exhaust max_uses
  IF NOT EXISTS (
    SELECT 1 FROM orders
    WHERE order_number = p_order_number
      AND user_id IS NOT DISTINCT FROM v_caller_id
  ) THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  -- Lock row to prevent race conditions
  SELECT * INTO v_code FROM discount_codes
  WHERE id = p_code_id AND is_active = true FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'INVALID_CODE'; END IF;
  IF v_code.expires_at IS NOT NULL AND v_code.expires_at < now() THEN RAISE EXCEPTION 'EXPIRED_CODE'; END IF;
  IF v_code.max_uses IS NOT NULL AND v_code.uses_count >= v_code.max_uses THEN RAISE EXCEPTION 'MAX_USES_REACHED'; END IF;

  -- Use IS NOT DISTINCT FROM to correctly handle NULL user_id (= NULL is never true in SQL)
  SELECT count(*) INTO v_user_uses FROM discount_uses
  WHERE code_id = p_code_id AND user_id IS NOT DISTINCT FROM p_user_id;

  IF v_user_uses >= v_code.per_user_limit THEN RAISE EXCEPTION 'USER_LIMIT_REACHED'; END IF;

  -- Recalculate server-side (never trust the client)
  IF v_code.type = 'percentage' THEN
    v_discount_amount := ROUND((p_cart_total * v_code.value / 100)::NUMERIC, 2);
  ELSE
    v_discount_amount := LEAST(v_code.value, p_cart_total);
  END IF;

  INSERT INTO discount_uses (code_id, user_id, order_id) VALUES (p_code_id, p_user_id, p_order_number);
  UPDATE discount_codes SET uses_count = uses_count + 1 WHERE id = p_code_id;

  RETURN jsonb_build_object('success', true, 'discount_amount', v_discount_amount);
END;
$$;
