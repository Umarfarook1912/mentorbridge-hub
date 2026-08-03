import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import { isAudienceForStudent } from '@/utils/meeting-audience'

export function useGetTasks() {
  return useQuery({
    queryKey: [QUERY_KEYS.tasks],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    staleTime: STALE_TIME.medium,
  })
}

export function useGetStudentTasks(studentId: string, domainInterest: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.tasks, 'student', studentId, domainInterest],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('tasks')
        .select('*, task_submissions(*)')
        .order('due_date')
      if (error) throw error
      return (data ?? []).filter((task) =>
        isAudienceForStudent(
          {
            targetDomains: task.target_domains,
            targetStudentIds: task.target_student_ids,
          },
          { id: studentId, domainInterest }
        )
      )
    },
    enabled: !!studentId,
    staleTime: STALE_TIME.medium,
  })
}
