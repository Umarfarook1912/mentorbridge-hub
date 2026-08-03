import type { SubmissionStatus } from '@/types/supabase.types'
import { isAudienceForStudent } from '@/utils/meeting-audience'

export type TaskReportStatus = SubmissionStatus | 'missing'

export interface TaskDetailRow {
  id: string
  studentId: string
  studentName: string
  email: string
  department: string
  taskId: string
  taskTitle: string
  dueDate: string
  status: TaskReportStatus
  submittedAt: string | null
}

export interface StudentTaskSummary {
  studentId: string
  studentName: string
  email: string
  department: string
  assigned: number
  approved: number
  rejected: number
  pending: number
  missing: number
  rate: number
  rank: number
}

interface StudentInput {
  id: string
  full_name: string
  email: string
  department: string | null
  domain_interest: string | null
}

interface TaskInput {
  id: string
  title: string
  due_date: string
  target_domains: string[] | null
  target_student_ids: string[] | null
}

interface SubmissionInput {
  id: string
  task_id: string
  student_id: string
  status: SubmissionStatus
  submitted_at: string
}

export function buildTaskDetailRows(
  students: StudentInput[],
  tasks: TaskInput[],
  submissions: SubmissionInput[]
): TaskDetailRow[] {
  const submissionMap = new Map(
    submissions.map((s) => [`${s.student_id}:${s.task_id}`, s] as const)
  )
  const rows: TaskDetailRow[] = []

  for (const student of students) {
    for (const task of tasks) {
      if (
        !isAudienceForStudent(
          {
            targetDomains: task.target_domains,
            targetStudentIds: task.target_student_ids,
          },
          { id: student.id, domainInterest: student.domain_interest }
        )
      ) {
        continue
      }

      const submission = submissionMap.get(`${student.id}:${task.id}`)
      rows.push({
        id: submission?.id ?? `${student.id}:${task.id}`,
        studentId: student.id,
        studentName: student.full_name,
        email: student.email,
        department: student.department ?? '',
        taskId: task.id,
        taskTitle: task.title,
        dueDate: task.due_date,
        status: submission?.status ?? 'missing',
        submittedAt: submission?.submitted_at ?? null,
      })
    }
  }

  return rows
}

export function aggregateTaskByStudent(rows: TaskDetailRow[]): StudentTaskSummary[] {
  const byStudent: Record<string, StudentTaskSummary> = {}

  for (const row of rows) {
    if (!byStudent[row.studentId]) {
      byStudent[row.studentId] = {
        studentId: row.studentId,
        studentName: row.studentName,
        email: row.email,
        department: row.department,
        assigned: 0,
        approved: 0,
        rejected: 0,
        pending: 0,
        missing: 0,
        rate: 0,
        rank: 0,
      }
    }
    const entry = byStudent[row.studentId]
    entry.assigned++
    if (row.status === 'Approved') entry.approved++
    else if (row.status === 'Rejected') entry.rejected++
    else if (row.status === 'Pending') entry.pending++
    else entry.missing++
  }

  return Object.values(byStudent)
    .map((s) => ({
      ...s,
      rate: s.assigned > 0 ? Math.round((s.approved / s.assigned) * 100) : 0,
      rank: 0,
    }))
    .sort(
      (a, b) =>
        b.rate - a.rate || b.approved - a.approved || a.studentName.localeCompare(b.studentName)
    )
    .map((s, i) => ({ ...s, rank: i + 1 }))
}

export function buildTaskChartData(rows: TaskDetailRow[]) {
  const byTask: Record<
    string,
    { task: string; Approved: number; Rejected: number; Pending: number; Missing: number }
  > = {}

  for (const row of rows) {
    if (!byTask[row.taskId]) {
      byTask[row.taskId] = {
        task: row.taskTitle.slice(0, 15) + (row.taskTitle.length > 15 ? '…' : ''),
        Approved: 0,
        Rejected: 0,
        Pending: 0,
        Missing: 0,
      }
    }
    const entry = byTask[row.taskId]
    if (row.status === 'Approved') entry.Approved++
    else if (row.status === 'Rejected') entry.Rejected++
    else if (row.status === 'Pending') entry.Pending++
    else entry.Missing++
  }

  return Object.values(byTask)
}
