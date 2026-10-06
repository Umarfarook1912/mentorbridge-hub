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
import { currentMonthValue, reportPeriodLabel } from './report-date-range'
import { aggregateByStudent, buildSessionChartData } from './attendance-report.utils'
import { fetchAttendanceDetailRows } from './fetch-attendance-detail-rows'

export function AttendanceReport() {
  const [department, setDepartment] = useState('')
  const [domain, setDomain] = useState('')
  const [studentId, setStudentId] = useState('')
  const [fullReport, setFullReport] = useState(false)
  const [fromMonth, setFromMonth] = useState(currentMonthValue)
  const [toMonth, setToMonth] = useState(currentMonthValue)

  const { data: students = [] } = useGetAllStudents()
  const pagination = usePagination()
  const periodKey = reportPeriodLabel(fullReport, fromMonth, toMonth)

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.reportsAttendance, periodKey, department, domain, studentId],
    queryFn: () =>
      fetchAttendanceDetailRows({
        supabase: getSupabaseBrowserClient(),
        fullReport,
        fromMonth,
        toMonth,
        studentId,
        department,
        domain,
      }),
  })

  const rows = [...(data ?? [])].sort(
    (a, b) =>
      b.meetingDate.localeCompare(a.meetingDate) || a.meetingTitle.localeCompare(b.meetingTitle)
  )
  const summary = aggregateByStudent(rows)
  const chartData = buildSessionChartData(rows)
  const selectedStudent = studentId ? summary[0] : null
  const total = studentId ? rows.length : summary.length
  const { page, totalPages, canPrev, canNext } = pagination.getState(total)

  function resetPage() {
    pagination.reset()
  }

  function handleExport() {
    if (studentId) exportToCSV(rows, `attendance-${studentId}-${periodKey}`)
    else {
      exportToCSV(
        summary.map((s) => ({
          rank: s.rank,
          studentName: s.studentName,
          email: s.email,
          department: s.department,
          Status: s.isActive ? 'Active' : 'Inactive',
          'Inactive Date': s.inactiveAt ?? '',
          present: s.present,
          absent: s.absent,
          permission: s.permission,
          total: s.total,
          'Attended %': s.attendedRate,
          'Permission %': s.permissionRate,
        })),
        `attendance-summary-${periodKey}`
      )
    }
  }

  return (
    <div className="space-y-4">
      <ReportFilters
        fullReport={fullReport}
        fromMonth={fromMonth}
        toMonth={toMonth}
        studentId={studentId}
        department={department}
        domain={domain}
        students={students}
        canExport={rows.length > 0}
        onFullReportChange={(v) => {
          setFullReport(v)
          resetPage()
        }}
        onFromMonthChange={(v) => {
          setFromMonth(v)
          if (toMonth < v) setToMonth(v)
          resetPage()
        }}
        onToMonthChange={(v) => {
          setToMonth(v < fromMonth ? fromMonth : v)
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
                  {selectedStudent.studentName} · {selectedStudent.present} present ·{' '}
                  {selectedStudent.permission} permission · {selectedStudent.absent} absent ·{' '}
                  {selectedStudent.total} total ·{' '}
                  <span className="text-foreground font-semibold">
                    {selectedStudent.attendedRate}% attended
                  </span>
                  {selectedStudent.permission > 0 && (
                    <span> (-{selectedStudent.permissionRate}% permission)</span>
                  )}
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
