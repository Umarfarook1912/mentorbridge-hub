'use client'

import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CalendarDays,
  CheckSquare,
  ClipboardList,
} from 'lucide-react'
import { StatsCard } from '@/components/shared/data-display/stats-card'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { useDashboardStats } from './use-dashboard-stats'

export function DashboardStatsGrid() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) return <LoadingSkeleton />

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatsCard
        title="Total Students"
        value={stats?.totalStudents ?? 0}
        icon={Users}
        variant="primary"
        description="Enrolled students"
      />
      <StatsCard
        title="Present Today"
        value={stats?.presentToday ?? 0}
        icon={UserCheck}
        variant="success"
        description="In today's sessions"
      />
      <StatsCard
        title="Absent Today"
        value={stats?.absentToday ?? 0}
        icon={UserX}
        variant="destructive"
        description="Missed today"
      />
      <StatsCard
        title="Permission"
        value={stats?.permissionToday ?? 0}
        icon={Clock}
        variant="warning"
        description="With permission"
      />
      <StatsCard
        title="Today's Meetings"
        value={stats?.todaysMeetings ?? 0}
        icon={CalendarDays}
        variant="secondary"
        description="Sessions scheduled today"
      />
      <StatsCard
        title="Active Tasks"
        value={stats?.pendingTasks ?? 0}
        icon={CheckSquare}
        variant="default"
        description="With open due dates"
      />
      <StatsCard
        title="Pending Reviews"
        value={stats?.pendingReviews ?? 0}
        icon={ClipboardList}
        variant="warning"
        description="Submissions awaiting review"
      />
    </div>
  )
}
