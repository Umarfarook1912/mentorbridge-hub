import { Suspense } from 'react'
import type { Metadata } from 'next'
import { EnrollmentReportScreen } from '@/features/admin/reports/enrollment-report-screen'

export const metadata: Metadata = { title: 'Enrollment Report' }

export default function EnrollmentReportPage() {
  return (
    <Suspense fallback={null}>
      <EnrollmentReportScreen />
    </Suspense>
  )
}
