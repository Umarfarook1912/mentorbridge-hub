'use client'

import { useState } from 'react'
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
import { FeatureCardSection } from '@/components/shared/data-display/feature-card'
import { DataTable } from '@/components/shared/data-display/data-table'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { PaginationControls } from '@/components/shared/data-display/pagination-controls'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS } from '@/lib/constants'
import { useGetAllStudents } from '@/services/students/use-get-students'
import { usePagination } from '@/hooks/use-pagination'
import { exportToCSV } from '@/utils/export'
import { attendanceDetailColumns, attendanceSummaryColumns } from './attendance-report-columns'
import { ReportFilters } from './report-filters'
import {
  aggregateByStudent,
  buildSessionChartData,
  type AttendanceDetailRow,
} from './attendance-report.utils'

export function AttendanceReport() {
  const [department, setDepartment] = useState('')
  const [domain, setDomain] = useState('')
  const [studentId, setStudentId] = useState('')
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const { data: students = [] } = useGetAllStudents()
  const pagination = usePagination()

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.reportsAttendance, month, department, domain, studentId],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      const [year, m] = month.split('-').map(Number)
      const start = `${year}-${String(m).padStart(2, '0')}-01`
      const end = new Date(year, m, 0).toISOString().split('T')[0]

      let query = supabase
        .from('attendance')
        .select(
          '*, meetings!inner(title, meeting_date), profiles:student_id(full_name, email, department, domain_interest)'
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
        domainInterest:
          (r.profiles as { domain_interest: string | null } | null)?.domain_interest ?? '',
        meetingTitle: (r.meetings as { title: string } | null)?.title ?? '',
        meetingDate: (r.meetings as { meeting_date: string } | null)?.meeting_date ?? '',
        status: r.status,
      }))

      return result.filter((r) => {
        if (department && r.department !== department) return false
        if (domain && r.domainInterest !== domain) return false
        return true
      })
    },
  })

  const rows = data ?? []
  const summary = aggregateByStudent(rows)
  const chartData = buildSessionChartData(rows)
  const selectedStudent = studentId ? summary[0] : null
  const total = studentId ? rows.length : summary.length
  const { page, totalPages, canPrev, canNext } = pagination.getState(total)

  function handleExport() {
    if (studentId) exportToCSV(rows, `attendance-${studentId}-${month}`)
    else exportToCSV(summary, `attendance-summary-${month}`)
  }

  function resetPage() {
    pagination.reset()
  }

  return (
    <div className="space-y-4">
      <ReportFilters
        month={month}
        studentId={studentId}
        department={department}
        domain={domain}
        students={students}
        canExport={rows.length > 0}
        onMonthChange={(v) => {
          setMonth(v)
          resetPage()
        }}
        onStudentChange={(v) => {
          setStudentId(v)
          resetPage()
        }}
        onDepartmentChange={(v) => {
          setDepartment(v)
          resetPage()
        }}
        onDomainChange={(v) => {
          setDomain(v)
          resetPage()
        }}
        onExport={handleExport}
      />

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
                columns={attendanceDetailColumns}
                keyExtractor={(r) => r.id}
              />
            </div>
          ) : (
            <DataTable
              data={pagination.paginate(summary)}
              columns={attendanceSummaryColumns}
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
