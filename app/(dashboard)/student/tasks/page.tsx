import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { StudentTasksList } from '@/features/student/tasks/student-tasks-list'

export const metadata: Metadata = { title: 'My Tasks' }

export default function StudentTasksPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks"
        description="View assigned tasks, submit work, and track feedback"
      />
      <StudentTasksList />
    </div>
  )
}
