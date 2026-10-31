-- Lock down public access to orders and finance data.
--
-- Before this migration, anyone holding the public (anon) key could:
--   * read every guest order (user_id IS NULL) with names, phones and addresses
--   * read and update every Accra order
--   * read the monthly profit & loss via get_pnl_summary()
--
-- Guest order tracking moves to get_order_tracking(), which returns one order
-- by its order number with no phone, email or street address.

-- 1. Orders: only owners, admins and hub partners can read; drop public rules
drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders" on public.orders
  for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Anon can read Accra orders" on public.orders;
drop policy if exists "Anon can update Accra orders" on public.orders;

-- 2. Guest order tracking: one order, limited fields
create or replace function public.get_order_tracking(p_order_number text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'order_number',   o.order_number,
    'status',         o.status,
    'payment_status', o.payment_status,
    'payment_method', o.payment_method,
    'created_at',     o.created_at,
    'total_amount',   o.total_amount,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'name',          i->>'name',
        'quantity',      i->'quantity',
        'price',         i->'price',
        'image',         i->>'image',
        'selected_size', coalesce(i->>'selected_size', i->>'selectedSize'),
        'selected_color', coalesce(i->>'selected_color', i->>'selectedColor')
      ))
      from jsonb_array_elements(case when jsonb_typeof(o.items) = 'array' then o.items else '[]'::jsonb end) i
    ), '[]'::jsonb),
    'shipping_address', jsonb_build_object(
      'city',            o.shipping_address->>'city',
      'delivery_method', o.shipping_address->>'delivery_method'
    )
  )
  from public.orders o
  where o.order_number = upper(trim(p_order_number))
  limit 1
$$;

revoke all on function public.get_order_tracking(text) from public;
grant execute on function public.get_order_tracking(text) to anon, authenticated;

-- 3. Profit & loss: admins only
create or replace function public.get_pnl_summary(p_month date)
returns json
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_start  date := date_trunc('month', p_month)::date;
  v_end    date := (date_trunc('month', p_month) + interval '1 month')::date;

  v_gross_revenue      numeric := 0;
  v_cogs               numeric := 0;
  v_operating_expenses numeric := 0;

  v_total_restock_qty   numeric := 0;
  v_total_restock_spend numeric := 0;
  v_weighted_avg_cost   numeric := 0;
  v_units_sold_month    numeric := 0;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;

  select coalesce(sum(amount), 0)
  into v_gross_revenue
  from financial_transactions
  where type = 'sale'
    and date >= v_start
    and date <  v_end;

  select
    coalesce(sum(quantity), 0),
    coalesce(sum(quantity * unit_cost), 0)
  into v_total_restock_qty, v_total_restock_spend
  from inventory_transactions
  where type = 'restock'
    and unit_cost is not null
    and created_at < v_end;

  if v_total_restock_qty > 0 then
    v_weighted_avg_cost := v_total_restock_spend / v_total_restock_qty;
  end if;

  select coalesce(sum(abs(quantity)), 0)
  into v_units_sold_month
  from inventory_transactions
  where type = 'sale'
    and created_at >= v_start
    and created_at <  v_end;

  v_cogs := v_units_sold_month * v_weighted_avg_cost;

  select coalesce(sum(amount), 0)
  into v_operating_expenses
  from financial_transactions
  where type = 'expense'
    and date >= v_start
    and date <  v_end;

  return json_build_object(
    'gross_revenue',       v_gross_revenue,
    'cogs',                v_cogs,
    'gross_profit',        v_gross_revenue - v_cogs,
    'operating_expenses',  v_operating_expenses,
    'net_profit',          v_gross_revenue - v_cogs - v_operating_expenses
  );
end;
$function$;

revoke execute on function public.get_pnl_summary(date) from public, anon;
grant execute on function public.get_pnl_summary(date) to authenticated;

-- 4. Internal helpers nothing public should call directly.
-- Triggers and other SECURITY DEFINER functions still call them as the owner.
revoke execute on function public.get_guest_order(uuid) from public, anon, authenticated;
revoke execute on function public.sync_product_stock_from_levels() from public, anon;
revoke execute on function public.cleanup_discount_rate_limits() from public, anon, authenticated;
revoke execute on function public._pick_sale_location(uuid, text, integer, text) from public, anon, authenticated;
