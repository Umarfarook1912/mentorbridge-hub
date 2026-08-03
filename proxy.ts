import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import {
  canAccessAdminPath,
  canAssociateAccessStudentPath,
  canUseAdminShell,
  firstAllowedAdminRoute,
} from '@/lib/permissions'
import type { UserRole } from '@/types/supabase.types'

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
]
const ADMIN_ROUTES = ['/admin']
const STUDENT_ROUTES = ['/student']

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user && pathname.startsWith('/reset-password')) {
    return response
  }

  async function loadPermUser() {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, section_permissions')
      .eq('id', user!.id)
      .single()
    if (!profile) return null
    return {
      role: profile.role as UserRole,
      sectionPermissions: profile.section_permissions ?? null,
    }
  }

  if (user && isPublicRoute(pathname)) {
    const permUser = await loadPermUser()
    const dest =
      permUser?.role === 'Student'
        ? '/student/dashboard'
        : canUseAdminShell(permUser)
          ? firstAllowedAdminRoute(permUser)
          : '/student/dashboard'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  if (!user && !isPublicRoute(pathname) && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (
    user &&
    (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) ||
      STUDENT_ROUTES.some((r) => pathname.startsWith(r)))
  ) {
    const permUser = await loadPermUser()
    const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
    const isStudentRoute = STUDENT_ROUTES.some((r) => pathname.startsWith(r))

    if (isAdminRoute) {
      if (!canAccessAdminPath(permUser, pathname)) {
        if (canUseAdminShell(permUser)) {
          return NextResponse.redirect(new URL(firstAllowedAdminRoute(permUser), request.url))
        }
        return NextResponse.redirect(new URL('/student/dashboard', request.url))
      }
    }

    if (isStudentRoute && permUser?.role !== 'Student') {
      const associateOk = permUser?.role === 'Associate' && canAssociateAccessStudentPath(pathname)
      if (!associateOk) {
        return NextResponse.redirect(
          new URL(
            canUseAdminShell(permUser) ? firstAllowedAdminRoute(permUser) : '/login',
            request.url
          )
        )
      }
    }
  }

  if (pathname === '/') {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const permUser = await loadPermUser()
    const dest =
      permUser?.role === 'Student'
        ? '/student/dashboard'
        : canUseAdminShell(permUser)
          ? firstAllowedAdminRoute(permUser)
          : '/login'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
