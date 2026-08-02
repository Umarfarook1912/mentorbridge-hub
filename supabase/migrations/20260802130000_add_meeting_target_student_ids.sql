-- Optional specific student invitees (union with target_domains)
alter table public.meetings
  add column if not exists target_student_ids uuid[];

comment on column public.meetings.target_student_ids is
  'Specific student profile ids. Combined with target_domains (OR). Both null/empty = all students.';
