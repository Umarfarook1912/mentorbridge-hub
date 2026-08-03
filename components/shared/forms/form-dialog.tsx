'use client'

import { type ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/utils/cn'

interface FormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
}

const maxWidthClasses = {
  sm: 'max-w-sm sm:max-w-sm',
  md: 'max-w-md sm:max-w-md',
  lg: 'max-w-lg sm:max-w-lg',
  xl: 'max-w-xl sm:max-w-xl',
  '2xl': 'max-w-2xl sm:max-w-2xl',
  '3xl': 'max-w-3xl sm:max-w-3xl',
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = 'md',
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          maxWidthClasses[maxWidth],
          'flex max-h-[min(90vh,900px)] flex-col gap-0 overflow-hidden p-0'
        )}
      >
        <DialogHeader className="shrink-0 border-b px-5 pt-5 pr-12 pb-3">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
