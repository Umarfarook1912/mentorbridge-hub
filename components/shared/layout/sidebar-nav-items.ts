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
  Video,
  User,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { canViewSection, type AdminSection, type PermissionUser } from '@/lib/permissions'
import type { UserRole } from '@/types/supabase.types'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
  section?: AdminSection | 'adminOnly' | 'adminRoleOnly'
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
      { label: 'Team', href: ROUTES.admin.admins, icon: UsersRound, section: 'adminRoleOnly' },
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
      { label: 'Videos', href: ROUTES.admin.videos, icon: Video, section: 'videos' },
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
      { label: 'Videos', href: ROUTES.student.videos, icon: Video },
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
      if (item.section === 'adminRoleOnly') return user.role === 'Admin'
      if (item.section === 'adminOnly') return user.role === 'Admin' || user.role === 'Staff'
      return canViewSection(user, item.section)
    }),
  })).filter((section) => section.items.length > 0)
}

/** Learner links so Executives can view own attendance and submit tasks. */
const EXECUTIVE_LEARNING_NAV: NavSection = {
  title: 'My learning',
  items: [
    { label: 'My Attendance', href: ROUTES.student.attendance, icon: UserCheck },
    { label: 'My Tasks', href: ROUTES.student.tasks, icon: BookOpen },
    { label: 'My Meetings', href: ROUTES.student.meetings, icon: CalendarDays },
    { label: 'Videos', href: ROUTES.student.videos, icon: Video },
    { label: 'Profile', href: ROUTES.student.profile, icon: User },
  ],
}

export function getNavByRole(role: UserRole, sectionPermissions?: string[] | null): NavSection[] {
  if (role === 'Student') return STUDENT_NAV
  const adminNav = filterAdminNav({ role, sectionPermissions })
  if (role === 'Executive') {
    return [...adminNav, EXECUTIVE_LEARNING_NAV]
  }
  return adminNav
}
