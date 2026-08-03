import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants'
import { canUseAdminShell, firstAllowedAdminRoute } from '@/lib/permissions'
import type { UserRole } from '@/types/supabase.types'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (next === ROUTES.resetPassword || next.startsWith(`${ROUTES.resetPassword}?`)) {
        return NextResponse.redirect(`${origin}${ROUTES.resetPassword}`)
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, section_permissions')
          .eq('id', user.id)
          .single()

        const permUser = profile
          ? {
              role: profile.role as UserRole,
              sectionPermissions: profile.section_permissions ?? null,
            }
          : null

        const destination =
          permUser?.role === 'Student'
            ? ROUTES.student.dashboard
            : canUseAdminShell(permUser)
              ? firstAllowedAdminRoute(permUser)
              : ROUTES.student.dashboard
        return NextResponse.redirect(`${origin}${destination}`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}${ROUTES.login}?error=auth_callback_error`)
}
