'use client'

import { useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { FilterPills } from '@/components/shared/forms/filter-pills'
import { MeetingCard } from '@/components/shared/data-display/meeting-card'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { useGetMeetings } from '@/services/meetings/use-get-meetings'
import { useAuthStore } from '@/store/auth-store'
import { isMeetingForStudent } from '@/utils/meeting-audience'

type TimeFilter = 'today' | 'past'

export function StudentMeetingsList() {
  const { user } = useAuthStore()
  const [time, setTime] = useState<TimeFilter>('today')
  const { data: todayRaw = [], isLoading: lt } = useGetMeetings('today')
  const { data: pastRaw = [], isLoading: lp } = useGetMeetings('past')

  const today = useMemo(
    () =>
      todayRaw.filter((m) =>
        isMeetingForStudent(
          { targetDomains: m.target_domains, targetStudentIds: m.target_student_ids },
          { id: user?.id ?? '', domainInterest: user?.domainInterest }
        )
      ),
    [todayRaw, user?.id, user?.domainInterest]
  )
  const past = useMemo(
    () =>
      pastRaw.filter((m) =>
        isMeetingForStudent(
          { targetDomains: m.target_domains, targetStudentIds: m.target_student_ids },
          { id: user?.id ?? '', domainInterest: user?.domainInterest }
        )
      ),
    [pastRaw, user?.id, user?.domainInterest]
  )

  const meetings = time === 'today' ? today : past
  const isLoading = time === 'today' ? lt : lp

  return (
    <div className="space-y-4">
      <FilterPills
        aria-label="Meeting time"
        value={time}
        onChange={setTime}
        options={[
          { value: 'today', label: `Today (${today.length})` },
          { value: 'past', label: `Past (${past.length})` },
        ]}
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={time === 'today' ? 'No meetings today' : 'No past meetings'}
          description={time === 'today' ? 'Check back soon for new sessions' : undefined}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {meetings.map((m) => (
            <MeetingCard key={m.id} meeting={m} showJoin />
          ))}
        </div>
      )}
    </div>
  )
}
