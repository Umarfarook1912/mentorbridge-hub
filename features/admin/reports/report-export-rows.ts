import { enrollmentBadge } from '@/lib/enrollment'
import type { StudentAttendanceSummary } from './attendance-report.utils'
import type { StudentTaskSummary } from './task-completion-report.utils'

function placementColumns(row: {
  isActive: boolean
  inactiveAt: string | null
  companyName: string | null
  companyRole: string | null
  companyLocation: string | null
  companyJoinedAt: string | null
}) {
  return {
    Status: enrollmentBadge({ is_active: row.isActive, company_name: row.companyName }),
    'Inactive Date': row.inactiveAt ?? '',
    'Company Name': row.companyName ?? '',
    Role: row.companyRole ?? '',
    Location: row.companyLocation ?? '',
    'Date of Joining': row.companyJoinedAt ?? '',
  }
}

export function taskSummaryExportRows(summary: StudentTaskSummary[]) {
  return summary.map((s) => ({
    rank: s.rank,
    studentName: s.studentName,
    email: s.email,
    department: s.department,
    ...placementColumns(s),
    assigned: s.assigned,
    approved: s.approved,
    pending: s.pending,
    rejected: s.rejected,
    missing: s.missing,
    'Completion %': s.rate,
  }))
}

export function attendanceSummaryExportRows(summary: StudentAttendanceSummary[]) {
  return summary.map((s) => ({
    rank: s.rank,
    studentName: s.studentName,
    email: s.email,
    department: s.department,
    ...placementColumns(s),
    present: s.present,
    absent: s.absent,
    permission: s.permission,
    total: s.total,
    'Attended %': s.attendedRate,
    'Permission %': s.permissionRate,
  }))
}
