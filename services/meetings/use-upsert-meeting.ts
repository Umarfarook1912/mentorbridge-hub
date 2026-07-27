import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateMeetings } from '@/lib/invalidate-queries'
import type { IMeetingMutation } from './meetings.types'

interface UpsertMeetingParams {
  id?: string
  data: IMeetingMutation
}

async function upsertMeeting({ id, data }: UpsertMeetingParams) {
  const url = id ? `/api/admin/meetings/${id}` : '/api/admin/meetings'
  const response = await fetch(url, {
    method: id ? 'PATCH' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message ?? (id ? 'Failed to update meeting' : 'Failed to create meeting'))
  }

  return response.json()
}

export function useUpsertMeeting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: upsertMeeting,
    onSuccess: async () => {
      await invalidateMeetings(queryClient)
    },
  })
}
