-- Staff can SELECT all admin data but cannot INSERT/UPDATE/DELETE

comment on column public.profiles.section_permissions is
  'Grantable admin sections for Executive role. Ignored for Admin and Staff; empty for Student.';

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select
  using (
    auth.uid() = id
    or public.get_my_role() = 'Admin'
    or public.get_my_role() = 'Executive'
    or public.get_my_role() = 'Staff'
  );

drop policy if exists "attendance_select" on public.attendance;
create policy "attendance_select" on public.attendance for select
  using (
    public.has_section_permission('attendance')
    or public.get_my_role() = 'Staff'
    or student_id = auth.uid()
  );

drop policy if exists "submissions_select" on public.task_submissions;
create policy "submissions_select" on public.task_submissions for select
  using (
    public.has_section_permission('submissions')
    or public.get_my_role() = 'Staff'
    or student_id = auth.uid()
  );

drop policy if exists "blogs_insert" on public.blogs;
create policy "blogs_insert" on public.blogs for insert
  with check (
    author_id = auth.uid()
    and public.get_my_role() <> 'Staff'
  );
