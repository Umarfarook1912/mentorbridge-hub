import { NextResponse } from 'next/server'
import { getSupabaseServerClient, getSupabaseAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((profile as { role?: string } | null)?.role !== 'Admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { fullName, email, phone, department, domainInterest, password } = body

  if (!fullName || !email || !password || !department || !domainInterest) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
  }

  const adminClient = await getSupabaseAdminClient()

  // Detect misconfigured service role (anon key cannot create users)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  if (!serviceKey || serviceKey === anonKey || serviceKey.includes('"role":"anon"')) {
    return NextResponse.json(
      {
        message:
          'SUPABASE_SERVICE_ROLE_KEY is missing or set to the anon key. Open Supabase → Project Settings → API → copy the service_role key into .env.local, then restart npm run dev.',
      },
      { status: 500 }
    )
  }

  const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, role: 'Student' },
  })

  if (createError) {
    const message = createError.message.toLowerCase().includes('not allowed')
      ? 'User not allowed — your SUPABASE_SERVICE_ROLE_KEY is invalid. Use the service_role secret from Supabase Project Settings → API (not the anon key), then restart the dev server.'
      : createError.message
    return NextResponse.json({ message }, { status: 400 })
  }

  const { error: profileError } = await adminClient
    .from('profiles')
    .update({
      full_name: fullName,
      phone: phone ?? null,
      department,
      domain_interest: domainInterest,
      role: 'Student' as const,
    } as Record<string, unknown>)
    .eq('id', newUser.user.id)

  if (profileError) {
    return NextResponse.json({ message: profileError.message }, { status: 400 })
  }

  return NextResponse.json({ id: newUser.user.id, email }, { status: 201 })
}
