'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { StudentFormSelects } from './student-form-selects'
import { SectionPermissionsPicker } from './section-permissions-picker'
import {
  studentSchema,
  updateStudentSchema,
  type StudentInput,
  type UpdateStudentInput,
} from '@/lib/validations/student'
import { useCreateStudent } from '@/services/students/use-create-student'
import { useUpdateStudent } from '@/services/students/use-update-student'
import type { IStudentEntity } from '@/services/students'
import { getErrorMessage } from '@/utils/form'
import type { AdminSection } from '@/lib/permissions'

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
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<StudentInput | UpdateStudentInput>({
    resolver: zodResolver(isEdit ? updateStudentSchema : studentSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      studentCategory: 'SSM Student',
      department: '',
      domainInterest: '',
      ...(isEdit ? { role: 'Student' as const, sectionPermissions: [] as AdminSection[] } : {}),
    },
  })

  const studentCategory = useWatch({ control, name: 'studentCategory' }) ?? ''
  const department = useWatch({ control, name: 'department' }) ?? ''
  const domainInterest = useWatch({ control, name: 'domainInterest' }) ?? ''
  const roleValue = useWatch({ control, name: 'role' }) ?? ''
  const sectionPermissions =
    (useWatch({ control, name: 'sectionPermissions' }) as AdminSection[] | undefined) ?? []

  useEffect(() => {
    if (!student) return
    reset({
      fullName: student.full_name ?? '',
      email: student.email ?? '',
      phone: student.phone ?? '',
      studentCategory:
        (student.student_category as StudentInput['studentCategory']) ?? 'SSM Student',
      department: student.department ?? '',
      domainInterest: student.domain_interest ?? '',
      role: student.role,
      sectionPermissions: (student.section_permissions as AdminSection[] | null) ?? [],
    })
  }, [student, reset])

  async function onSubmit(data: StudentInput | UpdateStudentInput) {
    try {
      if (isEdit) {
        const editData = data as UpdateStudentInput
        await updateStudent({
          id: student.id,
          data: {
            fullName: editData.fullName,
            phone: editData.phone || '',
            studentCategory: editData.studentCategory,
            department: editData.department,
            domainInterest: editData.domainInterest,
            role: editData.role,
            sectionPermissions: editData.role === 'Associate' ? editData.sectionPermissions : [],
          },
        })
        toast.success('Updated successfully')
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

      <StudentFormSelects
        studentCategory={studentCategory}
        department={department}
        domainInterest={domainInterest}
        role={isEdit ? roleValue : undefined}
        showRole={isEdit}
        errors={{
          studentCategory: errors.studentCategory,
          department: errors.department,
          domainInterest: errors.domainInterest,
          role: 'role' in errors ? errors.role : undefined,
        }}
        onStudentCategoryChange={(v) =>
          setValue('studentCategory', v as StudentInput['studentCategory'], {
            shouldValidate: true,
          })
        }
        onDepartmentChange={(v) => setValue('department', v, { shouldValidate: true })}
        onDomainInterestChange={(v) => setValue('domainInterest', v, { shouldValidate: true })}
        onRoleChange={(v) => {
          setValue('role', v as UpdateStudentInput['role'], { shouldValidate: true })
          if (v !== 'Associate') {
            setValue('sectionPermissions', [], { shouldValidate: true })
          }
        }}
      />

      {isEdit && roleValue === 'Associate' && (
        <SectionPermissionsPicker
          value={sectionPermissions}
          onChange={(sections) =>
            setValue('sectionPermissions', sections, { shouldValidate: true })
          }
          error={
            'sectionPermissions' in errors
              ? (errors.sectionPermissions as { message?: string } | undefined)
              : undefined
          }
        />
      )}

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
