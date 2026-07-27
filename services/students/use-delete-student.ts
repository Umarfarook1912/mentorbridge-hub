import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateStudents } from '@/lib/invalidate-queries'

async function deleteStudent(id: string) {
  const response = await fetch(`/api/admin/students/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message ?? 'Failed to delete student')
  }
}

export function useDeleteStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteStudent,
    onSuccess: async () => {
      await invalidateStudents(queryClient)
    },
  })
}
