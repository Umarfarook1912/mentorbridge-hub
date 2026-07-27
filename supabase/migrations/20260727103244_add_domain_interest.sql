-- Add domain_interest column to profiles
alter table public.profiles
  add column if not exists domain_interest text;

create index if not exists idx_profiles_domain_interest
  on public.profiles(domain_interest);
