'use client'

import { cn } from '@/utils/cn'

export interface FilterPillOption<T extends string = string> {
  value: T
  label: string
}

interface FilterPillsProps<T extends string = string> {
  options: FilterPillOption<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
  'aria-label'?: string
}

export function FilterPills<T extends string = string>({
  options,
  value,
  onChange,
  className,
  'aria-label': ariaLabel = 'Filter options',
}: FilterPillsProps<T>) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)} role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full border px-3.5 py-1 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground hover:text-foreground hover:border-foreground/30 border-border'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
