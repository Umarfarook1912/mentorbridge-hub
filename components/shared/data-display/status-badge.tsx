import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import type { AttendanceStatus, SubmissionStatus } from '@/types/supabase.types'

type StatusValue =
  AttendanceStatus | SubmissionStatus | 'upcoming' | 'completed' | 'overdue' | 'missing'

const STATUS_CONFIG: Record<StatusValue, { label: string; className: string }> = {
  Present: {
    label: 'Present',
    className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  },
  Absent: {
    label: 'Absent',
    className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
  },
  Permission: {
    label: 'Permission',
    className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
  },
  Pending: {
    label: 'Pending',
    className: 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
  },
  Approved: {
    label: 'Approved',
    className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  },
  Rejected: {
    label: 'Rejected',
    className: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
  },
  upcoming: {
    label: 'Upcoming',
    className: 'bg-info/10 text-info border-info/20 hover:bg-info/20',
  },
  completed: {
    label: 'Completed',
    className: 'bg-success/10 text-success border-success/20 hover:bg-success/20',
  },
  overdue: {
    label: 'Overdue',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  missing: {
    label: 'Not Submitted',
    className: 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20',
  },
}

interface StatusBadgeProps {
  status: StatusValue
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  if (!config) return <Badge variant="outline">{status}</Badge>

  return (
    <Badge variant="outline" className={cn(config.className, 'font-medium', className)}>
      {config.label}
    </Badge>
  )
}
