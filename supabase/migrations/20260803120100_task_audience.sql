-- Task audience (domain + specific people), drop degree department assignment
alter table public.tasks
  add column if not exists target_domains text[];

alter table public.tasks
  add column if not exists target_student_ids uuid[];

comment on column public.tasks.target_domains is
  'Student domain_interest values. null/empty = unrestricted by domain.';
comment on column public.tasks.target_student_ids is
  'Specific student invitees. Combined with target_domains (OR). Both empty = all.';

alter table public.tasks drop column if exists department;
drop index if exists idx_tasks_department;
