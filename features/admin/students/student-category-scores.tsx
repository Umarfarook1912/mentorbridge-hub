'use client'

import { STUDENT_NOTE_CATEGORIES, type StudentNoteCategory } from '@/lib/validations/student-note'
import type { IStudentNote } from '@/services/student-notes'
import { NOTE_CATEGORY_BAR, NOTE_CATEGORY_STYLES } from './student-note.constants'
import { cn } from '@/utils/cn'

function categoryTotals(notes: IStudentNote[]) {
  const totals = Object.fromEntries(
    STUDENT_NOTE_CATEGORIES.map((category) => [category, 0])
  ) as Record<StudentNoteCategory, number>

  for (const note of notes) {
    if (note.percentage == null || !(note.category in totals)) continue
    totals[note.category] += note.percentage
  }

  return totals
}

interface StudentCategoryScoresProps {
  notes: IStudentNote[]
}

/** Running total percent for each category. */
export function StudentCategoryScores({ notes }: StudentCategoryScoresProps) {
  const totals = categoryTotals(notes)
  const overall = STUDENT_NOTE_CATEGORIES.reduce((sum, category) => sum + totals[category], 0)

  return (
    <aside className="bg-muted/30 w-full shrink-0 border-b px-5 py-4 md:w-72 md:overflow-y-auto md:border-b-0 md:border-l">
      <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        Category scores
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{overall}%</p>
      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
        Totals add up for this student.
      </p>

      <ul className="mt-4 space-y-3">
        {STUDENT_NOTE_CATEGORIES.map((category) => {
          const total = totals[category]
          return (
            <li key={category}>
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase',
                    NOTE_CATEGORY_STYLES[category]
                  )}
                >
                  {category}
                </span>
                <span className="text-sm font-semibold tabular-nums">{total}%</span>
              </div>
              <div className="bg-muted mt-1.5 h-1.5 overflow-hidden rounded-full">
                <div
                  className={cn('h-full rounded-full', NOTE_CATEGORY_BAR[category])}
                  style={{ width: `${Math.min(total, 100)}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
