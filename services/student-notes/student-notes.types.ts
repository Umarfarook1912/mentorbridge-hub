import type { StudentNoteCategory } from '@/lib/validations/student-note'

export interface IStudentNote {
  id: string
  student_id: string
  author_id: string | null
  body: string
  category: StudentNoteCategory
  created_at: string
  updated_at: string
  author?: { full_name: string } | null
}

export interface IStudentNoteMutation {
  body: string
  category: StudentNoteCategory
}
