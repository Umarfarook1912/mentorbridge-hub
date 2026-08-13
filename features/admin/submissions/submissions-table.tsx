'use client'

import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/shared/data-display/data-table'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { UserAvatar } from '@/components/shared/data-display/user-avatar'
import { SubmissionReviewMeta } from '@/components/shared/data-display/submission-review-meta'
import { SubmissionLinkIcons } from '@/components/shared/data-display/submission-link-icons'
import { formatDateTime } from '@/utils/format'
import type { SubmissionStatus } from '@/types/supabase.types'

export type SubmissionRow = {
  id: string
  student_id: string
  github_url: string | null
  google_doc_url: string | null
  medium_blog_url: string | null
  other_url: string | null
  submitted_at: string
  status: SubmissionStatus
  reviewed_by_name: string | null
  reviewed_at: string | null
  profiles: {
    full_name: string
    email: string
    department: string | null
    domain_interest: string | null
    avatar_url: string | null
  } | null
}

export function getSubmissionColumns(onReview?: (id: string) => void): Column<SubmissionRow>[] {
  const columns: Column<SubmissionRow>[] = [
    {
      key: 'student',
      header: 'Student',
      className: 'min-w-[200px] max-w-[280px]',
      headerClassName: 'min-w-[200px] max-w-[280px]',
      cell: (row) => {
        const profile = row.profiles
        return (
          <div className="flex items-center gap-2">
            <UserAvatar name={profile?.full_name ?? ''} avatarUrl={profile?.avatar_url} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{profile?.full_name}</p>
              <p className="text-muted-foreground truncate text-xs">
                {profile?.domain_interest ?? profile?.department ?? profile?.email}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'links',
      header: 'Links',
      className: 'w-[120px]',
      headerClassName: 'w-[120px]',
      cell: (row) => (
        <SubmissionLinkIcons
          githubUrl={row.github_url}
          googleDocUrl={row.google_doc_url}
          mediumBlogUrl={row.medium_blog_url}
          otherUrl={row.other_url}
        />
      ),
    },
    {
      key: 'submitted',
      header: 'Submitted',
      className: 'w-[160px]',
      headerClassName: 'w-[160px]',
      cell: (row) => (
        <span className="text-muted-foreground text-sm">{formatDateTime(row.submitted_at)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-[140px]',
      headerClassName: 'w-[140px]',
      cell: (row) => (
        <div className="space-y-1">
          <StatusBadge status={row.status} />
          <SubmissionReviewMeta
            status={row.status}
            reviewedByName={row.reviewed_by_name}
            reviewedAt={row.reviewed_at}
          />
        </div>
      ),
    },
  ]

  if (onReview) {
    columns.push({
      key: 'actions',
      header: '',
      className: 'w-[110px] text-right',
      headerClassName: 'w-[110px]',
      cell: (row) => (
        <Button variant="ghost" size="sm" onClick={() => onReview(row.id)}>
          <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
          Review
        </Button>
      ),
    })
  }

  return columns
}

export function SubmissionsDataTable({
  rows,
  onReview,
}: {
  rows: SubmissionRow[]
  onReview?: (id: string) => void
}) {
  return (
    <DataTable
      data={rows}
      columns={getSubmissionColumns(onReview)}
      keyExtractor={(r) => r.id}
      className="w-full"
      fixedLayout
    />
  )
}
