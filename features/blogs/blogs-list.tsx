'use client'

import { useMemo, useState } from 'react'
import { Newspaper, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { SearchBar } from '@/components/shared/forms/search-bar'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { BlogForm } from './blog-form'
import { BlogSection } from './blog-section'
import { useGetBlogs, type IBlogEntity } from '@/services/blogs'
import { useAuthStore } from '@/store/auth-store'
import { useDebounce } from '@/hooks/use-debounce'

export function BlogsList() {
  const { user } = useAuthStore()
  const { data: blogs = [], isLoading } = useGetBlogs()
  const [addOpen, setAddOpen] = useState(false)
  const [editBlog, setEditBlog] = useState<IBlogEntity | null>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search)

  const searchedBlogs = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    if (!q) return blogs
    return blogs.filter(
      (blog) => blog.title.toLowerCase().includes(q) || blog.author_name.toLowerCase().includes(q)
    )
  }, [blogs, debouncedSearch])

  const { myBlogs, otherBlogs } = useMemo(() => {
    if (!user) return { myBlogs: [] as typeof searchedBlogs, otherBlogs: searchedBlogs }
    return {
      myBlogs: searchedBlogs.filter((b) => b.author_id === user.id),
      otherBlogs: searchedBlogs.filter((b) => b.author_id !== user.id),
    }
  }, [searchedBlogs, user])

  const canManage = (blog: IBlogEntity) =>
    !!user &&
    (user.id === blog.author_id ||
      user.role === 'Admin' ||
      (user.role === 'Associate' && (user.sectionPermissions ?? []).includes('blogs')))

  const canManageCommunity = (): boolean =>
    !!user &&
    (user.role === 'Admin' ||
      (user.role === 'Associate' && (user.sectionPermissions ?? []).includes('blogs')))

  const hasSearch = debouncedSearch.trim().length > 0
  const noMatchTitle = 'No matching blogs'
  const noMatchDescription = 'Try a different search'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by title or author…"
          className="sm:w-72"
        />
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
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({searchedBlogs.length})</TabsTrigger>
            <TabsTrigger value="mine">My Blogs ({myBlogs.length})</TabsTrigger>
            <TabsTrigger value="community">Community ({otherBlogs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <BlogSection
              blogs={searchedBlogs}
              emptyTitle={noMatchTitle}
              emptyDescription={noMatchDescription}
              canEdit={canManage}
              canDelete={canManage}
              onEdit={setEditBlog}
            />
          </TabsContent>

          <TabsContent value="mine" className="mt-4">
            <BlogSection
              blogs={myBlogs}
              emptyTitle={hasSearch ? noMatchTitle : "You haven't shared a blog yet"}
              emptyDescription={
                hasSearch ? noMatchDescription : 'Use Share Blog to post your Medium article'
              }
              emptyAction={
                hasSearch ? undefined : { label: 'Share Blog', onClick: () => setAddOpen(true) }
              }
              canEdit={canManage}
              canDelete={canManage}
              onEdit={setEditBlog}
            />
          </TabsContent>

          <TabsContent value="community" className="mt-4">
            <BlogSection
              blogs={otherBlogs}
              emptyTitle={hasSearch ? noMatchTitle : 'No community blogs yet'}
              emptyDescription={
                hasSearch ? noMatchDescription : 'When others share blogs, they will appear here'
              }
              canEdit={canManageCommunity}
              canDelete={canManageCommunity}
              onEdit={setEditBlog}
            />
          </TabsContent>
        </Tabs>
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
