# Attendance HTML report

Generates a full per-student attendance report from the database (all attendance-tracked meetings from the start through now).

## What you get

For each student:

- Total expected meetings (audience match + `attendance_mandatory`)
- Present / Absent / Permission counts and rates
- Click **Present**, **Absent**, or **Permission** to see which meetings and who conducted them

Unmarked expected meetings count as **Absent**.

## Run

From the repo root (uses `.env.local`):

```bash
npm run report:attendance
```

Or:

```bash
node scripts/attendance-report/generate.mjs
```

## Output

Files are written under `reports/`:

- `reports/attendance-report-latest.html` — always overwritten
- `reports/attendance-report-YYYY-MM-DDTHH-mm-ss.html` — timestamped copy

Open the HTML in any browser.

## Requirements

`.env.local` must include:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
