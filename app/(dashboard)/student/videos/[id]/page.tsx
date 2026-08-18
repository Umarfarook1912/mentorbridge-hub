import type { Metadata } from 'next'
import { VideoDetail } from '@/features/videos/video-detail'
import { ROUTES } from '@/lib/constants'

export const metadata: Metadata = { title: 'Video' }

export default async function StudentVideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <VideoDetail
      videoId={id}
      listHref={ROUTES.student.videos}
      basePath={ROUTES.student.videos}
    />
  )
}
