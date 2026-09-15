import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS, STALE_TIME } from '@/lib/constants'
import type { IStudentNote } from './student-notes.types'

export function useGetStudentNotes(studentId: string | null) {
  return useQuery({
    queryKey: [QUERY_KEYS.studentNotes, studentId],
    queryFn: async (): Promise<IStudentNote[]> => {
      const response = await fetch(`/api/admin/students/${studentId}/notes`)
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message ?? 'Failed to load notes')
      }
      return response.json()
    },
    enabled: !!studentId,
    staleTime: STALE_TIME.short,
  })
}
