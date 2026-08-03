import { z } from 'zod'
import { DOMAIN_INTERESTS } from '@/lib/constants'

export const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  dueDate: z.string().min(1, 'Select a due date'),
  targetDomains: z.array(z.enum(DOMAIN_INTERESTS)),
  targetStudentIds: z.array(z.string().uuid()),
})

export type TaskInput = z.infer<typeof taskSchema>
