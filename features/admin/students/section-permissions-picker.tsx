'use client'

import { ADMIN_SECTIONS, ADMIN_SECTION_LABELS, type AdminSection } from '@/lib/permissions'
import { cn } from '@/utils/cn'

interface SectionPermissionsPickerProps {
  value: AdminSection[]
  onChange: (sections: AdminSection[]) => void
  error?: { message?: string }
}

export function SectionPermissionsPicker({
  value,
  onChange,
  error,
}: SectionPermissionsPickerProps) {
  function toggle(section: AdminSection) {
    if (value.includes(section)) {
      onChange(value.filter((s) => s !== section))
    } else {
      onChange([...value, section])
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        Section access <span className="text-destructive">*</span>
      </p>
      <p className="text-muted-foreground text-xs">
        Choose which admin areas this Associate can open.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {ADMIN_SECTIONS.map((section) => {
          const checked = value.includes(section)
          return (
            <label
              key={section}
              className={cn(
                'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm',
                checked ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'
              )}
            >
              <input
                type="checkbox"
                className="accent-primary size-4"
                checked={checked}
                onChange={() => toggle(section)}
              />
              {ADMIN_SECTION_LABELS[section]}
            </label>
          )
        })}
      </div>
      {error?.message ? <p className="text-destructive text-xs">{error.message}</p> : null}
    </div>
  )
}
