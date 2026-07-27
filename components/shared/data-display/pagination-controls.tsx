'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationControlsProps {
  page: number
  totalPages: number
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  onGoTo?: (page: number) => void
  totalItems?: number
  pageSize?: number
}

export function PaginationControls({
  page,
  totalPages,
  canPrev,
  canNext,
  onPrev,
  onNext,
  totalItems,
  pageSize,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null

  const start = pageSize ? (page - 1) * pageSize + 1 : undefined
  const end = pageSize && totalItems ? Math.min(page * pageSize, totalItems) : undefined

  return (
    <div className="flex items-center justify-between py-3">
      {totalItems !== undefined && start !== undefined && end !== undefined ? (
        <p className="text-muted-foreground text-sm">
          Showing {start}–{end} of {totalItems}
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">
          Page {page} of {totalPages}
        </p>
      )}

      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" onClick={onPrev} disabled={!canPrev}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        <Button variant="outline" size="icon" onClick={onNext} disabled={!canNext}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>
    </div>
  )
}
