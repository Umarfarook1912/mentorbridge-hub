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
import type { UserRole } from '@/types/supabase.types'

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export const ADMIN_NAV: NavSection[] = [
  {
    items: [{ label: 'Dashboard', href: ROUTES.admin.dashboard, icon: LayoutDashboard }],
  },
  {
    title: 'Management',
    items: [
      { label: 'Students', href: ROUTES.admin.students, icon: Users },
      { label: 'Admins', href: ROUTES.admin.admins, icon: Shield },
      { label: 'Meetings', href: ROUTES.admin.meetings, icon: CalendarDays },
      { label: 'Attendance', href: ROUTES.admin.attendance, icon: UserCheck },
      { label: 'Tasks', href: ROUTES.admin.tasks, icon: CheckSquare },
      { label: 'Submissions', href: ROUTES.admin.submissions, icon: ClipboardList },
      { label: 'Blogs', href: ROUTES.admin.blogs, icon: Newspaper },
    ],
  },
  {
    title: 'Analytics',
    items: [{ label: 'Reports', href: ROUTES.admin.reports, icon: BarChart3 }],
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

export function getNavByRole(role: UserRole): NavSection[] {
  return role === 'Admin' ? ADMIN_NAV : STUDENT_NAV
}
