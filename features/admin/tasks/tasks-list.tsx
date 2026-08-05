'use client'

import { useState } from 'react'
import { ClipboardPlus, Pencil, Trash2, Calendar, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import {
  FeatureCard,
  FeatureCardDateBlock,
  FeatureCardMeta,
} from '@/components/shared/data-display/feature-card'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { TaskForm } from './task-form'
import { useGetTasks } from '@/services/tasks/use-get-tasks'
import { useDeleteTask } from '@/services/tasks/use-delete-task'
import { formatDate } from '@/utils/format'
import { formatAudience } from '@/utils/meeting-audience'
import { isTaskOverdue } from '@/utils/meeting-time'
import type { ITaskEntity } from '@/services/tasks'

function TaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: ITaskEntity
  onEdit: (t: ITaskEntity) => void
  onDelete: (id: string) => void
}) {
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
        <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(task)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive h-8 w-8"
            onClick={() => onDelete(task.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <FeatureCardMeta
          icon={Calendar}
          label={`Due ${formatDate(task.due_date)}${overdue ? ' (Overdue)' : ''}`}
          tone={overdue ? 'danger' : 'default'}
        />
        <FeatureCardMeta
          icon={Users}
          label={formatAudience(task.target_domains, task.target_student_ids)}
        />
      </div>
    </FeatureCard>
  )
}

export function TasksList() {
  const [addOpen, setAddOpen] = useState(false)
  const [editTask, setEditTask] = useState<ITaskEntity | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: tasks = [], isLoading } = useGetTasks()
  const { mutateAsync: deleteTask, isPending: deleting } = useDeleteTask()

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteTask(deleteId)
      toast.success('Task deleted')
      setDeleteId(null)
    } catch {
      toast.error('Failed to delete task')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAddOpen(true)}>
          <ClipboardPlus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : !tasks.length ? (
        <EmptyState
          icon={ClipboardPlus}
          title="No tasks yet"
          description="Create tasks and assign them to students"
          action={{ label: 'Create Task', onClick: () => setAddOpen(true) }}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={setEditTask} onDelete={setDeleteId} />
          ))}
        </div>
      )}

      <FormDialog open={addOpen} onOpenChange={setAddOpen} title="Create Task" maxWidth="2xl">
        {addOpen && <TaskForm key="create-task" onSuccess={() => setAddOpen(false)} />}
      </FormDialog>

      <FormDialog
        open={!!editTask}
        onOpenChange={(o) => !o && setEditTask(null)}
        title="Edit Task"
        maxWidth="2xl"
      >
        {editTask && (
          <TaskForm key={editTask.id} task={editTask} onSuccess={() => setEditTask(null)} />
        )}
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Task"
        description="This will delete the task and all student submissions. This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
