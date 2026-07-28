-- Denormalize reviewer name so students can see who approved/rejected
-- without needing SELECT access to other profiles rows.
alter table public.task_submissions
  add column if not exists reviewed_by_name text;

update public.task_submissions s
set reviewed_by_name = p.full_name
from public.profiles p
where s.reviewed_by = p.id
  and s.reviewed_by_name is null;
