import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'
import type { IStudentNote, IStudentNoteMutation } from './student-notes.types'

export function useCreateStudentNote(studentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: IStudentNoteMutation): Promise<IStudentNote> => {
      const response = await fetch(`/api/admin/students/${studentId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message ?? 'Failed to create note')
      }
      return response.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.studentNotes, studentId] })
    },
  })
}
