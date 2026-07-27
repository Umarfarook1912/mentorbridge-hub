import type { Metadata } from 'next'
import { PageHeader } from '@/components/shared/layout/page-header'
import { SubmissionsDashboard } from '@/features/admin/submissions/submissions-dashboard'

export const metadata: Metadata = { title: 'Submissions' }

export default function SubmissionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Submissions"
        description="Review student task submissions and provide feedback"
      />
      <SubmissionsDashboard />
    </div>
  )
}
