import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { ReportsTabs } from '@/features/admin/reports/reports-tabs'

export const metadata: Metadata = { title: 'Reports' }

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Analyse attendance patterns and task completion rates"
      />
      <ReportsTabs />
    </div>
  )
}
