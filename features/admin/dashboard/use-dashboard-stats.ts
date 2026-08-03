import { useQuery } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import { localToday } from '@/utils/meeting-time'

export interface DashboardStats {
  totalStudents: number
  presentToday: number
  absentToday: number
  permissionToday: number
  todaysMeetings: number
  pendingTasks: number
  pendingReviews: number
}

export function useDashboardStats() {
  return useQuery({
    queryKey: [QUERY_KEYS.dashboardStats],
    queryFn: async (): Promise<DashboardStats> => {
      const supabase = getSupabaseBrowserClient()
      const today = localToday()

      const [studentsRes, todayMeetingsRes, tasksRes, pendingReviewsRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('id', { count: 'exact' })
          .in('role', ['Student', 'Associate']),
        supabase.from('meetings').select('id').eq('meeting_date', today),
        supabase.from('tasks').select('id', { count: 'exact' }).gte('due_date', today),
        supabase.from('task_submissions').select('id', { count: 'exact' }).eq('status', 'Pending'),
      ])

      let present = 0,
        absent = 0,
        permission = 0

      if (todayMeetingsRes.data?.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const meetingIds = (todayMeetingsRes.data as any[]).map((m) => m.id)
        const { data: attendance } = await supabase
          .from('attendance')
          .select('status')
          .in('meeting_id', meetingIds)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const a = attendance as any[]
        present = a?.filter((r) => r.status === 'Present').length ?? 0
        absent = a?.filter((r) => r.status === 'Absent').length ?? 0
        permission = a?.filter((r) => r.status === 'Permission').length ?? 0
      }

      return {
        totalStudents: studentsRes.count ?? 0,
        presentToday: present,
        absentToday: absent,
        permissionToday: permission,
        todaysMeetings: todayMeetingsRes.data?.length ?? 0,
        pendingTasks: tasksRes.count ?? 0,
        pendingReviews: pendingReviewsRes.count ?? 0,
      }
    },
    staleTime: STALE_TIME.medium,
  })
}

export function useMonthlyAttendance() {
  return useQuery({
    queryKey: [QUERY_KEYS.dashboardMonthlyAttendance],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()

      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        return {
          label: d.toLocaleString('default', { month: 'short' }),
          year: d.getFullYear(),
          month: d.getMonth() + 1,
        }
      })

      const results = await Promise.all(
        months.map(async ({ label, year, month }) => {
          const start = `${year}-${String(month).padStart(2, '0')}-01`
          const end = new Date(year, month, 0).toISOString().split('T')[0]

          const { data } = await supabase
            .from('attendance')
            .select('status, meetings!inner(meeting_date)')
            .gte('meetings.meeting_date', start)
            .lte('meetings.meeting_date', end)

          const present = data?.filter((a) => a.status === 'Present').length ?? 0
          const absent = data?.filter((a) => a.status === 'Absent').length ?? 0
          const permission = data?.filter((a) => a.status === 'Permission').length ?? 0

          return { month: label, present, absent, permission }
        })
      )

      return results
    },
    staleTime: STALE_TIME.long,
  })
}
