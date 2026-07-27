import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateStudents } from '@/lib/invalidate-queries'
import type { IStudentUpdateMutation } from './students.types'

interface UpdateStudentParams {
  id: string
  data: IStudentUpdateMutation
}

async function updateStudent({ id, data }: UpdateStudentParams) {
  const response = await fetch(`/api/admin/students/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message ?? 'Failed to update student')
  }

  return response.json()
}

export function useUpdateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateStudent,
    onSuccess: async () => {
      await invalidateStudents(queryClient)
    },
  })
}
