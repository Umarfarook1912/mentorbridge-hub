'use client'

import { useMemo, useState } from 'react'
import { Newspaper, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { SearchBar } from '@/components/shared/forms/search-bar'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { BlogForm } from './blog-form'
import { BlogSection } from './blog-section'
import { useGetBlogs, type IBlogEntity } from '@/services/blogs'
import { useAuthStore } from '@/store/auth-store'
import { useDebounce } from '@/hooks/use-debounce'

type BlogFilter = 'all' | 'mine' | 'community'

export function BlogsList() {
  const { user } = useAuthStore()
  const { data: blogs = [], isLoading } = useGetBlogs()
  const [addOpen, setAddOpen] = useState(false)
  const [editBlog, setEditBlog] = useState<IBlogEntity | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<BlogFilter>('all')
  const debouncedSearch = useDebounce(search)

  const filteredBlogs = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return blogs.filter((blog) => {
      if (filter === 'mine' && user && blog.author_id !== user.id) return false
      if (filter === 'community' && user && blog.author_id === user.id) return false
      if (!q) return true
      return blog.title.toLowerCase().includes(q) || blog.author_name.toLowerCase().includes(q)
    })
  }, [blogs, debouncedSearch, filter, user])

  const { myBlogs, otherBlogs } = useMemo(() => {
    if (!user) return { myBlogs: [] as typeof filteredBlogs, otherBlogs: filteredBlogs }
    return {
      myBlogs: filteredBlogs.filter((b) => b.author_id === user.id),
      otherBlogs: filteredBlogs.filter((b) => b.author_id !== user.id),
    }
  }, [filteredBlogs, user])

  const canManage = (blog: IBlogEntity) =>
    !!user && (user.id === blog.author_id || user.role === 'Admin')

  const showMine = filter !== 'community'
  const showCommunity = filter !== 'mine'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by title or author…"
          className="sm:w-72"
        />
        <Select value={filter} onValueChange={(v) => setFilter((v as BlogFilter) ?? 'all')}>
          <SelectTrigger className="w-44">
            <SelectValue>
              {(value: string | null) => {
                if (value === 'mine') return 'My Blogs'
                if (value === 'community') return 'Community'
                return 'All Blogs'
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Blogs</SelectItem>
            <SelectItem value="mine">My Blogs</SelectItem>
            <SelectItem value="community">Community</SelectItem>
          </SelectContent>
        </Select>
        <div className="sm:ml-auto">
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Share Blog
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : !blogs.length ? (
        <EmptyState
          icon={Newspaper}
          title="No blogs yet"
          description="Be the first to share a Medium article with the MentorBridge community"
          action={{ label: 'Share Blog', onClick: () => setAddOpen(true) }}
        />
      ) : !filteredBlogs.length ? (
        <EmptyState
          icon={Newspaper}
          title="No matching blogs"
          description="Try a different search or filter"
        />
      ) : (
        <div className="space-y-8">
          {showMine && (
            <BlogSection
              title="My Blogs"
              description="Articles you have shared"
              blogs={myBlogs}
              emptyTitle="You haven't shared a blog yet"
              emptyDescription="Use Share Blog to post your Medium article"
              canEdit={canManage}
              canDelete={canManage}
              onEdit={setEditBlog}
            />
          )}
          {showCommunity && (
            <BlogSection
              title="Community Blogs"
              description="Articles shared by others"
              blogs={otherBlogs}
              emptyTitle="No community blogs yet"
              emptyDescription="When others share blogs, they will appear here"
              canEdit={() => !!user && user.role === 'Admin'}
              canDelete={() => !!user && user.role === 'Admin'}
              onEdit={setEditBlog}
            />
          )}
        </div>
      )}

      <FormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Share a Blog"
        description="Add your Medium article so everyone in MentorBridge can read it"
      >
        {addOpen && <BlogForm key="create-blog" onSuccess={() => setAddOpen(false)} />}
      </FormDialog>

      <FormDialog
        open={!!editBlog}
        onOpenChange={(o) => !o && setEditBlog(null)}
        title="Edit Blog"
        description="Update the title or Medium link"
      >
        {editBlog && (
          <BlogForm key={editBlog.id} blog={editBlog} onSuccess={() => setEditBlog(null)} />
        )}
      </FormDialog>
    </div>
  )
}
