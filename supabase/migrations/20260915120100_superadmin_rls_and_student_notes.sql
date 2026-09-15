-- SuperAdmin treated like Admin in RLS + SuperAdmin-only student notes

create or replace function public.is_full_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select public.get_my_role() in ('Admin'::public.user_role, 'SuperAdmin'::public.user_role)
$$;

create or replace function public.has_section_permission(perm text)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role in ('Admin'::public.user_role, 'SuperAdmin'::public.user_role)
        or (
          p.role = 'Executive'::public.user_role
          and p.section_permissions is not null
          and perm = any (p.section_permissions)
        )
      )
  );
$$;

-- Profiles
drop policy if exists "profiles_insert_admin" on public.profiles;
create policy "profiles_insert_admin" on public.profiles for insert
  with check (public.is_full_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update
  using (auth.uid() = id or public.is_full_admin());

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin" on public.profiles for delete
  using (public.is_full_admin());

-- Meetings
drop policy if exists "meetings_write_admin" on public.meetings;
create policy "meetings_write_admin" on public.meetings for insert
  with check (public.is_full_admin());

drop policy if exists "meetings_update_admin" on public.meetings;
create policy "meetings_update_admin" on public.meetings for update
  using (public.is_full_admin());

drop policy if exists "meetings_delete_admin" on public.meetings;
create policy "meetings_delete_admin" on public.meetings for delete
  using (public.is_full_admin());

-- Attendance
drop policy if exists "attendance_write_admin" on public.attendance;
create policy "attendance_write_admin" on public.attendance for insert
  with check (public.is_full_admin());

drop policy if exists "attendance_update_admin" on public.attendance;
create policy "attendance_update_admin" on public.attendance for update
  using (public.is_full_admin());

drop policy if exists "attendance_delete_admin" on public.attendance;
create policy "attendance_delete_admin" on public.attendance for delete
  using (public.is_full_admin());

-- Tasks
drop policy if exists "tasks_write_admin" on public.tasks;
create policy "tasks_write_admin" on public.tasks for insert
  with check (public.is_full_admin());

drop policy if exists "tasks_update_admin" on public.tasks;
create policy "tasks_update_admin" on public.tasks for update
  using (public.is_full_admin());

drop policy if exists "tasks_delete_admin" on public.tasks;
create policy "tasks_delete_admin" on public.tasks for delete
  using (public.is_full_admin());

-- Submissions
drop policy if exists "submissions_update_own_or_admin" on public.task_submissions;
create policy "submissions_update_own_or_admin" on public.task_submissions for update
  using (
    student_id = auth.uid()
    or public.is_full_admin()
    or public.get_my_role() = 'Executive'
  )
  with check (
    student_id = auth.uid()
    or public.is_full_admin()
    or public.get_my_role() = 'Executive'
  );

drop policy if exists "submissions_delete_admin" on public.task_submissions;
create policy "submissions_delete_admin" on public.task_submissions for delete
  using (public.is_full_admin());

-- Blogs
drop policy if exists "blogs_update" on public.blogs;
create policy "blogs_update" on public.blogs for update
  using (author_id = auth.uid() or public.is_full_admin())
  with check (author_id = auth.uid() or public.is_full_admin());

drop policy if exists "blogs_delete" on public.blogs;
create policy "blogs_delete" on public.blogs for delete
  using (author_id = auth.uid() or public.is_full_admin());

-- Profiles select — include SuperAdmin
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select
  using (
    auth.uid() = id
    or public.get_my_role() in ('Admin', 'SuperAdmin', 'Executive', 'Staff')
  );

-- Attendance / submissions select — include SuperAdmin
drop policy if exists "attendance_select" on public.attendance;
create policy "attendance_select" on public.attendance for select
  using (
    public.get_my_role() in ('Admin', 'SuperAdmin', 'Executive', 'Staff')
    or student_id = auth.uid()
  );

drop policy if exists "submissions_select" on public.task_submissions;
create policy "submissions_select" on public.task_submissions for select
  using (
    public.get_my_role() in ('Admin', 'SuperAdmin', 'Executive', 'Staff')
    or student_id = auth.uid()
  );

-- Student notes (SuperAdmin only)
create table if not exists public.student_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null,
  category text not null default 'General'
    check (category in ('General', 'Strength', 'Concern', 'Speaking', 'Technical')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_student_notes_student_id on public.student_notes(student_id);
create index if not exists idx_student_notes_created_at on public.student_notes(created_at desc);

alter table public.student_notes enable row level security;

create policy "student_notes_select_superadmin" on public.student_notes for select
  using (public.get_my_role() = 'SuperAdmin');

create policy "student_notes_insert_superadmin" on public.student_notes for insert
  with check (public.get_my_role() = 'SuperAdmin');

create policy "student_notes_update_superadmin" on public.student_notes for update
  using (public.get_my_role() = 'SuperAdmin');

create policy "student_notes_delete_superadmin" on public.student_notes for delete
  using (public.get_my_role() = 'SuperAdmin');
