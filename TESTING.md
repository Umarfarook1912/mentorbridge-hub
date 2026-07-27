# MentorBridge Hub — Full Testing Guide

End-to-end guide to set up and fully test the app as **Admin** and **Student**.

---

## 1. Prerequisites

- Node.js 20+
- Project at `D:\mentorbridge-hub`
- Supabase project already linked (migrations applied)
- `.env.local` filled with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Important: `SUPABASE_SERVICE_ROLE_KEY` must be the **service_role** key (not anon).  
> Find it in Supabase → **Project Settings → API → service_role**.  
> Without this, Admin cannot create students.

---

## 2. Start the app

```powershell
cd D:\mentorbridge-hub
npm install
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)  
You should be redirected to `/login`.

---

## 3. Create your first Admin user

### Option A — Register then promote (recommended)

1. Go to `/register`
2. Create account:

- Full name: `Admin User`
- Email: `admin@mentorbridge.in`
- Password: `Admin@12345`

3. Confirm email if Supabase email confirmation is enabled
   (or disable confirmation temporarily in Supabase Auth settings for local testing)
4. Promote to Admin via terminal:

```powershell
supabase db execute --sql "UPDATE public.profiles SET role = 'Admin' WHERE email = 'admin@mentorbridge.in';"
```

Or with `psql` using your DB connection string:

```sql
UPDATE public.profiles SET role = 'Admin' WHERE email = 'admin@mentorbridge.in';
SELECT email, role FROM public.profiles;
```

1. Log out / log in again at `/login`
2. You should land on `/admin/dashboard`

### Option B — Google OAuth (optional)

1. Enable Google provider in Supabase → **Authentication → Providers → Google**
2. Configure Google Cloud OAuth client + redirect URL
   `https://<project-ref>.supabase.co/auth/v1/callback`
3. Use **Continue with Google** on login
4. Promote that user’s email to Admin with the SQL above

---

## 4. Roles & route map

| Role    | Home                 | Access                 |
| ------- | -------------------- | ---------------------- |
| Admin   | `/admin/dashboard`   | All `/admin/*` pages   |
| Student | `/student/dashboard` | All `/student/*` pages |

Middleware protects routes: wrong role is redirected to their own dashboard.

### Admin pages

- `/admin/dashboard`
- `/admin/students`
- `/admin/meetings`
- `/admin/attendance`
- `/admin/tasks`
- `/admin/submissions`
- `/admin/reports`

### Student pages

- `/student/dashboard`
- `/student/meetings`
- `/student/attendance`
- `/student/tasks`
- `/student/profile`

---

## 5. Reference dropdown values

### Department

- IT
- CSE
- ECE
- AIDS
- CSBS
- Non SSM Students

### Domain Interest

- Frontend
- Backend
- Data Engineer

---

## 6. Full Admin test flow

Log in as Admin first.

### 6.1 Dashboard (`/admin/dashboard`)

Checklist:

- [x] Stats cards load (students, present/absent/permission, meetings, tasks, reviews)
- [x] Monthly Attendance chart renders
- [x] Quick Actions open Students / Meetings / Tasks / Reports

### 6.2 Students (`/admin/students`)

Create at least **2 students**:

| Field           | Student 1       | Student 2        |
| --------------- | --------------- | ---------------- |
| Full Name       | `Riya Sharma`   | `Arjun Kumar`    |
| Email           | `riya@test.com` | `arjun@test.com` |
| Phone           | `9876543210`    | `9876543211`     |
| Department      | `CSE`           | `IT`             |
| Domain Interest | `Frontend`      | `Backend`        |
| Password        | `Student@123`   | `Student@123`    |

Checklist:

- [ ] Add Student works
- [ ] Student appears in table with Department + Domain Interest
- [ ] Search by name/email works
- [ ] Filter by department works
- [ ] Edit student works (update department/domain)
- [ ] Delete student works (optional; keep 2 for remaining tests)

