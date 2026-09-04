'use client'

import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AttendanceRoster } from './attendance-roster'
import { formatDate, formatTime } from '@/utils/format'
import type { IMeetingEntity } from '@/services/meetings'

interface AttendanceMobileRosterProps {
  meeting: IMeetingEntity
  onBack: () => void
}

export function AttendanceMobileRoster({ meeting, onBack }: AttendanceMobileRosterProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3 border-b pb-3">
        <Button type="button" variant="ghost" size="sm" className="-ml-2 gap-1.5" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back to meetings
        </Button>
        <div>
          <h2 className="text-base font-semibold">{meeting.title}</h2>
          <p className="text-muted-foreground text-sm">
            {formatDate(meeting.meeting_date)} · {formatTime(meeting.start_time)} –{' '}
            {formatTime(meeting.end_time)} · {meeting.handled_by}
          </p>
        </div>
      </div>
      <AttendanceRoster
        meetingId={meeting.id}
        meetingTitle={meeting.title}
        meetingDate={meeting.meeting_date}
        targetDomains={meeting.target_domains}
        targetStudentIds={meeting.target_student_ids}
      />
    </div>
  )
}
