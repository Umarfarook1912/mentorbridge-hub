import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateMeetings } from '@/lib/invalidate-queries'

export function useDeleteMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/meetings/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message ?? 'Failed to delete meeting')
      }
    },
    onSuccess: async () => {
      await invalidateMeetings(queryClient)
    },
  })
}
