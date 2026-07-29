-- Normalize degree abbreviations in department names
update public.profiles
set department = 'BSc CS'
where department = 'Bsc CS';

update public.profiles
set department = 'MSc CS'
where department = 'Msc CS';

update public.profiles
set department = 'MSc Software Systems'
where department = 'MSC Software Systems';

update public.tasks
set department = 'BSc CS'
where department = 'Bsc CS';

update public.tasks
set department = 'MSc CS'
where department = 'Msc CS';

update public.tasks
set department = 'MSc Software Systems'
where department = 'MSC Software Systems';
