import { z } from 'zod'
import { STUDENT_CATEGORIES } from '@/lib/constants'

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().optional(),
  studentCategory: z.enum(STUDENT_CATEGORIES, { message: 'Select student type' }),
  department: z.string().min(1, 'Select a department'),
  domainInterest: z.string().min(1, 'Select a domain interest'),
})

export type ProfileInput = z.infer<typeof profileSchema>
