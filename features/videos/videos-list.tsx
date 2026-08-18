'use client'

import { useState } from 'react'
import { Plus, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { useGetVideos, useDeleteVideo, type IVideoEntity } from '@/services/videos'
import { useAuthStore } from '@/store/auth-store'
import { canManageVideos } from '@/lib/permissions'
import { DOMAIN_INTERESTS, type DomainInterest } from '@/lib/constants'
import { getErrorMessage } from '@/utils/form'
import { toast } from 'sonner'
import { VideosFeaturedHero } from './videos-featured-hero'
import { VideosGrid } from './videos-grid'
import { VideoForm } from './video-form'
import { splitVideoSections } from './videos-sections'

type DomainFilter = 'All' | DomainInterest

interface VideosListProps {
  basePath: string
}

export function VideosList({ basePath }: VideosListProps) {
  const detailHref = (id: string) => `${basePath}/${id}`
  const { user } = useAuthStore()
  const canManage = canManageVideos(user)
  const [domain, setDomain] = useState<DomainFilter>('All')
  const [addOpen, setAddOpen] = useState(false)
  const [editVideo, setEditVideo] = useState<IVideoEntity | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: videos = [], isLoading } = useGetVideos({ domain })
  const { mutateAsync: deleteVideo, isPending: deleting } = useDeleteVideo()
  const { featured, mostViewed, remaining } = splitVideoSections(videos)

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Tabs value={domain} onValueChange={(value) => setDomain(value as DomainFilter)}>
          <TabsList>
            <TabsTrigger value="All">All</TabsTrigger>
            {DOMAIN_INTERESTS.map((item) => (
              <TabsTrigger key={item} value={item}>
                {item}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {canManage ? (
          <div className="sm:ml-auto">
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Video
            </Button>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : !videos.length ? (
        <EmptyState
          icon={Video}
          title="No recordings yet"
          description={
            canManage
              ? 'Add a YouTube session recording for students to watch'
              : 'Session recordings will appear here'
          }
          action={canManage ? { label: 'Add Video', onClick: () => setAddOpen(true) } : undefined}
        />
      ) : (
        <>
          {featured ? (
            <VideosFeaturedHero
              video={featured}
              href={detailHref(featured.id)}
              canManage={canManage}
              onEdit={setEditVideo}
              onDelete={setDeleteId}
            />
          ) : null}
          <VideosGrid
            title="Most viewed"
            videos={mostViewed}
            emptyTitle="No other recordings yet"
            emptyDescription="More videos will show here as they get views"
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
            description="Paste a YouTube link. Title and description can be edited before saving."
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
