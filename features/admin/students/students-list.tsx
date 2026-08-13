'use client'

import { useState } from 'react'
import { UserPlus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SearchBar } from '@/components/shared/forms/search-bar'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { PaginationControls } from '@/components/shared/data-display/pagination-controls'
import { StudentsTable } from './students-table'
import { StudentForm } from './student-form'
import { useGetStudents } from '@/services/students/use-get-students'
import { useDebounce } from '@/hooks/use-debounce'
import { usePagination } from '@/hooks/use-pagination'
import { useAuthStore } from '@/store/auth-store'
import { canMutate } from '@/lib/permissions'
import { DEPARTMENTS, DOMAIN_INTERESTS } from '@/lib/constants'

export function StudentsList() {
  const { user } = useAuthStore()
  const canWrite = canMutate(user)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [domainInterest, setDomainInterest] = useState('')
  const [studentCategory, setStudentCategory] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const debouncedSearch = useDebounce(search)
  const pagination = usePagination()

  const { data, isLoading } = useGetStudents({
    search: debouncedSearch,
    department: department || undefined,
    domainInterest: domainInterest || undefined,
    studentCategory: studentCategory || undefined,
    page: pagination.page,
    pageSize: pagination.pageSize,
  })

  const total = data?.total ?? 0
  const { page, totalPages, canPrev, canNext } = pagination.getState(total)
  const hasFilters = !!(search || department || domainInterest || studentCategory)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchBar
          value={search}
          onChange={(v) => {
            setSearch(v)
            pagination.reset()
          }}
          placeholder="Search by name or email…"
          className="sm:w-72"
        />
        <Select
          value={studentCategory || 'all'}
          onValueChange={(v) => {
            setStudentCategory(v === 'all' ? '' : (v ?? ''))
            pagination.reset()
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All types">
              {(value: string | null) => {
                if (!value || value === 'all') return 'All types'
                if (value === 'SSM Student') return 'SSM'
                if (value === 'Other College') return 'Non SSM'
                return value
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="SSM Student">SSM</SelectItem>
            <SelectItem value="Other College">Non SSM</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={department || 'all'}
          onValueChange={(v) => {
            setDepartment(v === 'all' ? '' : (v ?? ''))
            pagination.reset()
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All departments">
              {(value: string | null) => (!value || value === 'all' ? 'All departments' : value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={domainInterest || 'all'}
          onValueChange={(v) => {
            setDomainInterest(v === 'all' ? '' : (v ?? ''))
            pagination.reset()
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All domains">
              {(value: string | null) => (!value || value === 'all' ? 'All domains' : value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All domains</SelectItem>
            {DOMAIN_INTERESTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {canWrite ? (
          <div className="sm:ml-auto">
            <Button onClick={() => setAddOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        ) : null}
      </div>

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
