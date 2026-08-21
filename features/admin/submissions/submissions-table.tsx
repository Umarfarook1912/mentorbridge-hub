'use client'

import { Eye, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/shared/data-display/data-table'
import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { UserAvatar } from '@/components/shared/data-display/user-avatar'
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
  feedback: string | null
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

interface GetColumnsArgs {
  onOpenReview: (row: SubmissionRow) => void
  canWrite: boolean
}

export function getSubmissionColumns({
  onOpenReview,
  canWrite,
}: GetColumnsArgs): Column<SubmissionRow>[] {
  return [
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
      className: 'w-[110px]',
      headerClassName: 'w-[110px]',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'reviewed',
      header: 'Reviewed',
      className: 'min-w-[160px] max-w-[220px]',
      headerClassName: 'min-w-[160px] max-w-[220px]',
      cell: (row) => {
        if (row.status === 'Pending' || (!row.reviewed_by_name && !row.reviewed_at)) {
          return <span className="text-muted-foreground text-sm">—</span>
        }
        return (
          <div className="min-w-0">
            {row.reviewed_by_name ? (
              <p className="truncate text-sm font-medium">{row.reviewed_by_name}</p>
            ) : null}
            {row.reviewed_at ? (
              <p className="text-muted-foreground text-xs">{formatDateTime(row.reviewed_at)}</p>
            ) : null}
            {row.feedback?.trim() ? (
              <p className="text-muted-foreground mt-0.5 truncate text-xs italic">
                “{row.feedback.trim()}”
              </p>
            ) : null}
          </div>
        )
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'w-[110px] text-right',
      headerClassName: 'w-[110px]',
      cell: (row) => {
        const isPending = row.status === 'Pending'
        if (!canWrite && isPending) return null
        const label = !canWrite || !isPending ? 'View' : 'Review'
        const Icon = !canWrite || !isPending ? Eye : MessageSquare
        return (
          <Button variant="ghost" size="sm" onClick={() => onOpenReview(row)}>
            <Icon className="mr-1.5 h-3.5 w-3.5" />
            {label}
          </Button>
        )
      },
    },
  ]
}

export function SubmissionsDataTable({
  rows,
  onOpenReview,
  canWrite,
}: {
  rows: SubmissionRow[]
  onOpenReview: (row: SubmissionRow) => void
  canWrite: boolean
}) {
  return (
    <DataTable
      data={rows}
      columns={getSubmissionColumns({ onOpenReview, canWrite })}
      keyExtractor={(r) => r.id}
      className="w-full"
      fixedLayout
    />
  )
}
