-- Associate section permissions + RLS (requires Associate enum from prior migration)

alter table public.profiles
  add column if not exists section_permissions text[];

comment on column public.profiles.section_permissions is
  'Grantable admin sections for Associate role. Ignored for Admin; empty for Student.';

create or replace function public.has_section_permission(perm text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'Admin'
        or (
          p.role = 'Associate'
          and p.section_permissions is not null
          and perm = any (p.section_permissions)
        )
      )
  );
$$;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select
  using (
    auth.uid() = id
    or public.get_my_role() = 'Admin'
    or public.get_my_role() = 'Associate'
  );

drop policy if exists "meetings_write_admin" on public.meetings;
drop policy if exists "meetings_update_admin" on public.meetings;
drop policy if exists "meetings_delete_admin" on public.meetings;

create policy "meetings_write_admin" on public.meetings for insert
  with check (public.has_section_permission('meetings'));
create policy "meetings_update_admin" on public.meetings for update
  using (public.has_section_permission('meetings'));
create policy "meetings_delete_admin" on public.meetings for delete
  using (public.has_section_permission('meetings'));

drop policy if exists "attendance_select" on public.attendance;
drop policy if exists "attendance_write_admin" on public.attendance;
drop policy if exists "attendance_update_admin" on public.attendance;
drop policy if exists "attendance_delete_admin" on public.attendance;

create policy "attendance_select" on public.attendance for select
  using (
    public.has_section_permission('attendance')
    or student_id = auth.uid()
  );
create policy "attendance_write_admin" on public.attendance for insert
  with check (public.has_section_permission('attendance'));
create policy "attendance_update_admin" on public.attendance for update
  using (public.has_section_permission('attendance'));
create policy "attendance_delete_admin" on public.attendance for delete
  using (public.has_section_permission('attendance'));

drop policy if exists "tasks_write_admin" on public.tasks;
drop policy if exists "tasks_update_admin" on public.tasks;
drop policy if exists "tasks_delete_admin" on public.tasks;

create policy "tasks_write_admin" on public.tasks for insert
  with check (public.has_section_permission('tasks'));
create policy "tasks_update_admin" on public.tasks for update
  using (public.has_section_permission('tasks'));
create policy "tasks_delete_admin" on public.tasks for delete
  using (public.has_section_permission('tasks'));

drop policy if exists "submissions_select" on public.task_submissions;
drop policy if exists "submissions_update_own_or_admin" on public.task_submissions;
drop policy if exists "submissions_delete_admin" on public.task_submissions;

create policy "submissions_select" on public.task_submissions for select
  using (
    public.has_section_permission('submissions')
    or student_id = auth.uid()
  );
create policy "submissions_update_own_or_admin" on public.task_submissions for update
  using (
    student_id = auth.uid()
    or public.has_section_permission('submissions')
  )
  with check (
    student_id = auth.uid()
    or public.has_section_permission('submissions')
  );
create policy "submissions_delete_admin" on public.task_submissions for delete
  using (public.has_section_permission('submissions'));

drop policy if exists "blogs_update" on public.blogs;
drop policy if exists "blogs_delete" on public.blogs;

create policy "blogs_update" on public.blogs for update
  using (author_id = auth.uid() or public.has_section_permission('blogs'))
  with check (author_id = auth.uid() or public.has_section_permission('blogs'));
create policy "blogs_delete" on public.blogs for delete
  using (author_id = auth.uid() or public.has_section_permission('blogs'));
