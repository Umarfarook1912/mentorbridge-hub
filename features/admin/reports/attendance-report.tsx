'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FeatureCardSection } from '@/components/shared/data-display/feature-card'
import { DataTable, type Column } from '@/components/shared/data-display/data-table'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { PaginationControls } from '@/components/shared/data-display/pagination-controls'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { DEPARTMENTS, QUERY_KEYS } from '@/lib/constants'
import { useGetAllStudents } from '@/services/students/use-get-students'
import { usePagination } from '@/hooks/use-pagination'
import { exportToCSV } from '@/utils/export'
import { formatDate } from '@/utils/format'
import {
  aggregateByStudent,
  buildSessionChartData,
  type AttendanceDetailRow,
  type StudentAttendanceSummary,
} from './attendance-report.utils'

export function AttendanceReport() {
  const [department, setDepartment] = useState('')
  const [studentId, setStudentId] = useState('')
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const { data: students = [] } = useGetAllStudents()
  const pagination = usePagination()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.reportsAttendance, month, department, studentId],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      const [year, m] = month.split('-').map(Number)
      const start = `${year}-${String(m).padStart(2, '0')}-01`
      const end = new Date(year, m, 0).toISOString().split('T')[0]

      let query = supabase
        .from('attendance')
        .select(
          '*, meetings!inner(title, meeting_date), profiles:student_id(full_name, email, department)'
        )
        .gte('meetings.meeting_date', start)
        .lte('meetings.meeting_date', end)

      if (studentId) query = query.eq('student_id', studentId)

      const { data: rows, error } = await query
      if (error) throw error

      const result: AttendanceDetailRow[] = (rows ?? []).map((r) => ({
        id: r.id,
        studentId: r.student_id,
        studentName: (r.profiles as { full_name: string } | null)?.full_name ?? '',
        email: (r.profiles as { email: string } | null)?.email ?? '',
        department: (r.profiles as { department: string | null } | null)?.department ?? '',
        meetingTitle: (r.meetings as { title: string } | null)?.title ?? '',
        meetingDate: (r.meetings as { meeting_date: string } | null)?.meeting_date ?? '',
        status: r.status,
      }))

      return department ? result.filter((r) => r.department === department) : result
    },
  })

  const rows = data ?? []
  const summary = aggregateByStudent(rows)
  const chartData = buildSessionChartData(rows)
  const selectedStudent = studentId ? summary[0] : null
  const total = studentId ? rows.length : summary.length
  const { page, totalPages, canPrev, canNext } = pagination.getState(total)

  const summaryColumns: Column<StudentAttendanceSummary>[] = [
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

  const detailColumns: Column<AttendanceDetailRow>[] = [
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

  function handleExport() {
    if (studentId) {
      exportToCSV(rows, `attendance-${studentId}-${month}`)
    } else {
      exportToCSV(summary, `attendance-summary-${month}`)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="month"
          value={month}
          onChange={(e) => {
            setMonth(e.target.value)
            pagination.reset()
          }}
          className="bg-background h-9 rounded-md border px-3 text-sm"
        />
        <Select
          value={studentId || 'all'}
          onValueChange={(v) => {
            setStudentId(v === 'all' ? '' : (v ?? ''))
            pagination.reset()
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All students">
              {(value: string | null) => {
                if (!value || value === 'all') return 'All Students'
                return students.find((s) => s.id === value)?.full_name ?? 'All Students'
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            {students.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={department || 'all'}
          onValueChange={(v) => {
            setDepartment(v === 'all' ? '' : (v ?? ''))
            pagination.reset()
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All departments">
              {(value: string | null) => (!value || value === 'all' ? 'All Departments' : value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          onClick={handleExport}
          disabled={!rows.length}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {!studentId && (
            <FeatureCardSection title="Attendance by Session">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="meeting"
                    tick={{ fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Present" fill="var(--color-success)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Absent" fill="var(--color-destructive)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Permission" fill="var(--color-warning)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </FeatureCardSection>
          )}

          {studentId ? (
            <div className="space-y-3">
              {selectedStudent && (
                <p className="text-muted-foreground text-sm">
                  {selectedStudent.studentName} · {selectedStudent.present}/{selectedStudent.total}{' '}
                  present ·{' '}
                  <span className="text-foreground font-semibold">{selectedStudent.rate}%</span>{' '}
                  attendance
                </p>
              )}
              <DataTable
                data={pagination.paginate(rows)}
                columns={detailColumns}
                keyExtractor={(r) => r.id}
              />
            </div>
          ) : (
            <DataTable
              data={pagination.paginate(summary)}
              columns={summaryColumns}
              keyExtractor={(r) => r.studentId}
            />
          )}
          <PaginationControls
            page={page}
            totalPages={totalPages}
            canPrev={canPrev}
            canNext={canNext}
            onPrev={() => pagination.goTo(page - 1, total)}
            onNext={() => pagination.goTo(page + 1, total)}
            totalItems={total}
            pageSize={pagination.pageSize}
            onPageSizeChange={pagination.setPageSize}
          />
        </>
      )}
    </div>
  )
}
