'use client'

import { Pencil, Trash2, Calendar, Users, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  FeatureCard,
  FeatureCardDateBlock,
  FeatureCardMeta,
} from '@/components/shared/data-display/feature-card'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { formatDate } from '@/utils/format'
import { formatAudience } from '@/utils/meeting-audience'
import { isTaskOverdue } from '@/utils/meeting-time'
import type { ITaskEntity } from '@/services/tasks'

interface TaskCardProps {
  task: ITaskEntity
  onEdit?: (t: ITaskEntity) => void
  onDelete?: (id: string) => void
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const overdue = isTaskOverdue(task.due_date)

  return (
    <FeatureCard accent={overdue ? 'danger' : 'brand'} highlighted={overdue}>
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
          </div>
          <h3 className="text-base leading-snug font-semibold">{task.title}</h3>
          {task.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{task.description}</p>
          )}
        </div>
        {(onEdit || onDelete) && (
          <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            {onEdit ? (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(task)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive h-8 w-8"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            ) : null}
          </div>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <FeatureCardMeta
          icon={Calendar}
          label={`Due ${formatDate(task.due_date)}${overdue ? ' (Overdue)' : ''}`}
          tone={overdue ? 'danger' : 'default'}
        />
        {task.assigned_by ? (
          <FeatureCardMeta icon={User} label={`Assigned by ${task.assigned_by}`} />
        ) : null}
        <FeatureCardMeta
          icon={Users}
          label={formatAudience(task.target_domains, task.target_student_ids)}
          className={task.assigned_by ? 'sm:col-span-2' : undefined}
        />
      </div>
    </FeatureCard>
  )
}
