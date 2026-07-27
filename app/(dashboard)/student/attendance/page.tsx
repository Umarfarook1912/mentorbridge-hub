'use client'

import { useAuthStore } from '@/store/auth-store'
import { PageHeader } from '@/components/shared/layout/page-header'
import { StudentAttendanceView } from '@/features/student/attendance/student-attendance-view'

export default function StudentAttendancePage() {
  const { user } = useAuthStore()
  if (!user) return null

  return (
    <div className="space-y-6">
      <PageHeader title="My Attendance" description="Track your attendance across all sessions" />
      <StudentAttendanceView studentId={user.id} />
    </div>
  )
}
