-- Target audience for meetings by student domain_interest
-- null or empty array = all students
alter table public.meetings
  add column if not exists target_domains text[];

comment on column public.meetings.target_domains is
  'Student domain_interest values (Frontend/Backend/Data Engineer). null or empty = all students.';
