'use client'

import { useState } from 'react'
import { ExternalLink, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable, type Column } from '@/components/shared/data-display/data-table'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { UserAvatar } from '@/components/shared/data-display/user-avatar'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { FeedbackDialog } from './feedback-dialog'
import { useGetSubmissions } from '@/services/submissions/use-get-submissions'
import { DEPARTMENTS } from '@/lib/constants'
import { formatDate } from '@/utils/format'
import { ClipboardList } from 'lucide-react'
import type { SubmissionStatus } from '@/types/supabase.types'

type SubmissionRow = {
  id: string
  task_id: string
  student_id: string
  github_url: string | null
  google_doc_url: string | null
  medium_blog_url: string | null
  remarks: string | null
  feedback: string | null
  submitted_at: string
  status: SubmissionStatus
  tasks: { title: string; due_date: string } | null
  profiles: {
    full_name: string
    email: string
    department: string | null
    avatar_url: string | null
  } | null
}

export function SubmissionsDashboard() {
  const [statusFilter, setStatusFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [feedbackId, setFeedbackId] = useState<string | null>(null)

  const { data: submissions = [], isLoading } = useGetSubmissions({
    status: (statusFilter as SubmissionStatus) || undefined,
    department: departmentFilter || undefined,
  })

  const columns: Column<SubmissionRow>[] = [
    {
      key: 'student',
      header: 'Student',
      cell: (row) => {
        const profile = row.profiles as SubmissionRow['profiles']
        return (
          <div className="flex items-center gap-2">
            <UserAvatar name={profile?.full_name ?? ''} avatarUrl={profile?.avatar_url} size="sm" />
            <div>
              <p className="text-sm font-medium">{profile?.full_name}</p>
              <p className="text-muted-foreground text-xs">
                {profile?.department ?? profile?.email}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'task',
      header: 'Task',
      cell: (row) => {
        const task = row.tasks as SubmissionRow['tasks']
        return <span className="text-sm font-medium">{task?.title ?? '—'}</span>
      },
    },
    {
      key: 'links',
      header: 'Links',
      cell: (row) => (
        <div className="flex items-center gap-1">
          {row.github_url && (
            <a
              href={row.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:bg-muted rounded p-1"
              title="GitHub"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {row.google_doc_url && (
            <a
              href={row.google_doc_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:bg-muted rounded p-1"
              title="Google Doc"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          {row.medium_blog_url && (
            <a
              href={row.medium_blog_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:bg-muted rounded p-1"
              title="Medium"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'submitted',
      header: 'Submitted',
      cell: (row) => (
        <span className="text-muted-foreground text-sm">{formatDate(row.submitted_at)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'actions',
      header: '',
      cell: (row) => (
        <Button variant="ghost" size="sm" onClick={() => setFeedbackId(row.id)}>
          <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
          Review
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v === 'all' ? '' : (v ?? ''))}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={departmentFilter}
          onValueChange={(v) => setDepartmentFilter(v === 'all' ? '' : (v ?? ''))}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className="text-muted-foreground ml-auto text-sm">{submissions.length} submissions</p>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="table" />
      ) : !submissions.length ? (
        <EmptyState
          icon={ClipboardList}
          title="No submissions found"
          description="Submissions will appear here once students submit their work"
        />
      ) : (
        <DataTable
          data={submissions as SubmissionRow[]}
          columns={columns}
          keyExtractor={(r) => r.id}
        />
      )}

      <FeedbackDialog
        submissionId={feedbackId}
        open={!!feedbackId}
        onOpenChange={(o) => {
          if (!o) setFeedbackId(null)
        }}
      />
    </div>
  )
}
