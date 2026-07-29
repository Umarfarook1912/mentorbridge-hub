'use client'

import Link from 'next/link'
import { ExternalLink, Newspaper } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeatureCardSection } from '@/components/shared/data-display/feature-card'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { useGetBlogs } from '@/services/blogs'
import { formatDate } from '@/utils/format'

interface DashboardBlogsProps {
  blogsHref: string
}

export function DashboardBlogs({ blogsHref }: DashboardBlogsProps) {
  const { data: blogs = [], isLoading } = useGetBlogs()
  const recent = blogs.slice(0, 4)

  return (
    <FeatureCardSection
      title="Blogs"
      action={
        <Button nativeButton={false} render={<Link href={blogsHref} />} variant="ghost" size="sm">
          View all
        </Button>
      }
    >
      {isLoading ? (
        <LoadingSkeleton className="min-h-24 py-6" />
      ) : !recent.length ? (
        <EmptyState
          icon={Newspaper}
          title="No blogs yet"
          description="Share a Medium article from the Blogs page"
        />
      ) : (
        <ul className="space-y-3">
          {recent.map((blog) => (
            <li
              key={blog.id}
              className="border-border/70 flex items-center gap-3 rounded-xl border p-2.5"
            >
              <div className="bg-muted relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                {blog.preview_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={blog.preview_image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Newspaper className="text-muted-foreground/50 h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="truncate text-sm font-medium">{blog.title}</p>
                <p className="text-muted-foreground text-xs">
                  {blog.author_name} · {formatDate(blog.created_at)}
                </p>
              </div>
              <Button
                nativeButton={false}
                render={<a href={blog.medium_url} target="_blank" rel="noopener noreferrer" />}
                variant="outline"
                size="icon-sm"
                aria-label={`Open ${blog.title}`}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </FeatureCardSection>
  )
}
