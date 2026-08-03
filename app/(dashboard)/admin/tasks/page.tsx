import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { TasksPageContent } from '@/features/admin/tasks/tasks-page-content'

export const metadata: Metadata = { title: 'Task Management' }

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Tasks" description="Create and assign tasks, or submit your own work" />
      <TasksPageContent />
    </div>
  )
}
