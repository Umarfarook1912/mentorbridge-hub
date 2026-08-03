'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { AudiencePicker } from '@/components/shared/forms/audience-picker'
import { taskSchema, type TaskInput } from '@/lib/validations/task'
import { useUpsertTask } from '@/services/tasks/use-upsert-task'
import type { ITaskEntity } from '@/services/tasks'
import { getErrorMessage, toDateInputValue } from '@/utils/form'
import type { MeetingDomain } from '@/utils/meeting-audience'

interface TaskFormProps {
  task?: ITaskEntity | null
  onSuccess: () => void
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const isEdit = !!task
  const { mutateAsync: upsertTask, isPending } = useUpsertTask()

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      targetDomains: [],
      targetStudentIds: [],
    },
  })

  const targetDomains = useWatch({ control, name: 'targetDomains' }) ?? []
  const targetStudentIds = useWatch({ control, name: 'targetStudentIds' }) ?? []

  useEffect(() => {
    reset({
      title: task?.title ?? '',
      description: task?.description ?? '',
      dueDate: toDateInputValue(task?.due_date),
      targetDomains: (task?.target_domains as MeetingDomain[] | null) ?? [],
      targetStudentIds: task?.target_student_ids ?? [],
    })
  }, [task, reset])

  async function onSubmit(data: TaskInput) {
    try {
      await upsertTask({ id: task?.id, data })
      toast.success(isEdit ? 'Task updated' : 'Task created')
      onSuccess()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormFieldWrapper label="Task Title" htmlFor="title" error={errors.title} required>
        <Input id="title" placeholder="Build a React Todo App" {...register('title')} />
      </FormFieldWrapper>

      <FormFieldWrapper label="Description" htmlFor="description" error={errors.description}>
        <Textarea
          id="description"
          placeholder="Task description and requirements…"
          rows={4}
          {...register('description')}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label="Due Date" htmlFor="dueDate" error={errors.dueDate} required>
        <Input id="dueDate" type="date" {...register('dueDate')} />
      </FormFieldWrapper>

      <AudiencePicker
        label="Assigned to"
        description="All students, domain groups, and/or specific people. Groups and people combine."
        domains={targetDomains}
        studentIds={targetStudentIds}
        onDomainsChange={(domains) => setValue('targetDomains', domains, { shouldValidate: true })}
        onStudentIdsChange={(ids) => setValue('targetStudentIds', ids, { shouldValidate: true })}
        error={errors.targetDomains ?? errors.targetStudentIds}
      />

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}
