'use client'

import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { DEPARTMENTS, DOMAIN_INTERESTS, STUDENT_CATEGORIES } from '@/lib/constants'
import type { ProfileInput } from './profile-form.schema'
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form'

interface ProfileInfoFieldsProps {
  email: string
  register: UseFormRegister<ProfileInput>
  setValue: UseFormSetValue<ProfileInput>
  errors: FieldErrors<ProfileInput>
  studentCategory: string
  department: string
  domainInterest: string
  isSubmitting: boolean
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
}

export function ProfileInfoFields({
  email,
  register,
  setValue,
  errors,
  studentCategory,
  department,
  domainInterest,
  isSubmitting,
  onSubmit,
}: ProfileInfoFieldsProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4" autoComplete="off">
      <FormFieldWrapper label="Full Name" htmlFor="fullName" error={errors.fullName} required>
        <Input id="fullName" autoComplete="name" {...register('fullName')} />
      </FormFieldWrapper>
      <FormFieldWrapper label="Email">
        <Input value={email} disabled readOnly />
      </FormFieldWrapper>
      <FormFieldWrapper label="Phone Number" htmlFor="phone" error={errors.phone}>
        <Input
          id="phone"
          type="tel"
          autoComplete="off"
          placeholder="+91 9876543210"
          {...register('phone')}
        />
      </FormFieldWrapper>
      <FormFieldWrapper label="Student Type" error={errors.studentCategory} required>
        <Select
          value={studentCategory || null}
          onValueChange={(v) =>
            setValue('studentCategory', (v ?? 'SSM Student') as ProfileInput['studentCategory'], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {STUDENT_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormFieldWrapper>
      <FormFieldWrapper label="Department" error={errors.department} required>
        <Select
          value={department || null}
          onValueChange={(v) => setValue('department', v ?? '', { shouldValidate: true })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormFieldWrapper>
      <FormFieldWrapper label="Domain Interest" error={errors.domainInterest} required>
        <Select
          value={domainInterest || null}
          onValueChange={(v) => setValue('domainInterest', v ?? '', { shouldValidate: true })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select domain interest" />
          </SelectTrigger>
          <SelectContent>
            {DOMAIN_INTERESTS.map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormFieldWrapper>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  )
}
