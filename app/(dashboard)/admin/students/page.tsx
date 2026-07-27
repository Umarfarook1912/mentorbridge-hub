import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { StudentsList } from '@/features/admin/students/students-list'

export const metadata: Metadata = { title: 'Student Management' }

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage enrolled students, their departments, and account details"
      />
      <StudentsList />
    </div>
  )
}
