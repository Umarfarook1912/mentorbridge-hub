import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'

export function useGetAttendanceByMeeting(meetingId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.attendance, 'meeting', meetingId],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('attendance')
        .select('*, profiles(full_name, email, department, avatar_url)')
        .eq('meeting_id', meetingId)
      if (error) throw error
      return data ?? []
    },
    enabled: !!meetingId,
    staleTime: STALE_TIME.short,
  })
}

export function useGetStudentAttendance(studentId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.attendance, 'student', studentId],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('attendance')
        .select('*, meetings(title, meeting_date, start_time, end_time)')
        .eq('student_id', studentId)
        .order('marked_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!studentId,
    staleTime: STALE_TIME.medium,
  })
}
