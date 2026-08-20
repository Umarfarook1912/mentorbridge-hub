'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, CalendarPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { MeetingCard } from '@/components/shared/data-display/meeting-card'
import { MeetingsFilters, type MeetingsFiltersState } from './meetings-filters'
import { MeetingCreateSheet } from './meeting-create-sheet'
import { MeetingEditSheet } from './meeting-edit-sheet'
import { useGetMeetings } from '@/services/meetings/use-get-meetings'
import { useDeleteMeeting } from '@/services/meetings/use-delete-meeting'
import { useAuthStore } from '@/store/auth-store'
import { canMutate } from '@/lib/permissions'
import type { IMeetingEntity } from '@/services/meetings'

function matchesDomain(meeting: IMeetingEntity, domain: MeetingsFiltersState['domain']) {
  if (domain === 'All') return true
  const targets = meeting.target_domains ?? []
  if (targets.length === 0) return true
  return targets.includes(domain)
}

function matchesAttendance(
  meeting: IMeetingEntity,
  attendance: MeetingsFiltersState['attendance']
) {
  if (attendance === 'all') return true
  if (attendance === 'mandatory') return meeting.attendance_mandatory
  return !meeting.attendance_mandatory
}

function matchesSearch(meeting: IMeetingEntity, search: string) {
  const q = search.trim().toLowerCase()
  if (!q) return true
  return (
    meeting.title.toLowerCase().includes(q) || meeting.handled_by.toLowerCase().includes(q)
  )
}

function matchesDateRange(meeting: IMeetingEntity, from: string, to: string) {
  if (from && meeting.meeting_date < from) return false
  if (to && meeting.meeting_date > to) return false
  return true
}

export function MeetingsList() {
  const { user } = useAuthStore()
  const canWrite = canMutate(user)
  const [addOpen, setAddOpen] = useState(false)
  const [editMeeting, setEditMeeting] = useState<IMeetingEntity | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filters, setFilters] = useState<MeetingsFiltersState>({
    time: 'today',
    domain: 'All',
    attendance: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
  })

  const { data: today = [], isLoading: loadingToday } = useGetMeetings('today')
  const { data: past = [], isLoading: loadingPast } = useGetMeetings('past')
  const { mutateAsync: deleteMeeting, isPending: deleting } = useDeleteMeeting()

  function updateFilter<K extends keyof MeetingsFiltersState>(
    key: K,
    value: MeetingsFiltersState[K]
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const filteredToday = useMemo(
    () =>
      today.filter(
        (m) =>
          matchesDomain(m, filters.domain) &&
          matchesAttendance(m, filters.attendance) &&
          matchesSearch(m, filters.search) &&
          matchesDateRange(m, filters.dateFrom, filters.dateTo)
      ),
    [today, filters]
  )
  const filteredPast = useMemo(
    () =>
      past.filter(
        (m) =>
          matchesDomain(m, filters.domain) &&
          matchesAttendance(m, filters.attendance) &&
          matchesSearch(m, filters.search) &&
          matchesDateRange(m, filters.dateFrom, filters.dateTo)
      ),
    [past, filters]
  )
  const meetings = filters.time === 'today' ? filteredToday : filteredPast
  const isLoading = filters.time === 'today' ? loadingToday : loadingPast

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
      <div className="flex flex-col gap-3">
        {canWrite ? (
          <div className="flex justify-end">
            <Button onClick={() => setAddOpen(true)}>
              <CalendarPlus className="mr-2 h-4 w-4" /> Create Meeting
            </Button>
          </div>
        ) : null}

        <MeetingsFilters
          filters={filters}
          todayCount={filteredToday.length}
          pastCount={filteredPast.length}
          onChange={updateFilter}
        />
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={filters.time === 'today' ? 'No meetings today' : 'No past meetings'}
          description={
            filters.search || filters.domain !== 'All' || filters.attendance !== 'all'
              ? 'Try adjusting your filters'
              : filters.time === 'today'
                ? 'Create a meeting or check back for scheduled sessions'
                : undefined
          }
          action={
            canWrite && filters.time === 'today'
              ? { label: 'Create Meeting', onClick: () => setAddOpen(true) }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {meetings.map((m) => (
            <MeetingCard
              key={m.id}
              meeting={m}
              onEdit={canWrite ? setEditMeeting : undefined}
              onDelete={canWrite ? setDeleteId : undefined}
            />
          ))}
        </div>
      )}

      <MeetingCreateSheet open={addOpen} onOpenChange={setAddOpen} />
      <MeetingEditSheet
        meeting={editMeeting}
        open={!!editMeeting}
        onOpenChange={(open) => !open && setEditMeeting(null)}
      />

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
