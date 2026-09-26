/**
 * Generate a full student attendance HTML report from Supabase.
 *
 * Usage:
 *   npm run report:attendance
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isMeetingForStudent } from './audience.mjs'
import { buildHtmlReport } from './build-html.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '../..')
const OUT_DIR = path.join(ROOT, 'reports')

async function loadEnvFile() {
  const envPath = path.join(ROOT, '.env.local')
  try {
    const raw = await readFile(envPath, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = value
    }
  } catch {
    // Optional if caller used --env-file
  }
}

async function fetchAll(supabase, table, columns, options = {}) {
  const pageSize = 1000
  let from = 0
  const rows = []

  for (;;) {
    let query = supabase.from(table).select(columns).range(from, from + pageSize - 1)
    if (options.order) {
      for (const o of options.order) {
        query = query.order(o.column, { ascending: o.ascending ?? true })
      }
    }
    if (options.in) {
      query = query.in(options.in.column, options.in.values)
    }
    if (options.eq) {
      for (const [column, value] of Object.entries(options.eq)) {
        query = query.eq(column, value)
      }
    }

    const { data, error } = await query
    if (error) throw new Error(`${table}: ${error.message}`)
    rows.push(...(data ?? []))
    if (!data || data.length < pageSize) break
    from += pageSize
  }

  return rows
}

function toMeetingItem(meeting, status) {
  return {
    id: meeting.id,
    title: meeting.title,
    meeting_date: meeting.meeting_date,
    start_time: meeting.start_time,
    end_time: meeting.end_time,
    handled_by: meeting.handled_by,
    status,
  }
}

function byDateThenTime(a, b) {
  return (
    a.meeting_date.localeCompare(b.meeting_date) ||
    String(a.start_time ?? '').localeCompare(String(b.start_time ?? ''))
  )
}

function buildStudentReports(students, meetings, attendanceRows) {
  const attendanceByPair = new Map()
  for (const row of attendanceRows) {
    attendanceByPair.set(`${row.student_id}:${row.meeting_id}`, row.status)
  }

  const mandatoryMeetings = meetings.filter((m) => m.attendance_mandatory !== false)
  const optionalMeetings = meetings.filter((m) => m.attendance_mandatory === false)

  return students
    .map((student) => {
      const expectedMandatory = mandatoryMeetings.filter((m) => isMeetingForStudent(m, student))
      const expectedOptional = optionalMeetings.filter((m) => isMeetingForStudent(m, student))

      const presentMeetings = []
      const absentMeetings = []
      const permissionMeetings = []

      for (const meeting of expectedMandatory) {
        const status = attendanceByPair.get(`${student.id}:${meeting.id}`) ?? 'Absent'
        const item = toMeetingItem(meeting, status)
        if (status === 'Present') presentMeetings.push(item)
        else if (status === 'Permission') permissionMeetings.push(item)
        else absentMeetings.push(item)
      }

      const nonMandatoryMeetings = expectedOptional
        .map((m) => toMeetingItem(m, 'Non-mandatory'))
        .sort(byDateThenTime)

      presentMeetings.sort(byDateThenTime)
      absentMeetings.sort(byDateThenTime)
      permissionMeetings.sort(byDateThenTime)

      const total = expectedMandatory.length
      const present = presentMeetings.length
      const absent = absentMeetings.length
      const permission = permissionMeetings.length
      const nonMandatory = nonMandatoryMeetings.length
      const allMeetings = total + nonMandatory
      const rate = (n) => (total > 0 ? Math.round((n / total) * 100) : 0)

      return {
        ...student,
        stats: {
          total,
          present,
          absent,
          permission,
          nonMandatory,
          allMeetings,
          presentRate: rate(present),
          absentRate: rate(absent),
          permissionRate: rate(permission),
        },
        presentMeetings,
        absentMeetings,
        permissionMeetings,
        nonMandatoryMeetings,
      }
    })
    .sort(
      (a, b) =>
        b.stats.presentRate - a.stats.presentRate ||
        b.stats.present - a.stats.present ||
        a.full_name.localeCompare(b.full_name)
    )
}

async function main() {
  await loadEnvFile()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local'
    )
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  console.log('Fetching students, meetings, and attendance…')

  const [students, meetings, attendanceRows] = await Promise.all([
    fetchAll(
      supabase,
      'profiles',
      'id, full_name, email, department, domain_interest, is_active, inactive_at, role',
      {
        in: { column: 'role', values: ['Student', 'Executive'] },
        order: [{ column: 'full_name', ascending: true }],
      }
    ),
    fetchAll(
      supabase,
      'meetings',
      'id, title, handled_by, meeting_date, start_time, end_time, target_domains, target_student_ids, attendance_mandatory',
      {
        order: [
          { column: 'meeting_date', ascending: true },
          { column: 'start_time', ascending: true },
        ],
      }
    ),
    fetchAll(supabase, 'attendance', 'meeting_id, student_id, status'),
  ])

  const mandatoryMeetings = meetings.filter((m) => m.attendance_mandatory !== false)
  const optionalMeetings = meetings.filter((m) => m.attendance_mandatory === false)
  const mandatoryIds = new Set(mandatoryMeetings.map((m) => m.id))
  const relevantAttendance = attendanceRows.filter((r) => mandatoryIds.has(r.meeting_id))

  const studentReports = buildStudentReports(students, meetings, relevantAttendance)

  const generatedAt = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const html = buildHtmlReport({
    generatedAt,
    meetings,
    mandatoryCount: mandatoryMeetings.length,
    nonMandatoryCount: optionalMeetings.length,
    students: studentReports,
  })

  await mkdir(OUT_DIR, { recursive: true })
  const stamp = new Date().toISOString().slice(0, 19).replaceAll(':', '-')
  const outFile = path.join(OUT_DIR, `attendance-report-${stamp}.html`)
  const latestFile = path.join(OUT_DIR, 'attendance-report-latest.html')

  await writeFile(outFile, html, 'utf8')
  await writeFile(latestFile, html, 'utf8')

  console.log(`Meetings analysed: ${meetings.length} (mandatory ${mandatoryMeetings.length}, optional ${optionalMeetings.length})`)
  console.log(`Students analysed: ${studentReports.length}`)
  console.log(`Wrote: ${outFile}`)
  console.log(`Also:  ${latestFile}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
