import { z } from 'zod'
import { STUDENT_CATEGORIES, USER_ROLES } from '@/lib/constants'
import { ADMIN_SECTIONS } from '@/lib/permissions'

const phoneSchema = z
  .string()
  .trim()
  .refine((val) => val === '' || /^[+]?[\d\s\-()]{8,20}$/.test(val), 'Enter a valid phone number')

const optionalCategory = z.union([z.enum(STUDENT_CATEGORIES), z.literal('')])

/** Create: email, password, and name required; other profile fields optional. */
export const studentSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  phone: phoneSchema.optional().or(z.literal('')),
  studentCategory: optionalCategory,
  department: z.string(),
  domainInterest: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

/** Edit: name required; other profile details optional for OAuth role changes. */
export const updateStudentSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    phone: phoneSchema.optional().or(z.literal('')),
    studentCategory: optionalCategory,
    department: z.string(),
    domainInterest: z.string(),
    role: z.enum(USER_ROLES, { message: 'Select a role' }),
    sectionPermissions: z.array(z.enum(ADMIN_SECTIONS)),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'Associate' && data.sectionPermissions.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select at least one section for Associate',
        path: ['sectionPermissions'],
      })
    }
  })

export type StudentInput = z.infer<typeof studentSchema>
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
