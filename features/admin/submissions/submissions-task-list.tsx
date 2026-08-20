'use client'

import { useMemo, useState } from 'react'
import { Calendar, ChevronRight, ClipboardList } from 'lucide-react'
import {
  FeatureCard,
  FeatureCardDateBlock,
  FeatureCardMeta,
} from '@/components/shared/data-display/feature-card'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { FilterPills } from '@/components/shared/forms/filter-pills'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { formatDate } from '@/utils/format'
import { isTaskOverdue } from '@/utils/meeting-time'
import type { ITaskEntity } from '@/services/tasks'

type TaskTimeFilter = 'active' | 'overdue'

type TaskWithCounts = ITaskEntity & {
  task_submissions?: { id: string; status: string }[] | null
}

interface SubmissionsTaskListProps {
  tasks: TaskWithCounts[]
  isLoading: boolean
  onSelect: (taskId: string) => void
}

export function SubmissionsTaskList({ tasks, isLoading, onSelect }: SubmissionsTaskListProps) {
  const [time, setTime] = useState<TaskTimeFilter>('active')

  const active = useMemo(() => tasks.filter((t) => !isTaskOverdue(t.due_date)), [tasks])
  const overdue = useMemo(() => tasks.filter((t) => isTaskOverdue(t.due_date)), [tasks])
  const visible = time === 'active' ? active : overdue

  if (isLoading) return <LoadingSkeleton />

  if (!tasks.length) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No tasks yet"
        description="Create tasks first — submissions will appear under each task"
      />
    )
  }

  return (
    <div className="space-y-4">
      <FilterPills
        aria-label="Task time"
        value={time}
        onChange={setTime}
        options={[
          { value: 'active', label: `Active (${active.length})` },
          { value: 'overdue', label: `Overdue (${overdue.length})` },
        ]}
      />

      {!visible.length ? (
        <EmptyState
          icon={ClipboardList}
          title={time === 'active' ? 'No active tasks' : 'No overdue tasks'}
          description={
            time === 'active'
              ? 'All tasks are past due — switch to Overdue to view them'
              : 'No overdue tasks yet'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((task) => {
            const submissions = task.task_submissions ?? []
            const pending = submissions.filter((s) => s.status === 'Pending').length
            const overdue = isTaskOverdue(task.due_date)

            return (
              <FeatureCard
                key={task.id}
                accent={overdue ? 'danger' : 'brand'}
                highlighted={pending > 0}
                onClick={() => onSelect(task.id)}
                footer={
                  <div className="text-muted-foreground flex w-full items-center justify-between text-xs">
                    <span>
                      {submissions.length} submission{submissions.length === 1 ? '' : 's'}
                      {pending > 0 ? ` · ${pending} pending` : ''}
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
                    tone={overdue ? 'danger' : 'brand'}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      {overdue ? <StatusBadge status="overdue" /> : null}
                      {pending > 0 ? <StatusBadge status="Pending" /> : null}
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
                  label={`Due ${formatDate(task.due_date)}${overdue ? ' (Overdue)' : ''}`}
                  tone={overdue ? 'danger' : 'default'}
                />
              </FeatureCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
