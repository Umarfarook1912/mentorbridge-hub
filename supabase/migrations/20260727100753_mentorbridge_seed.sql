-- ============================================================
-- MentorBridge Hub — Seed Data
-- Run AFTER schema.sql
-- Creates sample data for development (profiles are linked to real
-- Supabase auth users — create those first via Supabase dashboard,
-- then paste the UUIDs below).
-- ============================================================

-- ── Departments ──────────────────────────────────────────────
-- Used as reference values across the app

-- ── Sample Meetings ──────────────────────────────────────────
-- Replace 'ADMIN_USER_ID' with actual admin UUID after creating user
-- Example:
-- insert into public.meetings (title, description, handled_by, meeting_date, start_time, end_time, created_by)
-- values
--   ('React Fundamentals Session',  'Introduction to React hooks and component patterns', 'Senthil Kumar', current_date + interval '3 days', '10:00', '12:00', 'ADMIN_USER_ID'),
--   ('JavaScript Deep Dive',        'Async/await, promises, and event loop', 'Dhileepan',     current_date + interval '7 days', '14:00', '16:00', 'ADMIN_USER_ID'),
--   ('Career Strategy Workshop',    'Resume building and interview preparation',           'Senthil Kumar', current_date - interval '2 days', '09:00', '11:00', 'ADMIN_USER_ID');

-- ── Sample Tasks ─────────────────────────────────────────────
-- insert into public.tasks (title, description, due_date, department, created_by)
-- values
--   ('Build a React Todo App',    'Create a fully functional todo app with hooks and local storage', current_date + interval '7 days',  null,   'ADMIN_USER_ID'),
--   ('Write a Medium Blog Post',  'Write about your learning journey in the MentorBridge program',  current_date + interval '14 days', null,   'ADMIN_USER_ID'),
--   ('MERN Stack Mini Project',   'Build a REST API with Express and MongoDB',                       current_date + interval '21 days', 'MERN', 'ADMIN_USER_ID');

-- ── Department Values Reference ───────────────────────────────
-- Used in app for filter dropdowns:
-- 'MERN', 'Java Backend', 'Cloud', 'Data Science', 'AI/DS', 'Full Stack'

-- ── Instructions ─────────────────────────────────────────────
-- 1. Create an Admin user via Supabase Auth dashboard
-- 2. Update their profile role to 'Admin':
--    UPDATE public.profiles SET role = 'Admin' WHERE email = 'admin@mentorbridge.in';
-- 3. Create student users via the Admin panel in the app
-- 4. Uncomment and run the meeting/task inserts above with real admin UUID
