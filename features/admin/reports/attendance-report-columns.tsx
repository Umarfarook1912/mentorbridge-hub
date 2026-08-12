import type { Column } from '@/components/shared/data-display/data-table'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { formatDate } from '@/utils/format'
import type { AttendanceDetailRow, StudentAttendanceSummary } from './attendance-report.utils'

export const attendanceSummaryColumns: Column<StudentAttendanceSummary>[] = [
  {
    key: 'rank',
    header: '#',
    cell: (r) => <span className="text-muted-foreground text-sm">{r.rank}</span>,
  },
  {
    key: 'student',
    header: 'Student',
    cell: (r) => <span className="text-sm font-medium">{r.studentName}</span>,
  },
  {
    key: 'dept',
    header: 'Department',
    cell: (r) => <span className="text-sm">{r.department}</span>,
  },
  {
    key: 'present',
    header: 'Present',
    cell: (r) => <span className="text-sm">{r.present}</span>,
  },
  { key: 'absent', header: 'Absent', cell: (r) => <span className="text-sm">{r.absent}</span> },
  {
    key: 'permission',
    header: 'Permission',
    cell: (r) => <span className="text-sm">{r.permission}</span>,
  },
  {
    key: 'rate',
    header: 'Attendance %',
    cell: (r) => <span className="text-sm font-semibold tabular-nums">{r.rate}%</span>,
  },
]

export const attendanceDetailColumns: Column<AttendanceDetailRow>[] = [
  {
    key: 'meeting',
    header: 'Meeting',
    cell: (r) => <span className="text-sm">{r.meetingTitle}</span>,
  },
  {
    key: 'date',
    header: 'Date',
    cell: (r) => (
      <span className="text-muted-foreground text-sm">{formatDate(r.meetingDate)}</span>
    ),
  },
  { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
]
