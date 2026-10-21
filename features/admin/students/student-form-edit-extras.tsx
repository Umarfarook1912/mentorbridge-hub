'use client'

import { type FieldError } from 'react-hook-form'
import { SectionPermissionsPicker } from './section-permissions-picker'
import { StudentStatusFields } from './student-status-fields'
import type { EnrollmentStatus } from '@/lib/enrollment'
import type { AdminSection } from '@/lib/permissions'

interface StudentFormEditExtrasProps {
  status: EnrollmentStatus
  inactiveAt: string
  companyName: string
  companyRole: string
  companyLocation: string
  companyJoinedAt: string
  roleValue: string
  sectionPermissions: AdminSection[]
  inactiveAtError?: FieldError
  companyNameError?: FieldError
  companyRoleError?: FieldError
  companyLocationError?: FieldError
  companyJoinedAtError?: FieldError
  sectionPermissionsError?: { message?: string }
  onStatusChange: (status: EnrollmentStatus) => void
  onInactiveAtChange: (date: string) => void
  onCompanyNameChange: (value: string) => void
  onCompanyRoleChange: (value: string) => void
  onCompanyLocationChange: (value: string) => void
  onCompanyJoinedAtChange: (date: string) => void
  onSectionPermissionsChange: (sections: AdminSection[]) => void
}

export function StudentFormEditExtras(props: StudentFormEditExtrasProps) {
  return (
    <>
      <StudentStatusFields
        status={props.status}
        inactiveAt={props.inactiveAt}
        companyName={props.companyName}
        companyRole={props.companyRole}
        companyLocation={props.companyLocation}
        companyJoinedAt={props.companyJoinedAt}
        onStatusChange={props.onStatusChange}
        onInactiveAtChange={props.onInactiveAtChange}
        onCompanyNameChange={props.onCompanyNameChange}
        onCompanyRoleChange={props.onCompanyRoleChange}
        onCompanyLocationChange={props.onCompanyLocationChange}
        onCompanyJoinedAtChange={props.onCompanyJoinedAtChange}
        inactiveAtError={props.inactiveAtError}
        companyNameError={props.companyNameError}
        companyRoleError={props.companyRoleError}
        companyLocationError={props.companyLocationError}
        companyJoinedAtError={props.companyJoinedAtError}
      />
      {props.roleValue === 'Executive' && (
        <SectionPermissionsPicker
          value={props.sectionPermissions}
          onChange={props.onSectionPermissionsChange}
          error={props.sectionPermissionsError}
        />
      )}
    </>
  )
}
