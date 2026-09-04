'use client'

import { CalendarDays, Clock, User } from 'lucide-react'
import {
  FeatureCard,
  FeatureCardDateBlock,
  FeatureCardMeta,
} from '@/components/shared/data-display/feature-card'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { formatDate, formatTime } from '@/utils/format'
import type { IMeetingEntity } from '@/services/meetings'

interface AttendanceMeetingListProps {
  meetings: IMeetingEntity[]
  selectedId: string | null
  emptyTitle: string
  emptyDescription?: string
  onSelect: (id: string) => void
}

export function AttendanceMeetingList({
  meetings,
  selectedId,
  emptyTitle,
  emptyDescription,
  onSelect,
}: AttendanceMeetingListProps) {
  if (!meetings.length) {
    return (
      <EmptyState icon={CalendarDays} title={emptyTitle} description={emptyDescription} />
    )
  }

  return (
    <div className="space-y-3">
      {meetings.map((meeting) => {
        const isSelected = selectedId === meeting.id
        return (
          <FeatureCard
            key={meeting.id}
            highlighted={isSelected}
            onClick={() => onSelect(meeting.id)}
            contentClassName="space-y-3"
            className={
              isSelected
                ? 'bg-primary/5 ring-primary shadow-dropdown ring-2 hover:ring-primary'
                : undefined
            }
          >
            <div className="flex items-start gap-3">
              <FeatureCardDateBlock
                day={formatDate(meeting.meeting_date, 'dd')}
                month={formatDate(meeting.meeting_date, 'MMM')}
                weekday={formatDate(meeting.meeting_date, 'EEE')}
                tone={isSelected ? 'brand' : 'secondary'}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-semibold ${isSelected ? 'text-primary' : ''}`}
                >
                  {meeting.title}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <FeatureCardMeta
                    icon={Clock}
                    label={`${formatTime(meeting.start_time)} – ${formatTime(meeting.end_time)}`}
                  />
                  <FeatureCardMeta icon={User} label={meeting.handled_by} />
                </div>
              </div>
            </div>
          </FeatureCard>
        )
      })}
    </div>
  )
}
