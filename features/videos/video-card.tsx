'use client'

import Link from 'next/link'
import { Play, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatViewCount } from '@/utils/format'
import { cn } from '@/utils/cn'
import type { IVideoEntity } from '@/services/videos'

interface VideoCardProps {
  video: IVideoEntity
  href: string
  canManage?: boolean
  onEdit?: (video: IVideoEntity) => void
  onDelete?: (id: string) => void
}

export function VideoCard({ video, href, canManage, onEdit, onDelete }: VideoCardProps) {
  return (
    <article
      className={cn(
        'bg-card shadow-card group overflow-hidden rounded-lg border transition-all duration-200',
        'hover:shadow-dropdown hover:ring-primary/20 hover:-translate-y-0.5'
      )}
    >
      <Link href={href} className="block">
        <div className="bg-muted relative aspect-video w-full overflow-hidden">
          {video.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="from-primary/15 via-muted to-secondary/10 flex h-full w-full items-center justify-center bg-gradient-to-br">
              <Play className="text-muted-foreground/50 h-8 w-8" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 opacity-90 shadow-sm">
              <Play className="text-foreground ml-0.5 h-4 w-4 fill-current" />
            </span>
          </div>
        </div>
      </Link>

      <div className="space-y-0.5 p-2 sm:p-3">
        <Link href={href} className="hover:text-primary block">
          <h3 className="line-clamp-2 text-xs leading-snug font-semibold sm:text-sm">{video.title}</h3>
        </Link>
        <p className="text-muted-foreground text-[11px] sm:text-xs">
          {video.domain} · {formatViewCount(video.view_count)}
        </p>
      </div>

      {canManage ? (
        <div className="bg-muted/40 flex items-center justify-end gap-0.5 border-t px-2 py-1.5">
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
    </article>
  )
}
