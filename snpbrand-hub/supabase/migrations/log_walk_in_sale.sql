-- Migration to create log_walk_in_sale transactional RPC
--
-- This function wraps the stock level decrement and the walk-in sales logger
-- into a single Postgres transaction. If any part of the operation fails,
-- the entire transaction will roll back.

CREATE OR REPLACE FUNCTION log_walk_in_sale(
  p_product_id   UUID,
  p_size         TEXT,
  p_location_id  UUID,
  p_quantity     INT,
  p_unit_price   NUMERIC,
  p_sold_by      UUID,
  p_note         TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role           TEXT;
  v_accra_id       UUID;
BEGIN
  -- 1) Authentication check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'log_walk_in_sale: Not authenticated';
  END IF;

  -- 2) Fetch user role
  SELECT role INTO v_role
  FROM user_profiles
  WHERE id = auth.uid();

  IF v_role IS NULL THEN
    RAISE EXCEPTION 'log_walk_in_sale: User profile not found';
  END IF;

  -- 3) Authorization checks
  IF v_role = 'hub_partner' THEN
    -- Resolve Accra location ID
    SELECT id INTO v_accra_id FROM locations WHERE name = 'Accra';
    IF p_location_id IS DISTINCT FROM v_accra_id THEN
      RAISE EXCEPTION 'log_walk_in_sale: Hub partners are only authorized to log sales for Accra location';
    END IF;
  ELSIF v_role != 'admin' THEN
    RAISE EXCEPTION 'log_walk_in_sale: Not authorized';
  END IF;

  -- 4) Validate quantity
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'log_walk_in_sale: Quantity must be greater than zero';
  END IF;

  -- 5) Apply stock change (decrements stock)
  -- Calls apply_stock_change(p_product_id, p_size, p_location_id, p_delta, p_type, p_note, p_unit_cost)
  PERFORM apply_stock_change(
    p_product_id,
    p_size,
    p_location_id,
    -p_quantity,
    'sale',
    COALESCE(p_note, 'Walk-in sale'),
    p_unit_price
  );

  -- 6) Log sale into walk_in_sales
  INSERT INTO walk_in_sales (
    location_id,
    product_id,
    size,
    quantity,
    unit_price,
    sold_by,
    note
  ) VALUES (
    p_location_id,
    p_product_id,
    p_size,
    p_quantity,
    p_unit_price,
    p_sold_by,
    p_note
  );

END;
$$;

-- Revoke public execute rights and grant explicitly to authenticated users
REVOKE ALL ON FUNCTION log_walk_in_sale(UUID, TEXT, UUID, INT, NUMERIC, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION log_walk_in_sale(UUID, TEXT, UUID, INT, NUMERIC, UUID, TEXT) TO authenticated;
