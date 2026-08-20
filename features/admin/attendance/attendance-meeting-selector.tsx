'use client'

import { useState } from 'react'
import { CalendarDays, Clock } from 'lucide-react'
import {
  FeatureCard,
  FeatureCardDateBlock,
  FeatureCardMeta,
} from '@/components/shared/data-display/feature-card'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { AttendanceRoster } from './attendance-roster'
import { useGetMeetings } from '@/services/meetings/use-get-meetings'
import { formatDate, formatTime } from '@/utils/format'

export function AttendanceMeetingSelector() {
  const { data: meetings = [], isLoading } = useGetMeetings('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const attendanceMeetings = meetings.filter((m) => m.attendance_mandatory)
  const selected = attendanceMeetings.find((m) => m.id === selectedId)

  if (isLoading) return <LoadingSkeleton />

  if (!attendanceMeetings.length) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No attendance meetings"
        description="Only meetings marked as attendance mandatory appear here"
      />
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm font-medium">Select a Meeting</p>
        {attendanceMeetings.map((meeting) => (
          <FeatureCard
            key={meeting.id}
            highlighted={selectedId === meeting.id}
            onClick={() => setSelectedId(meeting.id)}
            contentClassName="space-y-3"
          >
            <div className="flex items-start gap-3">
              <FeatureCardDateBlock
                day={formatDate(meeting.meeting_date, 'dd')}
                month={formatDate(meeting.meeting_date, 'MMM')}
                weekday={formatDate(meeting.meeting_date, 'EEE')}
                tone={selectedId === meeting.id ? 'brand' : 'secondary'}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{meeting.title}</p>
                <div className="mt-2">
                  <FeatureCardMeta icon={Clock} label={formatTime(meeting.start_time)} />
                </div>
              </div>
            </div>
          </FeatureCard>
        ))}
      </div>

      <div className="lg:col-span-2">
        {selected ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">{selected.title}</h2>
              <p className="text-muted-foreground text-sm">
                {formatDate(selected.meeting_date)} · {formatTime(selected.start_time)} –{' '}
                {formatTime(selected.end_time)}
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
  )
}
