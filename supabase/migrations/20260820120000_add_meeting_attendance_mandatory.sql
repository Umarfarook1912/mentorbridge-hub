-- Optional meetings can skip attendance marking in the hub

alter table public.meetings
  add column if not exists attendance_mandatory boolean not null default true;

create index if not exists idx_meetings_attendance_mandatory
  on public.meetings(attendance_mandatory)
  where attendance_mandatory = true;
