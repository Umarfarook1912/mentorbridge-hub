'use client'

import { useMemo, useState } from 'react'
import { ClipboardPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { FilterPills } from '@/components/shared/forms/filter-pills'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { TaskCard } from './task-card'
import { TaskForm } from './task-form'
import { useGetTasks } from '@/services/tasks/use-get-tasks'
import { useDeleteTask } from '@/services/tasks/use-delete-task'
import { isTaskOverdue } from '@/utils/meeting-time'
import type { ITaskEntity } from '@/services/tasks'
import { useAuthStore } from '@/store/auth-store'
import { canMutate } from '@/lib/permissions'

type TaskTimeFilter = 'active' | 'overdue'

export function TasksList() {
  const { user } = useAuthStore()
  const canWrite = canMutate(user)
  const [time, setTime] = useState<TaskTimeFilter>('active')
  const [addOpen, setAddOpen] = useState(false)
  const [editTask, setEditTask] = useState<ITaskEntity | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: tasks = [], isLoading } = useGetTasks()
  const { mutateAsync: deleteTask, isPending: deleting } = useDeleteTask()

  const active = useMemo(() => tasks.filter((t) => !isTaskOverdue(t.due_date)), [tasks])
  const overdue = useMemo(() => tasks.filter((t) => isTaskOverdue(t.due_date)), [tasks])
  const visible = time === 'active' ? active : overdue

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FilterPills
          aria-label="Task time"
          value={time}
          onChange={setTime}
          options={[
            { value: 'active', label: `Active (${active.length})` },
            { value: 'overdue', label: `Overdue (${overdue.length})` },
          ]}
        />
        {canWrite ? (
          <Button onClick={() => setAddOpen(true)}>
            <ClipboardPlus className="mr-2 h-4 w-4" /> Create Task
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : !tasks.length ? (
        <EmptyState
          icon={ClipboardPlus}
          title="No tasks yet"
          description="Create tasks and assign them to students"
          action={canWrite ? { label: 'Create Task', onClick: () => setAddOpen(true) } : undefined}
        />
      ) : !visible.length ? (
        <EmptyState
          icon={ClipboardPlus}
          title={time === 'active' ? 'No active tasks' : 'No overdue tasks'}
          description={
            time === 'active'
              ? 'All tasks are past due — switch to Overdue to view them'
              : 'No overdue tasks yet'
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={canWrite ? setEditTask : undefined}
              onDelete={canWrite ? setDeleteId : undefined}
            />
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
