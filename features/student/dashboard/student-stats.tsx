'use client'

import { useQuery } from '@tanstack/react-query'
import { CheckSquare, Clock, UserCheck } from 'lucide-react'
import { StatsCard } from '@/components/shared/data-display/stats-card'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'

interface StudentStatsProps {
  studentId: string
  department?: string | null
}

export function StudentStats({ studentId }: StudentStatsProps) {
  const { data: stats, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.studentStats, studentId],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient()

      const [attendanceRes, pendingRes, completedRes] = await Promise.all([
        supabase.from('attendance').select('status').eq('student_id', studentId),
        supabase
          .from('task_submissions')
          .select('id', { count: 'exact' })
          .eq('student_id', studentId)
          .eq('status', 'Pending'),
        supabase
          .from('task_submissions')
          .select('id', { count: 'exact' })
          .eq('student_id', studentId)
          .eq('status', 'Approved'),
      ])

      const attendance = attendanceRes.data ?? []
      const present = attendance.filter((a) => a.status === 'Present').length
      const total = attendance.length
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0

      return {
        attendancePercentage: percentage,
        totalSessions: total,
        pendingTasks: pendingRes.count ?? 0,
        completedTasks: completedRes.count ?? 0,
      }
    },
    staleTime: STALE_TIME.medium,
    enabled: !!studentId,
  })

  if (isLoading) return <LoadingSkeleton variant="stats" />

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      <StatsCard
        title="Attendance"
        value={`${stats?.attendancePercentage ?? 0}%`}
        icon={UserCheck}
        variant={
          (stats?.attendancePercentage ?? 0) >= 75
            ? 'success'
            : (stats?.attendancePercentage ?? 0) >= 50
              ? 'warning'
              : 'destructive'
        }
        description={`${stats?.totalSessions ?? 0} sessions`}
      />
      <StatsCard
        title="Pending Tasks"
        value={stats?.pendingTasks ?? 0}
        icon={Clock}
        variant="warning"
        description="Awaiting review"
      />
      <StatsCard
        title="Completed Tasks"
        value={stats?.completedTasks ?? 0}
        icon={CheckSquare}
        variant="success"
        description="Approved by admin"
      />
    </div>
  )
}
