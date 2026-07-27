import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { MeetingsList } from '@/features/admin/meetings/meetings-list'

export const metadata: Metadata = { title: 'Meetings' }

export default function MeetingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Meetings" description="Schedule and manage learning sessions" />
      <MeetingsList />
    </div>
  )
}
