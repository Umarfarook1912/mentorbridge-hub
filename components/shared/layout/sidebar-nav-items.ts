import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  BarChart3,
  UserCheck,
  BookOpen,
  Newspaper,
  Shield,
  User,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { hasSection, type AdminSection, type PermissionUser } from '@/lib/permissions'
import type { UserRole } from '@/types/supabase.types'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
  section?: AdminSection | 'adminOnly'
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export const ADMIN_NAV: NavSection[] = [
  {
    items: [
      {
        label: 'Dashboard',
        href: ROUTES.admin.dashboard,
        icon: LayoutDashboard,
        section: 'dashboard',
      },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Students', href: ROUTES.admin.students, icon: Users, section: 'adminOnly' },
      { label: 'Admins', href: ROUTES.admin.admins, icon: Shield, section: 'adminOnly' },
      { label: 'Meetings', href: ROUTES.admin.meetings, icon: CalendarDays, section: 'meetings' },
      {
        label: 'Attendance',
        href: ROUTES.admin.attendance,
        icon: UserCheck,
        section: 'attendance',
      },
      { label: 'Tasks', href: ROUTES.admin.tasks, icon: CheckSquare, section: 'tasks' },
      {
        label: 'Submissions',
        href: ROUTES.admin.submissions,
        icon: ClipboardList,
        section: 'submissions',
      },
      { label: 'Blogs', href: ROUTES.admin.blogs, icon: Newspaper, section: 'blogs' },
    ],
  },
  {
    title: 'Analytics',
    items: [{ label: 'Reports', href: ROUTES.admin.reports, icon: BarChart3, section: 'reports' }],
  },
]

export const STUDENT_NAV: NavSection[] = [
  {
    items: [{ label: 'Dashboard', href: ROUTES.student.dashboard, icon: LayoutDashboard }],
  },
  {
    title: 'Learning',
    items: [
      { label: 'Meetings', href: ROUTES.student.meetings, icon: CalendarDays },
      { label: 'Attendance', href: ROUTES.student.attendance, icon: UserCheck },
      { label: 'Tasks', href: ROUTES.student.tasks, icon: BookOpen },
      { label: 'Blogs', href: ROUTES.student.blogs, icon: Newspaper },
    ],
  },
  {
    title: 'Account',
    items: [{ label: 'Profile', href: ROUTES.student.profile, icon: User }],
  },
]

function filterAdminNav(user: PermissionUser): NavSection[] {
  return ADMIN_NAV.map((section) => ({
    ...section,
    items: section.items.filter((item) => {
      if (!item.section) return true
      if (item.section === 'adminOnly') return user.role === 'Admin'
      return hasSection(user, item.section)
    }),
  })).filter((section) => section.items.length > 0)
}

export function getNavByRole(role: UserRole, sectionPermissions?: string[] | null): NavSection[] {
  if (role === 'Student') return STUDENT_NAV
  return filterAdminNav({ role, sectionPermissions })
}
