import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { TasksList } from '@/features/admin/tasks/tasks-list'

export const metadata: Metadata = { title: 'Task Management' }

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks"
        description="Create and assign tasks to students by department or all"
      />
      <TasksList />
    </div>
  )
}
