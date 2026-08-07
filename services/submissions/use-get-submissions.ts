import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import type { SubmissionStatus } from '@/types/supabase.types'

export interface SubmissionFilters {
  taskId?: string
  studentId?: string
  department?: string
  domainInterest?: string
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
          '*, tasks(title, due_date), profiles:student_id(full_name, email, department, domain_interest, avatar_url)'
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

      if (filters.domainInterest) {
        result = result.filter(
          (s) =>
            (s.profiles as { domain_interest: string | null })?.domain_interest ===
            filters.domainInterest
        )
      }

      return result
    },
    staleTime: STALE_TIME.short,
  })
}
