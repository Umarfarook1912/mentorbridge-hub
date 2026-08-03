-- Must run in its own migration: new enum values can't be used in the same transaction
alter type public.user_role add value if not exists 'Associate';
