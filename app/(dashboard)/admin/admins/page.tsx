import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { AdminsList } from '@/features/admin/admins/admins-list'

export const metadata: Metadata = { title: 'Admins' }

export default function AdminsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Admins" description="View all admins and change their role when needed" />
      <AdminsList />
    </div>
  )
}
