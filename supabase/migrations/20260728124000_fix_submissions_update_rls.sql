-- Ensure admins can update submission review fields under RLS
drop policy if exists "submissions_update_own_or_admin" on public.task_submissions;

create policy "submissions_update_own_or_admin" on public.task_submissions
  for update
  using (
    student_id = auth.uid()
    or public.get_my_role() = 'Admin'
  )
  with check (
    student_id = auth.uid()
    or public.get_my_role() = 'Admin'
  );
