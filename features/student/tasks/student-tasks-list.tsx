'use client'

import { useState } from 'react'
import { Calendar, ExternalLink, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import {
  FeatureCard,
  FeatureCardDateBlock,
  FeatureCardMeta,
} from '@/components/shared/data-display/feature-card'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { SubmissionForm } from './submission-form'
import { useGetStudentTasks } from '@/services/tasks/use-get-tasks'
import { useAuthStore } from '@/store/auth-store'
import { formatDate } from '@/utils/format'
import { isPast, parseISO } from 'date-fns'
import type { SubmissionStatus } from '@/types/supabase.types'

interface Submission {
  student_id: string
  status: SubmissionStatus
  github_url: string | null
  google_doc_url: string | null
  medium_blog_url: string | null
  remarks: string | null
  feedback: string | null
}

export function StudentTasksList() {
  const { user } = useAuthStore()
  const { data: tasks = [], isLoading } = useGetStudentTasks(
    user?.id ?? '',
    user?.department ?? null
  )
  const [submitTaskId, setSubmitTaskId] = useState<string | null>(null)

  if (!user) return null

  const taskForSubmit = tasks.find((t) => t.id === submitTaskId)
  const existingSubmission = taskForSubmit?.task_submissions?.find(
    (s: Submission) => s.student_id === user.id
  ) as Submission | undefined

  if (isLoading) return <LoadingSkeleton variant="card" count={3} />

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

          const overdue = isPast(parseISO(task.due_date))
          const canEdit = !submission || (submission.status === 'Pending' && !overdue)

          const footer = canEdit ? (
            <Button size="sm" className="w-full" onClick={() => setSubmitTaskId(task.id)}>
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
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    {submission ? (
                      <StatusBadge status={submission.status} />
                    ) : overdue ? (
                      <StatusBadge status="overdue" />
                    ) : null}
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
                  label={`Due ${formatDate(task.due_date)}`}
                  tone={overdue && !submission ? 'danger' : 'default'}
                />

                {submission?.feedback && (
                  <div className="border-border/70 bg-muted/40 text-muted-foreground rounded-lg border p-2.5 text-xs">
                    <p className="text-foreground mb-1 font-medium">Feedback</p>
                    <p>{submission.feedback}</p>
                  </div>
                )}

                {submission &&
                  (submission.github_url ||
                    submission.google_doc_url ||
                    submission.medium_blog_url) && (
                    <div className="border-border/60 mt-3 flex flex-wrap gap-2 border-t pt-3">
                      {submission.github_url && (
                        <a
                          href={submission.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" /> GitHub
                        </a>
                      )}
                      {submission.google_doc_url && (
                        <a
                          href={submission.google_doc_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" /> Doc
                        </a>
                      )}
                      {submission.medium_blog_url && (
                        <a
                          href={submission.medium_blog_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" /> Blog
                        </a>
                      )}
                    </div>
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
        {submitTaskId && (
          <SubmissionForm
            key={submitTaskId}
            taskId={submitTaskId}
            existing={existingSubmission}
            onSuccess={() => setSubmitTaskId(null)}
          />
        )}
      </FormDialog>
    </>
  )
}
