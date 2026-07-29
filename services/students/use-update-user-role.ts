import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateStudents } from '@/lib/invalidate-queries'
import type { UserRole } from '@/types/supabase.types'

async function updateUserRole({ id, role }: { id: string; role: UserRole }) {
  const response = await fetch(`/api/admin/students/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message ?? 'Failed to update role')
  }

  return response.json()
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateUserRole,
    onSuccess: async () => {
      await invalidateStudents(queryClient)
    },
  })
}
