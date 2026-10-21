'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { useGetAllStudents } from '@/services/students/use-get-students'
import { localToday } from '@/utils/meeting-time'
import { earliestEnrollmentDate } from '../dashboard/enrollment-groups'
import { EnrollmentReportDocument } from './enrollment-report-document'
import { parseReportQuery, reportGroups, reportScopeLabel } from './enrollment-report-query'

export function EnrollmentReportScreen() {
  const params = useSearchParams()
  const { data: students = [], isLoading } = useGetAllStudents()
  const generatedOn = localToday()
  const fallbackFrom = earliestEnrollmentDate(students) || generatedOn
  const query = parseReportQuery(params, fallbackFrom, generatedOn)
  const groups = reportGroups(students, query)
  const printed = useRef(false)

  useEffect(() => {
    if (isLoading || printed.current) return
    printed.current = true
    const timer = window.setTimeout(() => window.print(), 600)
    return () => window.clearTimeout(timer)
  }, [isLoading])

  if (isLoading) return <LoadingSkeleton />

  return (
    <div>
      <div className="no-print bg-muted/40 flex items-center justify-between gap-3 border-b px-6 py-3">
        <p className="text-sm">
          Choose <span className="font-medium">Save as PDF</span> in the print dialog.{' '}
          {reportScopeLabel(query)} from the selected dates.
        </p>
        <Button type="button" onClick={() => window.print()}>
          <FileDown />
          Save as PDF
        </Button>
      </div>
      <EnrollmentReportDocument
        groups={groups}
        fromDate={query.from}
        toDate={query.to}
        generatedOn={generatedOn}
        scopeLabel={reportScopeLabel(query)}
      />
    </div>
  )
}
