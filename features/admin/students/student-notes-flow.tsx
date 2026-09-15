'use client'

import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import type { IStudentNote } from '@/services/student-notes'

const COLS = 3

function chunkRows(notes: IStudentNote[], cols: number) {
  const rows: IStudentNote[][] = []
  for (let i = 0; i < notes.length; i += cols) {
    rows.push(notes.slice(i, i + cols))
  }
  return rows
}

interface StudentNotesFlowProps {
  notes: IStudentNote[]
  renderCard: (note: IStudentNote, index: number) => ReactNode
}

/** Zigzag flow map: L→R, wrap, then R→L, repeating. */
export function StudentNotesFlow({ notes, renderCard }: StudentNotesFlowProps) {
  const rows = chunkRows(notes, COLS)

  return (
    <>
      <ol className="flex flex-col gap-4 md:hidden">
        {notes.map((note, index) => (
          <li key={note.id}>{renderCard(note, index)}</li>
        ))}
      </ol>

      <div className="hidden space-y-2 md:block">
        {rows.map((row, rowIndex) => {
          const rtl = rowIndex % 2 === 1
          const isLastRow = rowIndex === rows.length - 1
          // Trailing edge of this row (where the path wraps down)
          const wrapSide = rtl ? 'start' : 'end'

          return (
            <div key={rowIndex}>
              <div className={cn('flex items-stretch', rtl ? 'flex-row-reverse' : 'flex-row')}>
                {row.map((note, colIndex) => {
                  const globalIndex = rowIndex * COLS + colIndex
                  const showArrow = colIndex < row.length - 1

                  return (
                    <div
                      key={note.id}
                      className="flex min-w-0 items-center"
                      style={{ flex: `0 0 ${100 / COLS}%`, maxWidth: `${100 / COLS}%` }}
                    >
                      {showArrow && rtl ? <FlowArrow flip /> : null}
                      <div className="min-w-0 flex-1 px-1.5">{renderCard(note, globalIndex)}</div>
                      {showArrow && !rtl ? <FlowArrow /> : null}
                    </div>
                  )
                })}
              </div>

              {!isLastRow ? (
                <div
                  className={cn(
                    'flex h-8',
                    wrapSide === 'end' ? 'justify-end' : 'justify-start'
                  )}
                  aria-hidden
                >
                  <div
                    className="flex justify-center"
                    style={{ width: `${100 / COLS}%` }}
                  >
                    <span className="bg-border h-full w-0.5 rounded-full" />
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </>
  )
}

function FlowArrow({ flip = false }: { flip?: boolean }) {
  return (
    <div
      className={cn('text-muted-foreground flex w-5 shrink-0 items-center justify-center', flip && 'rotate-180')}
      aria-hidden
    >
      <span className="bg-border h-0.5 flex-1 rounded-full" />
      <span className="border-muted-foreground/50 -ml-0.5 size-1.5 rotate-45 border-t border-r" />
    </div>
  )
}
