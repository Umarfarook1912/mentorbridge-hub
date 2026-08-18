-- Add 'General' as a valid domain for videos
alter table public.videos
  drop constraint if exists videos_domain_check;

alter table public.videos
  add constraint videos_domain_check
    check (domain in ('General', 'Frontend', 'Backend', 'Data Engineer'));
