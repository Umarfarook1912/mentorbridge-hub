'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Newspaper, Pencil, Trash2, User } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useDeleteBlog, type IBlogEntity } from '@/services/blogs'
import { QUERY_KEYS } from '@/lib/constants'
import { formatDate } from '@/utils/format'
import { getErrorMessage } from '@/utils/form'
import { cn } from '@/utils/cn'

function isWeakClientPreview(url: string | null | undefined) {
  if (!url) return true
  return /resize:fill:64:64|\/fit:64:|:64:64\/|\/64\//i.test(url)
}

interface BlogCardProps {
  blog: IBlogEntity
  canEdit?: boolean
  canDelete: boolean
  onEdit?: (blog: IBlogEntity) => void
}

export function BlogCard({ blog, canEdit, canDelete, onEdit }: BlogCardProps) {
  const queryClient = useQueryClient()
  const { mutateAsync: deleteBlog, isPending } = useDeleteBlog()
  const [resolvedPreview, setResolvedPreview] = useState<string | null>(null)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  const previewUrl = resolvedPreview ?? blog.preview_image_url
  const imgFailed = !!previewUrl && failedSrc === previewUrl

  // Backfill missing or weak (64x64 avatar) previews — setState only in async callback
  useEffect(() => {
    const needsRefresh = !blog.preview_image_url || isWeakClientPreview(blog.preview_image_url)
    if (!needsRefresh) return

    let cancelled = false

    async function backfill() {
      try {
        const res = await fetch(`/api/blogs/${blog.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshPreviewOnly: true, force: true }),
        })
        if (!res.ok) return
        const data = (await res.json()) as { image?: string | null }
        if (cancelled || !data.image) return
        setResolvedPreview(data.image)
        await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.blogs] })
      } catch {
        /* keep placeholder */
      }
    }

    void backfill()
    return () => {
      cancelled = true
    }
  }, [blog.id, blog.preview_image_url, queryClient])

  async function handleDelete() {
    try {
      await deleteBlog(blog.id)
      toast.success('Blog removed')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  const showImage = !!previewUrl && !imgFailed

  return (
    <article
      className={cn(
        'bg-card shadow-card group overflow-hidden rounded-lg border transition-all duration-200',
        'hover:shadow-dropdown hover:ring-primary/20 hover:-translate-y-0.5'
      )}
    >
      <div className="bg-muted relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt=""
            className="max-h-full max-w-full object-contain"
            onError={() => setFailedSrc(previewUrl)}
          />
        ) : (
          <div className="from-primary/15 via-muted to-secondary/10 flex h-full w-full items-center justify-center bg-gradient-to-br">
            <Newspaper className="text-muted-foreground/50 h-6 w-6" />
          </div>
        )}
        <div className="bg-primary absolute top-0 left-0 h-1 w-full" />
      </div>

      <div className="space-y-1.5 p-3">
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold">{blog.title}</h3>
        <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
          <User className="text-primary h-3 w-3 shrink-0" />
          <span className="truncate font-medium">{blog.author_name}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0">{formatDate(blog.created_at)}</span>
        </div>
      </div>

      <div className="bg-muted/40 flex items-center justify-between gap-2 border-t px-3 py-2">
        <Button
          nativeButton={false}
          render={<a href={blog.medium_url} target="_blank" rel="noopener noreferrer" />}
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs"
        >
          <ExternalLink className="mr-1 h-3 w-3" />
          Read
        </Button>
        {(canEdit || canDelete) && (
          <div className="flex items-center gap-0.5">
            {canEdit && onEdit && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onEdit(blog)}
                aria-label="Edit blog"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {canDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleDelete}
                disabled={isPending}
                aria-label="Delete blog"
              >
                <Trash2 className="text-destructive h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
