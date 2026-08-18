import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { VideosList } from '@/features/videos/videos-list'
import { ROUTES } from '@/lib/constants'

export const metadata: Metadata = { title: 'Videos' }

export default function StudentVideosPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Videos" description="Watch recorded MentorBridge sessions by domain" />
      <VideosList basePath={ROUTES.student.videos} />
    </div>
  )
}
