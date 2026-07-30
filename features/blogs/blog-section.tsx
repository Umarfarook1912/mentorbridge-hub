'use client'

import { Newspaper } from 'lucide-react'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { PaginationControls } from '@/components/shared/data-display/pagination-controls'
import { BlogCard } from './blog-card'
import { usePagination } from '@/hooks/use-pagination'
import type { IBlogEntity } from '@/services/blogs'

const BLOG_PAGE_SIZE = 10

interface BlogSectionProps {
  title?: string
  description?: string
  blogs: IBlogEntity[]
  emptyTitle: string
  emptyDescription: string
  emptyAction?: { label: string; onClick: () => void }
  canEdit?: (blog: IBlogEntity) => boolean
  canDelete: (blog: IBlogEntity) => boolean
  onEdit?: (blog: IBlogEntity) => void
}

export function BlogSection({
  title,
  description,
  blogs,
  emptyTitle,
  emptyDescription,
  emptyAction,
  canEdit,
  canDelete,
  onEdit,
}: BlogSectionProps) {
  const pagination = usePagination(BLOG_PAGE_SIZE)
  const total = blogs.length
  const { page, totalPages, canPrev, canNext } = pagination.getState(total)
  const pageBlogs = total > BLOG_PAGE_SIZE ? pagination.paginate(blogs) : blogs
  const showPagination = total > BLOG_PAGE_SIZE

  return (
    <section className="space-y-3">
      {(title || description) && (
        <div>
          {title ? <h2 className="text-lg font-semibold">{title}</h2> : null}
          {description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
        </div>
      )}

      {!blogs.length ? (
        <EmptyState
          icon={Newspaper}
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {pageBlogs.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                canEdit={canEdit?.(blog)}
                canDelete={canDelete(blog)}
                onEdit={onEdit}
              />
            ))}
          </div>
          {showPagination && (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              canPrev={canPrev}
              canNext={canNext}
              onPrev={() => pagination.goTo(page - 1, total)}
              onNext={() => pagination.goTo(page + 1, total)}
              totalItems={total}
              pageSize={pagination.pageSize}
              onPageSizeChange={pagination.setPageSize}
            />
          )}
        </>
      )}
    </section>
  )
}
