import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateStudents } from '@/lib/invalidate-queries'
import { QUERY_KEYS } from '@/lib/constants'
import type { UserRole } from '@/types/supabase.types'

async function updateUserRole({
  id,
  role,
  sectionPermissions,
}: {
  id: string
  role: UserRole
  sectionPermissions?: string[]
}) {
  const response = await fetch(`/api/admin/students/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, sectionPermissions }),
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
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.admins] })
    },
  })
}
