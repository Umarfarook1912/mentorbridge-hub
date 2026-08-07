import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateSubmissions } from '@/lib/invalidate-queries'
import type { ISubmissionMutation, IReviewMutation } from '../tasks/tasks.types'

export function useUpsertSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ISubmissionMutation & { studentId: string }) => {
      const supabase = getSupabaseBrowserClient()
      const payload: Record<string, unknown> = {
        github_url: data.githubUrl ?? null,
        google_doc_url: data.googleDocUrl ?? null,
        medium_blog_url: data.mediumBlogUrl ?? null,
        remarks: data.remarks ?? null,
        status: 'Pending',
      }
      if (data.otherUrl) {
        payload.other_url = data.otherUrl
      }

      const { data: existing, error: findError } = await supabase
        .from('task_submissions')
        .select('id')
        .eq('task_id', data.taskId)
        .eq('student_id', data.studentId)
        .maybeSingle()
      if (findError) throw findError

      if (existing) {
        // Keep original submitted_at so list order stays "first submitted first"
        const { error } = await supabase
          .from('task_submissions')
          .update(payload)
          .eq('id', existing.id)
        if (error) throw error
        return
      }

      const { error } = await supabase.from('task_submissions').insert({
        ...payload,
        task_id: data.taskId,
        student_id: data.studentId,
        submitted_at: new Date().toISOString(),
      })
      if (error) throw error
    },
    onSuccess: async () => {
      await invalidateSubmissions(queryClient)
    },
  })
}

export function useReviewSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: IReviewMutation) => {
      const response = await fetch(`/api/admin/submissions/${data.submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: data.status,
          feedback: data.feedback,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(
          typeof payload.message === 'string' ? payload.message : 'Failed to submit review'
        )
      }
      return payload
    },
    onSuccess: async () => {
      await invalidateSubmissions(queryClient)
    },
  })
}

export function useDeleteOwnSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (submissionId: string) => {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from('task_submissions').delete().eq('id', submissionId)
      if (error) throw error
    },
    onSuccess: async () => {
      await invalidateSubmissions(queryClient)
    },
  })
}
