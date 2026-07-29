'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { DEPARTMENTS, DOMAIN_INTERESTS, STUDENT_CATEGORIES, USER_ROLES } from '@/lib/constants'
import type { FieldError } from 'react-hook-form'

interface SelectFieldProps {
  label: string
  value: string
  error?: FieldError
  placeholder: string
  options: readonly string[]
  onChange: (value: string) => void
  required?: boolean
}

function SelectField({
  label,
  value,
  error,
  placeholder,
  options,
  onChange,
  required,
}: SelectFieldProps) {
  return (
    <FormFieldWrapper label={label} error={error} required={required}>
      <Select value={value || null} onValueChange={(v) => onChange(v ?? '')}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  )
}

interface StudentFormSelectsProps {
  studentCategory: string
  department: string
  domainInterest: string
  role?: string
  showRole?: boolean
  errors: {
    studentCategory?: FieldError
    department?: FieldError
    domainInterest?: FieldError
    role?: FieldError
  }
  onStudentCategoryChange: (v: string) => void
  onDepartmentChange: (v: string) => void
  onDomainInterestChange: (v: string) => void
  onRoleChange?: (v: string) => void
}

export function StudentFormSelects({
  studentCategory,
  department,
  domainInterest,
  role,
  showRole,
  errors,
  onStudentCategoryChange,
  onDepartmentChange,
  onDomainInterestChange,
  onRoleChange,
}: StudentFormSelectsProps) {
  return (
    <>
      <SelectField
        label="Student Type"
        value={studentCategory}
        error={errors.studentCategory}
        placeholder="Select type"
        options={STUDENT_CATEGORIES}
        onChange={onStudentCategoryChange}
        required
      />
      <SelectField
        label="Department"
        value={department}
        error={errors.department}
        placeholder="Select department"
        options={DEPARTMENTS}
        onChange={onDepartmentChange}
        required
      />
      <SelectField
        label="Domain Interest"
        value={domainInterest}
        error={errors.domainInterest}
        placeholder="Select domain interest"
        options={DOMAIN_INTERESTS}
        onChange={onDomainInterestChange}
        required
      />
      {showRole && onRoleChange && (
        <SelectField
          label="Role"
          value={role ?? ''}
          error={errors.role}
          placeholder="Select role"
          options={USER_ROLES}
          onChange={onRoleChange}
          required
        />
      )}
    </>
  )
}
