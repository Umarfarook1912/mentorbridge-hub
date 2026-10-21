-- Company placement: students stay able to sign in, and are omitted from attendance and submission lists.

alter table public.profiles
  add column if not exists company_name text;

alter table public.profiles
  add column if not exists company_location text;

alter table public.profiles
  add column if not exists company_joined_at date;

comment on column public.profiles.company_name is
  'Set when enrollment status is Company. Null for Active and Inactive students.';

comment on column public.profiles.company_location is
  'Workplace location for a Company student.';

comment on column public.profiles.company_joined_at is
  'Date the student joined the company.';
