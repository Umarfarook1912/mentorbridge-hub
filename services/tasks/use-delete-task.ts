import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateTasks } from '@/lib/invalidate-queries'

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message ?? 'Failed to delete task')
      }
    },
    onSuccess: async () => {
      await invalidateTasks(queryClient)
    },
  })
}
