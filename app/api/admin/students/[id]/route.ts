import { NextResponse } from 'next/server'
import { getSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase/server'

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
  const { fullName, phone, department, domainInterest } = body

  if (!fullName || !department || !domainInterest) {
    return NextResponse.json(
      { message: 'Full name, department and domain interest are required' },
      { status: 400 }
    )
  }

  // Use the authenticated Admin session (RLS allows Admin updates)
  const { data, error } = await auth.supabase
    .from('profiles')
    .update({
      full_name: fullName,
      phone: phone || null,
      department,
      domain_interest: domainInterest,
    })
    .eq('id', id)
    .eq('role', 'Student')
    .select('id')
    .maybeSingle()

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }

  if (!data) {
    return NextResponse.json(
      { message: 'Update failed. Check that your account role is Admin and the student exists.' },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if ('error' in auth && auth.error) return auth.error

  const { id } = await params
  const adminClient = await getSupabaseAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(id)

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
