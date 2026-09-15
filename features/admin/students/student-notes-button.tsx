'use client'

import { StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface StudentNotesButtonProps {
  studentName: string
  onClick: () => void
}

export function StudentNotesButton({ studentName, onClick }: StudentNotesButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-primary hover:bg-primary/10 hover:text-primary"
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
              aria-label={`Notes for ${studentName}`}
            >
              <StickyNote className="size-3.5" />
            </Button>
          }
        />
        <TooltipContent>Private notes</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
