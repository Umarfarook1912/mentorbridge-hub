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

type AttendanceJoinRow = {
  id: string
  student_id: string
  status: AttendanceDetailRow['status']
  meetings: { title: string; meeting_date: string } | null
  profiles: ProfileJoin | null
}

async function fetchAllAttendanceRows(
  supabase: SupabaseClient,
  fullReport: boolean,
  fromMonth: string,
  toMonth: string,
  studentId: string
): Promise<AttendanceJoinRow[]> {
  const pageSize = 1000
  let from = 0
  const rows: AttendanceJoinRow[] = []
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
    rows.push(...((data as AttendanceJoinRow[] | null) ?? []))
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
      const profile = r.profiles
      return {
        id: r.id,
        studentId: r.student_id,
        studentName: profile?.full_name ?? '',
        email: profile?.email ?? '',
        department: profile?.department ?? '',
        domainInterest: profile?.domain_interest ?? '',
        isActive: profile?.is_active ?? true,
        inactiveAt: profile?.inactive_at ?? null,
        meetingTitle: r.meetings?.title ?? '',
        meetingDate: r.meetings?.meeting_date ?? '',
        status: r.status,
      }
    })
    .filter((r) => {
      if (department && r.department !== department) return false
      if (domain && r.domainInterest !== domain) return false
      return true
    })
}
