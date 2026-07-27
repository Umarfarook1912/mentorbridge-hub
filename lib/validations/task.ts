import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Select a due date'),
  department: z.string().default('all'),
})

export type TaskInput = z.infer<typeof taskSchema>
