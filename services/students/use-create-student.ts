import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateStudents } from '@/lib/invalidate-queries'
import type { IStudentMutation } from './students.types'

interface CreateStudentResult {
  id: string
  email: string
}

async function createStudent(data: IStudentMutation): Promise<CreateStudentResult> {
  const response = await fetch('/api/admin/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message ?? 'Failed to create student')
  }

  return response.json()
}

export function useCreateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createStudent,
    onSuccess: async () => {
      await invalidateStudents(queryClient)
    },
  })
}
