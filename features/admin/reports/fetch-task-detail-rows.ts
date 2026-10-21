import type { SupabaseClient } from '@supabase/supabase-js'
import { monthRangeBounds } from './report-date-range'
import { buildTaskDetailRows, type TaskDetailRow } from './task-completion-report.utils'

interface StudentRow {
  id: string
  full_name: string
  email: string
  department: string | null
  domain_interest: string | null
  is_active: boolean | null
  inactive_at: string | null
  company_name: string | null
  company_role: string | null
  company_location: string | null
  company_joined_at: string | null
}

interface FetchTaskDetailParams {
  supabase: SupabaseClient
  students: StudentRow[]
  fullReport: boolean
  fromMonth: string
  toMonth: string
  department: string
  domain: string
  studentId: string
}

export async function fetchTaskDetailRows({
  supabase,
  students,
  fullReport,
  fromMonth,
  toMonth,
  department,
  domain,
  studentId,
}: FetchTaskDetailParams): Promise<TaskDetailRow[]> {
  let tasksQuery = supabase
    .from('tasks')
    .select('id, title, due_date, target_domains, target_student_ids')
    .order('due_date', { ascending: false })

  if (!fullReport) {
    const { start, end } = monthRangeBounds(fromMonth, toMonth)
    tasksQuery = tasksQuery.gte('due_date', start).lte('due_date', end)
  }

  const { data: tasks, error: tasksError } = await tasksQuery
  if (tasksError) throw tasksError
  if (!tasks?.length) return []

  const { data: submissions, error: submissionsError } = await supabase
    .from('task_submissions')
    .select('id, task_id, student_id, status, submitted_at')
    .in(
      'task_id',
      tasks.map((t) => t.id)
    )
  if (submissionsError) throw submissionsError

  let scoped = students
  if (department) scoped = scoped.filter((s) => s.department === department)
  if (domain) scoped = scoped.filter((s) => s.domain_interest === domain)
  if (studentId) scoped = scoped.filter((s) => s.id === studentId)

  return buildTaskDetailRows(scoped, tasks, submissions ?? [])
}
