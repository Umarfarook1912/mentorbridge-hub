import { StatusBadge } from '@/components/shared/data-display/status-badge'
import { getEnrollmentStatus, type EnrollmentFields } from '@/lib/enrollment'
import { formatDate } from '@/utils/format'

interface EnrollmentStatusLabelProps extends EnrollmentFields {
  inactiveAt?: string | null
  companyRole?: string | null
  companyLocation?: string | null
  companyJoinedAt?: string | null
}

export function EnrollmentStatusLabel({
  is_active,
  inactiveAt,
  company_name,
  companyRole,
  companyLocation,
  companyJoinedAt,
}: EnrollmentStatusLabelProps) {
  const status = getEnrollmentStatus({ is_active, company_name })
  const badge = status === 'company' ? 'Company' : status === 'inactive' ? 'Inactive' : 'Active'
  const companyLine = [
    company_name,
    companyRole,
    companyLocation,
    companyJoinedAt ? formatDate(companyJoinedAt) : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="space-y-0.5">
      <StatusBadge status={badge} />
      {status === 'inactive' && inactiveAt ? (
        <p className="text-muted-foreground text-xs">{formatDate(inactiveAt)}</p>
      ) : null}
      {status === 'company' && companyLine ? (
        <p className="text-muted-foreground text-xs">{companyLine}</p>
      ) : null}
    </div>
  )
}
