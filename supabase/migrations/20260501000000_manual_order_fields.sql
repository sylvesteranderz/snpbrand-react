-- Add columns needed for manual order entry via the admin form.
-- These sit alongside the existing guest-checkout fields so nothing breaks.
BEGIN;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_name    TEXT,
  ADD COLUMN IF NOT EXISTS customer_phone   TEXT,
  ADD COLUMN IF NOT EXISTS product_type     TEXT,
  ADD COLUMN IF NOT EXISTS size             TEXT,
  ADD COLUMN IF NOT EXISTS quantity         INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS order_channel    TEXT,
  ADD COLUMN IF NOT EXISTS notes            TEXT,
  ADD COLUMN IF NOT EXISTS source           TEXT DEFAULT 'website';

-- Trigram index for fast case-insensitive prefix/substring search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_orders_customer_name_trgm
  ON orders USING gin (customer_name gin_trgm_ops);

-- Plain btree index for exact-match lookups (phone prefill fetch)
CREATE INDEX IF NOT EXISTS idx_orders_customer_name_btree
  ON orders (customer_name);

COMMIT;
