import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateVideos } from '@/lib/invalidate-queries'
import type { IVideoMutation } from './videos.types'

async function parseError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => ({}))
  return typeof payload.message === 'string' ? payload.message : fallback
}

export function useCreateVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: IVideoMutation) => {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error(await parseError(response, 'Failed to add video'))
      return response.json()
    },
    onSuccess: async () => {
      await invalidateVideos(queryClient)
    },
  })
}

export function useUpdateVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: IVideoMutation }) => {
      const response = await fetch(`/api/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error(await parseError(response, 'Failed to update video'))
      return response.json()
    },
    onSuccess: async () => {
      await invalidateVideos(queryClient)
    },
  })
}

export function useDeleteVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/videos/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error(await parseError(response, 'Failed to delete video'))
      return response.json()
    },
    onSuccess: async () => {
      await invalidateVideos(queryClient)
    },
  })
}
