'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { MeetingFields } from './meeting-fields'
import { MeetingSheet } from './meeting-sheet'
import { EMPTY_MEETING } from './meeting-defaults'
import { meetingSchema, type MeetingInput } from '@/lib/validations/meeting'
import { useUpsertMeeting } from '@/services/meetings/use-upsert-meeting'
import type { IMeetingEntity } from '@/services/meetings'
import { getErrorMessage, toDateInputValue, toTimeInputValue } from '@/utils/form'
import type { MeetingDomain } from '@/utils/meeting-audience'

interface MeetingEditSheetProps {
  meeting: IMeetingEntity | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MeetingEditSheet({ meeting, open, onOpenChange }: MeetingEditSheetProps) {
  const { mutateAsync: upsertMeeting, isPending } = useUpsertMeeting()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MeetingInput>({
    resolver: zodResolver(meetingSchema),
    defaultValues: EMPTY_MEETING,
  })

  useEffect(() => {
    if (!meeting) return
    reset({
      title: meeting.title,
      description: meeting.description ?? '',
      handledBy: meeting.handled_by,
      meetingDate: toDateInputValue(meeting.meeting_date),
      startTime: toTimeInputValue(meeting.start_time),
      endTime: toTimeInputValue(meeting.end_time),
      meetUrl: meeting.meet_url ?? '',
      attendanceMandatory: meeting.attendance_mandatory ?? true,
      targetDomains: (meeting.target_domains as MeetingDomain[] | null) ?? [],
      targetStudentIds: meeting.target_student_ids ?? [],
    })
  }, [meeting, reset])

  async function onSubmit(data: MeetingInput) {
    if (!meeting) return
    try {
      await upsertMeeting({ id: meeting.id, data })
      toast.success('Meeting updated')
      onOpenChange(false)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <MeetingSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Meeting"
      description="Update this meeting’s details"
      footer={
        <Button
          type="submit"
          form="meeting-edit-form"
          disabled={isPending || !meeting}
          className="w-full sm:w-auto"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      }
    >
      {meeting ? (
        <form id="meeting-edit-form" onSubmit={handleSubmit(onSubmit)}>
          <MeetingFields
            register={register}
            control={control}
            setValue={setValue}
            errors={errors}
          />
        </form>
      ) : null}
    </MeetingSheet>
  )
}
