'use client'

import { useState } from 'react'
import { UserPlus } from 'lucide-react'
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
import { DEPARTMENTS } from '@/lib/constants'
import { Users } from 'lucide-react'

export function StudentsList() {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const debouncedSearch = useDebounce(search)
  const pagination = usePagination(0)

  const { data, isLoading } = useGetStudents({
    search: debouncedSearch,
    department: department || undefined,
    page: pagination.page,
    pageSize: pagination.pageSize,
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
          value={department}
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
        <div className="ml-auto">
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton variant="table" />
      ) : !data?.data.length ? (
        <EmptyState
          icon={Users}
          title="No students found"
          description={
            search ? 'Try a different search term' : 'Add your first student to get started'
          }
          action={!search ? { label: 'Add Student', onClick: () => setAddOpen(true) } : undefined}
        />
      ) : (
        <>
          <StudentsTable data={data.data} />
          <PaginationControls
            page={pagination.page}
            totalPages={Math.ceil((data.total ?? 0) / pagination.pageSize)}
            canPrev={pagination.canPrev}
            canNext={pagination.canNext}
            onPrev={() => pagination.goTo(pagination.page - 1)}
            onNext={() => pagination.goTo(pagination.page + 1)}
            totalItems={data.total}
            pageSize={pagination.pageSize}
          />
        </>
      )}

      <FormDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        title="Add Student"
        description="Enroll a new student in MentorBridge"
      >
        {addOpen && <StudentForm key="create-student" onSuccess={() => setAddOpen(false)} />}
      </FormDialog>
    </div>
  )
}
