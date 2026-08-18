'use client'

import Link from 'next/link'
import { formatViewCount } from '@/utils/format'
import type { IVideoEntity } from '@/services/videos'

interface VideoSimilarListProps {
  videos: IVideoEntity[]
  detailHref: (id: string) => string
}

export function VideoSimilarList({ videos, detailHref }: VideoSimilarListProps) {
  if (!videos.length) {
    return <p className="text-muted-foreground text-sm">No similar recordings yet</p>
  }

  return (
    <ul className="space-y-3">
      {videos.map((video) => (
        <li key={video.id}>
          <Link href={detailHref(video.id)} className="hover:bg-muted/50 flex gap-3 rounded-lg p-1">
            <div className="bg-muted relative h-16 w-28 shrink-0 overflow-hidden rounded-md">
              {video.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-medium">{video.title}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {video.domain} · {formatViewCount(video.view_count)}
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
