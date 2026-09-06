'use client'

import { type FieldError } from 'react-hook-form'
import { SectionPermissionsPicker } from './section-permissions-picker'
import { StudentStatusFields } from './student-status-fields'
import type { AdminSection } from '@/lib/permissions'

interface StudentFormEditExtrasProps {
  isActive: boolean
  inactiveAt: string
  roleValue: string
  sectionPermissions: AdminSection[]
  inactiveAtError?: FieldError
  sectionPermissionsError?: { message?: string }
  onIsActiveChange: (active: boolean) => void
  onInactiveAtChange: (date: string) => void
  onSectionPermissionsChange: (sections: AdminSection[]) => void
}

export function StudentFormEditExtras({
  isActive,
  inactiveAt,
  roleValue,
  sectionPermissions,
  inactiveAtError,
  sectionPermissionsError,
  onIsActiveChange,
  onInactiveAtChange,
  onSectionPermissionsChange,
}: StudentFormEditExtrasProps) {
  return (
    <>
      <StudentStatusFields
        isActive={isActive}
        inactiveAt={inactiveAt}
        onIsActiveChange={onIsActiveChange}
        onInactiveAtChange={onInactiveAtChange}
        inactiveAtError={inactiveAtError}
      />
      {roleValue === 'Executive' && (
        <SectionPermissionsPicker
          value={sectionPermissions}
          onChange={onSectionPermissionsChange}
          error={sectionPermissionsError}
        />
      )}
    </>
  )
}
