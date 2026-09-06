'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { PaginationControls } from '@/components/shared/data-display/pagination-controls'
import { StudentsTable } from './students-table'
import { StudentForm } from './student-form'
import { StudentsListFilters } from './students-list-filters'
import { useGetStudents } from '@/services/students/use-get-students'
import { useDebounce } from '@/hooks/use-debounce'
import { usePagination } from '@/hooks/use-pagination'
import { useAuthStore } from '@/store/auth-store'
import { canMutate } from '@/lib/permissions'

export function StudentsList() {
  const { user } = useAuthStore()
  const canWrite = canMutate(user)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [domainInterest, setDomainInterest] = useState('')
  const [studentCategory, setStudentCategory] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [addOpen, setAddOpen] = useState(false)

  const debouncedSearch = useDebounce(search)
  const pagination = usePagination()

  const { data, isLoading } = useGetStudents({
    search: debouncedSearch,
    department: department || undefined,
    domainInterest: domainInterest || undefined,
    studentCategory: studentCategory || undefined,
    isActive: isActiveFilter === 'all' ? undefined : isActiveFilter === 'active',
    page: pagination.page,
    pageSize: pagination.pageSize,
  })

  const total = data?.total ?? 0
  const { page, totalPages, canPrev, canNext } = pagination.getState(total)
  const hasFilters = !!(
    search ||
    department ||
    domainInterest ||
    studentCategory ||
    isActiveFilter !== 'all'
  )

  function resetPage() {
    pagination.reset()
  }

  return (
    <div className="space-y-4">
      <StudentsListFilters
        search={search}
        studentCategory={studentCategory}
        isActiveFilter={isActiveFilter}
        department={department}
        domainInterest={domainInterest}
        canWrite={canWrite}
        onSearchChange={(v) => {
          setSearch(v)
          resetPage()
        }}
        onStudentCategoryChange={(v) => {
          setStudentCategory(v)
          resetPage()
        }}
        onIsActiveFilterChange={(v) => {
          setIsActiveFilter(v)
          resetPage()
        }}
        onDepartmentChange={(v) => {
          setDepartment(v)
          resetPage()
        }}
        onDomainInterestChange={(v) => {
          setDomainInterest(v)
          resetPage()
        }}
        onAddClick={() => setAddOpen(true)}
      />

      {isLoading ? (
        <LoadingSkeleton />
      ) : !data?.data.length ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description={
            hasFilters
              ? 'Try a different search or filter'
              : 'Add your first student to get started'
          }
          action={
            !hasFilters && canWrite
              ? { label: 'Add Student', onClick: () => setAddOpen(true) }
              : undefined
          }
        />
      ) : (
        <>
          <StudentsTable data={data.data} readOnly={!canWrite} />
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

      {canWrite ? (
        <FormDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          title="Add Student"
          description="Enroll a new student in MentorBridge"
        >
          {addOpen && <StudentForm key="create-student" onSuccess={() => setAddOpen(false)} />}
        </FormDialog>
      ) : null}
    </div>
  )
}
