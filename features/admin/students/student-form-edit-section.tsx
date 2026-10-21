'use client'

import { useWatch, type Control, type FieldErrors, type UseFormSetValue } from 'react-hook-form'
import { StudentFormEditExtras } from './student-form-edit-extras'
import { localToday } from '@/utils/meeting-time'
import type { EnrollmentStatus } from '@/lib/enrollment'
import type { AdminSection } from '@/lib/permissions'
import type { StudentInput, UpdateStudentInput } from '@/lib/validations/student'

type FormValues = StudentInput | UpdateStudentInput

interface StudentFormEditSectionProps {
  control: Control<FormValues>
  setValue: UseFormSetValue<FormValues>
  errors: FieldErrors<FormValues>
}

export function StudentFormEditSection({ control, setValue, errors }: StudentFormEditSectionProps) {
  const roleValue = useWatch({ control, name: 'role' }) ?? ''
  const enrollmentStatus =
    (useWatch({ control, name: 'enrollmentStatus' }) as EnrollmentStatus | undefined) ?? 'active'
  const inactiveAtValue = (useWatch({ control, name: 'inactiveAt' }) as string | undefined) ?? ''
  const companyName = (useWatch({ control, name: 'companyName' }) as string | undefined) ?? ''
  const companyRole = (useWatch({ control, name: 'companyRole' }) as string | undefined) ?? ''
  const companyLocation = (useWatch({ control, name: 'companyLocation' }) as string | undefined) ?? ''
  const companyJoinedAt = (useWatch({ control, name: 'companyJoinedAt' }) as string | undefined) ?? ''
  const sectionPermissions =
    (useWatch({ control, name: 'sectionPermissions' }) as AdminSection[] | undefined) ?? []

  return (
    <StudentFormEditExtras
      status={enrollmentStatus}
      inactiveAt={inactiveAtValue}
      companyName={companyName}
      companyRole={companyRole}
      companyLocation={companyLocation}
      companyJoinedAt={companyJoinedAt}
      roleValue={String(roleValue)}
      sectionPermissions={sectionPermissions}
      onStatusChange={(status) => {
        setValue('enrollmentStatus', status, { shouldValidate: true })
        if (status === 'inactive') {
          setValue('inactiveAt', inactiveAtValue || localToday(), { shouldValidate: true })
        }
        if (status === 'company') {
          setValue('companyJoinedAt', companyJoinedAt || localToday(), { shouldValidate: true })
        }
      }}
      onInactiveAtChange={(date) => setValue('inactiveAt', date, { shouldValidate: true })}
      onCompanyNameChange={(value) => setValue('companyName', value, { shouldValidate: true })}
      onCompanyRoleChange={(value) => setValue('companyRole', value, { shouldValidate: true })}
      onCompanyLocationChange={(value) =>
        setValue('companyLocation', value, { shouldValidate: true })
      }
      onCompanyJoinedAtChange={(date) => setValue('companyJoinedAt', date, { shouldValidate: true })}
      onSectionPermissionsChange={(sections) =>
        setValue('sectionPermissions', sections, { shouldValidate: true })
      }
      inactiveAtError={'inactiveAt' in errors ? errors.inactiveAt : undefined}
      companyNameError={'companyName' in errors ? errors.companyName : undefined}
      companyRoleError={'companyRole' in errors ? errors.companyRole : undefined}
      companyLocationError={'companyLocation' in errors ? errors.companyLocation : undefined}
      companyJoinedAtError={'companyJoinedAt' in errors ? errors.companyJoinedAt : undefined}
      sectionPermissionsError={
        'sectionPermissions' in errors
          ? (errors.sectionPermissions as { message?: string } | undefined)
          : undefined
      }
    />
  )
}
