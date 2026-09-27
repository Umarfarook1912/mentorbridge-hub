-- Category scores: drop Concern, add Communication, store a percent on each note.
-- Totals are the sum of note percentages for that student and category.

update public.student_notes
set category = 'General'
where category = 'Concern';

do $$
declare
  constraint_name text;
begin
  select c.conname into constraint_name
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'student_notes'
    and c.contype = 'c'
    and pg_get_constraintdef(c.oid) ilike '%Concern%';

  if constraint_name is not null then
    execute format('alter table public.student_notes drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.student_notes
  add constraint student_notes_category_check
  check (category in ('General', 'Strength', 'Speaking', 'Technical', 'Communication'));

alter table public.student_notes
  add column if not exists percentage integer;

alter table public.student_notes
  drop constraint if exists student_notes_percentage_check;

alter table public.student_notes
  add constraint student_notes_percentage_check
  check (percentage is null or (percentage >= 0 and percentage <= 100));
