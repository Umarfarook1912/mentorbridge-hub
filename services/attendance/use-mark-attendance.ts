import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateAttendance } from '@/lib/invalidate-queries'
import type { IMarkAttendanceMutation } from './attendance.types'

export function useMarkAttendance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ meetingId, records }: IMarkAttendanceMutation) => {
      const supabase = getSupabaseBrowserClient()

      const rows = records.map((r) => ({
        meeting_id: meetingId,
        student_id: r.studentId,
        status: r.status,
        marked_at: new Date().toISOString(),
      }))

      const { error } = await supabase
        .from('attendance')
        .upsert(rows, { onConflict: 'meeting_id,student_id' })

      if (error) throw error
    },
    onSuccess: async (_, { meetingId }) => {
      await invalidateAttendance(queryClient, meetingId)
    },
  })
}
