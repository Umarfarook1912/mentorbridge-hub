import { formatDateTime } from '@/utils/format'
import type { SubmissionStatus } from '@/types/supabase.types'

interface SubmissionReviewMetaProps {
  status: SubmissionStatus
  reviewedByName?: string | null
  reviewedAt?: string | null
}

export function SubmissionReviewMeta({
  status,
  reviewedByName,
  reviewedAt,
}: SubmissionReviewMetaProps) {
  if (status === 'Pending' || (!reviewedByName && !reviewedAt)) return null

  const action = status === 'Rejected' ? 'Rejected' : 'Approved'

  return (
    <p className="text-muted-foreground text-xs">
      {reviewedByName ? `${action} by ${reviewedByName}` : action}
      {reviewedAt ? ` · ${formatDateTime(reviewedAt)}` : ''}
    </p>
  )
}
