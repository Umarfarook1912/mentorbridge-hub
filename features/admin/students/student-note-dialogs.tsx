'use client'

import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { NOTE_CATEGORY_STYLES } from './student-note.constants'
import type { IStudentNote } from '@/services/student-notes'
import { formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'

function NotePreview({ note }: { note: IStudentNote }) {
  return (
    <div className="bg-muted/40 rounded-lg border px-3 py-3">
      <span
        className={cn(
          'inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
          NOTE_CATEGORY_STYLES[note.category]
        )}
      >
        {note.category}
        {note.percentage != null ? ` · +${note.percentage}%` : ''}
      </span>
      <p className="mt-2 line-clamp-4 text-sm leading-relaxed whitespace-pre-wrap">{note.body}</p>
      <p className="text-muted-foreground mt-2 text-xs">
        {note.author?.full_name ?? 'Unknown'} · {formatDate(note.created_at)}
      </p>
    </div>
  )
}

interface StudentNoteDialogsProps {
  noteToDelete: IStudentNote | null
  scoreToRemove: IStudentNote | null
  deleting: boolean
  removing: boolean
  onDeleteOpenChange: (open: boolean) => void
  onScoreOpenChange: (open: boolean) => void
  onConfirmDelete: () => void
  onConfirmRemoveScore: () => void
}

export function StudentNoteDialogs({
  noteToDelete,
  scoreToRemove,
  deleting,
  removing,
  onDeleteOpenChange,
  onScoreOpenChange,
  onConfirmDelete,
  onConfirmRemoveScore,
}: StudentNoteDialogsProps) {
  return (
    <>
      <ConfirmDialog
        open={!!noteToDelete}
        onOpenChange={onDeleteOpenChange}
        title="Delete note"
        description="This note and its score will be removed from the category total."
        confirmLabel="Delete"
        variant="destructive"
        loading={deleting}
        onConfirm={onConfirmDelete}
      >
        {noteToDelete ? <NotePreview note={noteToDelete} /> : null}
      </ConfirmDialog>

      <ConfirmDialog
        open={!!scoreToRemove}
        onOpenChange={onScoreOpenChange}
        title="Remove score"
        description="This percent comes off the category total. The note stays."
        confirmLabel="Remove score"
        variant="destructive"
        loading={removing}
        onConfirm={onConfirmRemoveScore}
      >
        {scoreToRemove ? <NotePreview note={scoreToRemove} /> : null}
      </ConfirmDialog>
    </>
  )
}
