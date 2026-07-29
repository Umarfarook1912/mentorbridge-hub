'use client'

import { useState } from 'react'
import { Shield } from 'lucide-react'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DataTable, type Column } from '@/components/shared/data-display/data-table'
import { UserAvatar } from '@/components/shared/data-display/user-avatar'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { useGetAdmins, useUpdateUserRole, type IStudentEntity } from '@/services/students'
import { useAuthStore } from '@/store/auth-store'
import { USER_ROLES } from '@/lib/constants'
import { formatDate } from '@/utils/format'
import { getErrorMessage } from '@/utils/form'
import type { UserRole } from '@/types/supabase.types'

export function AdminsList() {
  const { user } = useAuthStore()
  const { data: admins = [], isLoading } = useGetAdmins()
  const { mutateAsync: updateRole, isPending } = useUpdateUserRole()
  const [pending, setPending] = useState<{ id: string; role: UserRole; name: string } | null>(null)

  async function confirmRoleChange() {
    if (!pending) return
    try {
      await updateRole({ id: pending.id, role: pending.role })
      toast.success(
        pending.role === 'Admin'
          ? `${pending.name} is now an Admin`
          : `${pending.name} is now a Student`
      )
      setPending(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  const columns: Column<IStudentEntity>[] = [
    {
      key: 'name',
      header: 'Admin',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={row.full_name} avatarUrl={row.avatar_url} size="sm" />
          <div>
            <p className="text-sm font-medium">
              {row.full_name}
              {user?.id === row.id ? (
                <span className="text-muted-foreground ml-1 text-xs">(you)</span>
              ) : null}
            </p>
            <p className="text-muted-foreground text-xs">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'joined',
      header: 'Joined',
      cell: (row) => (
        <span className="text-muted-foreground text-sm">{formatDate(row.created_at)}</span>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      cell: (row) => {
        const isSelf = user?.id === row.id
        return (
          <Select
            value={row.role}
            disabled={isSelf || isPending}
            onValueChange={(v) => {
              if (!v || v === row.role) return
              setPending({ id: row.id, role: v as UserRole, name: row.full_name })
            }}
          >
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {USER_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
    },
  ]

  if (isLoading) return <LoadingSkeleton />

  if (!admins.length) {
    return (
      <EmptyState
        icon={Shield}
        title="No admins found"
        description="Promote a student to Admin from the Students page"
      />
    )
  }

  return (
    <>
      <DataTable data={admins} columns={columns} keyExtractor={(r) => r.id} />
      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        title={pending?.role === 'Student' ? 'Demote to Student' : 'Change Role'}
        description={
          pending?.role === 'Student'
            ? `Change ${pending.name}'s role to Student? They will lose admin access.`
            : `Confirm role change for ${pending?.name}.`
        }
        confirmLabel={pending?.role === 'Student' ? 'Demote' : 'Confirm'}
        variant={pending?.role === 'Student' ? 'destructive' : 'default'}
        loading={isPending}
        onConfirm={confirmRoleChange}
      />
    </>
  )
}
