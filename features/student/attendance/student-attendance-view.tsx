'use client'

import { useMemo } from 'react'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'
import { FeatureCardSection } from '@/components/shared/data-display/feature-card'
import { DataTable, type Column } from '@/components/shared/data-display/data-table'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { useGetStudentAttendance } from '@/services/attendance/use-get-attendance'
import { formatDate, formatTime } from '@/utils/format'
import type { AttendanceStatus } from '@/types/supabase.types'

interface AttendanceRow {
  id: string
  meetingTitle: string
  meetingDate: string
  startTime: string
  status: AttendanceStatus
}

interface StudentAttendanceViewProps {
  studentId: string
}

export function StudentAttendanceView({ studentId }: StudentAttendanceViewProps) {
  const { data = [], isLoading } = useGetStudentAttendance(studentId)

  const rows: AttendanceRow[] = useMemo(
    () =>
      data.map((a) => ({
        id: a.id,
        meetingTitle: (a.meetings as { title: string } | null)?.title ?? '',
        meetingDate: (a.meetings as { meeting_date: string } | null)?.meeting_date ?? '',
        startTime: (a.meetings as { start_time: string } | null)?.start_time ?? '',
        status: a.status,
      })),
    [data]
  )

  const percentage = useMemo(() => {
    if (!rows.length) return 0
    const present = rows.filter((r) => r.status === 'Present').length
    return Math.round((present / rows.length) * 100)
  }, [rows])

  const chartData = [
    {
      value: percentage,
      fill:
        percentage >= 75
          ? 'var(--color-success)'
          : percentage >= 50
            ? 'var(--color-warning)'
            : 'var(--color-destructive)',
    },
  ]

  const columns: Column<AttendanceRow>[] = [
    {
      key: 'meeting',
      header: 'Meeting',
      cell: (r) => <span className="text-sm font-medium">{r.meetingTitle}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      cell: (r) => <span className="text-sm">{formatDate(r.meetingDate, 'EEE, dd MMM yyyy')}</span>,
    },
    {
      key: 'time',
      header: 'Time',
      cell: (r) => <span className="text-muted-foreground text-sm">{formatTime(r.startTime)}</span>,
    },
    { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
  ]

  if (isLoading) return <LoadingSkeleton variant="table" />

  return (
    <div className="space-y-6">
      <FeatureCardSection title="Overall Attendance">
        <div className="flex items-center gap-6">
          <div className="relative h-28 w-28">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="70%"
                outerRadius="100%"
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={8} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold">{percentage}%</span>
              <span className="text-muted-foreground text-xs">Present</span>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              Total sessions: <span className="text-foreground font-semibold">{rows.length}</span>
            </p>
            <p className="text-muted-foreground">
              Present:{' '}
              <span className="text-success font-semibold">
                {rows.filter((r) => r.status === 'Present').length}
              </span>
            </p>
            <p className="text-muted-foreground">
              Absent:{' '}
              <span className="text-destructive font-semibold">
                {rows.filter((r) => r.status === 'Absent').length}
              </span>
            </p>
            <p className="text-muted-foreground">
              Permission:{' '}
              <span className="text-warning font-semibold">
                {rows.filter((r) => r.status === 'Permission').length}
              </span>
            </p>
          </div>
        </div>
      </FeatureCardSection>

      <DataTable data={rows} columns={columns} keyExtractor={(r) => r.id} />
    </div>
  )
}
