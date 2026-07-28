import type { Column } from '@/components/shared/data-display/data-table'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { formatDate } from '@/utils/format'
import type { StudentTaskSummary, TaskDetailRow } from './task-completion-report.utils'

export const taskSummaryColumns: Column<StudentTaskSummary>[] = [
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
    key: 'approved',
    header: 'Approved',
    cell: (r) => <span className="text-sm">{r.approved}</span>,
  },
  {
    key: 'pending',
    header: 'Pending',
    cell: (r) => <span className="text-sm">{r.pending}</span>,
  },
  {
    key: 'rejected',
    header: 'Rejected',
    cell: (r) => <span className="text-sm">{r.rejected}</span>,
  },
  {
    key: 'missing',
    header: 'Missing',
    cell: (r) => <span className="text-sm">{r.missing}</span>,
  },
  {
    key: 'rate',
    header: 'Completion %',
    cell: (r) => <span className="text-sm font-semibold tabular-nums">{r.rate}%</span>,
  },
]

export const taskDetailColumns: Column<TaskDetailRow>[] = [
  {
    key: 'task',
    header: 'Task',
    cell: (r) => <span className="text-sm">{r.taskTitle}</span>,
  },
  {
    key: 'due',
    header: 'Due',
    cell: (r) => <span className="text-muted-foreground text-sm">{formatDate(r.dueDate)}</span>,
  },
  { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
]
