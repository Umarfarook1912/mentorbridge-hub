'use client'

import { useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { AttendanceRoster } from './attendance-roster'
import { AttendanceMeetingList } from './attendance-meeting-list'
import { AttendanceMobileRoster } from './attendance-mobile-roster'
import {
  AttendanceMeetingFilters,
  type AttendanceFiltersState,
} from './attendance-meeting-filters'
import { useGetMeetings } from '@/services/meetings/use-get-meetings'
import { formatDate, formatTime } from '@/utils/format'
import { isMeetingCompleted, localToday } from '@/utils/meeting-time'
import type { IMeetingEntity } from '@/services/meetings'

function matchesDomain(meeting: IMeetingEntity, domain: AttendanceFiltersState['domain']) {
  if (domain === 'All') return true
  const targets = meeting.target_domains ?? []
  if (targets.length === 0) return true
  return targets.includes(domain)
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

function isTodayMeeting(meeting: IMeetingEntity) {
  const today = localToday()
  return meeting.meeting_date >= today && !isMeetingCompleted(meeting.meeting_date, meeting.end_time)
}

function isPastMeeting(meeting: IMeetingEntity) {
  return isMeetingCompleted(meeting.meeting_date, meeting.end_time)
}

function applyFilters(list: IMeetingEntity[], filters: AttendanceFiltersState) {
  return list.filter(
    (m) =>
      matchesDomain(m, filters.domain) &&
      matchesSearch(m, filters.search) &&
      matchesDateRange(m, filters.dateFrom, filters.dateTo)
  )
}

export function AttendanceMeetingSelector() {
  const { data: meetings = [], isLoading } = useGetMeetings('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [filters, setFilters] = useState<AttendanceFiltersState>({
    time: 'today',
    domain: 'All',
    search: '',
    dateFrom: '',
    dateTo: '',
  })

  const mandatory = useMemo(() => meetings.filter((m) => m.attendance_mandatory), [meetings])
  const filteredAll = useMemo(() => applyFilters(mandatory, filters), [mandatory, filters])
  const todayMeetings = useMemo(() => filteredAll.filter(isTodayMeeting), [filteredAll])
  const pastMeetings = useMemo(() => filteredAll.filter(isPastMeeting), [filteredAll])

  const visibleMeetings = filters.time === 'today' ? todayMeetings : pastMeetings
  const selected = visibleMeetings.find((m) => m.id === selectedId)

  function updateFilter<K extends keyof AttendanceFiltersState>(
    key: K,
    value: AttendanceFiltersState[K]
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function selectMeeting(id: string) {
    setSelectedId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading) return <LoadingSkeleton />

  if (!mandatory.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No attendance meetings"
        description="Only meetings marked as attendance mandatory appear here"
      />
    )
  }

  const hasActiveFilters =
    !!filters.search || filters.domain !== 'All' || !!filters.dateFrom || !!filters.dateTo
  const emptyTitle = filters.time === 'today' ? 'No meetings today' : 'No past meetings'
  const emptyDescription = hasActiveFilters ? 'Try adjusting your filters' : undefined

  return (
    <div className="space-y-4">
      {/* Mobile: hide filters while marking so roster is the only surface */}
      <div className={selected ? 'hidden lg:block' : undefined}>
        <AttendanceMeetingFilters
          filters={filters}
          todayCount={todayMeetings.length}
          pastCount={pastMeetings.length}
          onChange={updateFilter}
        />
      </div>

      {/* Mobile: full takeover roster — no meeting cards to mis-tap */}
      {selected && (
        <div className="lg:hidden">
          <AttendanceMobileRoster meeting={selected} onBack={() => setSelectedId(null)} />
        </div>
      )}

      {/* Desktop always; mobile only when no meeting selected */}
      <div className={selected ? 'hidden lg:grid lg:grid-cols-3 lg:gap-6' : 'grid gap-6 lg:grid-cols-3'}>
        <div className="space-y-3">
          <p className="text-muted-foreground text-sm font-medium">Select a Meeting</p>
          <AttendanceMeetingList
            meetings={visibleMeetings}
            selectedId={selectedId}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            onSelect={selectMeeting}
          />
        </div>

        <div className="hidden lg:col-span-2 lg:block">
          {selected ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">{selected.title}</h2>
                <p className="text-muted-foreground text-sm">
                  {formatDate(selected.meeting_date)} · {formatTime(selected.start_time)} –{' '}
                  {formatTime(selected.end_time)} · {selected.handled_by}
                </p>
              </div>
              <AttendanceRoster
                meetingId={selected.id}
                meetingTitle={selected.title}
                meetingDate={selected.meeting_date}
                targetDomains={selected.target_domains}
                targetStudentIds={selected.target_student_ids}
              />
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              title="Select a meeting"
              description="Choose a meeting from the list to mark attendance"
            />
          )}
        </div>
      </div>
    </div>
  )
}
