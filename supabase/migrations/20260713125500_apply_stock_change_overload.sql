-- Create a robust 3-argument overload of apply_stock_change to support legacy database triggers.
-- This wrapper handles size coercions, auto-creates missing stock_levels rows, and clamps stock quantities
-- to prevent transaction-aborting errors during payment confirmations and reconciliations.

CREATE OR REPLACE FUNCTION apply_stock_change(
  p_product_id  UUID,
  p_size        TEXT,
  p_delta       INT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_default_loc_id UUID;
  v_size TEXT;
  v_current_qty INT;
BEGIN
  -- 1. Coerce size (default to 'unknown' if NULL, empty, or literally '<NULL>'/'null')
  v_size := COALESCE(p_size, 'unknown');
  IF v_size = '' OR v_size = '<NULL>' OR v_size = 'null' THEN
    v_size := 'unknown';
  END IF;

  -- 2. Resolve default location (Accra)
  SELECT id INTO v_default_loc_id FROM locations WHERE name = 'Accra' LIMIT 1;
  IF v_default_loc_id IS NULL THEN
    SELECT id INTO v_default_loc_id FROM locations LIMIT 1;
  END IF;

  -- 3. Check for existence and lock the stock_levels row
  SELECT quantity INTO v_current_qty
  FROM stock_levels
  WHERE product_id = p_product_id
    AND size = v_size
    AND location_id = v_default_loc_id
  FOR UPDATE;

  -- 4. If no stock_levels row exists, create it dynamically with 0 quantity
  IF NOT FOUND THEN
    INSERT INTO stock_levels (product_id, size, location_id, quantity)
    VALUES (p_product_id, v_size, v_default_loc_id, 0)
    ON CONFLICT (product_id, size, location_id) DO NOTHING;
    
    v_current_qty := 0;
  END IF;

  -- 5. Log the inventory transaction in ledger
  INSERT INTO inventory_transactions (product_id, size, location_id, type, quantity, note)
  VALUES (p_product_id, v_size, v_default_loc_id, 'sale', p_delta, 'Legacy database trigger auto-update');

  -- 6. Atomically update the quantity, clamping to a minimum of 0 to prevent negative stock errors
  UPDATE stock_levels
  SET quantity = GREATEST(0, quantity + p_delta),
      updated_at = now()
  WHERE product_id = p_product_id
    AND size = v_size
    AND location_id = v_default_loc_id;

END;
$$;

-- Grant execute permission so triggers running under different roles can call it safely
GRANT EXECUTE ON FUNCTION apply_stock_change(uuid, text, int) TO public, authenticated, anon, service_role;
