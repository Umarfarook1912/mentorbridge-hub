'use client'

import { Video } from 'lucide-react'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { VideoCard } from './video-card'
import type { IVideoEntity } from '@/services/videos'

interface VideosGridProps {
  title: string
  videos: IVideoEntity[]
  emptyTitle: string
  emptyDescription: string
  detailHref: (id: string) => string
  canManage?: boolean
  onEdit?: (video: IVideoEntity) => void
  onDelete?: (id: string) => void
}

export function VideosGrid({
  title,
  videos,
  emptyTitle,
  emptyDescription,
  detailHref,
  canManage,
  onEdit,
  onDelete,
}: VideosGridProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {!videos.length ? (
        <EmptyState icon={Video} title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              href={detailHref(video.id)}
              canManage={canManage}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </section>
  )
}
