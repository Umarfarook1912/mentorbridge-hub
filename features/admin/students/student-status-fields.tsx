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

interface StudentStatusFieldsProps {
  isActive: boolean
  inactiveAt: string
  onIsActiveChange: (active: boolean) => void
  onInactiveAtChange: (date: string) => void
  inactiveAtError?: FieldError
}

export function StudentStatusFields({
  isActive,
  inactiveAt,
  onIsActiveChange,
  onInactiveAtChange,
  inactiveAtError,
}: StudentStatusFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormFieldWrapper label="Enrollment Status" htmlFor="isActive" required>
        <Select
          value={isActive ? 'active' : 'inactive'}
          onValueChange={(v) => onIsActiveChange(v === 'active')}
        >
          <SelectTrigger id="isActive" className="w-full">
            <SelectValue>
              {(value: string | null) => (value === 'inactive' ? 'Inactive' : 'Active')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </FormFieldWrapper>

      {!isActive && (
        <FormFieldWrapper
          label="Inactive Date"
          htmlFor="inactiveAt"
          error={inactiveAtError}
          required
        >
          <Input
            id="inactiveAt"
            type="date"
            value={inactiveAt}
            onChange={(e) => onInactiveAtChange(e.target.value)}
          />
        </FormFieldWrapper>
      )}
    </div>
  )
}
