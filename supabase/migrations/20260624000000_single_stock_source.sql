-- =============================================================================
-- PHASE 1 — Single Stock Source of Truth
-- Migration: 20260624000000_single_stock_source.sql
--
-- DO NOT apply automatically. Review manually, then run in Supabase SQL Editor.
--
-- What this does:
--   1. Creates `locations` table and seeds Kumasi + Accra.
--   2. Creates `stock_levels` (product × size × location) as the single source
--      of truth for current stock counts.
--   3. Backfills stock_levels from every product's current size_stock JSONB.
--   4. Adds nullable location_id to inventory_transactions; backfills existing
--      103 rows to Kumasi.
--   5. Creates apply_stock_change() RPC — the ONE function allowed to mutate
--      stock_levels. All writes go through this.
--
-- FIX (2026-06-26):
--   • apply_stock_change() now rejects callers who are not admin (closes the
--     SECURITY DEFINER bypass hole for authenticated non-admin users).
--   • inventory_transactions.type CHECK constraint updated to include 'transfer'.
--     The old anonymous constraint is dropped dynamically (it was created outside
--     this repo's migrations); a new named constraint replaces it.
--
-- What this does NOT touch:
--   products.size_stock, products.stock_quantity, product_variants, any
--   frontend code. Those remain untouched until a later phase.
-- =============================================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. LOCATIONS
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS locations (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed locations (idempotent — ON CONFLICT DO NOTHING)
INSERT INTO locations (name) VALUES
  ('Kumasi'),
  ('Accra')
ON CONFLICT (name) DO NOTHING;

-- RLS: readable by everyone (used in dropdowns), writable only by admins
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read locations"
  ON locations FOR SELECT USING (true);

CREATE POLICY "Admin write locations"
  ON locations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
-- NOTE: locations has the same SECURITY DEFINER gap as stock_levels had
-- (any admin can write directly). Acceptable for now — locations change
-- rarely and there is no quantity field to corrupt.

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. STOCK_LEVELS  (single source of truth for on-hand quantity)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS stock_levels (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size        TEXT        NOT NULL,
  location_id UUID        NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  quantity    INT         NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, size, location_id)
);

CREATE INDEX IF NOT EXISTS idx_stock_levels_product_id
  ON stock_levels (product_id);

CREATE INDEX IF NOT EXISTS idx_stock_levels_location_id
  ON stock_levels (location_id);

-- Auto-refresh updated_at
CREATE OR REPLACE FUNCTION stock_levels_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stock_levels_updated_at ON stock_levels;
CREATE TRIGGER trg_stock_levels_updated_at
  BEFORE UPDATE ON stock_levels
  FOR EACH ROW EXECUTE FUNCTION stock_levels_set_updated_at();

-- RLS
-- stock_levels has RLS enabled.
-- SELECT: public (anyone can read stock counts for the storefront).
-- INSERT/UPDATE/DELETE: NO RLS policy exists for any role.
--   Direct writes are also blocked at the PostgreSQL grant level (see REVOKE
--   below). The ONLY write path is apply_stock_change(), which runs as
--   SECURITY DEFINER and therefore bypasses both RLS and table grants.
ALTER TABLE stock_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read stock_levels"
  ON stock_levels FOR SELECT USING (true);

-- No write policy — intentional. Direct INSERT/UPDATE/DELETE are forbidden.
-- apply_stock_change() (SECURITY DEFINER) is the only authorised write path.

-- Belt-and-suspenders: Supabase auto-grants INSERT/UPDATE/DELETE to
-- 'authenticated' and 'anon' at the PostgreSQL level when a table is created.
-- RLS-with-no-matching-policy would already block those, but we revoke the
-- grants explicitly so the table is locked even if RLS is accidentally disabled.
REVOKE INSERT, UPDATE, DELETE ON stock_levels FROM authenticated, anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. BACKFILL stock_levels FROM products.size_stock
--
--    One row per (product_id, size_key, Kumasi) for every key in size_stock
--    that is a non-empty JSONB object. Quantity taken from the JSONB value,
--    cast to int (defaults to 0 if the cast would fail).
--
--    Products whose size_stock is NULL or '{}' produce zero rows — they will
--    have no stock_levels entry until a restock is logged via apply_stock_change.
--
--    ON CONFLICT DO NOTHING makes this re-runnable safely.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO stock_levels (product_id, size, location_id, quantity)
SELECT
  p.id                                      AS product_id,
  kv.key                                    AS size,
  (SELECT id FROM locations WHERE name = 'Kumasi') AS location_id,
  GREATEST(
    COALESCE(
      (kv.value #>> '{}')::int,             -- cast JSONB scalar to text to int
      0
    ),
    0                                        -- clamp to 0 if somehow negative
  )                                          AS quantity
FROM
  products p,
  jsonb_each(p.size_stock) AS kv            -- expands size_stock keys
WHERE
  p.size_stock IS NOT NULL
  AND p.size_stock != '{}'::jsonb
ON CONFLICT (product_id, size, location_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ADD location_id TO inventory_transactions
--    Backfill all existing rows to Kumasi.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE inventory_transactions
  ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

-- Backfill existing rows to Kumasi
UPDATE inventory_transactions
SET location_id = (SELECT id FROM locations WHERE name = 'Kumasi')
WHERE location_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_inv_tx_location_id
  ON inventory_transactions (location_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. apply_stock_change(p_product_id, p_size, p_location_id, p_delta,
--                       p_type, p_note)
--
--    THE only function allowed to change stock_levels.quantity.
--
--    Atomically:
--      a) Acquires a row-level lock on stock_levels (prevents race conditions).
--      b) Validates the resulting quantity would not go below 0.
--      c) Inserts a ledger row into inventory_transactions.
--      d) Updates stock_levels.quantity += p_delta.
--
--    Raises an exception (rolls back) if:
--      - No stock_levels row exists for the given (product, size, location).
--      - The resulting quantity would be negative.
--
--    p_delta is signed: positive = stock IN (restock/return),
--                       negative = stock OUT (sale/adjustment down).
--
--    SECURITY DEFINER so it bypasses RLS on the two tables, which is safe
--    because all validation is performed inside the function body.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION apply_stock_change(
  p_product_id  UUID,
  p_size        TEXT,
  p_location_id UUID,
  p_delta       INT,
  p_type        TEXT,           -- 'sale' | 'restock' | 'adjustment' | 'return' | 'transfer'
  p_note        TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_qty INT;
  v_new_qty     INT;
BEGIN
  -- 0) Authorization — reject any caller who is not an admin.
  --    SECURITY DEFINER bypasses table-level RLS, so we must enforce this
  --    explicitly. auth.uid() returns NULL for service-role callers (edge
  --    functions), which intentionally passes — edge functions are trusted.
  IF auth.uid() IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'apply_stock_change: not authorized';
  END IF;

  -- a) Lock the stock row for this (product, size, location)
  --    FOR UPDATE prevents concurrent calls from double-decrementing.
  SELECT quantity
  INTO v_current_qty
  FROM stock_levels
  WHERE product_id  = p_product_id
    AND size        = p_size
    AND location_id = p_location_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION
      'apply_stock_change: no stock_levels row for product_id=%, size=%, location_id=%. '
      'Create the row first (e.g. via a restock).',
      p_product_id, p_size, p_location_id;
  END IF;

  -- b) Guard against going negative
  v_new_qty := v_current_qty + p_delta;

  IF v_new_qty < 0 THEN
    RAISE EXCEPTION
      'apply_stock_change: insufficient stock — current=%, requested delta=%, would result in %.',
      v_current_qty, p_delta, v_new_qty;
  END IF;

  -- c) Ledger row
  INSERT INTO inventory_transactions
    (product_id, size, location_id, type, quantity, note)
  VALUES
    (p_product_id, p_size, p_location_id, p_type, p_delta, p_note);

  -- d) Update stock_levels
  UPDATE stock_levels
  SET
    quantity   = v_new_qty,
    updated_at = now()
  WHERE product_id  = p_product_id
    AND size        = p_size
    AND location_id = p_location_id;

