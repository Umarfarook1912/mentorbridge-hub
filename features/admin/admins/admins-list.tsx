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
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/shared/data-display/data-table'
import { UserAvatar } from '@/components/shared/data-display/user-avatar'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { SectionPermissionsPicker } from '@/features/admin/students/section-permissions-picker'
import { useGetAdmins, useUpdateUserRole, type IStudentEntity } from '@/services/students'
import { useAuthStore } from '@/store/auth-store'
import { USER_ROLES } from '@/lib/constants'
import { formatDate } from '@/utils/format'
import { getErrorMessage } from '@/utils/form'
import type { AdminSection } from '@/lib/permissions'
import type { UserRole } from '@/types/supabase.types'

export function AdminsList() {
  const { user } = useAuthStore()
  const { data: admins = [], isLoading } = useGetAdmins()
  const { mutateAsync: updateRole, isPending } = useUpdateUserRole()
  const [pending, setPending] = useState<{ id: string; role: UserRole; name: string } | null>(null)
  const [associateSections, setAssociateSections] = useState<AdminSection[]>([])
  const [sectionError, setSectionError] = useState<string | undefined>()

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

  async function confirmAssociate() {
    if (!pending || pending.role !== 'Associate') return
    if (associateSections.length === 0) {
      setSectionError('Select at least one section for Associate')
      return
    }
    try {
      await updateRole({
        id: pending.id,
        role: 'Associate',
        sectionPermissions: associateSections,
      })
      toast.success(`${pending.name} is now an Associate`)
      setPending(null)
      setAssociateSections([])
      setSectionError(undefined)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  function openRoleChange(id: string, role: UserRole, name: string) {
    setPending({ id, role, name })
    setAssociateSections([])
    setSectionError(undefined)
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
              openRoleChange(row.id, v as UserRole, row.full_name)
            }}
          >
            <SelectTrigger className="h-8 w-36">
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

  const associateOpen = !!pending && pending.role === 'Associate'
  const confirmOpen = !!pending && pending.role !== 'Associate'

  return (
    <>
      <DataTable data={admins} columns={columns} keyExtractor={(r) => r.id} />

      <FormDialog
        open={associateOpen}
        onOpenChange={(o) => {
          if (!o) {
            setPending(null)
            setAssociateSections([])
            setSectionError(undefined)
          }
        }}
        title={`Make ${pending?.name ?? ''} an Associate`}
        description="Choose which admin sections this Associate can access"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <SectionPermissionsPicker
            value={associateSections}
            onChange={(sections) => {
              setAssociateSections(sections)
              setSectionError(undefined)
            }}
            error={sectionError ? { message: sectionError } : undefined}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPending(null)
                setAssociateSections([])
                setSectionError(undefined)
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={confirmAssociate} disabled={isPending}>
              Confirm
            </Button>
          </div>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={confirmOpen}
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
