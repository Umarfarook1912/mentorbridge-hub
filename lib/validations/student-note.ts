import { z } from 'zod'

export const STUDENT_NOTE_CATEGORIES = [
  'General',
  'Strength',
  'Concern',
  'Speaking',
  'Technical',
] as const

export type StudentNoteCategory = (typeof STUDENT_NOTE_CATEGORIES)[number]

export const studentNoteSchema = z.object({
  body: z.string().trim().min(1, 'Note is required').max(5000, 'Note is too long'),
  category: z.enum(STUDENT_NOTE_CATEGORIES),
})

export type StudentNoteInput = z.infer<typeof studentNoteSchema>
