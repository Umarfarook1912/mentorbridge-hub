'use client'

import { useState } from 'react'
import { Calendar, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import {
  FeatureCard,
  FeatureCardDateBlock,
  FeatureCardMeta,
} from '@/components/shared/data-display/feature-card'
import { SubmissionReviewMeta } from '@/components/shared/data-display/submission-review-meta'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { SubmissionForm } from './submission-form'
import { TaskSubmissionLinks } from './task-submission-links'
import { useGetStudentTasks } from '@/services/tasks/use-get-tasks'
import { useAuthStore } from '@/store/auth-store'
import { formatDate } from '@/utils/format'
import { isTaskOverdue } from '@/utils/meeting-time'
import type { SubmissionStatus } from '@/types/supabase.types'

interface Submission {
  student_id: string
  status: SubmissionStatus
  github_url: string | null
  google_doc_url: string | null
  medium_blog_url: string | null
  other_url: string | null
  remarks: string | null
  feedback: string | null
  reviewed_by_name: string | null
  reviewed_at: string | null
}

const OVERDUE_SUBMIT_MSG =
  'This task is overdue. The due date has passed, so submissions are closed.'

export function StudentTasksList() {
  const { user } = useAuthStore()
  const { data: tasks = [], isLoading } = useGetStudentTasks(
    user?.id ?? '',
    user?.domainInterest ?? null
  )
  const [submitTaskId, setSubmitTaskId] = useState<string | null>(null)

  if (!user) return null

  const taskForSubmit = tasks.find((t) => t.id === submitTaskId)
  const existingSubmission = taskForSubmit?.task_submissions?.find(
    (s: Submission) => s.student_id === user.id
  ) as Submission | undefined

  if (isLoading) return <LoadingSkeleton />

  if (!tasks.length) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No tasks assigned yet"
        description="Tasks will appear here once the admin assigns them"
      />
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => {
          const submission = task.task_submissions?.find(
            (s: Submission) => s.student_id === user.id
          ) as Submission | undefined

          const overdue = isTaskOverdue(task.due_date)
          const canEdit = !overdue && (!submission || submission.status === 'Pending')

          function handleSubmitClick() {
            if (overdue) {
              toast.error(OVERDUE_SUBMIT_MSG)
              return
            }
            setSubmitTaskId(task.id)
          }

          const footer =
            overdue && !submission ? (
              <Button size="sm" variant="outline" className="w-full" onClick={handleSubmitClick}>
                Submit Task
              </Button>
            ) : canEdit ? (
              <Button size="sm" className="w-full" onClick={handleSubmitClick}>
                {submission ? 'Edit Submission' : 'Submit Task'}
              </Button>
            ) : undefined

          return (
            <FeatureCard
              key={task.id}
              accent={
                overdue && !submission
                  ? 'danger'
                  : submission?.status === 'Approved'
                    ? 'success'
                    : 'brand'
              }
              highlighted={overdue && !submission}
              footer={footer}
            >
              <div className="flex items-start gap-3">
                <FeatureCardDateBlock
                  day={formatDate(task.due_date, 'dd')}
                  month={formatDate(task.due_date, 'MMM')}
                  weekday={formatDate(task.due_date, 'EEE')}
                  tone={overdue && !submission ? 'danger' : 'brand'}
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {submission ? <StatusBadge status={submission.status} /> : null}
                      {overdue ? <StatusBadge status="overdue" /> : null}
                    </div>
                    {submission && (
                      <SubmissionReviewMeta
                        status={submission.status}
                        reviewedByName={submission.reviewed_by_name}
                        reviewedAt={submission.reviewed_at}
                      />
                    )}
                  </div>
                  <h3 className="text-base leading-snug font-semibold">{task.title}</h3>
                  {task.description && (
                    <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                <FeatureCardMeta
                  icon={Calendar}
                  label={`Due ${formatDate(task.due_date)}${overdue ? ' (Overdue)' : ''}`}
                  tone={overdue ? 'danger' : 'default'}
                />
                {overdue && !submission ? (
                  <p className="text-destructive text-xs font-medium">
                    Due date has passed — submissions are closed.
                  </p>
                ) : null}
                {submission?.feedback && (
                  <div className="border-border/70 bg-muted/40 text-muted-foreground rounded-lg border p-2.5 text-xs">
                    <p className="text-foreground mb-1 font-medium">Feedback</p>
                    <p>{submission.feedback}</p>
                  </div>
                )}
                {submission && (
                  <TaskSubmissionLinks
                    githubUrl={submission.github_url}
                    googleDocUrl={submission.google_doc_url}
                    mediumBlogUrl={submission.medium_blog_url}
                    otherUrl={submission.other_url}
                  />
                )}
              </div>
            </FeatureCard>
          )
        })}
      </div>

      <FormDialog
        open={!!submitTaskId}
        onOpenChange={(o) => {
          if (!o) setSubmitTaskId(null)
        }}
        title={existingSubmission ? 'Edit Submission' : 'Submit Task'}
        description={taskForSubmit?.title}
        maxWidth="lg"
      >
        {submitTaskId && taskForSubmit && !isTaskOverdue(taskForSubmit.due_date) ? (
          <SubmissionForm
            key={submitTaskId}
            taskId={submitTaskId}
            existing={existingSubmission}
            onSuccess={() => setSubmitTaskId(null)}
          />
        ) : null}
      </FormDialog>
    </>
  )
}
