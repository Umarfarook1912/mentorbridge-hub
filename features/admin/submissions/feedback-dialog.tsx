'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { feedbackSchema, type FeedbackInput } from '@/lib/validations/submission'
import { useReviewSubmission } from '@/services/submissions/use-upsert-submission'
import { getErrorMessage } from '@/utils/form'

interface FeedbackDialogProps {
  submissionId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackDialog({ submissionId, open, onOpenChange }: FeedbackDialogProps) {
  const { mutateAsync: reviewSubmission, isPending } = useReviewSubmission()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { feedback: '', status: undefined },
  })

  const status = watch('status')

  async function onSubmit(data: FeedbackInput) {
    if (!submissionId) return
    try {
      await reviewSubmission({
        submissionId,
        status: data.status,
        feedback: data.feedback,
      })
      toast.success(`Submission ${data.status.toLowerCase()}`)
      reset()
      onOpenChange(false)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to submit review'))
    }
  }

  return (
    <FormDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
      title="Review Submission"
      description="Provide feedback and update the submission status"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormFieldWrapper label="Decision" error={errors.status} required>
          <Select
            value={status || null}
            onValueChange={(v) =>
              setValue('status', v as FeedbackInput['status'], { shouldValidate: true })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select outcome">
                {(value: string | null) =>
                  value === 'Approved'
                    ? 'Approve'
                    : value === 'Rejected'
                      ? 'Reject'
                      : 'Select outcome'
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Approved">Approve</SelectItem>
              <SelectItem value="Rejected">Reject</SelectItem>
            </SelectContent>
          </Select>
        </FormFieldWrapper>

        <FormFieldWrapper label="Feedback" htmlFor="feedback" error={errors.feedback} required>
          <Textarea
            id="feedback"
            placeholder="Provide constructive feedback for the student…"
            rows={4}
            {...register('feedback')}
          />
        </FormFieldWrapper>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Review
          </Button>
        </div>
      </form>
    </FormDialog>
  )
}
