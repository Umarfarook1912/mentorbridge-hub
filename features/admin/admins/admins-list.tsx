'use client'

import { useMemo, useState } from 'react'
import { UsersRound } from 'lucide-react'
import { DataTable } from '@/components/shared/data-display/data-table'
import { FilterPills } from '@/components/shared/forms/filter-pills'
import { LoadingSkeleton } from '@/components/shared/feedback/loading-skeleton'
import { EmptyState } from '@/components/shared/feedback/empty-state'
import { useGetAdmins } from '@/services/students'
import { useAuthStore } from '@/store/auth-store'
import { canMutate } from '@/lib/permissions'
import { AdminRoleDialogs } from './admin-role-dialogs'
import { buildTeamColumns } from './team-columns'
import { useAdminRoleChange } from './use-admin-role-change'

type RoleFilter = 'all' | 'Admin' | 'Staff' | 'Executive'

export function AdminsList() {
  const { user } = useAuthStore()
  const canWrite = canMutate(user)
  const { data: members = [], isLoading } = useGetAdmins()
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const roleChange = useAdminRoleChange()

  const admins = useMemo(() => members.filter((m) => m.role === 'Admin'), [members])
  const staff = useMemo(() => members.filter((m) => m.role === 'Staff'), [members])
  const executives = useMemo(() => members.filter((m) => m.role === 'Executive'), [members])
  const visible =
    roleFilter === 'all'
      ? members
      : roleFilter === 'Admin'
        ? admins
        : roleFilter === 'Staff'
          ? staff
          : executives

  const columns = buildTeamColumns({
    currentUserId: user?.id,
    canWrite,
    isPending: roleChange.isPending,
    onRoleChange: roleChange.openRoleChange,
    onEditAccess: roleChange.openEditAccess,
  })

  if (isLoading) return <LoadingSkeleton />

  if (!members.length) {
    return (
      <EmptyState
        icon={UsersRound}
        title="No team members yet"
        description="Promote a student to Admin, Staff, or Executive from the Students page"
      />
    )
  }

  return (
    <div className="space-y-4">
      <FilterPills
        aria-label="Team role"
        value={roleFilter}
        onChange={setRoleFilter}
        options={[
          { value: 'all', label: `All (${members.length})` },
          { value: 'Admin', label: `Admin (${admins.length})` },
          { value: 'Staff', label: `Staff (${staff.length})` },
          { value: 'Executive', label: `Executive (${executives.length})` },
        ]}
      />

      {!visible.length ? (
        <EmptyState
          icon={UsersRound}
          title={`No ${roleFilter} members`}
          description="Try another filter to see team members"
        />
      ) : (
        <DataTable data={visible} columns={columns} keyExtractor={(r) => r.id} />
      )}

      <AdminRoleDialogs
        pending={roleChange.pending}
        executiveSections={roleChange.executiveSections}
        sectionError={roleChange.sectionError}
        isPending={roleChange.isPending}
        onExecutiveSectionsChange={roleChange.setExecutiveSections}
        onClearSectionError={roleChange.clearSectionError}
        onClose={roleChange.closeDialogs}
        onConfirmRoleChange={roleChange.confirmRoleChange}
        onConfirmExecutive={roleChange.confirmExecutive}
      />
    </div>
  )
}
