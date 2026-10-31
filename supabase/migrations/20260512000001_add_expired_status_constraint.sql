-- Add check constraint on orders.status to include 'expired'.
-- If the constraint already exists with 'expired' in the list, this is a no-op.
do $$
begin
  -- Drop the old constraint if it exists but doesn't include 'expired'
  if exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    where c.conname = 'orders_status_check'
      and t.relname = 'orders'
      and pg_get_constraintdef(c.oid) not like '%expired%'
  ) then
    alter table orders drop constraint orders_status_check;
  end if;

  -- Add the constraint (including 'expired') if it doesn't already exist
  if not exists (
    select 1 from pg_constraint c
    join pg_class t on c.conrelid = t.oid
    where c.conname = 'orders_status_check'
      and t.relname = 'orders'
  ) then
    alter table orders
      add constraint orders_status_check
      check (status in (
        'pending', 'confirmed', 'processing', 'shipped',
        'delivered', 'cancelled', 'expired'
      ));
  end if;
end $$;
