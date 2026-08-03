import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { AttendancePageContent } from '@/features/admin/attendance/attendance-page-content'

export const metadata: Metadata = { title: 'Attendance' }

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description="Mark and track student attendance per meeting session"
      />
      <AttendancePageContent />
    </div>
  )
}
