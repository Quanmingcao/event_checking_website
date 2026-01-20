-- 1. Enable pg_cron extension (if not already enabled)
create extension if not exists pg_cron;

-- 2. Create the cleanup function
create or replace function cleanup_old_event_data()
returns void
language plpgsql
security definer -- Run as superuser to bypass RLS on storage.objects if needed
as $$
declare
  old_event record;
begin
  -- Loop through events that ended more than 10 days ago
  for old_event in
    select id, name 
    from events
    where end_time < (now() - interval '10 days')
  loop
    -- A. Delete Attendant Photos from Storage
    -- Bucket: 'attendant-photos', Path: '{event_id}/...'
    delete from storage.objects
    where bucket_id = 'attendant-photos'
    and name like old_event.id || '/%';

    -- B. Clear references in 'attendants' table
    update attendants
    set avatar_url = null, 
        face_descriptor = null -- Remove face vector to save space if needed (optional)
    where event_id = old_event.id
    and (avatar_url is not null or face_descriptor is not null);

    -- C. Delete Event Background from Storage
    -- Bucket: 'event-backgrounds', Path: '{event_id}-bg-...'
    delete from storage.objects
    where bucket_id = 'event-backgrounds'
    and name like old_event.id || '-bg-%';

    -- D. Clear reference in 'events' table
    update events
    set image_url = null
    where id = old_event.id
    and image_url is not null;

    raise notice 'Cleaned up images for event: % (ID: %)', old_event.name, old_event.id;
  end loop;
end;
$$;

-- 3. Schedule the job to run every day at 3:00 AM UTC
-- Note: Requires pg_cron to be active.
select cron.schedule(
  'cleanup-every-day-3am', -- Job name
  '0 3 * * *',             -- Cron schedule (3:00 AM daily)
  'select cleanup_old_event_data()'
);

-- To check scheduled jobs: select * from cron.job;
-- To unschedule: select cron.unschedule('cleanup-every-day-3am');
