import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'

export function useIncrementVideoView() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/videos/${id}/view`, { method: 'POST' })
      if (!response.ok) return null
      return response.json() as Promise<{ viewCount: number | null }>
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.videos] })
    },
  })
}
