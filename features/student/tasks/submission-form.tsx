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
import { submissionSchema, type SubmissionInput } from '@/lib/validations/submission'
import { useUpsertSubmission } from '@/services/submissions/use-upsert-submission'
import { useAuthStore } from '@/store/auth-store'
import { getErrorMessage } from '@/utils/form'

interface SubmissionFormProps {
  taskId: string
  existing?: {
    github_url?: string | null
    google_doc_url?: string | null
    medium_blog_url?: string | null
    remarks?: string | null
  } | null
  onSuccess: () => void
}

export function SubmissionForm({ taskId, existing, onSuccess }: SubmissionFormProps) {
  const { user } = useAuthStore()
  const { mutateAsync: upsertSubmission, isPending } = useUpsertSubmission()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubmissionInput>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      githubUrl: '',
      googleDocUrl: '',
      mediumBlogUrl: '',
      remarks: '',
    },
  })

  useEffect(() => {
    reset({
      githubUrl: existing?.github_url ?? '',
      googleDocUrl: existing?.google_doc_url ?? '',
      mediumBlogUrl: existing?.medium_blog_url ?? '',
      remarks: existing?.remarks ?? '',
    })
  }, [existing, reset])

  async function onSubmit(data: SubmissionInput) {
    if (!user) return
    try {
      await upsertSubmission({
        taskId,
        studentId: user.id,
        githubUrl: data.githubUrl || undefined,
        googleDocUrl: data.googleDocUrl || undefined,
        mediumBlogUrl: data.mediumBlogUrl || undefined,
        remarks: data.remarks || undefined,
      })
      toast.success('Submission saved!')
      onSuccess()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Failed to submit'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormFieldWrapper label="GitHub Repository URL" htmlFor="githubUrl" error={errors.githubUrl}>
        <Input
          id="githubUrl"
          type="url"
          placeholder="https://github.com/username/repo"
          {...register('githubUrl')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label="Google Docs URL" htmlFor="googleDocUrl" error={errors.googleDocUrl}>
        <Input
          id="googleDocUrl"
          type="url"
          placeholder="https://docs.google.com/..."
          {...register('googleDocUrl')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper
        label="Medium Blog URL"
        htmlFor="mediumBlogUrl"
        error={errors.mediumBlogUrl}
      >
        <Input
          id="mediumBlogUrl"
          type="url"
          placeholder="https://medium.com/..."
          {...register('mediumBlogUrl')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label="Remarks (optional)" htmlFor="remarks" error={errors.remarks}>
        <Textarea
          id="remarks"
          placeholder="Any additional notes for the reviewer…"
          rows={3}
          {...register('remarks')}
        />
      </FormFieldWrapper>

      {errors.githubUrl?.message?.includes('required') && (
        <p className="text-destructive text-sm">Please provide at least one submission link</p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {existing ? 'Update Submission' : 'Submit Task'}
        </Button>
      </div>
    </form>
  )
}
