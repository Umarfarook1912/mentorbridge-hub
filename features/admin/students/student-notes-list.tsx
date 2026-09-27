'use client'

import { StickyNote } from 'lucide-react'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { StudentNoteCard } from './student-note-card'
import { StudentNotesFlow } from './student-notes-flow'
import type { IStudentNote } from '@/services/student-notes'
import type { StudentNoteInput } from '@/lib/validations/student-note'

interface StudentNotesListProps {
  notes: IStudentNote[]
  editingId: string | null
  isUpdating: boolean
  onEdit: (noteId: string) => void
  onCancelEdit: () => void
  onDelete: (note: IStudentNote) => void
  onRemoveScore: (note: IStudentNote) => void
  onUpdate: (noteId: string, data: StudentNoteInput) => Promise<void>
}

export function StudentNotesList({
  notes,
  editingId,
  isUpdating,
  onEdit,
  onCancelEdit,
  onDelete,
  onRemoveScore,
  onUpdate,
}: StudentNotesListProps) {
  if (!notes.length) {
    return (
      <div className="flex h-full min-h-48 items-center justify-center">
        <EmptyState
          icon={StickyNote}
          title="Start the notebook"
          description="Capture strengths, speaking, and technical notes privately"
        />
      </div>
    )
  }

  const flowNotes = [...notes].reverse()

  return (
    <StudentNotesFlow
      notes={flowNotes}
      renderCard={(note, index) => (
        <StudentNoteCard
          note={note}
          step={index + 1}
          isLatest={index === flowNotes.length - 1}
          isEditing={editingId === note.id}
          isUpdating={isUpdating}
          onEdit={() => onEdit(note.id)}
          onCancelEdit={onCancelEdit}
          onDelete={() => onDelete(note)}
          onRemoveScore={() => onRemoveScore(note)}
          onUpdate={(data) => onUpdate(note.id, data)}
        />
      )}
    />
  )
}