### 6.3 Meetings (`/admin/meetings`)

Create 2 meetings:

1. **Upcoming**

- Title: `React Hooks Deep Dive`
- Handled by: `Senthil Kumar`
- Date: tomorrow
- Time: `10:00` – `12:00`

2. **Past** (optional)

- Title: `Orientation Session`
- Date: yesterday
- Time: `09:00` – `10:00`

Checklist:

- [ ] Create Meeting works
- [ ] Appears under Upcoming tab
- [ ] Edit meeting works
- [ ] Past tab lists completed meetings
- [ ] Delete meeting works (optional)

### 6.4 Attendance (`/admin/attendance`)

1. Select `React Hooks Deep Dive`
2. Mark each student:

- Riya → **Present**
- Arjun → **Absent** (or Permission)

3. Click **Save**
4. Click **Mark All Present** then Save again
5. Export CSV

Checklist:

- [ ] Meeting selector works
- [ ] P / A / Ex toggles work
- [ ] Save succeeds
- [ ] Summary counts update
- [ ] CSV downloads

### 6.5 Tasks (`/admin/tasks`)

Create 2 tasks:

1. All students

- Title: `Build Todo App`
- Due date: +7 days
- Assign To: **All Students**

2. Department-specific

- Title: `Cloud Basics Assignment`
- Due date: +10 days
- Assign To: **IT**

Checklist:

- [ ] Create Task works
- [ ] Edit / Delete works
- [ ] Overdue styling shows for past due dates (optional)

### 6.6 Submissions (`/admin/submissions`)

(Do this after a student submits — see Student section 7.4)

Checklist:

- [ ] Pending submission appears
- [ ] Filters by Status / Department work
- [ ] Links open (GitHub / Doc / Medium)
- [ ] Review → Approve with feedback
- [ ] Review → Reject with feedback
- [ ] Status badge updates

### 6.7 Reports (`/admin/reports`)

Checklist:

- [ ] Month picker works
- [ ] Department filter works
- [ ] Attendance chart loads
- [ ] Table shows attendance rows
- [ ] Export CSV downloads

### 6.8 Navbar / polish

Checklist:

- [ ] Theme toggle (light/dark) works
- [ ] Notifications bell opens (may be empty)
- [ ] Avatar menu shows name/email
- [ ] Sign Out returns to `/login`

---

## 7. Full Student test flow

Use a private/incognito window (or sign out Admin).

Login as:

- Email: `riya@test.com`
- Password: `Student@123`

### 7.1 Dashboard (`/student/dashboard`)

Checklist:

- [ ] Welcome message shows first name
- [ ] Attendance % card loads
- [ ] Pending / Completed task counts load
- [ ] Upcoming meetings list shows admin-created meeting
- [ ] Pending tasks list shows assigned tasks

### 7.2 Meetings (`/student/meetings`)

Checklist:

- [ ] Upcoming tab shows meeting details (title, date, time, handled by)
- [ ] Past tab works
- [ ] Student cannot create/edit/delete meetings (read-only)

### 7.3 Attendance (`/student/attendance`)

Checklist:

- [ ] Overall attendance ring/percentage shows
- [ ] Present / Absent / Permission counts match admin marks
- [ ] History table lists sessions with status badges

### 7.4 Tasks (`/student/tasks`)

For `Build Todo App`:

1. Click **Submit Task**
2. Enter at least one link:

- GitHub: `https://github.com/example/todo-app`
- Optional Google Doc / Medium
- Remarks: `Completed all requirements`

3. Submit

Checklist:

- [ ] Task cards show due date
- [ ] Submit dialog validates (at least one URL required)
- [ ] After submit, status becomes **Pending**
- [ ] Edit Submission works while Pending and before due date
- [ ] Department-only task (`Cloud Basics`) appears only for IT student (Arjun), not CSE (Riya)

Then switch back to Admin and approve/reject in Submissions.

