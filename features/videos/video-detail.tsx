'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Video } from 'lucide-react'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { useGetVideoById, useGetSimilarVideos, useIncrementVideoView } from '@/services/videos'
import { formatViewCount } from '@/utils/format'
import { VideoPlayer } from './video-player'
import { VideoSimilarList } from './video-similar-list'

interface VideoDetailProps {
  videoId: string
  listHref: string
  basePath: string
}

export function VideoDetail({ videoId, listHref, basePath }: VideoDetailProps) {
  const detailHref = (id: string) => `${basePath}/${id}`
  const { data: video, isLoading } = useGetVideoById(videoId)
  const { data: similar = [] } = useGetSimilarVideos(video)
  const { mutate: incrementView } = useIncrementVideoView()
  const counted = useRef(false)

  useEffect(() => {
    if (!videoId || counted.current) return
    const key = `mb-video-view:${videoId}`
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(key)) return
    counted.current = true
    try {
      sessionStorage.setItem(key, '1')
    } catch {
      /* ignore quota */
    }
    incrementView(videoId)
  }, [videoId, incrementView])

  if (isLoading) return <LoadingSkeleton />

  if (!video) {
    return (
      <EmptyState
        icon={Video}
        title="Video not found"
        description="This recording may have been removed"
        action={{ label: 'Back to videos', onClick: () => window.location.assign(listHref) }}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Link
        href={listHref}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to videos
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <VideoPlayer youtubeId={video.youtube_id} title={video.title} />
          <div className="space-y-2">
            <h1 className="text-xl font-semibold md:text-2xl">{video.title}</h1>
            <p className="text-muted-foreground text-sm">
              {formatViewCount(video.view_count)} · {video.domain}
            </p>
          </div>
        </div>

        <aside className="space-y-3">
          <h2 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Similar videos
          </h2>
          <VideoSimilarList videos={similar} detailHref={detailHref} />
        </aside>
      </div>
    </div>
  )
}
