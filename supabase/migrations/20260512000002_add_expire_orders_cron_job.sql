-- Enable pg_cron (safe to run if already enabled)
create extension if not exists pg_cron;

-- Unschedule any existing job with this name before recreating
select cron.unschedule(jobid)
from cron.job
where jobname = 'expire-pending-orders';

-- Hourly job: mark pending orders older than 24 hours as expired
select cron.schedule(
  'expire-pending-orders',
  '0 * * * *',
  $$
    update public.orders
    set status = 'expired'
    where status = 'pending'
      and created_at < now() - interval '24 hours';
  $$
);
