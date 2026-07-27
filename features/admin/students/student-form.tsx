'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import {
  studentSchema,
  updateStudentSchema,
  type StudentInput,
  type UpdateStudentInput,
} from '@/lib/validations/student'
import { DEPARTMENTS, DOMAIN_INTERESTS } from '@/lib/constants'
import { useCreateStudent } from '@/services/students/use-create-student'
import { useUpdateStudent } from '@/services/students/use-update-student'
import type { IStudentEntity } from '@/services/students'
import { getErrorMessage } from '@/utils/form'

interface StudentFormProps {
  student?: IStudentEntity | null
  onSuccess: () => void
}

export function StudentForm({ student, onSuccess }: StudentFormProps) {
  const isEdit = !!student
  const { mutateAsync: createStudent, isPending: creating } = useCreateStudent()
  const { mutateAsync: updateStudent, isPending: updating } = useUpdateStudent()
  const isLoading = creating || updating

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<StudentInput | UpdateStudentInput>({
    resolver: zodResolver(isEdit ? updateStudentSchema : studentSchema),
    defaultValues: {
      fullName: student?.full_name ?? '',
      email: student?.email ?? '',
      phone: student?.phone ?? '',
      department: student?.department ?? '',
      domainInterest: student?.domain_interest ?? '',
    },
  })

  // Re-fill form whenever the selected student changes (edit again after save)
  useEffect(() => {
    if (!student) return
    reset({
      fullName: student.full_name ?? '',
      email: student.email ?? '',
      phone: student.phone ?? '',
      department: student.department ?? '',
      domainInterest: student.domain_interest ?? '',
    })
  }, [student, reset])

  const department = watch('department')
  const domainInterest = watch('domainInterest')

  async function onSubmit(data: StudentInput | UpdateStudentInput) {
    try {
      if (isEdit) {
        await updateStudent({
          id: student.id,
          data: {
            fullName: data.fullName,
            phone: data.phone || '',
            department: data.department,
            domainInterest: data.domainInterest,
          },
        })
        toast.success('Student updated successfully')
      } else {
        await createStudent(data as StudentInput)
        toast.success('Student created successfully')
      }
      onSuccess()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormFieldWrapper label="Full Name" htmlFor="fullName" error={errors.fullName} required>
        <Input id="fullName" placeholder="Prasanna Kumar" {...register('fullName')} />
      </FormFieldWrapper>

      <FormFieldWrapper label="Email" htmlFor="email" error={errors.email} required>
        <Input
          id="email"
          type="email"
          placeholder="student@example.com"
          readOnly={isEdit}
          className={isEdit ? 'bg-muted' : undefined}
          {...register('email')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label="Phone Number" htmlFor="phone" error={errors.phone}>
        <Input id="phone" placeholder="+91 9876543210" {...register('phone')} />
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
            {DEPARTMENTS.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
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
            {DOMAIN_INTERESTS.map((domain) => (
              <SelectItem key={domain} value={domain}>
                {domain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormFieldWrapper>

      {!isEdit && (
        <FormFieldWrapper
          label="Password"
          htmlFor="password"
          error={'password' in errors ? errors.password : undefined}
          required
        >
          <Input
            id="password"
            type="password"
            placeholder="Min. 8 characters"
            {...register('password')}
          />
        </FormFieldWrapper>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Save Changes' : 'Create Student'}
        </Button>
      </div>
    </form>
  )
}
