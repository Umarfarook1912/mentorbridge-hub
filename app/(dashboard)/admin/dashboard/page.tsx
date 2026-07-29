import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { DashboardStatsGrid } from '@/features/admin/dashboard/dashboard-stats-grid'
import { AttendanceChart } from '@/features/admin/dashboard/attendance-chart'
import { QuickActions } from '@/features/admin/dashboard/quick-actions'
import { DashboardBlogs } from '@/features/blogs/dashboard-blogs'
import { ROUTES } from '@/lib/constants'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of attendance, tasks, and student activity"
      />

      <DashboardStatsGrid />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttendanceChart />
        </div>
        <QuickActions />
      </div>

      <DashboardBlogs blogsHref={ROUTES.admin.blogs} />
    </div>
  )
}
