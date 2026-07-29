-- Student category (SSM / Non SSM) separate from department
alter table public.profiles
  add column if not exists student_category text;

create index if not exists idx_profiles_student_category
  on public.profiles(student_category);

-- Migrate old "Non SSM Students" department values into the new field
update public.profiles
set student_category = 'Non SSM Student',
    department = null
where department = 'Non SSM Student';

update public.profiles
set student_category = 'SSM Student'
where student_category is null
  and role = 'Student';
