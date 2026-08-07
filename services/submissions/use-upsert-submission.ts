import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateSubmissions } from '@/lib/invalidate-queries'
import type { ISubmissionMutation, IReviewMutation } from '../tasks/tasks.types'

export function useUpsertSubmission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ISubmissionMutation & { studentId: string }) => {
      const supabase = getSupabaseBrowserClient()
      const row: Record<string, unknown> = {
        task_id: data.taskId,
        student_id: data.studentId,
        github_url: data.githubUrl ?? null,
        google_doc_url: data.googleDocUrl ?? null,
        medium_blog_url: data.mediumBlogUrl ?? null,
        remarks: data.remarks ?? null,
        submitted_at: new Date().toISOString(),
        status: 'Pending',
      }
      // Only send when set — avoids PostgREST errors if other_url migration isn't applied yet
      if (data.otherUrl) {
        row.other_url = data.otherUrl
      }

      const { error } = await supabase
        .from('task_submissions')
        .upsert(row, { onConflict: 'task_id,student_id' })
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
