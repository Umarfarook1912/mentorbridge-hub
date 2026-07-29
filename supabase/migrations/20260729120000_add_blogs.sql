-- Blogs: shared Medium posts visible to all authenticated users
create table if not exists public.blogs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  medium_url  text not null,
  author_id   uuid not null references public.profiles(id) on delete cascade,
  author_name text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_blogs_created_at on public.blogs(created_at desc);
create index if not exists idx_blogs_author_id on public.blogs(author_id);

alter table public.blogs enable row level security;

create policy "blogs_select" on public.blogs
  for select to authenticated
  using (true);

create policy "blogs_insert" on public.blogs
  for insert to authenticated
  with check (author_id = auth.uid());

create policy "blogs_update" on public.blogs
  for update to authenticated
  using (author_id = auth.uid() or public.get_my_role() = 'Admin')
  with check (author_id = auth.uid() or public.get_my_role() = 'Admin');

create policy "blogs_delete" on public.blogs
  for delete to authenticated
  using (author_id = auth.uid() or public.get_my_role() = 'Admin');
