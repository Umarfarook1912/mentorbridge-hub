'use client'

import { CalendarDays, Clock, ExternalLink, Pencil, Trash2, User, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import {
  FeatureCard,
  FeatureCardDateBlock,
  FeatureCardMeta,
} from '@/components/shared/data-display/feature-card'
import { formatDate, formatTime, getMeetingLabel } from '@/utils/format'
import type { IMeetingEntity } from '@/services/meetings'

interface MeetingCardProps {
  meeting: IMeetingEntity
  onEdit?: (meeting: IMeetingEntity) => void
  onDelete?: (id: string) => void
  showJoin?: boolean
}

export function MeetingCard({ meeting, onEdit, onDelete, showJoin = false }: MeetingCardProps) {
  const label = getMeetingLabel(meeting.meeting_date)
  const statusMap = {
    today: 'upcoming',
    tomorrow: 'upcoming',
    upcoming: 'upcoming',
    past: 'completed',
  } as const
  const isPast = label === 'past'
  const canJoin = showJoin && !!meeting.meet_url && !isPast

  const footer = canJoin ? (
    <Button
      size="sm"
      className="w-full"
      nativeButton={false}
      render={<a href={meeting.meet_url!} target="_blank" rel="noopener noreferrer" />}
    >
      <Video className="h-3.5 w-3.5" />
      Join Meeting
      <ExternalLink className="h-3 w-3 opacity-70" />
    </Button>
  ) : !showJoin && meeting.meet_url ? (
    <a
      href={meeting.meet_url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      <Video className="h-3.5 w-3.5" />
      Open Meet link
      <ExternalLink className="h-3 w-3" />
    </a>
  ) : undefined

  return (
    <FeatureCard
      accent={isPast ? 'muted' : 'brand'}
      highlighted={label === 'today'}
      footer={footer}
    >
      <div className="flex items-start gap-3">
        <FeatureCardDateBlock
          day={formatDate(meeting.meeting_date, 'dd')}
          month={formatDate(meeting.meeting_date, 'MMM')}
          weekday={formatDate(meeting.meeting_date, 'EEE')}
          tone={label === 'today' ? 'brand' : isPast ? 'muted' : 'secondary'}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <StatusBadge status={statusMap[label]} />
            {label === 'today' && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                Today
              </span>
            )}
            {label === 'tomorrow' && (
              <span className="bg-brand-secondary/10 text-brand-secondary rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                Tomorrow
              </span>
            )}
          </div>
          <h3 className="text-base leading-snug font-semibold break-words">{meeting.title}</h3>
          {meeting.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{meeting.description}</p>
          )}
        </div>

        {(onEdit || onDelete) && (
          <div className="flex shrink-0 items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(meeting)}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive h-8 w-8"
                onClick={() => onDelete(meeting.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <FeatureCardMeta
          icon={Clock}
          label={`${formatTime(meeting.start_time)} – ${formatTime(meeting.end_time)}`}
        />
        <FeatureCardMeta
          icon={CalendarDays}
          label={formatDate(meeting.meeting_date, 'EEEE, dd MMM')}
        />
        <FeatureCardMeta icon={User} label={meeting.handled_by} className="sm:col-span-2" />
      </div>
    </FeatureCard>
  )
}
