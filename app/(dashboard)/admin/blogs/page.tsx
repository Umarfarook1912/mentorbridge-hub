import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { BlogsList } from '@/features/blogs/blogs-list'

export const metadata: Metadata = { title: 'Blogs' }

export default function AdminBlogsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Blogs"
        description="Share Medium articles and browse posts from the MentorBridge community"
      />
      <BlogsList />
    </div>
  )
}
