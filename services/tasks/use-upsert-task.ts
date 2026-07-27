import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateTasks } from '@/lib/invalidate-queries'
import type { ITaskMutation } from './tasks.types'

interface UpsertTaskParams {
  id?: string
  data: ITaskMutation
}

async function upsertTask({ id, data }: UpsertTaskParams) {
  const url = id ? `/api/admin/tasks/${id}` : '/api/admin/tasks'
  const response = await fetch(url, {
    method: id ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message ?? (id ? 'Failed to update task' : 'Failed to create task'))
  }

  return response.json()
}

export function useUpsertTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: upsertTask,
    onSuccess: async () => {
      await invalidateTasks(queryClient)
    },
  })
}
