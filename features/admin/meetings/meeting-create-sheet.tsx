'use client'

import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { MeetingFields } from './meeting-fields'
import { MeetingSheet } from './meeting-sheet'
import { EMPTY_MEETING } from './meeting-defaults'
import { multiMeetingSchema, type MultiMeetingInput } from '@/lib/validations/meeting'
import { useCreateMeetings } from '@/services/meetings/use-upsert-meeting'
import { getErrorMessage } from '@/utils/form'

interface MeetingCreateSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MeetingCreateSheet({ open, onOpenChange }: MeetingCreateSheetProps) {
  const { mutateAsync: createMeetings, isPending } = useCreateMeetings()

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<MultiMeetingInput>({
    resolver: zodResolver(multiMeetingSchema),
    defaultValues: { meetings: [{ ...EMPTY_MEETING }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'meetings' })

  function handleOpenChange(next: boolean) {
    if (!next) reset({ meetings: [{ ...EMPTY_MEETING }] })
    onOpenChange(next)
  }

  async function onSubmit(data: MultiMeetingInput) {
    try {
      await createMeetings(data.meetings)
      const count = data.meetings.length
      toast.success(count === 1 ? 'Meeting created' : `${count} meetings created`)
      handleOpenChange(false)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <MeetingSheet
      open={open}
      onOpenChange={handleOpenChange}
      title="Create Meetings"
      description="Add one or more meetings, then create them all at once"
      footer={
        <Button type="submit" form="meeting-create-form" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {fields.length === 1 ? 'Create Meeting' : `Create ${fields.length} Meetings`}
        </Button>
      }
    >
      <form id="meeting-create-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {fields.map((field, index) => (
          <div key={field.id} className="bg-card space-y-4 rounded-xl border p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2 border-b pb-3">
              <p className="font-semibold">Meeting {index + 1}</p>
              {fields.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => remove(index)}
                  aria-label={`Remove meeting ${index + 1}`}
                >
                  <Trash2 className="text-destructive h-4 w-4" />
                </Button>
              ) : null}
            </div>
            <MeetingFields
              register={register}
              control={control}
              setValue={setValue}
              errors={errors.meetings?.[index]}
              namePrefix={`meetings.${index}.`}
              idPrefix={`m${index}`}
            />
          </div>
        ))}

        <div className="flex justify-end">
          <Button type="button" onClick={() => append({ ...EMPTY_MEETING })}>
            <Plus className="mr-2 h-4 w-4" />
            Add another meeting
          </Button>
        </div>
      </form>
    </MeetingSheet>
  )
}
