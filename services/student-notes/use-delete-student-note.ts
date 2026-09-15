import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'

export function useDeleteStudentNote(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (noteId: string) => {
      const response = await fetch(`/api/admin/students/${studentId}/notes/${noteId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message ?? 'Failed to delete note')
      }
      return response.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.studentNotes, studentId] })
    },
  })
}
