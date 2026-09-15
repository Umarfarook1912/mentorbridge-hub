import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { hasSection, isFullAdmin, isSuperAdmin, type AdminSection } from '@/lib/permissions'
import type { UserRole } from '@/types/supabase.types'

export async function requireAdmin() {
  return requirePermission(null)
}

/** SuperAdmin only — used for student notes. */
export async function requireSuperAdmin() {
  const result = await requirePermission(null)
  if ('error' in result) return result
  if (!isSuperAdmin({ role: result.role })) {
    return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) }
  }
  return result
}

/** Pass null to require full Admin/SuperAdmin; pass a section for Admin/SuperAdmin or Executive with that section. */
export async function requirePermission(section: AdminSection | null) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, section_permissions')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) }
  }

  const role = profile.role as UserRole
  const sectionPermissions = profile.section_permissions ?? null
  const permUser = { role, sectionPermissions }

  if (role === 'Staff') {
    return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) }
  }

  if (section === null) {
    if (!isFullAdmin(permUser)) {
      return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) }
    }
  } else if (!hasSection(permUser, section)) {
    return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) }
  }

  return { supabase, user, role, sectionPermissions }
}
