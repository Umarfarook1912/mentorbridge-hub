export const DEPARTMENTS = ['IT', 'CSE', 'ECE', 'AIDS', 'CSBS', 'Non SSM Students'] as const

export const DOMAIN_INTERESTS = ['Frontend', 'Backend', 'Data Engineer'] as const

export const ROUTES = {
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  authCallback: '/auth/callback',
  admin: {
    dashboard: '/admin/dashboard',
    students: '/admin/students',
    meetings: '/admin/meetings',
    attendance: '/admin/attendance',
    tasks: '/admin/tasks',
    submissions: '/admin/submissions',
    reports: '/admin/reports',
  },
  student: {
    dashboard: '/student/dashboard',
    meetings: '/student/meetings',
    attendance: '/student/attendance',
    tasks: '/student/tasks',
    profile: '/student/profile',
  },
} as const

export const APP_NAME = 'MentorBridge'
export const APP_DESCRIPTION = 'Attendance & Task Management'
export const APP_LOGO = '/logo.webp'

export const QUERY_KEYS = {
  students: 'students',
  meetings: 'meetings',
  attendance: 'attendance',
  tasks: 'tasks',
  submissions: 'submissions',
  notifications: 'notifications',
  dashboardStats: 'dashboard-stats',
  dashboardMonthlyAttendance: 'dashboard-monthly-attendance',
  studentStats: 'student-stats',
  reportsAttendance: 'reports-attendance',
  reportsTasks: 'reports-tasks',
} as const

export const STALE_TIME = {
  short: 30 * 1000, // 30s — frequently changing data
  medium: 60 * 1000, // 1m — dashboard stats
  long: 5 * 60 * 1000, // 5m — reference data like students list
} as const

export const PAGE_SIZE = 10
