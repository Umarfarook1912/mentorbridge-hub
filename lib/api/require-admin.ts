import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { hasSection, type AdminSection } from '@/lib/permissions'
import type { UserRole } from '@/types/supabase.types'

export async function requireAdmin() {
  return requirePermission(null)
}

/** Pass null to require full Admin only; pass a section for Admin or Executive with that section. */
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
    if (role !== 'Admin') {
      return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) }
    }
  } else if (!hasSection(permUser, section)) {
    return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) }
  }

  return { supabase, user, role, sectionPermissions }
}
