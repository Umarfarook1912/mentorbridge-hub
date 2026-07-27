-- ============================================================
-- MentorBridge Hub — Database Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Enums ───────────────────────────────────────────────────
create type public.user_role as enum ('Admin', 'Student');
create type public.attendance_status as enum ('Present', 'Absent', 'Permission');
create type public.submission_status as enum ('Pending', 'Approved', 'Rejected');

-- ── Table: profiles ─────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null unique,
  phone       text,
  department  text,
  domain_interest text,
  role        public.user_role not null default 'Student',
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create index idx_profiles_role       on public.profiles(role);
create index idx_profiles_email      on public.profiles(email);
create index idx_profiles_department on public.profiles(department);
create index idx_profiles_domain_interest on public.profiles(domain_interest);

-- ── Table: meetings ─────────────────────────────────────────
create table public.meetings (
  id           uuid primary key default uuid_generate_v4(),
  title        text not null,
  description  text,
  handled_by   text not null,
  meeting_date date not null,
  start_time   time not null,
  end_time     time not null,
  duration     int generated always as (
                 extract(epoch from (end_time - start_time))::int / 60
               ) stored,
  meet_url     text,
  created_by   uuid not null references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index idx_meetings_date       on public.meetings(meeting_date);
create index idx_meetings_created_by on public.meetings(created_by);

-- ── Table: attendance ───────────────────────────────────────
create table public.attendance (
  id         uuid primary key default uuid_generate_v4(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status     public.attendance_status not null default 'Absent',
  marked_at  timestamptz not null default now(),
  unique (meeting_id, student_id)
);

create index idx_attendance_meeting_id on public.attendance(meeting_id);
create index idx_attendance_student_id on public.attendance(student_id);
create index idx_attendance_status     on public.attendance(status);
create index idx_attendance_marked_at  on public.attendance(marked_at);

-- ── Table: tasks ────────────────────────────────────────────
create table public.tasks (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text,
  due_date    date not null,
  department  text,           -- null means assigned to all departments
  created_by  uuid not null references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index idx_tasks_due_date   on public.tasks(due_date);
create index idx_tasks_created_by on public.tasks(created_by);
create index idx_tasks_department on public.tasks(department);

-- ── Table: task_submissions ─────────────────────────────────
create table public.task_submissions (
  id               uuid primary key default uuid_generate_v4(),
  task_id          uuid not null references public.tasks(id) on delete cascade,
  student_id       uuid not null references public.profiles(id) on delete cascade,
  github_url       text,
  google_doc_url   text,
  medium_blog_url  text,
  remarks          text,
  feedback         text,
  submitted_at     timestamptz not null default now(),
  status           public.submission_status not null default 'Pending',
  reviewed_by      uuid references public.profiles(id) on delete set null,
  reviewed_at      timestamptz,
  unique (task_id, student_id)
);

create index idx_submissions_task_id    on public.task_submissions(task_id);
create index idx_submissions_student_id on public.task_submissions(student_id);
create index idx_submissions_status     on public.task_submissions(status);

-- ── Table: notifications ────────────────────────────────────
create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  title      text not null,
  body       text,
  type       text not null,   -- 'meeting' | 'task' | 'submission'
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_id   on public.notifications(user_id);
create index idx_notifications_is_read   on public.notifications(is_read);
create index idx_notifications_created_at on public.notifications(created_at desc);

-- ── Storage: avatars bucket ─────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- ── Enable RLS ───────────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.meetings          enable row level security;
alter table public.attendance        enable row level security;
alter table public.tasks             enable row level security;
alter table public.task_submissions  enable row level security;
alter table public.notifications     enable row level security;

-- ── Helper function: get current user role ───────────────────
create or replace function public.get_my_role()
returns public.user_role
language sql
security definer
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- ── RLS Policies: profiles ───────────────────────────────────
-- Admins see all; students see only their own row.
create policy "profiles_select" on public.profiles for select
  using (auth.uid() = id or public.get_my_role() = 'Admin');

create policy "profiles_insert_admin" on public.profiles for insert
  with check (public.get_my_role() = 'Admin');

create policy "profiles_update_own" on public.profiles for update
  using (auth.uid() = id or public.get_my_role() = 'Admin');

create policy "profiles_delete_admin" on public.profiles for delete
  using (public.get_my_role() = 'Admin');

-- ── RLS Policies: meetings ───────────────────────────────────
create policy "meetings_select_all_authenticated" on public.meetings for select
  using (auth.role() = 'authenticated');

create policy "meetings_write_admin" on public.meetings for insert
  with check (public.get_my_role() = 'Admin');

create policy "meetings_update_admin" on public.meetings for update
  using (public.get_my_role() = 'Admin');

create policy "meetings_delete_admin" on public.meetings for delete
  using (public.get_my_role() = 'Admin');

-- ── RLS Policies: attendance ─────────────────────────────────
create policy "attendance_select" on public.attendance for select
  using (
    public.get_my_role() = 'Admin'
    or student_id = auth.uid()
  );

create policy "attendance_write_admin" on public.attendance for insert
  with check (public.get_my_role() = 'Admin');

create policy "attendance_update_admin" on public.attendance for update
  using (public.get_my_role() = 'Admin');

create policy "attendance_delete_admin" on public.attendance for delete
  using (public.get_my_role() = 'Admin');

-- ── RLS Policies: tasks ──────────────────────────────────────
create policy "tasks_select_authenticated" on public.tasks for select
  using (auth.role() = 'authenticated');

create policy "tasks_write_admin" on public.tasks for insert
  with check (public.get_my_role() = 'Admin');

create policy "tasks_update_admin" on public.tasks for update
  using (public.get_my_role() = 'Admin');

create policy "tasks_delete_admin" on public.tasks for delete
  using (public.get_my_role() = 'Admin');

-- ── RLS Policies: task_submissions ───────────────────────────
create policy "submissions_select" on public.task_submissions for select
  using (
    public.get_my_role() = 'Admin'
    or student_id = auth.uid()
  );

create policy "submissions_insert_own" on public.task_submissions for insert
  with check (student_id = auth.uid());

create policy "submissions_update_own_or_admin" on public.task_submissions for update
  using (
    student_id = auth.uid()
    or public.get_my_role() = 'Admin'
  )
  with check (
    student_id = auth.uid()
    or public.get_my_role() = 'Admin'
  );

create policy "submissions_delete_admin" on public.task_submissions for delete
  using (public.get_my_role() = 'Admin');

-- ── RLS Policies: notifications ──────────────────────────────
create policy "notifications_own" on public.notifications for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── Storage RLS: avatars ─────────────────────────────────────
create policy "avatar_public_read" on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatar_auth_upload" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "avatar_owner_update" on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "avatar_owner_delete" on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- ── Auto-create profile on signup ───────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'Student')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
