import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { StudentMeetingsList } from '@/features/student/meetings/student-meetings-list'

export const metadata: Metadata = { title: 'Meetings' }

export default function StudentMeetingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Meetings" description="View all scheduled learning sessions" />
      <StudentMeetingsList />
    </div>
  )
}
