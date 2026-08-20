'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useUpdateUserRole, type IStudentEntity } from '@/services/students'
import { getErrorMessage } from '@/utils/form'
import type { AdminSection } from '@/lib/permissions'
import type { UserRole } from '@/types/supabase.types'
import type { PendingRoleChange } from './admin-role-dialogs'

export function useAdminRoleChange() {
  const { mutateAsync: updateRole, isPending } = useUpdateUserRole()
  const [pending, setPending] = useState<PendingRoleChange | null>(null)
  const [executiveSections, setExecutiveSections] = useState<AdminSection[]>([])
  const [sectionError, setSectionError] = useState<string | undefined>()

  function closeDialogs() {
    setPending(null)
    setExecutiveSections([])
    setSectionError(undefined)
  }

  async function confirmRoleChange() {
    if (!pending) return
    try {
      await updateRole({ id: pending.id, role: pending.role })
      toast.success(`${pending.name} is now a ${pending.role}`)
      closeDialogs()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  async function confirmExecutive() {
    if (!pending || pending.role !== 'Executive') return
    if (executiveSections.length === 0) {
      setSectionError('Select at least one section for Executive')
      return
    }
    try {
      await updateRole({
        id: pending.id,
        role: 'Executive',
        sectionPermissions: executiveSections,
      })
      toast.success(
        pending.editAccessOnly
          ? `Updated access for ${pending.name}`
          : `${pending.name} is now an Executive`
      )
      closeDialogs()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  function openRoleChange(row: IStudentEntity, role: UserRole) {
    setPending({ id: row.id, role, name: row.full_name })
    setExecutiveSections(
      role === 'Executive' ? ((row.section_permissions as AdminSection[] | null) ?? []) : []
    )
    setSectionError(undefined)
  }

  function openEditAccess(row: IStudentEntity) {
    setPending({ id: row.id, role: 'Executive', name: row.full_name, editAccessOnly: true })
    setExecutiveSections((row.section_permissions as AdminSection[] | null) ?? [])
    setSectionError(undefined)
  }

  return {
    pending,
    executiveSections,
    sectionError,
    isPending,
    setExecutiveSections,
    clearSectionError: () => setSectionError(undefined),
    closeDialogs,
    confirmRoleChange,
    confirmExecutive,
    openRoleChange,
    openEditAccess,
  }
}
