import { ROUTES } from '@/lib/constants'
import type { UserRole } from '@/types/supabase.types'

export const ADMIN_SECTIONS = [
  'dashboard',
  'meetings',
  'attendance',
  'tasks',
  'submissions',
  'blogs',
  'reports',
] as const

export type AdminSection = (typeof ADMIN_SECTIONS)[number]

export const ADMIN_SECTION_LABELS: Record<AdminSection, string> = {
  dashboard: 'Dashboard',
  meetings: 'Meetings',
  attendance: 'Attendance',
  tasks: 'Tasks',
  submissions: 'Submissions',
  blogs: 'Blogs',
  reports: 'Reports',
}

/** Admin-only paths Executives cannot access */
const ADMIN_ONLY_PREFIXES = [ROUTES.admin.students, ROUTES.admin.admins] as const

const SECTION_BY_PREFIX: { prefix: string; section: AdminSection }[] = [
  { prefix: ROUTES.admin.dashboard, section: 'dashboard' },
  { prefix: ROUTES.admin.meetings, section: 'meetings' },
  { prefix: ROUTES.admin.attendance, section: 'attendance' },
  { prefix: ROUTES.admin.tasks, section: 'tasks' },
  { prefix: ROUTES.admin.submissions, section: 'submissions' },
  { prefix: ROUTES.admin.blogs, section: 'blogs' },
  { prefix: ROUTES.admin.reports, section: 'reports' },
]

export interface PermissionUser {
  role: UserRole
  sectionPermissions?: string[] | null
}

export function isFullAdmin(user: PermissionUser | null | undefined): boolean {
  return user?.role === 'Admin'
}

export function isExecutive(user: PermissionUser | null | undefined): boolean {
  return user?.role === 'Executive'
}

export function isStaff(user: PermissionUser | null | undefined): boolean {
  return user?.role === 'Staff'
}

export function canUseAdminShell(user: PermissionUser | null | undefined): boolean {
  return isFullAdmin(user) || isExecutive(user) || isStaff(user)
}

/** Admin-shell writes (students, meetings, attendance, tasks). Staff is read-only. */
export function canMutate(user: PermissionUser | null | undefined): boolean {
  return isFullAdmin(user) || isExecutive(user)
}

/** Students, Admins, and Executives can create their own content. Staff cannot. */
export function canAuthorContent(user: PermissionUser | null | undefined): boolean {
  return !!user && user.role !== 'Staff'
}

export function hasSection(
  user: PermissionUser | null | undefined,
  section: AdminSection
): boolean {
  if (!user) return false
  if (user.role === 'Admin') return true
  if (user.role !== 'Executive') return false
  return (user.sectionPermissions ?? []).includes(section)
}

export function canViewSection(
  user: PermissionUser | null | undefined,
  section: AdminSection
): boolean {
  if (!user) return false
  if (user.role === 'Admin' || user.role === 'Staff') return true
  return hasSection(user, section)
}

export function sectionForAdminPath(pathname: string): AdminSection | null {
  if (ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) return null
  const match = SECTION_BY_PREFIX.find((s) => pathname.startsWith(s.prefix))
  return match?.section ?? null
}

export function canAccessAdminPath(
  user: PermissionUser | null | undefined,
  pathname: string
): boolean {
  if (!user) return false
  if (user.role === 'Admin' || user.role === 'Staff') return true
  if (user.role !== 'Executive') return false
  if (ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p))) return false
  const section = sectionForAdminPath(pathname)
  if (!section) return false
  return hasSection(user, section)
}

export function firstAllowedAdminRoute(user: PermissionUser | null | undefined): string {
  if (!user) return ROUTES.login
  if (user.role === 'Admin' || user.role === 'Staff') return ROUTES.admin.dashboard
  for (const section of ADMIN_SECTIONS) {
    if (hasSection(user, section)) {
      const found = SECTION_BY_PREFIX.find((s) => s.section === section)
      if (found) return found.prefix
    }
  }
  // Executives always keep student-style learning routes
  return ROUTES.student.attendance
}

/** Student paths Executives may open (act as learner + staff). */
export const EXECUTIVE_STUDENT_PATHS = [
  ROUTES.student.attendance,
  ROUTES.student.tasks,
  ROUTES.student.meetings,
  ROUTES.student.profile,
] as const

export function canExecutiveAccessStudentPath(pathname: string): boolean {
  return EXECUTIVE_STUDENT_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}
