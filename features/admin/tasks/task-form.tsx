'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { taskSchema, type TaskInput } from '@/lib/validations/task'
import { useUpsertTask } from '@/services/tasks/use-upsert-task'
import { DEPARTMENTS } from '@/lib/constants'
import type { ITaskEntity } from '@/services/tasks'
import { getErrorMessage, toDateInputValue } from '@/utils/form'

interface TaskFormProps {
  task?: ITaskEntity | null
  onSuccess: () => void
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const isEdit = !!task
  const { mutateAsync: upsertTask, isPending } = useUpsertTask()

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema) as never,
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      department: 'all',
    },
  })

  useEffect(() => {
    reset({
      title: task?.title ?? '',
      description: task?.description ?? '',
      dueDate: toDateInputValue(task?.due_date),
      department: task?.department ?? 'all',
    })
  }, [task, reset])

  const department = watch('department')

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

      <div className="grid grid-cols-2 gap-4">
        <FormFieldWrapper label="Due Date" htmlFor="dueDate" error={errors.dueDate} required>
          <Input id="dueDate" type="date" {...register('dueDate')} />
        </FormFieldWrapper>

        <FormFieldWrapper label="Assign To" error={errors.department}>
          <Select
            value={department || 'all'}
            onValueChange={(v) => setValue('department', v ?? 'all', { shouldValidate: true })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All students">
                {(value: string | null) => (!value || value === 'all' ? 'All Students' : value)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormFieldWrapper>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  )
}
