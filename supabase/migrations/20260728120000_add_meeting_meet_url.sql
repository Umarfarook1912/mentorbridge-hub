-- Add optional Google Meet (or other) join URL to meetings
alter table public.meetings
  add column if not exists meet_url text;
