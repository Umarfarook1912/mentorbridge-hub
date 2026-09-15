'use client'

import { useState } from 'react'
import { StickyNote } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { StudentNoteCard } from './student-note-card'
import { StudentNotesFlow } from './student-notes-flow'
import { NOTE_CATEGORY_STYLES } from './student-note.constants'
import {
  useUpdateStudentNote,
  useDeleteStudentNote,
  type IStudentNote,
} from '@/services/student-notes'
import { getErrorMessage } from '@/utils/form'
import { formatDate } from '@/utils/format'
import type { StudentNoteInput } from '@/lib/validations/student-note'
import { cn } from '@/utils/cn'

interface StudentNotesListProps {
  studentId: string
  notes: IStudentNote[]
}

export function StudentNotesList({ studentId, notes }: StudentNotesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<IStudentNote | null>(null)
  const { mutateAsync: updateNote, isPending: updating } = useUpdateStudentNote(studentId)
  const { mutateAsync: deleteNote, isPending: deleting } = useDeleteStudentNote(studentId)

  async function handleUpdate(noteId: string, data: StudentNoteInput) {
    try {
      await updateNote({ noteId, data })
      toast.success('Note updated')
      setEditingId(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  async function handleDelete() {
    if (!noteToDelete) return
    try {
      await deleteNote(noteToDelete.id)
      toast.success('Note deleted')
      setNoteToDelete(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  if (!notes.length) {
    return (
      <div className="flex h-full min-h-48 items-center justify-center">
        <EmptyState
          icon={StickyNote}
          title="Start the notebook"
          description="Capture strengths, concerns, and speaking notes privately"
        />
      </div>
    )
  }

  const flowNotes = [...notes].reverse()

  return (
    <>
      <StudentNotesFlow
        notes={flowNotes}
        renderCard={(note, index) => (
          <StudentNoteCard
            note={note}
            step={index + 1}
            isLatest={index === flowNotes.length - 1}
            isEditing={editingId === note.id}
            isUpdating={updating}
            onEdit={() => setEditingId(note.id)}
            onCancelEdit={() => setEditingId(null)}
            onDelete={() => setNoteToDelete(note)}
            onUpdate={(data) => handleUpdate(note.id, data)}
          />
        )}
      />

      <ConfirmDialog
        open={!!noteToDelete}
        onOpenChange={(o) => !o && setNoteToDelete(null)}
        title="Delete note"
        description="This note will be permanently removed."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={handleDelete}
      >
        {noteToDelete ? (
          <div className="bg-muted/40 rounded-lg border px-3 py-3">
            <span
              className={cn(
                'inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
                NOTE_CATEGORY_STYLES[noteToDelete.category]
              )}
            >
              {noteToDelete.category}
            </span>
            <p className="mt-2 line-clamp-4 text-sm leading-relaxed whitespace-pre-wrap">
              {noteToDelete.body}
            </p>
            <p className="text-muted-foreground mt-2 text-xs">
              {noteToDelete.author?.full_name ?? 'Unknown'} · {formatDate(noteToDelete.created_at)}
            </p>
          </div>
        ) : null}
      </ConfirmDialog>
    </>
  )
}
