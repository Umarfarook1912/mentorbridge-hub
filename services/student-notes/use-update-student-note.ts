import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'
import type { IStudentNote, IStudentNoteMutation } from './student-notes.types'

export function useUpdateStudentNote(studentId: string) {
  const queryClient = useQueryClient()
  const queryKey = [QUERY_KEYS.studentNotes, studentId] as const

  return useMutation({
    mutationFn: async ({
      noteId,
      data,
    }: {
      noteId: string
      data: IStudentNoteMutation
    }): Promise<IStudentNote> => {
      const response = await fetch(`/api/admin/students/${studentId}/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message ?? 'Failed to update note')
      }
      return response.json()
    },
    onMutate: async ({ noteId, data }) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<IStudentNote[]>(queryKey)

      queryClient.setQueryData<IStudentNote[]>(queryKey, (old) =>
        old?.map((note) =>
          note.id === noteId
            ? {
                ...note,
                body: data.body,
                category: data.category,
                updated_at: new Date().toISOString(),
              }
            : note
        )
      )

      return { previous }
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey })
    },
  })
}
