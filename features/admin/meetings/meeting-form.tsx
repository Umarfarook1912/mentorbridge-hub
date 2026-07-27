'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { meetingSchema, type MeetingInput } from '@/lib/validations/meeting'
import { useUpsertMeeting } from '@/services/meetings/use-upsert-meeting'
import type { IMeetingEntity } from '@/services/meetings'
import { getErrorMessage, toDateInputValue, toTimeInputValue } from '@/utils/form'

interface MeetingFormProps {
  meeting?: IMeetingEntity | null
  onSuccess: () => void
}

export function MeetingForm({ meeting, onSuccess }: MeetingFormProps) {
  const isEdit = !!meeting
  const { mutateAsync: upsertMeeting, isPending } = useUpsertMeeting()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MeetingInput>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: '',
      description: '',
      handledBy: '',
      meetingDate: '',
      startTime: '',
      endTime: '',
      meetUrl: '',
    },
  })

  useEffect(() => {
    reset({
      title: meeting?.title ?? '',
      description: meeting?.description ?? '',
      handledBy: meeting?.handled_by ?? '',
      meetingDate: toDateInputValue(meeting?.meeting_date),
      startTime: toTimeInputValue(meeting?.start_time),
      endTime: toTimeInputValue(meeting?.end_time),
      meetUrl: meeting?.meet_url ?? '',
    })
  }, [meeting, reset])

  async function onSubmit(data: MeetingInput) {
    try {
      await upsertMeeting({ id: meeting?.id, data })
      toast.success(isEdit ? 'Meeting updated' : 'Meeting created')
      onSuccess()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormFieldWrapper label="Meeting Title" htmlFor="title" error={errors.title} required>
        <Input id="title" placeholder="React Fundamentals Session" {...register('title')} />
      </FormFieldWrapper>

      <FormFieldWrapper label="Description" htmlFor="description" error={errors.description}>
        <Textarea
          id="description"
          placeholder="What will be covered…"
          rows={3}
          {...register('description')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label="Handled By" htmlFor="handledBy" error={errors.handledBy} required>
        <Input id="handledBy" placeholder="Senthil Kumar" {...register('handledBy')} />
      </FormFieldWrapper>

      <div className="grid grid-cols-3 gap-3">
        <FormFieldWrapper label="Date" htmlFor="meetingDate" error={errors.meetingDate} required>
          <Input id="meetingDate" type="date" {...register('meetingDate')} />
        </FormFieldWrapper>
        <FormFieldWrapper label="Start Time" htmlFor="startTime" error={errors.startTime} required>
          <Input id="startTime" type="time" {...register('startTime')} />
        </FormFieldWrapper>
        <FormFieldWrapper label="End Time" htmlFor="endTime" error={errors.endTime} required>
          <Input id="endTime" type="time" {...register('endTime')} />
        </FormFieldWrapper>
      </div>

      <FormFieldWrapper label="Google Meet URL" htmlFor="meetUrl" error={errors.meetUrl}>
        <Input
          id="meetUrl"
          type="url"
          placeholder="https://meet.google.com/abc-defg-hij"
          {...register('meetUrl')}
        />
      </FormFieldWrapper>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Save Changes' : 'Create Meeting'}
        </Button>
      </div>
    </form>
  )
}
