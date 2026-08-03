'use client'

import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MeetingCard } from '@/components/shared/data-display/meeting-card'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { useGetMeetings } from '@/services/meetings/use-get-meetings'
import { useAuthStore } from '@/store/auth-store'
import { isMeetingForStudent } from '@/utils/meeting-audience'

export function StudentMeetingsList() {
  const { user } = useAuthStore()
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

  return (
    <Tabs defaultValue="today">
      <TabsList>
        <TabsTrigger value="today">Today ({today.length})</TabsTrigger>
        <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="today" className="mt-4">
        {lt ? (
          <LoadingSkeleton />
        ) : today.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No meetings today"
            description="Check back soon for new sessions"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {today.map((m) => (
              <MeetingCard key={m.id} meeting={m} showJoin />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="past" className="mt-4">
        {lp ? (
          <LoadingSkeleton />
        ) : past.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No past meetings" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {past.map((m) => (
              <MeetingCard key={m.id} meeting={m} showJoin />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
