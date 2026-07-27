import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'

export function useGetMeetings(filter?: 'upcoming' | 'past' | 'all') {
  return useQuery({
    queryKey: [QUERY_KEYS.meetings, filter ?? 'all'],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      let query = supabase.from('meetings').select('*').order('meeting_date', { ascending: false })

      const today = new Date().toISOString().split('T')[0]

      if (filter === 'upcoming') {
        query = query.gte('meeting_date', today)
      } else if (filter === 'past') {
        query = query.lt('meeting_date', today)
      }

      const { data, error } = await query
      if (error) throw error
      return data ?? []
    },
    staleTime: STALE_TIME.medium,
  })
}

export function useGetMeetingById(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.meetings, id],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.from('meetings').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}
