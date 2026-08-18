-- Session recordings: YouTube videos tagged by domain (Frontend / Backend / Data Engineer)

create table if not exists public.videos (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  youtube_url     text not null,
  youtube_id      text not null,
  thumbnail_url   text,
  domain          text not null,
  view_count      integer not null default 0,
  created_by      uuid not null references public.profiles(id),
  created_at      timestamptz not null default now(),
  constraint videos_domain_check check (domain in ('Frontend', 'Backend', 'Data Engineer'))
);

create index if not exists idx_videos_domain_views on public.videos(domain, view_count desc);
create index if not exists idx_videos_created_at on public.videos(created_at desc);

alter table public.videos enable row level security;

create policy "videos_select" on public.videos
  for select to authenticated
  using (true);

create policy "videos_insert" on public.videos
  for insert to authenticated
  with check (public.has_section_permission('videos'));

create policy "videos_update" on public.videos
  for update to authenticated
  using (public.has_section_permission('videos'))
  with check (public.has_section_permission('videos'));

create policy "videos_delete" on public.videos
  for delete to authenticated
  using (public.has_section_permission('videos'));

create or replace function public.increment_video_views(video_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count integer;
begin
  update public.videos
  set view_count = view_count + 1
  where id = video_id
  returning view_count into new_count;
  return new_count;
end;
$$;

grant execute on function public.increment_video_views(uuid) to authenticated;
