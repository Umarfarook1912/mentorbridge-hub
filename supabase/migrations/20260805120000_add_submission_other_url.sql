-- Optional other/portfolio link on task submissions
alter table public.task_submissions
  add column if not exists other_url text;

comment on column public.task_submissions.other_url is
  'Optional portfolio or any other submission link';
