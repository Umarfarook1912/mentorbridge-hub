'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StudentNoteForm } from './student-note-form'
import { NOTE_CATEGORY_ACCENT, NOTE_CATEGORY_STYLES } from './student-note.constants'
import type { IStudentNote } from '@/services/student-notes'
import { formatDate } from '@/utils/format'
import type { StudentNoteInput } from '@/lib/validations/student-note'
import { cn } from '@/utils/cn'

interface StudentNoteCardProps {
  note: IStudentNote
  step?: number
  isLatest: boolean
  isEditing: boolean
  isUpdating: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
  onUpdate: (data: StudentNoteInput) => Promise<void>
}

export function StudentNoteCard({
  note,
  step,
  isLatest,
  isEditing,
  isUpdating,
  onEdit,
  onCancelEdit,
  onDelete,
  onUpdate,
}: StudentNoteCardProps) {
  return (
    <div
      className={cn(
        'group bg-card relative h-full rounded-xl border border-l-4 p-4 transition-colors',
        NOTE_CATEGORY_ACCENT[note.category],
        isLatest && 'border-primary bg-primary/5'
      )}
    >
      {isLatest ? (
        <span className="bg-primary text-primary-foreground absolute -top-2.5 right-3 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
          Growing
        </span>
      ) : null}

      {isEditing ? (
        <StudentNoteForm
          key={note.id}
          initial={{ body: note.body, category: note.category }}
          submitLabel="Save"
          isLoading={isUpdating}
          onSubmit={onUpdate}
          onCancel={onCancelEdit}
        />
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {step != null ? (
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                    isLatest
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {step}
                </span>
              ) : null}
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
                  NOTE_CATEGORY_STYLES[note.category]
                )}
              >
                {note.category}
              </span>
            </div>
            <div className="flex gap-0.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={onEdit}
                aria-label="Edit note"
              >
                <Pencil className="size-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:text-destructive"
                onClick={onDelete}
                aria-label="Delete note"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{note.body}</p>
          <p className="text-muted-foreground text-xs">
            {note.author?.full_name ?? 'Unknown'} · {formatDate(note.created_at)}
            {note.updated_at !== note.created_at ? ' · edited' : ''}
          </p>
        </div>
      )}
    </div>
  )
}
