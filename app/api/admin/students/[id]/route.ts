import { NextResponse } from 'next/server'
import { getSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase/server'
import type { UserRole } from '@/types/supabase.types'

async function requireAdmin() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as { role?: string } | null)?.role !== 'Admin') {
    return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) }
  }

  return { supabase, user }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return auth.error

  const { id } = await params
  const body = await request.json()
  const { fullName, phone, department, domainInterest, studentCategory, role } = body

  if (role && role !== 'Admin' && role !== 'Student') {
    return NextResponse.json({ message: 'Invalid role' }, { status: 400 })
  }

  if (role && role !== 'Admin' && id === auth.user.id) {
    return NextResponse.json(
      { message: 'You cannot demote your own admin account' },
      { status: 400 }
    )
  }

  // Role-only update (Admins list)
  if (role && fullName == null) {
    const { data, error } = await auth.supabase
      .from('profiles')
      .update({ role: role as UserRole })
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) return NextResponse.json({ message: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ message: 'User not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  }

  if (!fullName || !department || !domainInterest || !studentCategory) {
    return NextResponse.json(
      { message: 'Full name, category, department and domain interest are required' },
      { status: 400 }
    )
  }

  const updates: Record<string, unknown> = {
    full_name: fullName,
    phone: phone || null,
    department,
    domain_interest: domainInterest,
    student_category: studentCategory,
  }

  if (role === 'Admin' || role === 'Student') {
    updates.role = role as UserRole
  }

  const { data, error } = await auth.supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error) return NextResponse.json({ message: error.message }, { status: 400 })
  if (!data) {
    return NextResponse.json(
      { message: 'Update failed. Check that your account role is Admin and the user exists.' },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return auth.error

  const { id } = await params

  if (id === auth.user.id) {
    return NextResponse.json({ message: 'You cannot delete your own account' }, { status: 400 })
  }

  const adminClient = await getSupabaseAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(id)

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
