import { z } from 'zod'

export const STUDENT_NOTE_CATEGORIES = [
  'General',
  'Strength',
  'Speaking',
  'Technical',
  'Communication',
] as const

export type StudentNoteCategory = (typeof STUDENT_NOTE_CATEGORIES)[number]

const percentMessage = 'Enter a whole number from 0 to 100'

export const studentNoteSchema = z
  .object({
    body: z.string().trim().max(5000, 'Note is too long'),
    category: z.enum(STUDENT_NOTE_CATEGORIES),
    percentage: z
      .number()
      .int(percentMessage)
      .min(0, percentMessage)
      .max(100, percentMessage)
      .nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.body) return
    ctx.addIssue({
      code: 'custom',
      path: ['body'],
      message: value.percentage != null ? 'Add a note for this score' : 'Note is required',
    })
  })

export type StudentNoteInput = z.infer<typeof studentNoteSchema>
