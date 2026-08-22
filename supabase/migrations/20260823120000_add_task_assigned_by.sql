-- Who assigned the task (display name), same idea as meetings.handled_by
alter table public.tasks
  add column if not exists assigned_by text not null default '';

comment on column public.tasks.assigned_by is
  'Display name of who assigned the task (like meetings.handled_by).';
