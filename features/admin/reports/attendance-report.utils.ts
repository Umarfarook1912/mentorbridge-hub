import type { AttendanceStatus } from '@/types/supabase.types'

export interface AttendanceDetailRow {
  id: string
  studentId: string
  studentName: string
  email: string
  department: string
  domainInterest: string
  meetingTitle: string
  meetingDate: string
  status: AttendanceStatus
}

export interface StudentAttendanceSummary {
  studentId: string
  studentName: string
  email: string
  department: string
  present: number
  absent: number
  permission: number
  total: number
  rate: number
  rank: number
}

export function aggregateByStudent(rows: AttendanceDetailRow[]): StudentAttendanceSummary[] {
  const byStudent: Record<string, StudentAttendanceSummary> = {}

  for (const row of rows) {
    if (!byStudent[row.studentId]) {
      byStudent[row.studentId] = {
        studentId: row.studentId,
        studentName: row.studentName,
        email: row.email,
        department: row.department,
        present: 0,
        absent: 0,
        permission: 0,
        total: 0,
        rate: 0,
        rank: 0,
      }
    }
    const entry = byStudent[row.studentId]
    entry.total++
    if (row.status === 'Present') entry.present++
    else if (row.status === 'Absent') entry.absent++
    else entry.permission++
  }

  return Object.values(byStudent)
    .map((s) => ({
      ...s,
      rate: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
      rank: 0,
    }))
    .sort(
      (a, b) =>
        b.rate - a.rate || b.present - a.present || a.studentName.localeCompare(b.studentName)
    )
    .map((s, i) => ({ ...s, rank: i + 1 }))
}

export function buildSessionChartData(rows: AttendanceDetailRow[]) {
  const byMeeting: Record<
    string,
    { meeting: string; Present: number; Absent: number; Permission: number }
  > = {}
  for (const r of rows) {
    if (!byMeeting[r.meetingTitle]) {
      byMeeting[r.meetingTitle] = {
        meeting: r.meetingTitle.slice(0, 15) + (r.meetingTitle.length > 15 ? '…' : ''),
        Present: 0,
        Absent: 0,
        Permission: 0,
      }
    }
    byMeeting[r.meetingTitle][r.status]++
  }
  return Object.values(byMeeting)
}
