import type { SupabaseClient } from '@supabase/supabase-js'
import { monthRangeBounds } from './report-date-range'
import type { AttendanceDetailRow } from './attendance-report.utils'

interface FetchAttendanceParams {
  supabase: SupabaseClient
  fullReport: boolean
  fromMonth: string
  toMonth: string
  studentId: string
  department: string
  domain: string
}

type ProfileJoin = {
  full_name: string
  email: string
  department: string | null
  domain_interest: string | null
  is_active: boolean | null
  inactive_at: string | null
}

type MeetingJoin = { title: string; meeting_date: string }

type RawAttendanceRow = {
  id: string
  student_id: string
  status: AttendanceDetailRow['status']
  meetings: MeetingJoin | MeetingJoin[] | null
  profiles: ProfileJoin | ProfileJoin[] | null
}

function unwrapOne<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

async function fetchAllAttendanceRows(
  supabase: SupabaseClient,
  fullReport: boolean,
  fromMonth: string,
  toMonth: string,
  studentId: string
): Promise<RawAttendanceRow[]> {
  const pageSize = 1000
  let from = 0
  const rows: RawAttendanceRow[] = []
  const bounds = fullReport ? null : monthRangeBounds(fromMonth, toMonth)

  for (;;) {
    let query = supabase
      .from('attendance')
      .select(
        'id, student_id, status, meetings!inner(title, meeting_date), profiles:student_id(full_name, email, department, domain_interest, is_active, inactive_at)'
      )
      .range(from, from + pageSize - 1)

    if (bounds) {
      query = query
        .gte('meetings.meeting_date', bounds.start)
        .lte('meetings.meeting_date', bounds.end)
    }
    if (studentId) query = query.eq('student_id', studentId)

    const { data, error } = await query
    if (error) throw error
    rows.push(...((data as unknown as RawAttendanceRow[] | null) ?? []))
    if (!data || data.length < pageSize) break
    from += pageSize
  }

  return rows
}

export async function fetchAttendanceDetailRows({
  supabase,
  fullReport,
  fromMonth,
  toMonth,
  studentId,
  department,
  domain,
}: FetchAttendanceParams): Promise<AttendanceDetailRow[]> {
  const raw = await fetchAllAttendanceRows(supabase, fullReport, fromMonth, toMonth, studentId)

  return raw
    .map((r) => {
      const profile = unwrapOne(r.profiles)
      const meeting = unwrapOne(r.meetings)
      return {
        id: r.id,
        studentId: r.student_id,
        studentName: profile?.full_name ?? '',
        email: profile?.email ?? '',
        department: profile?.department ?? '',
        domainInterest: profile?.domain_interest ?? '',
        isActive: profile?.is_active ?? true,
        inactiveAt: profile?.inactive_at ?? null,
        meetingTitle: meeting?.title ?? '',
        meetingDate: meeting?.meeting_date ?? '',
        status: r.status,
      }
    })
    .filter((r) => {
      if (department && r.department !== department) return false
      if (domain && r.domainInterest !== domain) return false
      return true
    })
}
