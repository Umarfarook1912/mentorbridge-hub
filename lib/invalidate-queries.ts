import type { QueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'

/** Invalidate every query whose key starts with the given root. */
function invalidate(qc: QueryClient, key: string) {
  return qc.invalidateQueries({ queryKey: [key] })
}

export function invalidateStudents(qc: QueryClient) {
  return Promise.all([
    invalidate(qc, QUERY_KEYS.students),
    invalidate(qc, QUERY_KEYS.admins),
    invalidate(qc, QUERY_KEYS.dashboardStats),
  ])
}

export function invalidateMeetings(qc: QueryClient) {
  return Promise.all([
    invalidate(qc, QUERY_KEYS.meetings),
    invalidate(qc, QUERY_KEYS.attendance),
    invalidate(qc, QUERY_KEYS.dashboardStats),
    invalidate(qc, QUERY_KEYS.dashboardMonthlyAttendance),
    invalidate(qc, QUERY_KEYS.reportsAttendance),
    invalidate(qc, QUERY_KEYS.studentStats),
  ])
}

export function invalidateAttendance(qc: QueryClient, meetingId?: string) {
  return Promise.all([
    meetingId
      ? qc.invalidateQueries({ queryKey: [QUERY_KEYS.attendance, 'meeting', meetingId] })
      : invalidate(qc, QUERY_KEYS.attendance),
    invalidate(qc, QUERY_KEYS.attendance),
    invalidate(qc, QUERY_KEYS.dashboardStats),
    invalidate(qc, QUERY_KEYS.dashboardMonthlyAttendance),
    invalidate(qc, QUERY_KEYS.reportsAttendance),
    invalidate(qc, QUERY_KEYS.studentStats),
  ])
}

export function invalidateTasks(qc: QueryClient) {
  return Promise.all([
    invalidate(qc, QUERY_KEYS.tasks),
    invalidate(qc, QUERY_KEYS.submissions),
    invalidate(qc, QUERY_KEYS.dashboardStats),
    invalidate(qc, QUERY_KEYS.studentStats),
    invalidate(qc, QUERY_KEYS.reportsTasks),
  ])
}

export function invalidateSubmissions(qc: QueryClient) {
  return Promise.all([
    invalidate(qc, QUERY_KEYS.submissions),
    invalidate(qc, QUERY_KEYS.tasks),
    invalidate(qc, QUERY_KEYS.dashboardStats),
    invalidate(qc, QUERY_KEYS.studentStats),
    invalidate(qc, QUERY_KEYS.reportsTasks),
  ])
}

export function invalidateBlogs(qc: QueryClient) {
  return invalidate(qc, QUERY_KEYS.blogs)
}

export function invalidateProfile(qc: QueryClient) {
  return invalidate(qc, QUERY_KEYS.students)
}
