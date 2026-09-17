-- Restore Executive section permissions that were unintentionally narrowed
-- when SuperAdmin support was added. has_section_permission() already grants
-- every section to Admin and SuperAdmin.

-- Meetings
drop policy if exists "meetings_write_admin" on public.meetings;
create policy "meetings_write_admin" on public.meetings for insert
  with check (public.has_section_permission('meetings'));

drop policy if exists "meetings_update_admin" on public.meetings;
create policy "meetings_update_admin" on public.meetings for update
  using (public.has_section_permission('meetings'))
  with check (public.has_section_permission('meetings'));

drop policy if exists "meetings_delete_admin" on public.meetings;
create policy "meetings_delete_admin" on public.meetings for delete
  using (public.has_section_permission('meetings'));

-- Attendance
drop policy if exists "attendance_select" on public.attendance;
create policy "attendance_select" on public.attendance for select
  using (
    public.has_section_permission('attendance')
    or public.get_my_role() = 'Staff'
    or student_id = auth.uid()
  );

drop policy if exists "attendance_write_admin" on public.attendance;
create policy "attendance_write_admin" on public.attendance for insert
  with check (public.has_section_permission('attendance'));

drop policy if exists "attendance_update_admin" on public.attendance;
create policy "attendance_update_admin" on public.attendance for update
  using (public.has_section_permission('attendance'))
  with check (public.has_section_permission('attendance'));

drop policy if exists "attendance_delete_admin" on public.attendance;
create policy "attendance_delete_admin" on public.attendance for delete
  using (public.has_section_permission('attendance'));

-- Tasks
drop policy if exists "tasks_write_admin" on public.tasks;
create policy "tasks_write_admin" on public.tasks for insert
  with check (public.has_section_permission('tasks'));

drop policy if exists "tasks_update_admin" on public.tasks;
create policy "tasks_update_admin" on public.tasks for update
  using (public.has_section_permission('tasks'))
  with check (public.has_section_permission('tasks'));

drop policy if exists "tasks_delete_admin" on public.tasks;
create policy "tasks_delete_admin" on public.tasks for delete
  using (public.has_section_permission('tasks'));

-- Submissions
drop policy if exists "submissions_select" on public.task_submissions;
create policy "submissions_select" on public.task_submissions for select
  using (
    public.has_section_permission('submissions')
    or public.get_my_role() = 'Staff'
    or student_id = auth.uid()
  );

drop policy if exists "submissions_update_own_or_admin" on public.task_submissions;
create policy "submissions_update_own_or_admin" on public.task_submissions for update
  using (
    student_id = auth.uid()
    or public.has_section_permission('submissions')
  )
  with check (
    student_id = auth.uid()
    or public.has_section_permission('submissions')
  );

drop policy if exists "submissions_delete_admin" on public.task_submissions;
create policy "submissions_delete_admin" on public.task_submissions for delete
  using (public.has_section_permission('submissions'));

-- Blogs
drop policy if exists "blogs_update" on public.blogs;
create policy "blogs_update" on public.blogs for update
  using (
    author_id = auth.uid()
    or public.has_section_permission('blogs')
  )
  with check (
    author_id = auth.uid()
    or public.has_section_permission('blogs')
  );

drop policy if exists "blogs_delete" on public.blogs;
create policy "blogs_delete" on public.blogs for delete
  using (
    author_id = auth.uid()
    or public.has_section_permission('blogs')
  );