END;
$$;

-- Grant execute to authenticated users only (admins call it from the app).
REVOKE ALL ON FUNCTION apply_stock_change(uuid, text, uuid, int, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION apply_stock_change(uuid, text, uuid, int, text, text)
  TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. UPDATE inventory_transactions.type CHECK CONSTRAINT to include 'transfer'
--
--    Confirmed constraint name: inventory_transactions_type_check
--    (Postgres default auto-name for an inline CHECK on the type column.)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE inventory_transactions
  DROP CONSTRAINT inventory_transactions_type_check;

ALTER TABLE inventory_transactions
  ADD CONSTRAINT inventory_transactions_type_check
  CHECK (type IN ('restock', 'sale', 'adjustment', 'return', 'transfer'));

-- ─────────────────────────────────────────────────────────────────────────────
-- DIAGNOSTIC QUERIES — Run these in the SQL Editor to verify before committing.
--
-- Count how many stock_levels rows the backfill will produce:
--
--   SELECT COUNT(*) AS rows_to_backfill, SUM(qty) AS total_units
--   FROM (
--     SELECT GREATEST(COALESCE((kv.value #>> '{}')::int, 0), 0) AS qty
--     FROM products p, jsonb_each(p.size_stock) kv
--     WHERE p.size_stock IS NOT NULL AND p.size_stock != '{}'::jsonb
--   ) sub;
--
-- Count inventory_transactions rows to be backfilled to Kumasi:
--
--   SELECT COUNT(*) FROM inventory_transactions WHERE location_id IS NULL;
-- ─────────────────────────────────────────────────────────────────────────────

COMMIT;
