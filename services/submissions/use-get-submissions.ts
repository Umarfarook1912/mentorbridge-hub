import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import type { SubmissionStatus } from '@/types/supabase.types'

export interface SubmissionFilters {
  taskId?: string
  studentId?: string
  department?: string
  status?: SubmissionStatus
}

export function useGetSubmissions(filters: SubmissionFilters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.submissions, filters],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      let query = supabase
        .from('task_submissions')
        .select(
          '*, tasks(title, due_date), profiles:student_id(full_name, email, department, avatar_url)'
        )
        .order('submitted_at', { ascending: false })

      if (filters.taskId) query = query.eq('task_id', filters.taskId)
      if (filters.studentId) query = query.eq('student_id', filters.studentId)
      if (filters.status) query = query.eq('status', filters.status)

      const { data, error } = await query
      if (error) throw error

      let result = data ?? []

      if (filters.department) {
        result = result.filter(
          (s) => (s.profiles as { department: string | null })?.department === filters.department
        )
      }

      return result
    },
    staleTime: STALE_TIME.short,
  })
}

export function useGetMySubmissions(studentId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.submissions, 'student', studentId],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('task_submissions')
        .select('*, tasks(title, due_date, description)')
        .eq('student_id', studentId)
        .order('submitted_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!studentId,
    staleTime: STALE_TIME.medium,
  })
}
