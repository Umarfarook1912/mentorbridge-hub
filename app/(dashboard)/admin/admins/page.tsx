import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { AdminsList } from '@/features/admin/admins/admins-list'

export const metadata: Metadata = { title: 'Team' }

export default function AdminsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Manage Admin, Staff, and Executive roles and section access"
      />
      <AdminsList />
    </div>
  )
}
