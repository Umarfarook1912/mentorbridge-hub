import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import type { IStudentEntity } from './students.types'

export function useGetAdmins() {
  return useQuery({
    queryKey: [QUERY_KEYS.admins],
    queryFn: async (): Promise<IStudentEntity[]> => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('role', ['Admin', 'Staff'])
        .order('full_name', { ascending: true })

      if (error) throw error
      return data ?? []
    },
    staleTime: STALE_TIME.long,
  })
}
