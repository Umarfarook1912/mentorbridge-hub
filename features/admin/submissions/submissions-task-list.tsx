'use client'

import { useMemo, useState } from 'react'
import { Calendar, ChevronRight, ClipboardList, User } from 'lucide-react'
import {
  FeatureCard,
  FeatureCardDateBlock,
  FeatureCardMeta,
} from '@/components/shared/data-display/feature-card'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import {
  SubmissionsTaskFilters,
  matchesSubmissionTask,
  type SubmissionTaskFiltersState,
} from './submissions-task-filters'
import { useGetAllStudents } from '@/services/students/use-get-students'
import { formatDate } from '@/utils/format'
import { isAudienceForStudent } from '@/utils/meeting-audience'
import { isTaskOverdue } from '@/utils/meeting-time'
import type { ITaskEntity } from '@/services/tasks'

type TaskWithCounts = ITaskEntity & {
  task_submissions?: { id: string; status: string; student_id: string }[] | null
}

interface SubmissionsTaskListProps {
  tasks: TaskWithCounts[]
  isLoading: boolean
  onSelect: (taskId: string) => void
}

function notSubmittedCount(
  task: TaskWithCounts,
  students: { id: string; domain_interest: string | null }[]
) {
  const submittedIds = new Set((task.task_submissions ?? []).map((s) => s.student_id))
  return students.filter(
    (student) =>
      !submittedIds.has(student.id) &&
      isAudienceForStudent(
        {
          targetDomains: task.target_domains,
          targetStudentIds: task.target_student_ids,
        },
        { id: student.id, domainInterest: student.domain_interest }
      )
  ).length
}

export function SubmissionsTaskList({ tasks, isLoading, onSelect }: SubmissionsTaskListProps) {
  const { data: students = [], isLoading: loadingStudents } = useGetAllStudents()
  const [filters, setFilters] = useState<SubmissionTaskFiltersState>({
    time: 'active',
    domain: 'All',
    search: '',
    dateFrom: '',
    dateTo: '',
  })

  function updateFilter<K extends keyof SubmissionTaskFiltersState>(
    key: K,
    value: SubmissionTaskFiltersState[K]
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const matched = useMemo(
    () => tasks.filter((task) => matchesSubmissionTask(task, filters)),
    [tasks, filters]
  )
  const active = matched.filter((task) => !isTaskOverdue(task.due_date))
  const overdue = matched.filter((task) => isTaskOverdue(task.due_date))
  const visible = filters.time === 'active' ? active : overdue
  const filtersActive =
    filters.domain !== 'All' || !!filters.search || !!filters.dateFrom || !!filters.dateTo

  return (
    <div className="space-y-4">
      <SubmissionsTaskFilters
        filters={filters}
        activeCount={active.length}
        overdueCount={overdue.length}
        onChange={updateFilter}
      />

      {isLoading || loadingStudents ? (
        <LoadingSkeleton />
      ) : !tasks.length ? (
        <EmptyState
          icon={ClipboardList}
          title="No tasks yet"
          description="Create tasks first — submissions will appear under each task"
        />
      ) : !visible.length ? (
        <EmptyState
          icon={ClipboardList}
          title={filters.time === 'active' ? 'No active tasks' : 'No overdue tasks'}
          description={
            filtersActive
              ? 'Try adjusting your filters'
              : filters.time === 'active'
                ? 'All tasks are past due — switch to Overdue to view them'
                : 'No overdue tasks yet'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((task) => {
            const submissions = task.task_submissions ?? []
            const missing = notSubmittedCount(task, students)
            const taskOverdue = isTaskOverdue(task.due_date)

            return (
              <FeatureCard
                key={task.id}
                accent={taskOverdue ? 'danger' : 'brand'}
                highlighted={missing > 0}
                onClick={() => onSelect(task.id)}
                footer={
                  <div className="text-muted-foreground flex w-full items-center justify-between text-xs">
                    <span>
                      {submissions.length} submission{submissions.length === 1 ? '' : 's'}
                      {` · ${missing} not submitted`}
                    </span>
                    <span className="text-primary inline-flex items-center gap-0.5 font-medium">
                      View <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                }
              >
                <div className="flex items-start gap-3">
                  <FeatureCardDateBlock
                    day={formatDate(task.due_date, 'dd')}
                    month={formatDate(task.due_date, 'MMM')}
                    weekday={formatDate(task.due_date, 'EEE')}
                    tone={taskOverdue ? 'danger' : 'brand'}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      {taskOverdue ? <StatusBadge status="overdue" /> : null}
                      {missing > 0 ? <StatusBadge status="missing" /> : null}
                    </div>
                    <h3 className="text-base leading-snug font-semibold">{task.title}</h3>
                    {task.description ? (
                      <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                        {task.description}
                      </p>
                    ) : null}
                  </div>
                </div>
                <FeatureCardMeta
                  icon={Calendar}
                  label={`Due ${formatDate(task.due_date)}${taskOverdue ? ' (Overdue)' : ''}`}
                  tone={taskOverdue ? 'danger' : 'default'}
                />
                {task.assigned_by ? (
                  <FeatureCardMeta icon={User} label={`Assigned by ${task.assigned_by}`} />
                ) : null}
              </FeatureCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
