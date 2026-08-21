import { formatDateTime } from '@/utils/format'
import type { SubmissionStatus } from '@/types/supabase.types'

interface SubmissionReviewMetaProps {
  status: SubmissionStatus
  reviewedByName?: string | null
  reviewedAt?: string | null
  /** Compact single-line for tight spaces; default is stacked. */
  compact?: boolean
}

export function SubmissionReviewMeta({
  status,
  reviewedByName,
  reviewedAt,
  compact = false,
}: SubmissionReviewMetaProps) {
  if (status === 'Pending' || (!reviewedByName && !reviewedAt)) return null

  const verb = status === 'Rejected' ? 'Rejected' : 'Approved'

  if (compact) {
    return (
      <p className="text-muted-foreground text-xs">
        {reviewedByName ? `${verb} by ${reviewedByName}` : verb}
        {reviewedAt ? ` · ${formatDateTime(reviewedAt)}` : ''}
      </p>
    )
  }

  return (
    <div className="text-muted-foreground space-y-0.5 text-xs">
      <p>
        {verb} by {reviewedByName ?? '—'}
      </p>
      {reviewedAt ? <p>{formatDateTime(reviewedAt)}</p> : null}
    </div>
  )
}
