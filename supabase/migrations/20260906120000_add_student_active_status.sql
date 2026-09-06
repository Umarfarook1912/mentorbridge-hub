-- Student enrollment Active / Inactive with optional inactive date

alter table public.profiles
  add column if not exists is_active boolean not null default true;

alter table public.profiles
  add column if not exists inactive_at date;

create index if not exists idx_profiles_is_active
  on public.profiles(is_active);

comment on column public.profiles.is_active is
  'Enrollment status; new students default to Active';

comment on column public.profiles.inactive_at is
  'Date the student was marked Inactive; null when Active';
