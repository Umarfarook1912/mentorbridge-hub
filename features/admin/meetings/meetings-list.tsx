'use client'

import { useState } from 'react'
import { CalendarDays, CalendarPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { MeetingCard } from '@/components/shared/data-display/meeting-card'
import { MeetingForm } from './meeting-form'
import { useGetMeetings } from '@/services/meetings/use-get-meetings'
import { useDeleteMeeting } from '@/services/meetings/use-delete-meeting'
import type { IMeetingEntity } from '@/services/meetings'

export function MeetingsList() {
  const [addOpen, setAddOpen] = useState(false)
  const [editMeeting, setEditMeeting] = useState<IMeetingEntity | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: upcoming = [], isLoading: loadingUpcoming } = useGetMeetings('upcoming')
  const { data: past = [], isLoading: loadingPast } = useGetMeetings('past')
  const { mutateAsync: deleteMeeting, isPending: deleting } = useDeleteMeeting()

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteMeeting(deleteId)
      toast.success('Meeting deleted')
      setDeleteId(null)
    } catch {
      toast.error('Failed to delete meeting')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setAddOpen(true)}>
          <CalendarPlus className="mr-2 h-4 w-4" /> Create Meeting
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {loadingUpcoming ? (
            <LoadingSkeleton />
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming meetings"
              description="Create your first meeting to get started"
              action={{ label: 'Create Meeting', onClick: () => setAddOpen(true) }}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((m) => (
                <MeetingCard
                  key={m.id}
                  meeting={m}
                  onEdit={setEditMeeting}
                  onDelete={setDeleteId}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {loadingPast ? (
            <LoadingSkeleton />
          ) : past.length === 0 ? (
            <EmptyState icon={CalendarDays} title="No past meetings" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {past.map((m) => (
                <MeetingCard
                  key={m.id}
                  meeting={m}
                  onEdit={setEditMeeting}
                  onDelete={setDeleteId}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <FormDialog open={addOpen} onOpenChange={setAddOpen} title="Create Meeting" maxWidth="2xl">
        {addOpen && <MeetingForm key="create-meeting" onSuccess={() => setAddOpen(false)} />}
      </FormDialog>

      <FormDialog
        open={!!editMeeting}
        onOpenChange={(o) => !o && setEditMeeting(null)}
        title="Edit Meeting"
        maxWidth="2xl"
      >
        {editMeeting && (
          <MeetingForm
            key={editMeeting.id}
            meeting={editMeeting}
            onSuccess={() => setEditMeeting(null)}
          />
        )}
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Meeting"
        description="This will delete the meeting and all associated attendance records. This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
