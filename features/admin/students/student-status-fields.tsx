'use client'

import { type FieldError } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import type { EnrollmentStatus } from '@/lib/enrollment'

const STATUS_LABEL: Record<EnrollmentStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  company: 'Company',
}

interface StudentStatusFieldsProps {
  status: EnrollmentStatus
  inactiveAt: string
  companyName: string
  companyRole: string
  companyLocation: string
  companyJoinedAt: string
  onStatusChange: (status: EnrollmentStatus) => void
  onInactiveAtChange: (date: string) => void
  onCompanyNameChange: (value: string) => void
  onCompanyRoleChange: (value: string) => void
  onCompanyLocationChange: (value: string) => void
  onCompanyJoinedAtChange: (date: string) => void
  inactiveAtError?: FieldError
  companyNameError?: FieldError
  companyRoleError?: FieldError
  companyLocationError?: FieldError
  companyJoinedAtError?: FieldError
}

export function StudentStatusFields({
  status,
  inactiveAt,
  companyName,
  companyRole,
  companyLocation,
  companyJoinedAt,
  onStatusChange,
  onInactiveAtChange,
  onCompanyNameChange,
  onCompanyRoleChange,
  onCompanyLocationChange,
  onCompanyJoinedAtChange,
  inactiveAtError,
  companyNameError,
  companyRoleError,
  companyLocationError,
  companyJoinedAtError,
}: StudentStatusFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormFieldWrapper label="Enrollment Status" htmlFor="enrollmentStatus" required>
        <Select value={status} onValueChange={(v) => onStatusChange(v as EnrollmentStatus)}>
          <SelectTrigger id="enrollmentStatus" className="w-full">
            <SelectValue>{(value: string | null) => STATUS_LABEL[(value as EnrollmentStatus) ?? 'active']}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="company">Company</SelectItem>
          </SelectContent>
        </Select>
      </FormFieldWrapper>

      {status === 'inactive' && (
        <FormFieldWrapper label="Inactive Date" htmlFor="inactiveAt" error={inactiveAtError} required>
          <Input
            id="inactiveAt"
            type="date"
            value={inactiveAt}
            onChange={(e) => onInactiveAtChange(e.target.value)}
          />
        </FormFieldWrapper>
      )}

      {status === 'company' && (
        <>
          <FormFieldWrapper label="Date of Joining" htmlFor="companyJoinedAt" error={companyJoinedAtError} required>
            <Input
              id="companyJoinedAt"
              type="date"
              value={companyJoinedAt}
              onChange={(e) => onCompanyJoinedAtChange(e.target.value)}
            />
          </FormFieldWrapper>
          <FormFieldWrapper label="Company Name" htmlFor="companyName" error={companyNameError} required>
            <Input
              id="companyName"
              value={companyName}
              placeholder="KlyONIX Tech"
              onChange={(e) => onCompanyNameChange(e.target.value)}
            />
          </FormFieldWrapper>
          <FormFieldWrapper label="Role" htmlFor="companyRole" error={companyRoleError} required>
            <Input
              id="companyRole"
              value={companyRole}
              placeholder="Full Stack"
              onChange={(e) => onCompanyRoleChange(e.target.value)}
            />
          </FormFieldWrapper>
          <FormFieldWrapper label="Location" htmlFor="companyLocation" error={companyLocationError} required>
            <Input
              id="companyLocation"
              value={companyLocation}
              placeholder="Pollachi"
              onChange={(e) => onCompanyLocationChange(e.target.value)}
            />
          </FormFieldWrapper>
        </>
      )}
    </div>
  )
}
