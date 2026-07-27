import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/auth/callback']
const ADMIN_ROUTES = ['/admin']
const STUDENT_ROUTES = ['/student']

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect authenticated users away from public routes
  if (user && isPublicRoute(pathname)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const destination = profile?.role === 'Admin' ? '/admin/dashboard' : '/student/dashboard'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  // Redirect unauthenticated users to login
  if (!user && !isPublicRoute(pathname) && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based access control
  if (
    user &&
    (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) ||
      STUDENT_ROUTES.some((r) => pathname.startsWith(r)))
  ) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r))
    const isStudentRoute = STUDENT_ROUTES.some((r) => pathname.startsWith(r))

    if (isAdminRoute && profile?.role !== 'Admin') {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }

    if (isStudentRoute && profile?.role !== 'Student') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  // Root redirect
  if (pathname === '/') {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const destination = profile?.role === 'Admin' ? '/admin/dashboard' : '/student/dashboard'
    return NextResponse.redirect(new URL(destination, request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
