import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'

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

export function useGetStudentTasks(studentId: string, department: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.tasks, 'student', studentId],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()

      let query = supabase.from('tasks').select('*, task_submissions(*)')
      if (department) {
        query = query.or(`department.is.null,department.eq.${department}`)
      }

      const { data, error } = await query.order('due_date')
      if (error) throw error
      return data ?? []
    },
    enabled: !!studentId,
    staleTime: STALE_TIME.medium,
  })
}
