'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AttendanceMeetingSelector } from '@/features/admin/attendance/attendance-meeting-selector'
import { StudentAttendanceView } from '@/features/student/attendance/student-attendance-view'
import { useAuthStore } from '@/store/auth-store'

export function AttendancePageContent() {
  const { user } = useAuthStore()
  const showMine = user?.role === 'Associate'

  if (!showMine || !user) {
    return <AttendanceMeetingSelector />
  }

  return (
    <Tabs defaultValue="mark">
      <TabsList>
        <TabsTrigger value="mark">Mark attendance</TabsTrigger>
        <TabsTrigger value="mine">My attendance</TabsTrigger>
      </TabsList>
      <TabsContent value="mark" className="mt-4">
        <AttendanceMeetingSelector />
      </TabsContent>
      <TabsContent value="mine" className="mt-4">
        <StudentAttendanceView studentId={user.id} />
      </TabsContent>
    </Tabs>
  )
}
