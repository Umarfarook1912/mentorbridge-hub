'use client'

import { useEffect } from 'react'
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
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { feedbackSchema, type FeedbackInput } from '@/lib/validations/submission'
import { useReviewSubmission } from '@/services/submissions/use-upsert-submission'
import { getErrorMessage } from '@/utils/form'
import { formatDateTime } from '@/utils/format'
import type { SubmissionStatus } from '@/types/supabase.types'

export interface ReviewSubmissionData {
  id: string
  status: SubmissionStatus
  feedback: string | null
  reviewed_by_name: string | null
  reviewed_at: string | null
  studentName?: string
}

interface FeedbackDialogProps {
  submission: ReviewSubmissionData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canWrite?: boolean
}

export function FeedbackDialog({
  submission,
  open,
  onOpenChange,
  canWrite = false,
}: FeedbackDialogProps) {
  const { mutateAsync: reviewSubmission, isPending } = useReviewSubmission()
  const isReviewed = !!submission && submission.status !== 'Pending'
  const readOnly = !canWrite

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

  useEffect(() => {
    if (!open || !submission) return
    reset({
      feedback: submission.feedback ?? '',
      status:
        submission.status === 'Approved' || submission.status === 'Rejected'
          ? submission.status
          : undefined,
    })
  }, [open, submission, reset])

  async function onSubmit(data: FeedbackInput) {
    if (!submission || readOnly) return
    try {
      await reviewSubmission({
        submissionId: submission.id,
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

  const title = readOnly
    ? 'Review details'
    : isReviewed
      ? 'Update review'
      : 'Review submission'

  return (
    <FormDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset()
        onOpenChange(o)
      }}
      title={title}
      description={
        submission?.studentName
          ? `Submission from ${submission.studentName}`
          : 'View or update the review for this submission'
      }
    >
      {readOnly ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Decision</p>
            {submission ? <StatusBadge status={submission.status} /> : null}
          </div>
          {submission?.reviewed_by_name || submission?.reviewed_at ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">Reviewed</p>
              <p className="text-muted-foreground text-sm">
                {submission.reviewed_by_name ?? '—'}
                {submission.reviewed_at ? ` · ${formatDateTime(submission.reviewed_at)}` : ''}
              </p>
            </div>
          ) : null}
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Feedback</p>
            <p className="text-muted-foreground bg-muted/40 rounded-md border p-3 text-sm whitespace-pre-wrap">
              {submission?.feedback?.trim() ? submission.feedback : 'No feedback provided.'}
            </p>
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      ) : (
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

          <FormFieldWrapper label="Feedback" htmlFor="feedback" error={errors.feedback}>
            <Textarea
              id="feedback"
              placeholder="Optional feedback for the student…"
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
              {isReviewed ? 'Update review' : 'Submit review'}
            </Button>
          </div>
        </form>
      )}
    </FormDialog>
  )
}
