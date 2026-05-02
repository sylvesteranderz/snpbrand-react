-- 1. Add is_active flag to products so the manual order form can filter live products
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Back-fill: treat all existing products as active
UPDATE products SET is_active = true WHERE is_active IS NULL;

-- 2. Product variants table — one row per (product, size) with live stock quantity
CREATE TABLE IF NOT EXISTS product_variants (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size        TEXT        NOT NULL,
  quantity    INTEGER     NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  sort_order  INTEGER     NOT NULL DEFAULT 0,   -- controls display order in dropdowns
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, size)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id
  ON product_variants (product_id);

-- Auto-update updated_at on every write
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS trg_product_variants_updated_at ON product_variants;
CREATE TRIGGER trg_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Anyone can read variants (needed for the order form)
CREATE POLICY "Public read product_variants"
  ON product_variants FOR SELECT USING (true);

-- Only admins can write
CREATE POLICY "Admin write product_variants"
  ON product_variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
