'use client'

import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { UserAvatar } from '@/components/shared/data-display/user-avatar'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { StudentNoteForm } from './student-note-form'
import { StudentNotesList } from './student-notes-list'
import { StudentCategoryScores } from './student-category-scores'
import { StudentNoteDialogs } from './student-note-dialogs'
import { useStudentNoteActions } from './use-student-note-actions'
import { useGetStudentNotes, useCreateStudentNote } from '@/services/student-notes'
import type { IStudentEntity } from '@/services/students'
import { getErrorMessage } from '@/utils/form'
import type { StudentNoteInput } from '@/lib/validations/student-note'
import { cn } from '@/utils/cn'

interface StudentNotesSheetProps {
  student: IStudentEntity | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentNotesSheet({ student, open, onOpenChange }: StudentNotesSheetProps) {
  const studentId = student?.id ?? null
  const { data: notes = [], isLoading } = useGetStudentNotes(open ? studentId : null)
  const { mutateAsync: createNote, isPending: creating } = useCreateStudentNote(studentId ?? '')
  const actions = useStudentNoteActions(studentId ?? '')

  async function handleCreate(data: StudentNoteInput) {
    if (!studentId) return
    try {
      await createNote(data)
      toast.success('Note added')
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={cn(
          'flex w-full flex-col gap-0 p-0',
          'data-[side=right]:w-[min(1152px,80vw)] data-[side=right]:max-w-none data-[side=right]:sm:max-w-none'
        )}
      >
        <SheetHeader className="shrink-0 border-b px-6 py-5 pr-14 text-left">
          {student ? (
            <div className="flex items-center gap-3">
              <UserAvatar name={student.full_name} avatarUrl={student.avatar_url} size="md" />
              <div className="min-w-0 flex-1">
                <SheetTitle className="truncate text-lg">{student.full_name}</SheetTitle>
                <SheetDescription className="truncate text-sm">{student.email}</SheetDescription>
              </div>
              <span className="text-muted-foreground shrink-0 text-sm tabular-nums">
                {isLoading ? '…' : `${notes.length} notes`}
              </span>
            </div>
          ) : (
            <SheetTitle>Notes</SheetTitle>
          )}
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <div className="bg-muted/20 scrollbar-hide order-2 min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 md:order-1">
            {isLoading ? (
              <LoadingSkeleton />
            ) : studentId ? (
              <StudentNotesList
                notes={notes}
                editingId={actions.editingId}
                isUpdating={actions.updating}
                onEdit={actions.editNote}
                onCancelEdit={() => actions.setEditingId(null)}
                onDelete={actions.setNoteToDelete}
                onRemoveScore={actions.setScoreToRemove}
                onUpdate={actions.handleUpdate}
              />
            ) : null}
          </div>
          {studentId ? (
            <div className="order-1 md:order-2 md:min-h-0">
              <StudentCategoryScores notes={isLoading ? [] : notes} />
            </div>
          ) : null}
        </div>

        <div className="bg-background shrink-0 border-t px-6 py-4">
          {studentId ? (
            <StudentNoteForm isLoading={creating} onSubmit={handleCreate} />
          ) : null}
        </div>
      </SheetContent>
      <StudentNoteDialogs
        noteToDelete={actions.noteToDelete}
        scoreToRemove={actions.scoreToRemove}
        deleting={actions.deleting}
        removing={actions.updating}
        onDeleteOpenChange={(open) => !open && actions.setNoteToDelete(null)}
        onScoreOpenChange={(open) => !open && actions.setScoreToRemove(null)}
        onConfirmDelete={actions.handleDelete}
        onConfirmRemoveScore={actions.handleRemoveScore}
      />
    </Sheet>
  )
}
