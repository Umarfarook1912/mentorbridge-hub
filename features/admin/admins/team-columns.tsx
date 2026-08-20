'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Column } from '@/components/shared/data-display/data-table'
import { UserAvatar } from '@/components/shared/data-display/user-avatar'
import { USER_ROLES } from '@/lib/constants'
import { formatDate } from '@/utils/format'
import { ADMIN_SECTION_LABELS, type AdminSection } from '@/lib/permissions'
import type { IStudentEntity } from '@/services/students'
import type { UserRole } from '@/types/supabase.types'

function formatSections(permissions: string[] | null): string {
  if (!permissions?.length) return '—'
  return permissions.map((s) => ADMIN_SECTION_LABELS[s as AdminSection] ?? s).join(', ')
}

interface BuildColumnsArgs {
  currentUserId?: string
  canWrite: boolean
  isPending: boolean
  onRoleChange: (row: IStudentEntity, role: UserRole) => void
  onEditAccess: (row: IStudentEntity) => void
}

export function buildTeamColumns({
  currentUserId,
  canWrite,
  isPending,
  onRoleChange,
  onEditAccess,
}: BuildColumnsArgs): Column<IStudentEntity>[] {
  return [
    {
      key: 'name',
      header: 'Member',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={row.full_name} avatarUrl={row.avatar_url} size="sm" />
          <div>
            <p className="text-sm font-medium">
              {row.full_name}
              {currentUserId === row.id ? (
                <span className="text-muted-foreground ml-1 text-xs">(you)</span>
              ) : null}
            </p>
            <p className="text-muted-foreground text-xs">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'sections',
      header: 'Access',
      cell: (row) =>
        row.role === 'Executive' ? (
          <div className="flex flex-col items-start gap-1">
            <span className="text-muted-foreground text-sm">
              {formatSections(row.section_permissions)}
            </span>
            {canWrite && currentUserId !== row.id ? (
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs"
                onClick={() => onEditAccess(row)}
              >
                Edit access
              </Button>
            ) : null}
          </div>
        ) : row.role === 'Staff' ? (
          <span className="text-muted-foreground text-sm">View only</span>
        ) : (
          <span className="text-muted-foreground text-sm">Full access</span>
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
        const isSelf = currentUserId === row.id
        return (
          <Select
            value={row.role}
            disabled={isSelf || isPending || !canWrite}
            onValueChange={(v) => {
              if (!v || v === row.role) return
              onRoleChange(row, v as UserRole)
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
}
