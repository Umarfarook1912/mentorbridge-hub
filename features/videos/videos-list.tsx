'use client'

import { useState, useMemo } from 'react'
import { Plus, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/shared/forms/search-bar'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { useGetVideos, useDeleteVideo, type IVideoEntity } from '@/services/videos'
import { useAuthStore } from '@/store/auth-store'
import { canManageVideos } from '@/lib/permissions'
import { DOMAIN_INTERESTS, type DomainInterest } from '@/lib/constants'
import { FilterPills } from '@/components/shared/forms/filter-pills'
import { getErrorMessage } from '@/utils/form'
import { toast } from 'sonner'
import { VideosGrid } from './videos-grid'
import { VideoForm } from './video-form'
import { splitVideoSections } from './videos-sections'

type DomainFilter = 'All' | DomainInterest

const DOMAIN_OPTIONS = [
  { value: 'All' as const, label: 'All' },
  ...DOMAIN_INTERESTS.map((d) => ({ value: d, label: d })),
]

interface VideosListProps {
  basePath: string
}

export function VideosList({ basePath }: VideosListProps) {
  const detailHref = (id: string) => `${basePath}/${id}`
  const { user } = useAuthStore()
  const canManage = canManageVideos(user)
  const [domain, setDomain] = useState<DomainFilter>('All')
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editVideo, setEditVideo] = useState<IVideoEntity | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: videos = [], isLoading } = useGetVideos({ domain })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return videos
    return videos.filter((v) => v.title.toLowerCase().includes(q))
  }, [videos, search])

  const { mostViewed, remaining } = splitVideoSections(filtered)

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteVideo(deleteId)
      toast.success('Video removed')
      setDeleteId(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  const { mutateAsync: deleteVideo, isPending: deleting } = useDeleteVideo()

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3">
        {/* Search + Add */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search videos…"
            className="sm:w-72"
          />
          {canManage ? (
            <div className="sm:ml-auto">
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Video
              </Button>
            </div>
          ) : null}
        </div>

        <FilterPills
          aria-label="Domain"
          options={DOMAIN_OPTIONS}
          value={domain}
          onChange={setDomain}
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : !filtered.length ? (
        <EmptyState
          icon={Video}
          title={search ? 'No results found' : 'No recordings yet'}
          description={
            search
              ? `No videos match "${search}"`
              : canManage
                ? 'Add a YouTube session recording for students to watch'
                : 'Session recordings will appear here'
          }
          action={
            search
              ? { label: 'Clear search', onClick: () => setSearch('') }
              : canManage
                ? { label: 'Add Video', onClick: () => setAddOpen(true) }
                : undefined
          }
        />
      ) : (
        <>
          <VideosGrid
            title="Most viewed"
            videos={mostViewed}
            emptyTitle="No recordings yet"
            emptyDescription="Videos will appear here"
            detailHref={detailHref}
            canManage={canManage}
            onEdit={setEditVideo}
            onDelete={setDeleteId}
          />
          {remaining.length ? (
            <VideosGrid
              title="All recordings"
              videos={remaining}
              emptyTitle=""
              emptyDescription=""
              detailHref={detailHref}
              canManage={canManage}
              onEdit={setEditVideo}
              onDelete={setDeleteId}
            />
          ) : null}
        </>
      )}

      {canManage ? (
        <>
          <FormDialog
            open={addOpen}
            onOpenChange={setAddOpen}
            title="Add Video"
            description="Paste a YouTube link. Title can be edited before saving."
            maxWidth="lg"
          >
            {addOpen && <VideoForm key="create-video" onSuccess={() => setAddOpen(false)} />}
          </FormDialog>
          <FormDialog
            open={!!editVideo}
            onOpenChange={(open) => !open && setEditVideo(null)}
            title="Edit Video"
            maxWidth="lg"
          >
            {editVideo && (
              <VideoForm
                key={editVideo.id}
                video={editVideo}
                onSuccess={() => setEditVideo(null)}
              />
            )}
          </FormDialog>
          <ConfirmDialog
            open={!!deleteId}
            onOpenChange={(open) => !open && setDeleteId(null)}
            title="Delete Video"
            description="This recording will be removed from the hub. This cannot be undone."
            confirmLabel="Delete"
            variant="destructive"
            loading={deleting}
            onConfirm={handleDelete}
          />
        </>
      ) : null}
    </div>
  )
}
