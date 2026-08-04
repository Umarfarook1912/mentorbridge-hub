-- Rename Associate role to Executive
alter type public.user_role rename value 'Associate' to 'Executive';

comment on column public.profiles.section_permissions is
  'Grantable admin sections for Executive role. Ignored for Admin; empty for Student.';

create or replace function public.has_section_permission(perm text)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (
        p.role = 'Admin'
        or (
          p.role = 'Executive'
          and p.section_permissions is not null
          and perm = any (p.section_permissions)
        )
      )
  );
$$;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select
  using (
    auth.uid() = id
    or public.get_my_role() = 'Admin'
    or public.get_my_role() = 'Executive'
  );
