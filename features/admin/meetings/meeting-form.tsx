'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { MeetingAudiencePicker } from './meeting-audience-picker'
import { meetingSchema, type MeetingInput } from '@/lib/validations/meeting'
import { useUpsertMeeting } from '@/services/meetings/use-upsert-meeting'
import type { IMeetingEntity } from '@/services/meetings'
import { getErrorMessage, toDateInputValue, toTimeInputValue } from '@/utils/form'
import { cn } from '@/utils/cn'
import type { MeetingDomain } from '@/utils/meeting-audience'

interface MeetingFormProps {
  meeting?: IMeetingEntity | null
  onSuccess: () => void
}

export function MeetingForm({ meeting, onSuccess }: MeetingFormProps) {
  const isEdit = !!meeting
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
    defaultValues: {
      title: '',
      description: '',
      handledBy: '',
      meetingDate: '',
      startTime: '',
      endTime: '',
      meetUrl: '',
      attendanceMandatory: true,
      targetDomains: [],
      targetStudentIds: [],
    },
  })

  const targetDomains = useWatch({ control, name: 'targetDomains' }) ?? []
  const targetStudentIds = useWatch({ control, name: 'targetStudentIds' }) ?? []
  const attendanceMandatory = useWatch({ control, name: 'attendanceMandatory' }) ?? true

  useEffect(() => {
    reset({
      title: meeting?.title ?? '',
      description: meeting?.description ?? '',
      handledBy: meeting?.handled_by ?? '',
      meetingDate: toDateInputValue(meeting?.meeting_date),
      startTime: toTimeInputValue(meeting?.start_time),
      endTime: toTimeInputValue(meeting?.end_time),
      meetUrl: meeting?.meet_url ?? '',
      attendanceMandatory: meeting?.attendance_mandatory ?? true,
      targetDomains: (meeting?.target_domains as MeetingDomain[] | null) ?? [],
      targetStudentIds: meeting?.target_student_ids ?? [],
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
      <div className="grid gap-4 sm:grid-cols-2">
        <FormFieldWrapper label="Meeting Title" htmlFor="title" error={errors.title} required>
          <Input id="title" placeholder="React Fundamentals Session" {...register('title')} />
        </FormFieldWrapper>
        <FormFieldWrapper label="Handled By" htmlFor="handledBy" error={errors.handledBy} required>
          <Input id="handledBy" placeholder="Senthil Kumar" {...register('handledBy')} />
        </FormFieldWrapper>
      </div>

      <FormFieldWrapper label="Description" htmlFor="description" error={errors.description}>
        <Textarea
          id="description"
          placeholder="What will be covered…"
          rows={2}
          {...register('description')}
        />
      </FormFieldWrapper>

      <MeetingAudiencePicker
        domains={targetDomains}
        studentIds={targetStudentIds}
        onDomainsChange={(domains) => setValue('targetDomains', domains, { shouldValidate: true })}
        onStudentIdsChange={(ids) => setValue('targetStudentIds', ids, { shouldValidate: true })}
        error={errors.targetDomains ?? errors.targetStudentIds}
      />

      <div className="grid gap-4 sm:grid-cols-3">
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

      <FormFieldWrapper
        label="Attendance"
        error={errors.attendanceMandatory}
        required
        hint="Mandatory meetings appear in Attendance for marking"
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setValue('attendanceMandatory', true, { shouldValidate: true })}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              attendanceMandatory
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground hover:text-foreground border-border'
            )}
          >
            Mandatory
          </button>
          <button
            type="button"
            onClick={() => setValue('attendanceMandatory', false, { shouldValidate: true })}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
              !attendanceMandatory
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground hover:text-foreground border-border'
            )}
          >
            Not mandatory
          </button>
        </div>
      </FormFieldWrapper>

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
