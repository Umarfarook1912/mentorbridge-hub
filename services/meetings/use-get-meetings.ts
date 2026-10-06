import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import { isMeetingCompleted, localToday } from '@/utils/meeting-time'

export type MeetingListFilter = 'today' | 'past' | 'all'

export function useGetMeetings(filter?: MeetingListFilter) {
  return useQuery({
    queryKey: [QUERY_KEYS.meetings, filter ?? 'all'],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      const today = localToday()

      let query = supabase.from('meetings').select('*')

      // Today tab: soonest first. Past tab: most recent first.
      if (filter === 'today') {
        query = query
          .gte('meeting_date', today)
          .order('meeting_date', { ascending: true })
          .order('start_time', { ascending: true })
      } else {
        query = query
          .order('meeting_date', { ascending: false })
          .order('start_time', { ascending: false })
        if (filter === 'past') query = query.lte('meeting_date', today)
      }

      const { data, error } = await query
      if (error) throw error

      const rows = data ?? []
      if (filter === 'today') {
        return rows.filter((m) => !isMeetingCompleted(m.meeting_date, m.end_time))
      }
      if (filter === 'past') {
        return rows.filter((m) => isMeetingCompleted(m.meeting_date, m.end_time))
      }
      return rows
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
