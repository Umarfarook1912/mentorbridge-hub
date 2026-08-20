'use client'

import { useMemo, useState } from 'react'
import { ClipboardList } from 'lucide-react'
import { FilterPills } from '@/components/shared/forms/filter-pills'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { PaginationControls } from '@/components/shared/data-display/pagination-controls'
import { FeedbackDialog } from './feedback-dialog'
import { SubmissionsFilters } from './submissions-filters'
import { SubmissionsDataTable, type SubmissionRow } from './submissions-table'
import { UnsubmittedStudentsList } from './unsubmitted-students-list'
import { useGetSubmissions } from '@/services/submissions/use-get-submissions'
import { useGetAllStudents } from '@/services/students/use-get-students'
import { usePagination } from '@/hooks/use-pagination'
import { isAudienceForStudent } from '@/utils/meeting-audience'
import type { SubmissionStatus } from '@/types/supabase.types'
import { useAuthStore } from '@/store/auth-store'
import { canMutate } from '@/lib/permissions'

interface TaskSubmissionsPanelProps {
  taskId: string
  targetDomains?: string[] | null
  targetStudentIds?: string[] | null
}

type SubmissionsTab = 'submitted' | 'missing'

export function TaskSubmissionsPanel({
  taskId,
  targetDomains,
  targetStudentIds,
}: TaskSubmissionsPanelProps) {
  const { user } = useAuthStore()
  const canWrite = canMutate(user)
  const [tab, setTab] = useState<SubmissionsTab>('submitted')
  const [statusFilter, setStatusFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [domainFilter, setDomainFilter] = useState('')
  const [feedbackId, setFeedbackId] = useState<string | null>(null)
  const pagination = usePagination()

  const { data: allSubmissions = [], isLoading: loadingAll } = useGetSubmissions({ taskId })
  const { data: submissions = [], isLoading } = useGetSubmissions({
    taskId,
    status: (statusFilter as SubmissionStatus) || undefined,
    department: departmentFilter || undefined,
    domainInterest: domainFilter || undefined,
  })
  const { data: students = [], isLoading: loadingStudents } = useGetAllStudents()

  const unsubmitted = useMemo(() => {
    const submittedIds = new Set(allSubmissions.map((s) => s.student_id))
    return students
      .filter((s) =>
        isAudienceForStudent(
          { targetDomains, targetStudentIds },
          { id: s.id, domainInterest: s.domain_interest }
        )
      )
      .filter((s) => !submittedIds.has(s.id))
      .filter((s) => !departmentFilter || s.department === departmentFilter)
      .filter((s) => !domainFilter || s.domain_interest === domainFilter)
      .map((s) => ({
        id: s.id,
        full_name: s.full_name,
        email: s.email,
        department: s.department,
        domain_interest: s.domain_interest,
        avatar_url: s.avatar_url,
      }))
  }, [allSubmissions, students, targetDomains, targetStudentIds, departmentFilter, domainFilter])

  const total = submissions.length
  const { page, totalPages, canPrev, canNext } = pagination.getState(total)
  const pageRows = pagination.paginate(submissions as SubmissionRow[])

  return (
    <div className="flex w-full flex-col gap-5">
      <FilterPills
        aria-label="Submission status"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'submitted', label: `Submitted (${total})` },
          { value: 'missing', label: `Not submitted (${unsubmitted.length})` },
        ]}
      />

      <SubmissionsFilters
        statusFilter={statusFilter}
        departmentFilter={departmentFilter}
        domainFilter={domainFilter}
        total={total}
        onStatusChange={(v) => {
          setStatusFilter(v)
          pagination.reset()
        }}
        onDepartmentChange={(v) => {
          setDepartmentFilter(v)
          pagination.reset()
        }}
        onDomainChange={(v) => {
          setDomainFilter(v)
          pagination.reset()
        }}
      />

      {tab === 'submitted' ? (
        <div className="w-full space-y-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : !submissions.length ? (
            <EmptyState
              icon={ClipboardList}
              title="No submissions for this task"
              description="Submissions will appear here once students submit their work"
            />
          ) : (
            <>
              <SubmissionsDataTable
                rows={pageRows}
                onReview={canWrite ? setFeedbackId : undefined}
              />
              <PaginationControls
                page={page}
                totalPages={totalPages}
                canPrev={canPrev}
                canNext={canNext}
                onPrev={() => pagination.goTo(page - 1, total)}
                onNext={() => pagination.goTo(page + 1, total)}
                totalItems={total}
                pageSize={pagination.pageSize}
                onPageSizeChange={pagination.setPageSize}
              />
            </>
          )}
        </div>
      ) : (
        <UnsubmittedStudentsList
          students={unsubmitted}
          isLoading={loadingAll || loadingStudents}
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
