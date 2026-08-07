-- Allow students to delete their own submissions (within due date enforced in app)
drop policy if exists "submissions_delete_own" on public.task_submissions;
create policy "submissions_delete_own" on public.task_submissions for delete
  using (student_id = auth.uid());