Return to Student Tasks:

- [ ] Status shows Approved / Rejected
- [ ] Feedback text is visible

### 7.5 Profile (`/student/profile`)

Checklist:

- [ ] Update Full Name
- [ ] Update Phone
- [ ] Department dropdown shows IT/CSE/ECE/AIDS/CSBS/Non SSM Students only
- [ ] Domain Interest dropdown shows Frontend / Backend / Data Engineer
- [ ] Save Changes works
- [ ] Avatar upload works (optional; needs Storage `avatars` bucket)

---

## 8. Cross-role security checks

| Action                                  | Expected                         |
| --------------------------------------- | -------------------------------- |
| Student opens `/admin/dashboard`        | Redirect to `/student/dashboard` |
| Admin opens `/student/dashboard`        | Redirect to `/admin/dashboard`   |
| Logged-out user opens `/admin/students` | Redirect to `/login`             |
| Logged-in Admin opens `/login`          | Redirect to `/admin/dashboard`   |

---

## 9. Suggested happy-path script (30–40 min)

1. Start app → register Admin → promote role → login
2. Admin creates 2 students
3. Admin creates 1 upcoming meeting
4. Admin marks attendance
5. Admin creates 2 tasks (All + IT)
6. Login as Riya (CSE) → check meetings/attendance → submit All task
7. Login as Arjun (IT) → confirm IT task is visible → submit it
8. Login as Admin → review both submissions (approve one, reject one)
9. Login as each student → verify feedback/status
10. Admin opens Reports → export CSV
11. Student updates Profile (department + domain interest)

---

## 10. Troubleshooting

### Cannot create student

- Check `SUPABASE_SERVICE_ROLE_KEY` is the real **service_role** key
- Restart `npm run dev` after changing `.env.local`

### Stuck on login after register

- Confirm email in Supabase Auth, or disable email confirmation for local testing

### Still Student after Admin SQL update

- Sign out and sign in again (role is loaded from profile on login)

### Empty dashboard / charts

- Normal until meetings/attendance/tasks exist — create sample data first

### Google login fails

- Provider not enabled, or redirect URI mismatch in Google Cloud Console

### Avatar upload fails

- Ensure `avatars` storage bucket + policies exist (from schema migration)

### `MenuGroupContext is missing`

- Already fixed in navbar/notifications; hard refresh browser (`Ctrl+Shift+R`)

### Migration check

```powershell
supabase migration list
```

Expected remote versions include:

- `20260727100700`
- `20260727100753`
- `20260727103244`

---

## 11. Quick SQL helpers

```sql
-- List users/roles
SELECT id, full_name, email, role, department, domain_interest
FROM public.profiles
ORDER BY created_at DESC;

-- Promote admin
UPDATE public.profiles
SET role = 'Admin'
WHERE email = 'admin@mentorbridge.in';

-- Demote to student
UPDATE public.profiles
SET role = 'Student'
WHERE email = 'admin@mentorbridge.in';

-- Count core rows
SELECT
  (SELECT count(*) FROM public.profiles WHERE role = 'Student') AS students,
  (SELECT count(*) FROM public.meetings) AS meetings,
  (SELECT count(*) FROM public.attendance) AS attendance,
  (SELECT count(*) FROM public.tasks) AS tasks,
  (SELECT count(*) FROM public.task_submissions) AS submissions;
```

---

## 12. Pass criteria

Mark the app ready when all of these pass:

- [ ] Admin can CRUD students, meetings, tasks
- [ ] Admin can mark attendance and export CSV
- [ ] Student sees only own attendance/tasks
- [ ] Student can submit task links and see review feedback
- [ ] Department + Domain Interest dropdowns work on student form + profile
- [ ] Role-based redirects work
- [ ] Dark mode + sign out work
- [ ] Reports page loads and exports

---

Happy testing. If any step fails, note the page URL + exact error toast/console message and fix from there.
