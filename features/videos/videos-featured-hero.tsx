'use client'

import Link from 'next/link'
import { Play, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatViewCount } from '@/utils/format'
import type { IVideoEntity } from '@/services/videos'

interface VideosFeaturedHeroProps {
  video: IVideoEntity
  href: string
  canManage?: boolean
  onEdit?: (video: IVideoEntity) => void
  onDelete?: (id: string) => void
}

export function VideosFeaturedHero({
  video,
  href,
  canManage,
  onEdit,
  onDelete,
}: VideosFeaturedHeroProps) {
  return (
    <div className="bg-card shadow-card hover:ring-primary/20 relative grid overflow-hidden rounded-xl border transition-all lg:grid-cols-2">
      <Link href={href} className="bg-muted relative aspect-video w-full overflow-hidden block">
        {video.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="from-primary/15 via-muted to-secondary/10 h-full w-full bg-gradient-to-br" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <Play className="text-foreground ml-0.5 h-6 w-6 fill-current" />
          </span>
        </div>
      </Link>

      <div className="flex flex-col justify-center gap-3 p-5 md:p-6">
        <div className="flex items-center gap-2">
          <Badge>Featured</Badge>
          {canManage ? (
            <div className="ml-auto flex items-center gap-1">
              {onEdit ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(video)}
                  aria-label="Edit video"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              ) : null}
              {onDelete ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(video.id)}
                  aria-label="Delete video"
                >
                  <Trash2 className="text-destructive h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
        <Link href={href} className="hover:text-primary">
          <h2 className="text-xl leading-snug font-semibold md:text-2xl">{video.title}</h2>
        </Link>
        <p className="text-muted-foreground text-sm">
          {video.domain} · {formatViewCount(video.view_count)}
        </p>
      </div>
    </div>
  )
}
