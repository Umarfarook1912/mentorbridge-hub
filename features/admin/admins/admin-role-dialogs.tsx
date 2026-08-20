'use client'

import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/forms/confirm-dialog'
import { FormDialog } from '@/components/shared/forms/form-dialog'
import { SectionPermissionsPicker } from '@/features/admin/students/section-permissions-picker'
import type { AdminSection } from '@/lib/permissions'
import type { UserRole } from '@/types/supabase.types'

export interface PendingRoleChange {
  id: string
  role: UserRole
  name: string
  /** True when updating section access for an existing Executive. */
  editAccessOnly?: boolean
}

interface AdminRoleDialogsProps {
  pending: PendingRoleChange | null
  executiveSections: AdminSection[]
  sectionError?: string
  isPending: boolean
  onExecutiveSectionsChange: (sections: AdminSection[]) => void
  onClearSectionError: () => void
  onClose: () => void
  onConfirmRoleChange: () => void
  onConfirmExecutive: () => void
}

export function AdminRoleDialogs({
  pending,
  executiveSections,
  sectionError,
  isPending,
  onExecutiveSectionsChange,
  onClearSectionError,
  onClose,
  onConfirmRoleChange,
  onConfirmExecutive,
}: AdminRoleDialogsProps) {
  const executiveOpen = !!pending && pending.role === 'Executive'
  const confirmOpen = !!pending && pending.role !== 'Executive'
  const isEditAccess = !!pending?.editAccessOnly

  return (
    <>
      <FormDialog
        open={executiveOpen}
        onOpenChange={(o) => {
          if (!o) onClose()
        }}
        title={
          isEditAccess
            ? `Edit access for ${pending?.name ?? ''}`
            : `Make ${pending?.name ?? ''} an Executive`
        }
        description="Choose which sections this Executive can access"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <SectionPermissionsPicker
            value={executiveSections}
            onChange={(sections) => {
              onExecutiveSectionsChange(sections)
              onClearSectionError()
            }}
            error={sectionError ? { message: sectionError } : undefined}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={onConfirmExecutive} disabled={isPending}>
              {isEditAccess ? 'Save access' : 'Confirm'}
            </Button>
          </div>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => !o && onClose()}
        title={pending?.role === 'Student' ? 'Demote to Student' : 'Change Role'}
        description={
          pending?.role === 'Student'
            ? `Change ${pending.name}'s role to Student? They will lose admin access.`
            : `Confirm role change for ${pending?.name}.`
        }
        confirmLabel={pending?.role === 'Student' ? 'Demote' : 'Confirm'}
        variant={pending?.role === 'Student' ? 'destructive' : 'default'}
        loading={isPending}
        onConfirm={onConfirmRoleChange}
      />
    </>
  )
}
