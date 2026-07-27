'use client'

import { useState } from 'react'
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable, type Column } from '@/components/shared/data-display/data-table'
import { UserAvatar } from '@/components/shared/data-display/user-avatar'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { StudentForm } from './student-form'
import { useDeleteStudent } from '@/services/students/use-delete-student'
import type { IStudentEntity } from '@/services/students'
import { formatDate } from '@/utils/format'

interface StudentsTableProps {
  data: IStudentEntity[]
}

export function StudentsTable({ data }: StudentsTableProps) {
  const [editStudent, setEditStudent] = useState<IStudentEntity | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { mutateAsync: deleteStudent, isPending } = useDeleteStudent()

  async function handleDelete() {
    if (!deleteId) return
    try {
      await deleteStudent(deleteId)
      toast.success('Student removed')
      setDeleteId(null)
    } catch {
      toast.error('Failed to remove student')
    }
  }

  const columns: Column<IStudentEntity>[] = [
    {
      key: 'name',
      header: 'Student',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={row.full_name} avatarUrl={row.avatar_url} size="sm" />
          <div>
            <p className="text-sm font-medium">{row.full_name}</p>
            <p className="text-muted-foreground text-xs">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      cell: (row) => <span className="text-sm">{row.department ?? '—'}</span>,
    },
    {
      key: 'domainInterest',
      header: 'Domain Interest',
      cell: (row) => <span className="text-sm">{row.domain_interest ?? '—'}</span>,
    },
    {
      key: 'phone',
      header: 'Phone',
      cell: (row) => <span className="text-muted-foreground text-sm">{row.phone ?? '—'}</span>,
    },
    {
      key: 'joined',
      header: 'Joined',
      cell: (row) => (
        <span className="text-muted-foreground text-sm">{formatDate(row.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-12',
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger className="hover:bg-muted inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md outline-none">
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditStudent(row)}>
              <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeleteId(row.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <>
      <DataTable data={data} columns={columns} keyExtractor={(r) => r.id} />

      <FormDialog
        open={!!editStudent}
        onOpenChange={(o) => !o && setEditStudent(null)}
        title="Edit Student"
        description="Update student information"
      >
        {editStudent && (
          <StudentForm
            key={editStudent.id}
            student={editStudent}
            onSuccess={() => setEditStudent(null)}
          />
        )}
      </FormDialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
        title="Remove Student"
        description="This will permanently delete the student and all their data. This action cannot be undone."
        confirmLabel="Remove"
        variant="destructive"
        loading={isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
