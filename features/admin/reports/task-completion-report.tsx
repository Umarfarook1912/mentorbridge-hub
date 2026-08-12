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
import { PaginationControls } from '@/components/shared/data-display/pagination-controls'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS } from '@/lib/constants'
import { useGetAllStudents } from '@/services/students/use-get-students'
import { usePagination } from '@/hooks/use-pagination'
import { exportToCSV } from '@/utils/export'
import { taskDetailColumns, taskSummaryColumns } from './task-completion-report-columns'
import { ReportFilters } from './report-filters'
import {
  aggregateTaskByStudent,
  buildTaskChartData,
  buildTaskDetailRows,
  type TaskDetailRow,
} from './task-completion-report.utils'

export function TaskCompletionReport() {
  const [department, setDepartment] = useState('')
  const [domain, setDomain] = useState('')
  const [studentId, setStudentId] = useState('')
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  const { data: students = [], isLoading: loadingStudents } = useGetAllStudents()
  const pagination = usePagination()

  const { data: rows = [], isLoading } = useQuery({
    queryKey: [QUERY_KEYS.reportsTasks, month, department, domain, studentId, students],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      const [year, m] = month.split('-').map(Number)
      const start = `${year}-${String(m).padStart(2, '0')}-01`
      const end = new Date(year, m, 0).toISOString().split('T')[0]

      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('id, title, due_date, target_domains, target_student_ids')
        .gte('due_date', start)
        .lte('due_date', end)
      if (tasksError) throw tasksError
      if (!tasks?.length) return [] as TaskDetailRow[]

      const { data: submissions, error: submissionsError } = await supabase
        .from('task_submissions')
        .select('id, task_id, student_id, status, submitted_at')
        .in(
          'task_id',
          tasks.map((t) => t.id)
        )
      if (submissionsError) throw submissionsError

      let scopedStudents = students
      if (department) scopedStudents = scopedStudents.filter((s) => s.department === department)
      if (domain) scopedStudents = scopedStudents.filter((s) => s.domain_interest === domain)
      if (studentId) scopedStudents = scopedStudents.filter((s) => s.id === studentId)

      return buildTaskDetailRows(
        scopedStudents.map((s) => ({
          id: s.id,
          full_name: s.full_name,
          email: s.email,
          department: s.department,
          domain_interest: s.domain_interest,
        })),
        tasks,
        submissions ?? []
      )
    },
    enabled: students.length > 0,
  })

  const summary = aggregateTaskByStudent(rows)
  const chartData = buildTaskChartData(rows)
  const selectedStudent = studentId ? summary[0] : null
  const total = studentId ? rows.length : summary.length
  const { page, totalPages, canPrev, canNext } = pagination.getState(total)

  function handleExport() {
    if (studentId) exportToCSV(rows, `tasks-${studentId}-${month}`)
    else exportToCSV(summary, `tasks-summary-${month}`)
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
          pagination.reset()
        }}
        onStudentChange={(v) => {
          setStudentId(v)
          pagination.reset()
        }}
        onDepartmentChange={(v) => {
          setDepartment(v)
          pagination.reset()
        }}
        onDomainChange={(v) => {
          setDomain(v)
          pagination.reset()
        }}
        onExport={handleExport}
      />

      {isLoading || loadingStudents ? (
        <LoadingSkeleton />
      ) : (
        <>
          {!studentId && chartData.length > 0 && (
            <FeatureCardSection title="Completion by Task">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="task" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
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
                  <Bar dataKey="Approved" fill="var(--color-success)" radius={[3, 3, 0, 0]} />
                  <Bar
                    dataKey="Pending"
                    fill="var(--color-muted-foreground)"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar dataKey="Rejected" fill="var(--color-destructive)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Missing" fill="var(--color-warning)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </FeatureCardSection>
          )}

          {studentId ? (
            <div className="space-y-3">
              {selectedStudent && (
                <p className="text-muted-foreground text-sm">
                  {selectedStudent.studentName} · {selectedStudent.approved}/
                  {selectedStudent.assigned} approved ·{' '}
                  <span className="text-foreground font-semibold">{selectedStudent.rate}%</span>{' '}
                  completion
                </p>
              )}
              <DataTable
                data={pagination.paginate(rows)}
                columns={taskDetailColumns}
                keyExtractor={(r) => r.id}
              />
            </div>
          ) : (
            <DataTable
              data={pagination.paginate(summary)}
              columns={taskSummaryColumns}
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
