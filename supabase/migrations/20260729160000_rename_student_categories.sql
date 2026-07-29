-- Rename student category labels
update public.profiles
set student_category = 'SSM Student'
where student_category in ('SSM Students', 'SSM Student');

update public.profiles
set student_category = 'Other College'
where student_category in ('Non SSM Students', 'Non SSM Student');
