-- Job title at the company. Separate from profiles.role (portal access).

alter table public.profiles
  add column if not exists company_role text;

comment on column public.profiles.company_role is
  'Job role for a Company student. Null for Active and Inactive students.';
