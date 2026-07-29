'use client'

import { useAuthStore } from '@/store/auth-store'
import { PageHeader } from '@/components/shared/layout/page-header'
import { StudentStats } from '@/features/student/dashboard/student-stats'
import { DashboardBlogs } from '@/features/blogs/dashboard-blogs'
import { useGetMeetings } from '@/services/meetings/use-get-meetings'
import { useGetStudentTasks } from '@/services/tasks/use-get-tasks'
import type { SubmissionStatus } from '@/types/supabase.types'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { FeatureCard, FeatureCardDateBlock } from '@/components/shared/data-display/feature-card'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { formatDate, formatTime } from '@/utils/format'
import { CalendarDays, CheckSquare } from 'lucide-react'
import { isPast, parseISO } from 'date-fns'
import { ROUTES } from '@/lib/constants'

export default function StudentDashboardPage() {
  const { user } = useAuthStore()
  const { data: meetings = [], isLoading: loadingMeetings } = useGetMeetings('upcoming')
  const { data: tasks = [], isLoading: loadingTasks } = useGetStudentTasks(
    user?.id ?? '',
    user?.department ?? null
  )

  if (!user) return null

  const pendingTasks = tasks.filter((t) => {
    const submissions = (t.task_submissions ?? []) as {
      student_id: string
      status: SubmissionStatus
    }[]
    const sub = submissions.find((s) => s.student_id === user.id)
    return !sub || sub.status === 'Pending'
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user.fullName.split(' ')[0]} 👋`}
        description="Here's your learning activity summary"
      />

      <StudentStats studentId={user.id} department={user.department} />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            Upcoming Meetings
          </h2>
          {loadingMeetings ? (
            <LoadingSkeleton />
          ) : meetings.slice(0, 4).length === 0 ? (
            <EmptyState icon={CalendarDays} title="No upcoming meetings" />
          ) : (
            meetings.slice(0, 4).map((m) => (
              <FeatureCard key={m.id} contentClassName="space-y-0">
                <div className="flex items-center gap-3">
                  <FeatureCardDateBlock
                    day={formatDate(m.meeting_date, 'dd')}
                    month={formatDate(m.meeting_date, 'MMM')}
                    tone="brand"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{m.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(m.meeting_date, 'EEE, dd MMM')} · {formatTime(m.start_time)}
                    </p>
                  </div>
                  <StatusBadge status="upcoming" />
                </div>
              </FeatureCard>
            ))
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
            Pending Tasks
          </h2>
          {loadingTasks ? (
            <LoadingSkeleton />
          ) : pendingTasks.slice(0, 4).length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="All tasks submitted!"
              description="Great work keeping up with your tasks"
            />
          ) : (
            pendingTasks.slice(0, 4).map((t) => {
              const overdue = isPast(parseISO(t.due_date))
              return (
                <FeatureCard
                  key={t.id}
                  accent={overdue ? 'danger' : 'warning'}
                  contentClassName="space-y-0"
                >
                  <div className="flex items-center gap-3">
                    <FeatureCardDateBlock
                      day={formatDate(t.due_date, 'dd')}
                      month={formatDate(t.due_date, 'MMM')}
                      tone={overdue ? 'danger' : 'warning'}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{t.title}</p>
                      <p
                        className={`text-xs ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}
                      >
                        Due {formatDate(t.due_date)}
                        {overdue && ' (Overdue)'}
                      </p>
                    </div>
                  </div>
                </FeatureCard>
              )
            })
          )}
        </div>
      </div>

      <DashboardBlogs blogsHref={ROUTES.student.blogs} />
    </div>
  )
}
